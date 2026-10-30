-- ShiftLab accounts, step 3: each student's cases and practice progress are saved to their account.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste the CONTENTS of this file -> Run.
-- Run 0001 to 0004 first. Safe to run twice.
--
-- cases       one row per alert a student has opened. 'active' = being worked on, 'closed' = scored.
--             The database itself allows only ONE active case per student, so two browser tabs or two devices cannot cheat that rule.
-- saved_state everything else the site keeps per student (best scores in practice drills, solved log questions, handover notes),
--             one small JSON document per kind.
--
-- Security: only the signed-in student can touch their own rows (row-level security). A closed case can never be edited again,
-- only deleted (that is what "Reset progress" does). The publishable key is public, so every limit below is enforced here
-- and not only in the website's code.
-- shortcut: a student could still write a made-up score into their OWN closed case by calling the database directly, because
-- the site holds no secret key that could prove the score came from the grader. Fine while scores are only shown to the student;
-- before a public leaderboard or profile page shows scores as proof, move case writes behind a server-only secret.

create table if not exists public.cases (
  user_id    uuid not null references auth.users (id) on delete cascade,
  alert_id   text not null check (alert_id ~ '^SL-[0-9]{4}$'),
  status     text not null check (status in ('active', 'closed')),
  score      smallint check (score between 0 and 100),
  -- the whole closed case (what was submitted, the feedback, when), exactly what the Case reports page shows
  record     jsonb check (pg_column_size(record) <= 20000),
  started_at timestamptz not null default now(),
  closed_at  timestamptz,
  primary key (user_id, alert_id),
  constraint cases_shape check (
    (status = 'active' and score is null and record is null and closed_at is null)
    or (
      status = 'closed' and score is not null and record is not null and closed_at is not null
      and jsonb_typeof(record) = 'object'
      and record ->> 'alertId' = alert_id
      and jsonb_typeof(record -> 'feedback' -> 'score') = 'number'
      and (record -> 'feedback' ->> 'score')::numeric = score
    )
  )
);

-- One active case per student, enforced by the database.
create unique index if not exists cases_one_active_per_user on public.cases (user_id) where status = 'active';

-- Backstop against someone filling the free database by inserting thousands of made-up alert ids.
create or replace function public.limit_cases_per_user()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (select count(*) from public.cases where user_id = new.user_id) >= 100 then
    raise exception 'too many cases' using errcode = '23514';
  end if;
  return new;
end;
$$;
drop trigger if exists cases_limit on public.cases;
create trigger cases_limit before insert on public.cases for each row execute function public.limit_cases_per_user();

alter table public.cases enable row level security;
revoke all on public.cases from anon, authenticated;
grant select, insert, delete on public.cases to authenticated;
grant update (status, score, record, closed_at) on public.cases to authenticated;

drop policy if exists "read own cases" on public.cases;
create policy "read own cases" on public.cases for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "add own cases" on public.cases;
create policy "add own cases" on public.cases for insert to authenticated with check ((select auth.uid()) = user_id);
-- Only an active case can be updated (that is how it gets closed). A closed row matches no update, so it can never be reopened or re-scored.
drop policy if exists "close own active case" on public.cases;
create policy "close own active case" on public.cases for update to authenticated
  using ((select auth.uid()) = user_id and status = 'active')
  with check ((select auth.uid()) = user_id);
drop policy if exists "delete own cases" on public.cases;
create policy "delete own cases" on public.cases for delete to authenticated using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------------------------------------------------

create table if not exists public.saved_state (
  user_id    uuid not null references auth.users (id) on delete cascade,
  key        text not null check (key in ('mail', 'comms', 'after', 'sprint', 'shift', 'aicheck', 'logs', 'handover', 'sources')),
  data       jsonb not null check (jsonb_typeof(data) = 'object' and pg_column_size(data) <= 30000),
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

create or replace function public.touch_saved_state()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists saved_state_touch on public.saved_state;
create trigger saved_state_touch before update on public.saved_state for each row execute function public.touch_saved_state();

alter table public.saved_state enable row level security;
revoke all on public.saved_state from anon, authenticated;
grant select, insert, delete on public.saved_state to authenticated;
grant update (data) on public.saved_state to authenticated;

drop policy if exists "read own state" on public.saved_state;
create policy "read own state" on public.saved_state for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "add own state" on public.saved_state;
create policy "add own state" on public.saved_state for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "change own state" on public.saved_state;
create policy "change own state" on public.saved_state for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "delete own state" on public.saved_state;
create policy "delete own state" on public.saved_state for delete to authenticated using ((select auth.uid()) = user_id);
