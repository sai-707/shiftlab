-- DEMO DATA ONLY. Fills the admin dashboard with made-up guest traffic so you can see how it looks.
-- Run it in the Supabase SQL Editor after 0003_analytics.sql. Every demo row has a visitor id starting with "demo-".
-- Remove it all, before launch or any screenshot you share, with:
--   delete from public.events where visitor like 'demo-%';
-- Demo rows are guests, so they fill Visitors, Cases closed, Average score, Alerts and Sections.
-- Student accounts, Active students and the journey funnel always come from real accounts.

-- about 1,600 page views over the last 30 days, busier lately
insert into public.events (at, kind, visitor, path)
select now() - interval '30 days' * power(random(), 1.7),
       'view',
       'demo-' || (1 + floor(random() * 180))::int,
       p.path
from generate_series(1, 1600) g
cross join lateral (
  select (array['/', '/', '/', '/signup', '/login', '/dashboard', '/dashboard', '/queue', '/queue', '/mailbox', '/logs', '/lookup',
                '/comms', '/shift', '/tools', '/ai-check', '/playbooks', '/glossary', '/profile', '/start',
                '/alerts/SL-1001', '/alerts/SL-1001', '/alerts/SL-1002', '/alerts/SL-1003'])[1 + floor(random() * 24)::int] as path
  where g > 0
) p;

-- about 140 closed cases; early (easier) alerts score higher, with some spread
insert into public.events (at, kind, visitor, path, props)
select t.at, 'case_closed', t.visitor, '/alerts/' || t.alert,
       jsonb_build_object('alert', t.alert, 'score', t.score, 'verdict_ok', t.score >= 45, 'escalate_ok', t.score >= 30)
from (
  select now() - interval '30 days' * power(random(), 1.7) as at,
         'demo-' || (1 + floor(random() * 180))::int as visitor,
         a.alert,
         greatest(5, least(100, round(a.base + (random() - 0.5) * 50)))::int as score
  from generate_series(1, 140) g
  cross join lateral (
    select s.ids[x.i] as alert, 84 - 1.4 * x.i as base
    from (select array['SL-1001','SL-1002','SL-1003','SL-1004','SL-1005','SL-1006','SL-1007','SL-1008','SL-1009','SL-1010','SL-1011','SL-1012','SL-1013','SL-1014','SL-1015','SL-1016','SL-1017','SL-1018','SL-1019','SL-1020','SL-1021','SL-1022','SL-1023','SL-1024','SL-1025','SL-1026','SL-1027','SL-1028','SL-1029','SL-1030','SL-1031','SL-1032','SL-1033','SL-1034','SL-1035','SL-1036','SL-1037','SL-1038'] as ids) s
    cross join lateral (select 1 + floor(random() * array_length(s.ids, 1))::int as i where g > 0) x
  ) a
) t;
