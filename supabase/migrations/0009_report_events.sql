-- ShiftLab: see where students give up on a report.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run. Run 0003 and 0007 first. Safe to run twice.
-- Run it BEFORE the matching website update goes live. Until then the new event rows are refused and quietly dropped.
--
-- Adds two kinds of event: 'report_started' (the student filled in the first thing on the report form) and
-- 'report_blocked' (Submit was stopped: no decision chosen, a section left empty, or text a check did not accept).
-- They carry only the alert id and a short reason code, never anything the student typed.

-- 1. Allow the two new kinds and fix their shape so the numbers can never hit a bad value.
alter table public.events drop constraint if exists events_kind_check;
alter table public.events add constraint events_kind_check
  check (kind in ('view', 'case_closed', 'report_started', 'report_blocked'));

alter table public.events drop constraint if exists events_report_shape;
alter table public.events add constraint events_report_shape check (
  kind not in ('report_started', 'report_blocked') or (
    coalesce(jsonb_typeof(props -> 'alert') = 'string', false)
    and char_length(props ->> 'alert') <= 20
    and (kind <> 'report_blocked' or coalesce(props ->> 'reason' in ('decision', 'empty', 'quality'), false))
  )
);

-- 2. The Guests page log shows page views and closed cases only, so the new events do not clutter it.
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
        and e.kind in ('view', 'case_closed')
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

-- 3. Where reports stall, per alert: how many people started one, were blocked by a check, and closed the case.
--    No page calls this. Read it yourself in the SQL Editor:  select public.admin_report_funnel(30);
--    A "person" is the signed-in account, or the browser id for a guest. Counting begins on the first day a report event exists,
--    so cases closed before this update do not make "closed" bigger than "started". Admin accounts are left out.
create or replace function public.admin_report_funnel(days int default 30, tz text default 'Asia/Kolkata')
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  win   int  := least(greatest(coalesce(days, 30), 1), 365);
  first_day date := (select (min(e.at) at time zone tz)::date from public.events e where e.kind in ('report_started', 'report_blocked'));
  d0    date := greatest((now() at time zone tz)::date - (win - 1), coalesce(first_day, (now() at time zone tz)::date));
  res   jsonb;
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;

  with
  ev as (
    select e.kind, e.props ->> 'alert' as alert, e.props ->> 'reason' as reason, coalesce(e.user_id::text, e.visitor) as who
    from public.events e
    where e.kind in ('report_started', 'report_blocked', 'case_closed')
      and (e.at at time zone tz)::date >= d0
      and not exists (select 1 from public.profiles p where p.id = e.user_id and p.role = 'admin')
  ),
  al as (
    select alert,
      count(distinct who) filter (where kind = 'report_started') as started,
      count(distinct who) filter (where kind = 'report_blocked') as blocked,
      count(distinct who) filter (where kind = 'case_closed') as closed
    from ev where alert is not null group by alert
  ),
  rs as (select reason, count(*) as n from ev where kind = 'report_blocked' group by reason)
  select jsonb_build_object(
    'from', d0,
    'tracking_since', first_day,
    'alerts', coalesce((select jsonb_agg(to_jsonb(al) order by al.started desc, al.alert) from al), '[]'::jsonb),
    'reasons', coalesce((select jsonb_agg(to_jsonb(rs) order by rs.n desc) from rs), '[]'::jsonb)
  ) into res;

  return res;
end;
$$;
revoke all on function public.admin_report_funnel(int, text) from public, anon;
grant execute on function public.admin_report_funnel(int, text) to authenticated;
