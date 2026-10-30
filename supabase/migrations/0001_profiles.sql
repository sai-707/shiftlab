-- ShiftLab accounts, step 1: one profile row per user, with a role.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
-- Safe to run twice (uses "if not exists" / "or replace").

create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  role         text not null default 'student' check (role in ('student', 'admin')),
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A signed-in user can read their own row, and nothing else.
-- There is deliberately no insert, update or delete policy: nobody can change a role from the website.
-- Rows are created by the trigger below. The owner makes an admin with one SQL statement (see BRAIN.md).
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- Create the profile when someone signs up. The name comes from the sign-up form, trimmed to 40 characters.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 40));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: give a profile row to anyone who signed up before the trigger existed. Does nothing for people who already have one.
insert into public.profiles (id, display_name)
select id, left(coalesce(raw_user_meta_data ->> 'display_name', ''), 40)
from auth.users
on conflict (id) do nothing;
