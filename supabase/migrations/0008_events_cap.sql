-- ShiftLab: stop strangers from flooding the events table (and so your analytics numbers and your database size).
-- Run this once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run. Run 0003 first. Safe to run twice.
--
-- The publishable key is public, so anyone can add event rows straight to the database. This caps it:
-- 60 rows a minute per browser id, and 600 a minute for the whole site. Normal visitors never get near that.
-- Rows added from the SQL Editor (the demo data, your own clean-up) are not capped: only the website roles are.
-- shortcut: the browser id is chosen by the browser, so one person can dodge the first limit. The site-wide cap still holds.
-- It also means a flood can fill the minute and drop real page views until it stops. Move inserts behind a secret before that matters.

create index if not exists events_visitor_at_idx on public.events (visitor, at desc) where visitor is not null;

create or replace function public.events_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(current_setting('role', true), '') not in ('anon', 'authenticated') then
    return new;
  end if;
  if new.visitor is not null
     and (select count(*) from public.events e where e.visitor = new.visitor and e.at > now() - interval '1 minute') >= 60 then
    raise exception 'too many' using errcode = 'P0001';
  end if;
  if (select count(*) from public.events e where e.at > now() - interval '1 minute') >= 600 then
    raise exception 'too many' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function public.events_limit() from public, anon, authenticated;

drop trigger if exists events_limit_trg on public.events;
create trigger events_limit_trg before insert on public.events
  for each row execute function public.events_limit();
