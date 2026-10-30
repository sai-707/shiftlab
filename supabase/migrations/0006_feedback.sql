-- ShiftLab feedback: what testers type into the "Send feedback" window, and an admin-only way to read it.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run. Run 0001 to 0005 first (0003 makes is_admin()).
-- Safe to run twice.

create table if not exists public.feedback (
  id         bigint generated always as identity primary key,
  at         timestamptz not null default now(),
  visitor    text check (char_length(visitor) <= 40),            -- random id from the browser, not a person
  user_id    uuid references auth.users (id) on delete set null, -- only filled when the person ticked "you may contact me"
  signed_in  boolean not null default false,
  path       text check (char_length(path) <= 120),              -- the page they were on
  alert      text check (char_length(alert) <= 20),              -- e.g. SL-1014, when they were on an alert
  level      text check (level in ('Beginner', 'Intermediate', 'Hard', 'AI Era')),
  rating     smallint check (rating between 1 and 5),           -- how realistic it felt
  evidence   text check (evidence in ('yes', 'mostly', 'no')),  -- was the evidence enough
  confusing  text not null default '' check (char_length(confusing) <= 1000),
  opinion    text not null default '' check (char_length(opinion) <= 1000),
  role       text check (role in ('student', 'l1', 'l2plus', 'other')),
  contact_ok boolean not null default false,
  read       boolean not null default false,
  -- An empty form is not feedback: at least one answer is required.
  constraint feedback_has_answer check (rating is not null or evidence is not null or confusing <> '' or opinion <> ''),
  -- A person is linked only when they agreed to be contacted.
  constraint feedback_link_needs_ok check (user_id is null or contact_ok)
);
create index if not exists feedback_at_idx on public.feedback (at desc);
create index if not exists feedback_unread_idx on public.feedback (at desc) where not read;

alter table public.feedback enable row level security;

-- Anyone can add a row (guest or signed in). Nobody but an admin can read one, and the only thing an admin can change is "read".
revoke all on public.feedback from anon, authenticated;
grant insert (visitor, user_id, signed_in, path, alert, level, rating, evidence, confusing, opinion, role, contact_ok) on public.feedback to anon, authenticated;
grant select on public.feedback to authenticated;
grant update (read) on public.feedback to authenticated;

drop policy if exists "send feedback" on public.feedback;
create policy "send feedback"
  on public.feedback for insert
  to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

drop policy if exists "admin reads feedback" on public.feedback;
create policy "admin reads feedback"
  on public.feedback for select
  to authenticated
  using ((select public.is_admin()));

drop policy if exists "admin marks feedback read" on public.feedback;
create policy "admin marks feedback read"
  on public.feedback for update
  to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- Spam brake. Runs before every insert. It counts rows the sender cannot read, so it runs with the owner's rights.
-- 5 per hour per browser id, and 200 per hour for the whole site.
-- shortcut: the browser id is chosen by the browser, so a determined person can dodge the first limit. The site-wide cap still holds.
create or replace function public.feedback_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.visitor is not null
     and (select count(*) from public.feedback f where f.visitor = new.visitor and f.at > now() - interval '1 hour') >= 5 then
    raise exception 'too many' using errcode = 'P0001';
  end if;
  if (select count(*) from public.feedback f where f.at > now() - interval '1 hour') >= 200 then
    raise exception 'too many' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function public.feedback_limit() from public, anon, authenticated;

drop trigger if exists feedback_limit_trg on public.feedback;
create trigger feedback_limit_trg before insert on public.feedback
  for each row execute function public.feedback_limit();
