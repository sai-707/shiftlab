@AGENTS.md

# ShiftLab

A free web simulator for people training to be SOC (Security Operations Centre) Level 1 analysts. The user plays the analyst on shift: takes an alert from a queue, investigates the evidence, marks it True Positive or False Positive, writes a short case report (what happened, what is confirmed, what is unknown, next action), can escalate, and gets a score with coaching. Every alert is fictional.

## Stack

- Now: Next.js (App Router) + TypeScript + Tailwind CSS v4, npm. Supabase Auth for accounts (`profiles` table with a role).
- Saved progress (`cases` + `saved_state`, migration 0005, synced by `lib/sync.ts`) and analytics (`events` + `/admin`) exist. Hosted on Cloudflare Workers (OpenNext adapter) with Supabase; a push to `main` on the private GitHub repo redeploys (details in BRAIN.md §16).

## Rules

- Answer keys and scoring run on the server only. Never send the correct verdict or scoring rubric to the browser.
- One active alert per user. Enforce it in the database (unique partial index on cases(user_id) where status is in progress), not only in the UI.
- Admin is a role on the user profile, checked on the server. `/admin/login` is only a separate entrance. An admin sees only `/admin` (dashboard and analytics): `signIn` sends them there, and the `(app)` layout and `/welcome` redirect an admin to `/admin`, so the student workspace is closed to that account. To practise as a student, use a student account.
- Supabase: only the publishable key lives in this project (`.env.local`, git-ignored). Never add the secret/service_role key. Users can read their own `profiles` row and update only its `display_name`, `avatar`, `username` and `github` columns (column-level grant, never widen it to `role`); roles change only by SQL. Guests keep working: no page requires an account, but a guest can close only `GUEST_LIMIT` (3) alerts (`lib/progress.ts`), then is asked to sign up; their progress is imported into the account at first sign-in. The limit is counted in the browser, so it is a nudge, not security. A signed-in account with no username is sent to `/welcome` first (name and username required, photo and GitHub optional); the email there is read-only and comes from the account.
- Saved progress: a signed-in student's closed cases and practice scores are stored in `cases` and `saved_state` (RLS: own rows only; a closed case can never be updated; one active case per user is a unique index). Browser stores are a cache: every `createStore` write schedules a debounced save through `lib/sync.ts`, and sign-out wipes them. Merges only grow (max, OR, union). Guests stay local-only. Before any public leaderboard, move case writes behind a server-only secret (a student can currently write a fake score into their own closed case).
- Analytics: the `events` table is insert-only for the public and unreadable through the website; the owner's numbers come only from the admin-only database functions `admin_overview` and `admin_recent_users` (`supabase/migrations/0003_analytics.sql`). Never store report text, names or emails in `events`, never log them, and never add a select policy to it. New admin numbers go in a new migration.
- All names, text, logos and visual design are original to ShiftLab. Do not copy another product's branding, wording or scenarios.
- Keep it simple: build the smallest thing that works, and leave a `shortcut:` comment when a known limit is accepted.

## Structure

- public pages `app/page.tsx` (landing), `app/login`, `app/signup`, built from `components/site` (own stylesheet `site.css`, scoped under `.site`, outside the app layout); `app/(app)` signed-in pages (dashboard, queue, alerts, lookup, playbooks, reports, profile); `app/admin` owner analytics.
- `components/layout` shell pieces, `components/ui` small shared pieces. The account dropdown is `components/ui/UserMenu.tsx` (no UI library on purpose: a plain menu-button pattern, drawn in a portal); it sits in the top-right corner: the student layout renders it (via `SidebarAccount`), the admin shell puts it in its header.
- `content/` alert and playbook data (added in the next step); `lib/` helpers such as scoring.

## Theme

Dark "night-shift control room". Use the Tailwind tokens defined in `app/globals.css` (`bg-canvas`, `bg-panel`, `bg-raised`, `border-line`, `text-ink`, `text-muted`, `text-accent`, severity `critical`/`high`/`medium`/`low`, feedback `correct`/`missed`), never raw hex values. Fonts: Inter for the interface, JetBrains Mono (`font-mono`) for logs, IPs and email headers.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- When graphify-out/graph.json exists, run `graphify query "<question>"` before your first grep, search or source-file read for a codebase question, and put this rule in every subagent prompt that explores code. Read raw files only for lines the graph or an earlier read already located. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
- A committed graphify-out/graph.json is rewritten whole on every build, so a large diff to it in a pull request is expected. Do not flag it as churn or suggest skipping the graph rebuild or its hooks.
