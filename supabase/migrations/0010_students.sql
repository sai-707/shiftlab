-- ShiftLab: a Students page for the admin area (every account, with a search box and a page for each one).
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run. Run 0003 to 0009 first. Safe to run twice.
--
-- This file only ADDS things: one index and two read-only functions. It does not create, change or delete any table, column or row,
-- so everything recorded so far (accounts, visits, cases, feedback) is left exactly as it is. Nothing here writes data.

-- 1. Speeds up "which browsers belong to this account", which the Students page asks for.
create index if not exists events_visitor_idx on public.events (visitor) where visitor is not null;

-- 2. The list. One row per account, newest first, `lim` at a time (50 by default, at most 200), starting after `skip` rows.
--    `q` narrows it to accounts whose name or email contains that text. Emails are masked in the answer, like the Dashboard's list.
--    "source" is the first ?ref= label (for example linkedin-post2) seen from any browser this account signed in from.
create or replace function public.admin_students(lim int default 50, skip int default 0, q text default null)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  l         int  := least(greatest(coalesce(lim, 50), 1), 200);
  s         int  := greatest(coalesce(skip, 0), 0);
  pat       text := case when nullif(trim(coalesce(q, '')), '') is null then null
                         else '%' || replace(replace(replace(trim(q), '\', '\\'), '%', '\%'), '_', '\_') || '%' end;
  res_total int;
  res_rows  jsonb;
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;

  select count(*) into res_total
  from auth.users u
  left join public.profiles p on p.id = u.id
  where pat is null or u.email ilike pat or p.display_name ilike pat;

  select coalesce(jsonb_agg(to_jsonb(r) order by r.joined desc, r.id), '[]'::jsonb) into res_rows
  from (
    select
      u.id,
      coalesce(p.display_name, '') as name,
      case when u.email is null then '' else left(split_part(u.email, '@', 1), 1) || '***@' || split_part(u.email, '@', 2) end as email,
      u.created_at as joined,
      u.last_sign_in_at as last_sign_in,
      coalesce(u.raw_app_meta_data ->> 'provider', 'email') as method,
      (u.email_confirmed_at is not null) as confirmed,
      coalesce(p.role, 'student') as role,
      c.closed,
      c.avg_score,
      c.active_alert,
      c.active_since,
      (select max(e.at) from public.events e where e.user_id = u.id) as last_seen,
      src.ref as source
    from auth.users u
    left join public.profiles p on p.id = u.id
    left join lateral (
      select
        count(*) filter (where k.status = 'closed') as closed,
        round(avg(k.score) filter (where k.status = 'closed'))::int as avg_score,
        max(k.alert_id) filter (where k.status = 'active') as active_alert,
        max(k.started_at) filter (where k.status = 'active') as active_since
      from public.cases k where k.user_id = u.id
    ) c on true
    left join lateral (
      select e.props ->> 'ref' as ref
      from public.events e
      where e.props ->> 'ref' is not null
        and e.visitor in (select v.visitor from public.events v where v.user_id = u.id and v.visitor is not null)
      order by e.at
      limit 1
    ) src on true
    where pat is null or u.email ilike pat or p.display_name ilike pat
    order by u.created_at desc, u.id
    limit l offset s
  ) r;

  return jsonb_build_object('total', res_total, 'rows', res_rows);
end;
$$;
revoke all on function public.admin_students(int, int, text) from public, anon;
grant execute on function public.admin_students(int, int, text) to authenticated;

-- 3. One student: who they are, every case with its start and finish, and the latest 100 things they did,
--    including what their browser did BEFORE they signed up (marked guest = true). No report text, no emails in full.
create or replace function public.admin_student(uid uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  who jsonb;
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;

  select to_jsonb(r) into who
  from (
    select
      u.id,
      coalesce(p.display_name, '') as name,
      case when u.email is null then '' else left(split_part(u.email, '@', 1), 1) || '***@' || split_part(u.email, '@', 2) end as email,
      u.created_at as joined,
      u.last_sign_in_at as last_sign_in,
      coalesce(u.raw_app_meta_data ->> 'provider', 'email') as method,
      (u.email_confirmed_at is not null) as confirmed,
      coalesce(p.role, 'student') as role,
      (
        select e.props ->> 'ref' from public.events e
        where e.props ->> 'ref' is not null
          and e.visitor in (select v.visitor from public.events v where v.user_id = u.id and v.visitor is not null)
        order by e.at limit 1
      ) as source
    from auth.users u
    left join public.profiles p on p.id = u.id
    where u.id = uid
  ) r;

  if who is null then
    return null;
  end if;

  return jsonb_build_object(
    'student', who,
    'cases', coalesce((
      select jsonb_agg(to_jsonb(c) order by c.started_at)
      from (select k.alert_id, k.status, k.score, k.started_at, k.closed_at from public.cases k where k.user_id = uid) c
    ), '[]'::jsonb),
    'activity', coalesce((
      select jsonb_agg(to_jsonb(a) order by a.at desc, a.id desc)
      from (
        select
          e.id,
          e.at,
          e.kind,
          e.path,
          e.props ->> 'alert' as alert,
          (e.props ->> 'score')::numeric as score,
          e.props ->> 'reason' as reason,
          e.props ->> 'ref' as ref,
          (e.user_id is null) as guest
        from public.events e
        where e.user_id = uid
           or e.visitor in (select v.visitor from public.events v where v.user_id = uid and v.visitor is not null)
        order by e.at desc, e.id desc
        limit 100
      ) a
    ), '[]'::jsonb)
  );
end;
$$;
revoke all on function public.admin_student(uuid) from public, anon;
grant execute on function public.admin_student(uuid) to authenticated;
