-- ShiftLab certificates. Run this once in the Supabase dashboard: SQL Editor -> New query -> paste the CONTENTS of this file -> Run.
-- Run 0001 to 0013 first. Safe to run twice.
--
-- A certificate says: this person closed every alert of a level (or of all four levels, for Master) with an average of 70 or more.
-- The database works that out itself from the student's own saved cases, so the website cannot be tricked into issuing one early.
--
-- alert_catalog  which alert belongs to which level. The database has to know this because the alerts themselves live in the website's code.
--                shortcut: keep it in step by hand. When you add an alert, add a row here in a new migration (the tests/ folder checks the two agree).
-- certificates   one row per certificate. Nobody can insert, change or delete a row from the website: only the three functions below can,
--                and they only ever act for the signed-in student.
-- claim_certificate(kind, name)   issues the certificate if the rules are met, or returns the one already issued. The name is what is printed.
-- rename_certificate(id, name)    the owner can correct the printed name.
-- verify_certificate(id)          public. Returns what the verify page shows (name, scores, date) and nothing else: no email, no user id.
--
-- shortcut: as before (see 0005), a student could write a made-up score into their OWN case by calling the database directly, so a
-- determined cheat could still earn a certificate. Closing that needs a server-only secret key, which this project deliberately does not hold.
-- The verify page therefore proves "this is a real ShiftLab certificate record", not "this person's scores were checked by a human".

create table if not exists public.alert_catalog (
  alert_id text primary key check (alert_id ~ '^SL-[0-9]{4}$'),
  level    text not null check (level in ('Beginner', 'Intermediate', 'Hard', 'AI Era'))
);
alter table public.alert_catalog enable row level security;
revoke all on public.alert_catalog from anon, authenticated;
-- no policies on purpose: the functions below read it, nothing else needs to

insert into public.alert_catalog (alert_id, level) values
  -- Beginner (11)
  ('SL-1001', 'Beginner'), ('SL-1002', 'Beginner'), ('SL-1004', 'Beginner'), ('SL-1007', 'Beginner'), ('SL-1008', 'Beginner'), ('SL-1009', 'Beginner'), ('SL-1013', 'Beginner'), ('SL-1018', 'Beginner'), ('SL-1019', 'Beginner'), ('SL-1020', 'Beginner'), ('SL-1041', 'Beginner'),
  -- Intermediate (15)
  ('SL-1003', 'Intermediate'), ('SL-1005', 'Intermediate'), ('SL-1006', 'Intermediate'), ('SL-1010', 'Intermediate'), ('SL-1011', 'Intermediate'), ('SL-1012', 'Intermediate'), ('SL-1014', 'Intermediate'), ('SL-1015', 'Intermediate'), ('SL-1016', 'Intermediate'), ('SL-1017', 'Intermediate'), ('SL-1039', 'Intermediate'), ('SL-1040', 'Intermediate'), ('SL-1042', 'Intermediate'), ('SL-1047', 'Intermediate'), ('SL-1048', 'Intermediate'),
  -- Hard (14)
  ('SL-1021', 'Hard'), ('SL-1022', 'Hard'), ('SL-1023', 'Hard'), ('SL-1024', 'Hard'), ('SL-1025', 'Hard'), ('SL-1026', 'Hard'), ('SL-1027', 'Hard'), ('SL-1028', 'Hard'), ('SL-1029', 'Hard'), ('SL-1030', 'Hard'), ('SL-1043', 'Hard'), ('SL-1044', 'Hard'), ('SL-1045', 'Hard'), ('SL-1049', 'Hard'),
  -- AI Era (11)
  ('SL-1031', 'AI Era'), ('SL-1032', 'AI Era'), ('SL-1033', 'AI Era'), ('SL-1034', 'AI Era'), ('SL-1035', 'AI Era'), ('SL-1036', 'AI Era'), ('SL-1037', 'AI Era'), ('SL-1038', 'AI Era'), ('SL-1046', 'AI Era'), ('SL-1050', 'AI Era'), ('SL-1051', 'AI Era')
on conflict (alert_id) do update set level = excluded.level;

create table if not exists public.certificates (
  id         text primary key check (id ~ '^SL-(BGN|INT|HRD|AIE|MST)-[0-9A-F]{10}$'),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('Beginner', 'Intermediate', 'Hard', 'AI Era', 'Master')),
  holder     text not null check (char_length(holder) between 2 and 60),
  alerts     smallint not null check (alerts > 0),
  avg        smallint not null check (avg between 70 and 100),
  first_avg  smallint not null check (first_avg between 0 and 100),
  levels     jsonb check (levels is null or jsonb_typeof(levels) = 'object'),
  issued_at  timestamptz not null default now(),
  unique (user_id, kind)
);
alter table public.certificates enable row level security;
revoke all on public.certificates from anon, authenticated;
grant select on public.certificates to authenticated;
drop policy if exists "read own certificates" on public.certificates;
create policy "read own certificates" on public.certificates for select to authenticated using ((select auth.uid()) = user_id);

-- The row as the website uses it. No user id.
create or replace function public.cert_json(c public.certificates)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_build_object(
    'id', c.id, 'kind', c.kind, 'holder', c.holder, 'alerts', c.alerts, 'avg', c.avg,
    'firstAvg', c.first_avg, 'levels', c.levels, 'issuedAt', c.issued_at
  );
$$;

create or replace function public.claim_certificate(p_kind text, p_holder text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid     uuid := (select auth.uid());
  v_holder text := regexp_replace(btrim(coalesce(p_holder, '')), '\s+', ' ', 'g');
  prefix  text;
  have    public.certificates;
  total   int;
  done    int;
  v_avg   int;
  v_first int;
  v_levels jsonb := null;
begin
  if uid is null then raise exception 'sign_in' using errcode = '28000'; end if;
  prefix := case p_kind when 'Beginner' then 'BGN' when 'Intermediate' then 'INT' when 'Hard' then 'HRD' when 'AI Era' then 'AIE' when 'Master' then 'MST' end;
  if prefix is null then raise exception 'unknown_kind' using errcode = '22023'; end if;
  if char_length(v_holder) not between 2 and 60 or v_holder ~ '[<>[:cntrl:]]' then raise exception 'bad_name' using errcode = '22023'; end if;

  -- Already issued: hand back the same certificate, whatever name was sent now.
  select * into have from public.certificates where user_id = uid and kind = p_kind;
  if found then return public.cert_json(have); end if;

  if p_kind = 'Master' then
    if (select count(*) from public.certificates where user_id = uid and kind <> 'Master') < 4 then raise exception 'not_complete' using errcode = 'P0001'; end if;
    select count(*) into total from public.alert_catalog;
    select count(*), round(avg(c.score)), round(avg(least(100, greatest(0, coalesce((c.record #>> '{attempts,0,score}')::numeric, c.score)))))
      into done, v_avg, v_first
      from public.alert_catalog k join public.cases c on c.alert_id = k.alert_id and c.user_id = uid and c.status = 'closed';
    select jsonb_object_agg(l.level, l.a) into v_levels from (
      select k.level, round(avg(c.score))::int as a
      from public.alert_catalog k join public.cases c on c.alert_id = k.alert_id and c.user_id = uid and c.status = 'closed'
      group by k.level) l;
  else
    select count(*) into total from public.alert_catalog where level = p_kind;
    select count(*), round(avg(c.score)), round(avg(least(100, greatest(0, coalesce((c.record #>> '{attempts,0,score}')::numeric, c.score)))))
      into done, v_avg, v_first
      from public.alert_catalog k join public.cases c on c.alert_id = k.alert_id and c.user_id = uid and c.status = 'closed'
      where k.level = p_kind;
  end if;

  if total = 0 or done < total then raise exception 'not_complete' using errcode = 'P0001'; end if;
  if v_avg < 70 then raise exception 'avg_low' using errcode = 'P0001'; end if;

  insert into public.certificates (id, user_id, kind, holder, alerts, avg, first_avg, levels)
  values ('SL-' || prefix || '-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10)), uid, p_kind, v_holder, total, v_avg, v_first, v_levels)
  on conflict (user_id, kind) do nothing;
  select * into have from public.certificates where user_id = uid and kind = p_kind;
  return public.cert_json(have);
end;
$$;

create or replace function public.rename_certificate(p_id text, p_holder text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid    uuid := (select auth.uid());
  v_holder text := regexp_replace(btrim(coalesce(p_holder, '')), '\s+', ' ', 'g');
  have   public.certificates;
begin
  if uid is null then raise exception 'sign_in' using errcode = '28000'; end if;
  if char_length(v_holder) not between 2 and 60 or v_holder ~ '[<>[:cntrl:]]' then raise exception 'bad_name' using errcode = '22023'; end if;
  update public.certificates set holder = v_holder where id = p_id and user_id = uid returning * into have;
  if not found then raise exception 'not_found' using errcode = 'P0002'; end if;
  return public.cert_json(have);
end;
$$;

create or replace function public.verify_certificate(p_id text)
returns jsonb
language sql
security definer
stable
set search_path = ''
as $$
  select public.cert_json(c) from public.certificates c where c.id = upper(btrim(p_id));
$$;

revoke all on function public.cert_json(public.certificates) from public, anon, authenticated;
revoke all on function public.claim_certificate(text, text) from public, anon, authenticated;
revoke all on function public.rename_certificate(text, text) from public, anon, authenticated;
revoke all on function public.verify_certificate(text) from public, anon, authenticated;
grant execute on function public.claim_certificate(text, text) to authenticated;
grant execute on function public.rename_certificate(text, text) to authenticated;
grant execute on function public.verify_certificate(text) to anon, authenticated;
