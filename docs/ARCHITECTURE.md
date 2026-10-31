# How ShiftLab is built

A short map for people who want to read or change the code.

## Stack

Next.js 16 (App Router) and React 19 with strict TypeScript, Tailwind CSS 4, Supabase (accounts, saved progress, analytics), hosted on Cloudflare Workers through the OpenNext adapter.

## Runtime map

![Runtime map](runtime-map.png)

An HTML version with light and dark themes is in [`runtime-map.html`](runtime-map.html).

## The one rule

**The browser may see the questions, never the answers.**

```
Browser (untrusted)                       Server (trusted)
 components/**  ── ids + your answers ──▶  server actions (app/*-actions.ts, app/actions.ts)
 client-safe content (alert evidence)                │
                                                     ▼
 ◀── score, feedback, explanations ──   lib/grade.ts, lib/review.ts  ──▶  answer keys (content/*-keys.ts, ...)
```

- Evidence, mail, logs and drill text are in the browser bundle because you need them to work an alert. They contain no answers.
- Answer keys and grading run only on the server. Results go back to the browser after you commit to an answer.
- `tests/boundary.test.mjs` walks the import graph from every client file and fails if one can reach an answer key.

## Folder map

```
app/            pages, server actions (*-actions.ts), route handlers (auth callback, page-view beacon)
  (app)/        signed-in screens inside the sidebar shell
  admin/        owner analytics (dashboard, analytics, guests); gated on the server
components/     the screens; case/ is the heart (CaseWorkspace); site/ is the public landing and auth pages
content/        alerts, hints, playbooks, intel and log data; answer keys end in -keys.ts or are listed in the test
lib/            grading, progress stores, sync to Supabase, small shared rules
supabase/       numbered SQL migrations, run in order (0001 ... 0008); demo/ has made-up data for the admin pages
tests/          content and safety checks (no extra packages needed)
```

## Data and accounts

- **Guests** need nothing: progress lives in the browser (`localStorage`, keys `shiftlab.*.v1`) and is imported into the account at first sign-in. A guest can close 3 alerts before being asked to sign up (a nudge counted in the browser, not a security control).
- **Signed-in students**: `profiles` (name, photo, username, GitHub, role), `cases` (closed cases, one active case per user, enforced by a unique index) and `saved_state` (practice progress). Row-level security limits every table to the owner's own rows. A student can update only `display_name`, `avatar`, `username` and `github` on their profile; the `role` column changes only by SQL.
- **Admin** is a role on `profiles`. `/admin` answers 404 to everyone else, and every admin number comes from a `security definer` database function that checks the role again.
- **Analytics** (`events`): insert-only for the public and unreadable from the website. It stores a random browser id, a path and, for a closed case, the alert id and score, never report text, names or emails. Inserts are rate-limited in the database (migration 0008).

### Make yourself an admin

After you sign up once on your own copy, run this in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
```

## Adding an alert

Do every step or a test will tell you what is missing.

1. `content/alerts.ts`: add the alert (unique `SL-` id, a difficulty, evidence blocks with stable titles, an "Alert details" fields block).
2. `content/answer-keys.ts`: verdict, escalate, evidence matches, explanation.
3. `content/review-keys.ts`: key facts, next action, a model report, pitfalls.
4. `content/investigation-keys.ts` (levels with locked reports): the exact titles of the blocks to open.
5. `content/logs.ts` and `logLinks.ts`: log rows that support the story and guided searches that return them.
6. `content/intel.ts`: a unique key for each indicator.
7. `content/afteraction-keys.ts` (and `afteraction.ts` for a false positive).
8. Optional: `related.ts`, `realworld.ts` (a real, checked link), `shifts.ts` and `shift-keys.ts`.
9. Run `npm test`. The queue, dashboard and exports read from the `ALERTS` list, so nothing else needs a count.

Keep everything fictional: `.test` domains and the documentation IP ranges only.

## Deploy

Cloudflare Workers (free plan) plus Supabase. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` as both build variables and runtime secrets, add your site address under Supabase Authentication > URL Configuration, then `npm run deploy`. Use only the publishable key.
