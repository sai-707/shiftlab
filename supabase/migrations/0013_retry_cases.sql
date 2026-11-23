-- ShiftLab retries: a student may try an alert again, up to 3 times. The case keeps the best score.
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste the CONTENTS of this file -> Run.
-- Run 0001 to 0012 first. Safe to run twice. Run it BEFORE you deploy the retry code.
--
-- What changes: until now a closed case could never be updated (the update rule only matched active rows).
-- Now a closed case can be updated, but a trigger inside the database keeps the same promises:
--   * a closed case never reopens,
--   * the saved score never goes down (the best try is kept),
--   * the list of tries only grows, one at a time, and never past 3.
-- shortcut: as before, a student could still write a made-up score into their OWN case by calling the database directly,
-- because the website holds no secret key that proves a score came from the grader. Certificates will move case writes behind a server-only secret.

create or replace function public.attempt_count(r jsonb)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case when jsonb_typeof(r -> 'attempts') = 'array' then jsonb_array_length(r -> 'attempts') else 1 end;
$$;

create or replace function public.guard_case_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'closed' then
    if new.status <> 'closed' then
      raise exception 'a closed case cannot be reopened' using errcode = '23514';
    end if;
    if new.score < old.score then
      raise exception 'the best score cannot go down' using errcode = '23514';
    end if;
    if public.attempt_count(new.record) > 3 then
      raise exception 'at most 3 attempts' using errcode = '23514';
    end if;
    if public.attempt_count(new.record) < public.attempt_count(old.record)
       or public.attempt_count(new.record) > public.attempt_count(old.record) + 1 then
      raise exception 'tries are added one at a time' using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists cases_guard on public.cases;
create trigger cases_guard before update on public.cases for each row execute function public.guard_case_update();

drop policy if exists "close own active case" on public.cases;
drop policy if exists "update own case" on public.cases;
create policy "update own case" on public.cases for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
