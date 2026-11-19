-- ShiftLab: roadmap progress is saved to each student's account, and the admin area gets a roadmap page.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste the CONTENTS of this file -> Run.
-- Run 0001 to 0011 first. Safe to run twice.
--
-- 1. saved_state only accepted a fixed list of keys. This adds 'roadmap' to it. Nothing else about the table changes,
--    and no row is touched.
-- 2. admin_roadmap(): read-only totals for the admin Roadmap page. It returns counts only (how many students finished each
--    topic), never a name, an email or one student's list, and it checks the admin role itself like the other admin functions.

alter table public.saved_state drop constraint if exists saved_state_key_check;
alter table public.saved_state add constraint saved_state_key_check
  check (key in ('mail', 'comms', 'after', 'sprint', 'shift', 'aicheck', 'logs', 'handover', 'sources', 'roadmap'));

create or replace function public.admin_roadmap()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  res jsonb;
begin
  if not public.is_admin() then
    raise exception 'admins only' using errcode = '42501';
  end if;

  select jsonb_build_object(
    -- accounts that have saved any roadmap progress at all (opening a topic counts)
    'saved', (select count(*) from public.saved_state where key = 'roadmap'),
    -- accounts that have finished at least one topic
    'started', (
      select count(*) from public.saved_state
      where key = 'roadmap' and jsonb_typeof(data -> 'done') = 'object' and data -> 'done' <> '{}'::jsonb
    ),
    -- how many accounts picked each track
    'tracks', coalesce((
      select jsonb_object_agg(t.track, t.n)
      from (
        select case when data ->> 'track' = 'eng' then 'eng' else 'soc' end as track, count(*) as n
        from public.saved_state where key = 'roadmap' group by 1
      ) t
    ), '{}'::jsonb),
    -- topic slug -> how many accounts marked it done
    'topics', coalesce((
      select jsonb_object_agg(d.slug, d.n)
      from (
        select k.slug, count(*) as n
        from public.saved_state s,
             jsonb_object_keys(case when jsonb_typeof(s.data -> 'done') = 'object' then s.data -> 'done' else '{}'::jsonb end) as k(slug)
        where s.key = 'roadmap'
        group by k.slug
      ) d
    ), '{}'::jsonb)
  ) into res;

  return res;
end;
$$;

revoke all on function public.admin_roadmap() from public, anon;
grant execute on function public.admin_roadmap() to authenticated;
