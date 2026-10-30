# ShiftLab build plan

## Phase 1: core simulator (no login, local data)
1. App shell and dark theme (done in step 1).
2. Alert data format and 5 original alerts, organised by topic and difficulty.
3. Dashboard (stats, shift clock) and alert queue with "Assign to me" (one active alert at a time).
4. Alert page: evidence viewers (logs, timeline, IPs), intel lookup, triage, case report, escalate.
5. Server-side scoring and feedback page.

## Phase 2: landing and login designs (done, screens only)
Landing page (pitch and the 3-step loop), register and login screens. Built in `components/site`; the forms check input but do not create accounts until Phase 3.

## Phase 3: accounts and saved progress
Step 1 done: sign up, sign in, sign out, password reset, `profiles` table with a role, and each person's own name, photo, username and GitHub link saved to their account (new accounts finish a welcome screen first; the profile page shows the email under the name). Step 2 done: admin dashboard at `/admin` (visitors, new accounts, active students, cases closed, average score, student journey, busiest sections, hardest alerts, newest accounts) fed by an insert-only `events` table. Step 3 done: `cases` and `saved_state` tables (migration 0005) with row-level security and the one-active-case rule in the database; closed cases are saved when graded; practice progress is saved in the background; a guest's browser progress is imported at first sign-in; sign-out clears the browser copy.

## Phase 4: admin analytics (done)
Admin role, events table and the owner dashboard are built. Not built: a separate `/admin/login` entrance, rate-limited event writes, automatic purge of old events.

## Phase 5: deploy
Done 2026-10-30: Cloudflare Workers (free) + Supabase, deployed from the private GitHub repo on every push to `main`, at the workers.dev address. Not done: a custom domain, custom SMTP for emails.

## Phase 6: portfolio polish
README with screenshots, demo GIF, architecture diagram.

## Later ideas
Playbooks content, AI coaching on reports, more alert packs and difficulty levels.

## Built so far (phase 1 extras)
- 38 alerts in four levels: Beginner 10, Intermediate 10, Hard 10, AI Era 8 (SL-1031 to SL-1038). Each level opens when the one before it is closed.
- Practice: phishing mailbox, log search (now with an "AI tools" source), intel lookup, analyst tools, triage sprint, Shift mode (order and treat six alerts, optional 2 minute clock), Spot the AI's mistake (check an AI summary against evidence), communication drills.
- Stage 1 report review and server-side grading (caps: wrong verdict 40, fewer than two key facts 40, contradiction 70).

## Next
Real-world links for the older alerts, Supabase (then point the landing "Get started" at /signup), analytics, deploy, README with screenshots, Stage 2 AI review (server-side key, per-user daily limit, never changes the score).
