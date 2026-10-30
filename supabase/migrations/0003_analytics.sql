-- ShiftLab admin analytics: what people do on the site, and an admin-only way to read it.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run. Run 0001 and 0002 first.
-- Safe to run twice.

-- 1. Who may look. Reusable by later policies ("admins can read everything").
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin')
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- 2. The event log. One row per page view or closed case. No names, no emails, no report text.
create table if not exists public.events (
  id      bigint generated always as identity primary key,
  at      timestamptz not null default now(),
  kind    text not null check (kind in ('view', 'case_closed')),
  user_id uuid references auth.users (id) on delete set null, -- null for guests; kept (anonymously) if the account is deleted
  visitor text check (char_length(visitor) <= 40),            -- random id from the visitor's browser, not a person
  path    text check (char_length(path) <= 120),
  props   jsonb not null default '{}' check (length(props::text) <= 400),
  -- A closed case must carry a score, an alert id and two yes/no flags, so the dashboard maths can never hit a bad value.
  constraint events_case_shape check (
    kind <> 'case_closed' or (
      coalesce(jsonb_typeof(props -> 'score') = 'number', false)
      and coalesce(jsonb_typeof(props -> 'alert') = 'string', false)
      and coalesce(jsonb_typeof(props -> 'verdict_ok') = 'boolean', false)
      and coalesce(jsonb_typeof(props -> 'escalate_ok') = 'boolean', false)
      and (props ->> 'score')::numeric between 0 and 100
      and char_length(props ->> 'alert') <= 20
    )
  )
);
create index if not exists events_at_idx on public.events (at desc);
create index if not exists events_kind_at_idx on public.events (kind, at desc);
create index if not exists events_user_at_idx on public.events (user_id, at desc) where user_id is not null;

alter table public.events enable row level security;

-- Anyone can add a row (as themselves or as a guest). Nobody can read, change or delete one from the website.
-- shortcut: the publishable key is public, so someone could add fake rows directly. Fine for a portfolio dashboard;
-- add rate limiting or move inserts behind a secret before the numbers matter to anyone but you.
revoke all on public.events from anon, authenticated;
grant insert on public.events to anon, authenticated;
drop policy if exists "add events" on public.events;
create policy "add events"
  on public.events for insert
  to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

-- 3. The dashboard numbers. Only admins can run it; everyone else gets "permission denied".
--    Days are counted in `tz` (default India time). Admin accounts are left out of every count.
create or replace function public.admin_overview(days int default 30, tz text default 'Asia/Kolkata')
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
  ev as (
    select (e.at at time zone tz)::date as day, e.kind, e.user_id, e.visitor, e.path, e.props
    from public.events e
    where (e.at at time zone tz)::date >= dp
      and not exists (select 1 from public.profiles p where p.id = e.user_id and p.role = 'admin')
  ),
  su as ( -- student accounts, by the day they signed up
    select (u.created_at at time zone tz)::date as day, u.id
    from auth.users u
    left join public.profiles p on p.id = u.id
    where coalesce(p.role, 'student') <> 'admin'
  ),
  kp as (
    select
      count(distinct visitor) filter (where kind = 'view' and day >= d0) as v_cur,
      count(distinct visitor) filter (where kind = 'view' and day < d0) as v_prev,
      count(distinct user_id) filter (where day >= d0) as a_cur,
      count(distinct user_id) filter (where day < d0) as a_prev,
      count(*) filter (where kind = 'case_closed' and day >= d0) as c_cur,
      count(*) filter (where kind = 'case_closed' and day < d0) as c_prev,
      round(avg((props ->> 'score')::numeric) filter (where kind = 'case_closed' and day >= d0), 1) as s_cur,
      round(avg((props ->> 'score')::numeric) filter (where kind = 'case_closed' and day < d0), 1) as s_prev
    from ev
  ),
  sr as (
    select g.day::date as day,
      (select count(distinct visitor) from ev where ev.kind = 'view' and ev.day = g.day::date) as visitors,
      (select count(*) from su where su.day = g.day::date) as signups,
      (select count(*) from ev where ev.kind = 'case_closed' and ev.day = g.day::date) as cases,
      (select count(distinct user_id) from ev where ev.day = g.day::date) as active
    from generate_series(d0::timestamp, d1::timestamp, interval '1 day') as g(day)
  ),
  co as (select id from su where day >= d0), -- this window's new accounts
  fn as (
    select
      (select count(*) from co) as accounts,
      (select count(distinct user_id) from ev where kind = 'view' and path like '/alerts/%' and user_id in (select id from co)) as opened,
      (select count(*) from (select user_id from ev where kind = 'case_closed' and user_id in (select id from co) group by user_id having count(*) >= 1) x) as closed1,
      (select count(*) from (select user_id from ev where kind = 'case_closed' and user_id in (select id from co) group by user_id having count(*) >= 3) x) as closed3,
      (select count(*) from (select user_id from ev where user_id in (select id from co) group by user_id having count(distinct day) >= 2) x) as returned
  ),
  al as (
    select props ->> 'alert' as alert, count(*) as attempts,
           round(avg((props ->> 'score')::numeric), 1) as avg_score,
           round(100.0 * avg(case when (props ->> 'verdict_ok')::boolean then 1 else 0 end)) as verdict_pct
    from ev where kind = 'case_closed' and day >= d0
    group by 1 order by avg_score asc, attempts desc limit 50
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
    'tracking_since', (select (min(at) at time zone tz)::date from public.events),
    'accounts_total', (select count(*) from su),
    'cur', jsonb_build_object('signups', (select count(*) from su where day >= d0), 'visitors', kp.v_cur, 'active', kp.a_cur, 'cases', kp.c_cur, 'avg_score', kp.s_cur),
    'prev', jsonb_build_object('signups', (select count(*) from su where day >= dp and day < d0), 'visitors', kp.v_prev, 'active', kp.a_prev, 'cases', kp.c_prev, 'avg_score', kp.s_prev),
    'series', (select jsonb_agg(to_jsonb(sr) order by sr.day) from sr),
    'funnel', (select to_jsonb(fn) from fn),
    'alerts', coalesce((select jsonb_agg(to_jsonb(al)) from al), '[]'::jsonb),
    'sections', coalesce((select jsonb_agg(to_jsonb(se)) from se), '[]'::jsonb)
  ) into res
  from kp;

  return res;
end;
$$;
revoke all on function public.admin_overview(int, text) from public, anon;
grant execute on function public.admin_overview(int, text) to authenticated;

-- 4. The newest accounts. Emails are partly hidden (s***@gmail.com) so a screenshot is safe to share.
create or replace function public.admin_recent_users(n int default 10)
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
    select jsonb_agg(to_jsonb(r) order by r.joined desc)
    from (
      select
        coalesce(p.display_name, '') as name,
        case when u.email is null then '' else left(split_part(u.email, '@', 1), 1) || '***@' || split_part(u.email, '@', 2) end as email,
        u.created_at as joined,
        coalesce(p.role, 'student') as role,
        (select count(*) from public.events e where e.user_id = u.id and e.kind = 'case_closed') as cases,
        (select max(e.at) from public.events e where e.user_id = u.id) as last_seen
      from auth.users u
      left join public.profiles p on p.id = u.id
      order by u.created_at desc
      limit least(greatest(coalesce(n, 10), 1), 50)
    ) r
  ), '[]'::jsonb);
end;
$$;
revoke all on function public.admin_recent_users(int) from public, anon;
grant execute on function public.admin_recent_users(int) to authenticated;
