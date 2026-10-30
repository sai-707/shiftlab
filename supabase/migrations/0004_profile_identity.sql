-- ShiftLab accounts, step 1c: each person picks a username and can add a GitHub profile.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste the CONTENTS of this file -> Run.
-- Run 0001 and 0002 first. Safe to run twice.
--
-- username: null until the person finishes the welcome screen (that is how the site knows to show it).
--           Once set: 3 to 20 lowercase letters, digits or underscores, unique, and not a name that sounds official.
-- github:   only the GitHub username (the site adds https://github.com/ in front). Empty when they have none.

alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists github text not null default '';

-- Backstop for the website's own checks. The publishable key is public, so these must hold even if someone skips the website.
-- The username pattern is lowercase only, so the plain unique index below is already case-insensitive.
alter table public.profiles drop constraint if exists profiles_identity_ok;
alter table public.profiles add constraint profiles_identity_ok check (
  (username is null or (
    username ~ '^[a-z0-9_]{3,20}$'
    and username not in ('admin', 'administrator', 'root', 'shiftlab', 'support', 'system', 'owner', 'moderator')
  ))
  and github ~ '^([A-Za-z0-9]([A-Za-z0-9-]{0,37}[A-Za-z0-9])?)?$'
);

-- Two people cannot share a username. Many people can have none yet (null is not equal to null).
create unique index if not exists profiles_username_key on public.profiles (username);

-- A signed-in user may change their own row, and only these four columns.
-- The role column stays out of the grant on purpose, so nobody can make themselves an admin from the website.
revoke update on public.profiles from anon, authenticated;
grant update (display_name, avatar, username, github) on public.profiles to authenticated;
-- The policy "update own details" from 0002 still decides which row: only the caller's own.
