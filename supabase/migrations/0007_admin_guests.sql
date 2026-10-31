-- ShiftLab admin: how many people use ShiftLab as a guest, how many of them become accounts, and a log of what guests did.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run. Run 0003 first (it makes the events table and is_admin()).
-- Safe to run twice. Adds two admin-only functions and changes no table.
--
-- A "guest" is an event row with no user_id. A guest "person" is the random browser id in `visitor`, so clearing the browser's storage,
-- another browser or a private window counts as a new guest. A closed case is saved by the server without a browser id,
-- so case rows are counted but cannot be tied to one guest. Browsers that were ever used by an admin are left out.

-- 1. The numbers: same shape as admin_overview(), but for guests only.
create or replace function public.admin_guests(days int default 30, tz text default 'Asia/Kolkata')
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  n   int  := least(greatest(coalesce(days, 30), 1), 365);
  d1  date := (now() at time zone tz)::date; -- today
  d0  date := d1 - (n - 1);                  -- first day of this window
  dp  date := d0 - n;                        -- first day of the window before it
  res jsonb;
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;

  with
  adm as ( -- browsers an admin has signed in from
    select distinct e.visitor
    from public.events e
    join public.profiles p on p.id = e.user_id
    where p.role = 'admin' and e.visitor is not null
  ),
  li as ( -- browsers a student has signed in from, at any time
    select distinct e.visitor
    from public.events e
    left join public.profiles p on p.id = e.user_id
    where e.user_id is not null and e.visitor is not null and coalesce(p.role, 'student') <> 'admin'
  ),
  su as ( -- student accounts, by the day they signed up; `confirmed` is false until the email link is clicked
    select (u.created_at at time zone tz)::date as day, u.email_confirmed_at is not null as confirmed
    from auth.users u
    left join public.profiles p on p.id = u.id
    where coalesce(p.role, 'student') <> 'admin'
  ),
  ev as (
    select (e.at at time zone tz)::date as day, e.kind, e.visitor, e.path, e.props
    from public.events e
    where e.user_id is null
      and (e.at at time zone tz)::date >= dp
      and (e.visitor is null or e.visitor not in (select visitor from adm))
  ),
  kp as (
    select
      count(distinct visitor) filter (where kind = 'view' and day >= d0) as v_cur,
      count(distinct visitor) filter (where kind = 'view' and day < d0) as v_prev,
      count(*) filter (where kind = 'view' and day >= d0) as pv_cur,
      count(*) filter (where kind = 'view' and day < d0) as pv_prev,
      count(distinct visitor) filter (where kind = 'view' and path like '/alerts/%' and day >= d0) as o_cur,
      count(distinct visitor) filter (where kind = 'view' and path like '/alerts/%' and day < d0) as o_prev,
      count(distinct visitor) filter (where kind = 'view' and path = '/signup' and day >= d0) as sp_cur,
      count(distinct visitor) filter (where kind = 'view' and path = '/signup' and day < d0) as sp_prev,
      count(*) filter (where kind = 'case_closed' and day >= d0) as c_cur,
      count(*) filter (where kind = 'case_closed' and day < d0) as c_prev,
      round(avg((props ->> 'score')::numeric) filter (where kind = 'case_closed' and day >= d0), 1) as s_cur,
      (select count(*) from (select visitor from ev where kind = 'view' and day >= d0 group by visitor having count(distinct day) >= 2) x) as r_cur,
      (select count(distinct visitor) from ev where kind = 'view' and day >= d0 and visitor in (select visitor from li)) as l_cur
    from ev
  ),
  sr as (
    select g.day::date as day,
      (select count(distinct visitor) from ev where ev.kind = 'view' and ev.day = g.day::date) as visitors,
      (select count(*) from ev where ev.kind = 'case_closed' and ev.day = g.day::date) as cases,
      (select count(*) from su where su.day = g.day::date) as signups
    from generate_series(d0::timestamp, d1::timestamp, interval '1 day') as g(day)
  ),
  se as (
    select split_part(path, '/', 2) as section, count(*) as views, count(distinct visitor) as visitors
    from ev where kind = 'view' and day >= d0
    group by 1 order by views desc limit 20
  )
  select jsonb_build_object(
    'days', n,
    'from', d0,
    'to', d1,
    'tracking_since', (select (min(e.at) at time zone tz)::date from public.events e where e.user_id is null),
    'guests_total', (
      select count(distinct e.visitor) from public.events e
      where e.user_id is null and e.kind = 'view' and e.visitor is not null and e.visitor not in (select visitor from adm)
    ),
    'cur', jsonb_build_object('visitors', kp.v_cur, 'views', kp.pv_cur, 'opened', kp.o_cur, 'returned', kp.r_cur,
                              'signed_in_later', kp.l_cur, 'cases', kp.c_cur, 'avg_score', kp.s_cur,
                              'signup_page', kp.sp_cur,
                              'new_accounts', (select count(*) from su where day >= d0),
                              'unconfirmed', (select count(*) from su where day >= d0 and not confirmed)),
    'prev', jsonb_build_object('visitors', kp.v_prev, 'views', kp.pv_prev, 'opened', kp.o_prev, 'cases', kp.c_prev,
                              'signup_page', kp.sp_prev,
                              'new_accounts', (select count(*) from su where day >= dp and day < d0)),
    'series', (select jsonb_agg(to_jsonb(sr) order by sr.day) from sr),
    'sections', coalesce((select jsonb_agg(to_jsonb(se)) from se), '[]'::jsonb)
  ) into res
  from kp;

  return res;
end;
$$;
revoke all on function public.admin_guests(int, text) from public, anon;
grant execute on function public.admin_guests(int, text) to authenticated;

-- 2. The log: the newest guest events, newest first. Only the first 6 characters of the browser id are shown.
create or replace function public.admin_guest_log(n int default 100)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;

  return coalesce((
    select jsonb_agg(to_jsonb(r) order by r.at desc, r.id desc)
    from (
      select
        e.id,
        e.at,
        e.kind,
        left(e.visitor, 6) as guest,
        e.path,
        (e.props ->> 'score')::numeric as score,
        e.props ->> 'alert' as alert,
        (e.props ->> 'verdict_ok')::boolean as verdict_ok,
        (e.props ->> 'escalate_ok')::boolean as escalate_ok
      from public.events e
      where e.user_id is null
        and (e.visitor is null or e.visitor not in (
          select a.visitor from public.events a join public.profiles p on p.id = a.user_id where p.role = 'admin' and a.visitor is not null
        ))
      order by e.at desc, e.id desc
      limit least(greatest(coalesce(n, 100), 1), 200)
    ) r
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.admin_guest_log(int) from public, anon;
grant execute on function public.admin_guest_log(int) to authenticated;
