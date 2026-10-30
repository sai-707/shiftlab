-- ShiftLab accounts, step 1b: a signed-in person can save their own name and photo.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run. Run 0001 first.
-- Safe to run twice.

alter table public.profiles add column if not exists avatar text not null default '';

-- Backstop for the website's own checks: a name up to 40 characters, a photo up to 100,000 characters.
alter table public.profiles drop constraint if exists profiles_details_ok;
alter table public.profiles add constraint profiles_details_ok
  check (char_length(display_name) <= 40 and char_length(avatar) <= 100000);

-- A signed-in user may change their own row, and only these two columns.
-- The role column is left out of the grant on purpose, so nobody can make themselves an admin from the website.
revoke update on public.profiles from anon, authenticated;
grant update (display_name, avatar) on public.profiles to authenticated;

drop policy if exists "update own details" on public.profiles;
create policy "update own details"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
