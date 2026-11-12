-- ShiftLab: replies to feedback. The admin can answer a tester, and the tester can answer back (a two-way thread).
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run. Run 0006 first (and 0003 for is_admin()). Safe to run twice.
--
-- This file only ADDS things: one new table and four functions. The feedback table and every row in it stay exactly as they are.
-- A thread exists only for feedback that is linked to an account, which already means "signed in AND ticked 'You may contact me'".

create table if not exists public.feedback_messages (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  feedback_id bigint not null references public.feedback (id) on delete cascade,
  user_id     uuid   not null references auth.users (id) on delete cascade, -- the tester this thread is with
  from_admin  boolean not null,
  body        text not null check (char_length(body) between 1 and 1000),
  seen        boolean not null default false                               -- for an admin message: has the tester opened it
);
create index if not exists feedback_messages_thread_idx on public.feedback_messages (feedback_id, at);
create index if not exists feedback_messages_unseen_idx on public.feedback_messages (user_id) where from_admin and not seen;

-- Nobody touches the table directly except an admin reading it. Everything else goes through the functions below.
alter table public.feedback_messages enable row level security;
revoke all on public.feedback_messages from anon, authenticated;
grant select on public.feedback_messages to authenticated;
drop policy if exists "admin reads messages" on public.feedback_messages;
create policy "admin reads messages" on public.feedback_messages for select to authenticated using ((select public.is_admin()));

-- Send one message. An admin writes to the tester behind a feedback row; a tester writes back only on their own thread,
-- only after the admin has written first, and at most 10 a day. The role is decided here, never by the caller.
create or replace function public.send_feedback_message(fid bigint, msg text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  me    uuid := (select auth.uid());
  txt   text := left(btrim(coalesce(msg, '')), 1000);
  target uuid;
begin
  if me is null then raise exception 'sign in first' using errcode = '42501'; end if;
  if txt = '' then raise exception 'empty' using errcode = '22023'; end if;
  select f.user_id into target from public.feedback f where f.id = fid;
  if target is null then raise exception 'no account on this feedback' using errcode = '42501'; end if;

  if public.is_admin() then
    insert into public.feedback_messages (feedback_id, user_id, from_admin, body) values (fid, target, true, txt);
    update public.feedback set read = true where id = fid;
  else
    if target <> me then raise exception 'not your thread' using errcode = '42501'; end if;
    if not exists (select 1 from public.feedback_messages m where m.feedback_id = fid and m.from_admin) then
      raise exception 'no reply yet' using errcode = '42501';
    end if;
    if (select count(*) from public.feedback_messages m where m.user_id = me and not m.from_admin and m.at > now() - interval '1 day') >= 10 then
      raise exception 'too many' using errcode = 'P0001';
    end if;
    insert into public.feedback_messages (feedback_id, user_id, from_admin, body) values (fid, me, false, txt);
    update public.feedback set read = false where id = fid; -- brings the thread back to the top of the admin's Unread list
  end if;
end;
$$;

-- The caller's own threads: their original feedback and every message, oldest message first. Nothing about anyone else.
create or replace function public.my_threads()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(jsonb_agg(to_jsonb(t) order by t.last desc), '[]'::jsonb)
  from (
    select f.id, f.alert, f.path, f.confusing, f.opinion, f.at, x.last, x.messages
    from public.feedback f
    cross join lateral (
      select max(m.at) as last,
             jsonb_agg(jsonb_build_object('id', m.id, 'from_admin', m.from_admin, 'body', m.body, 'at', m.at, 'seen', m.seen) order by m.at, m.id) as messages
      from public.feedback_messages m
      where m.feedback_id = f.id
    ) x
    where f.user_id = (select auth.uid()) and x.last is not null
    order by x.last desc
    limit 50
  ) t;
$$;

-- For the bell: how many threads the caller has and how many admin messages they have not opened. Zeros for a guest.
create or replace function public.my_inbox()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'threads', (select count(distinct m.feedback_id) from public.feedback_messages m where m.user_id = (select auth.uid())),
    'unread',  (select count(*) from public.feedback_messages m where m.user_id = (select auth.uid()) and m.from_admin and not m.seen)
  );
$$;

create or replace function public.mark_my_messages_seen()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.feedback_messages set seen = true
  where user_id = (select auth.uid()) and from_admin and not seen;
$$;

revoke all on function public.send_feedback_message(bigint, text), public.my_threads(), public.my_inbox(), public.mark_my_messages_seen() from public, anon;
grant execute on function public.send_feedback_message(bigint, text), public.my_threads(), public.my_inbox(), public.mark_my_messages_seen() to authenticated;
