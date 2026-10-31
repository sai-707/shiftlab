# ShiftLab

**A free, browser-based practice shift for aspiring SOC Level 1 analysts.**
You take alerts from a queue at a fictional company, read the evidence, decide whether each one is a real attack, and write your report. ShiftLab then scores it and shows what a strong report looks like.

**Live:** https://shiftlab.blueteam-labs.workers.dev

![An alert page: description, labelled alert details, then evidence tabs and the report](docs/alert-page.png)

## Why it exists

Most beginner security training either shows you the answer or uses real data. ShiftLab makes you decide first, then explains. It is built for people learning the SOC L1 job: triage, reading evidence, writing a clear report, and knowing when to escalate.

Everything in it is fictional. The company is "Harbor & Pine Logistics", and every domain and address is a reserved test value (`.test` names and documentation IP ranges).

## What you can do

- **Work 38 alerts in four levels:** Beginner, Intermediate, Hard and AI Era (prompt injection, deepfake voice fraud, stolen AI keys and similar).
- **One page per alert:** the alert as labelled rows, the evidence in tabs (logs, context, mail headers, timelines), then your report at the bottom.
- **Judge, don't guess:** on higher levels the report stays locked until you have opened enough sources, as a real analyst would.
- **Free hints:** a lightbulb button gives three steps (think, look, find). Hints never give the verdict and never change your score.
- **Write the report:** verdict, what happened, what is confirmed, what is still unknown, next action, and whether to escalate.
- **About (`/guide`):** a public, plain-English page for someone who has never heard of a SOC: what ShiftLab is, the problem it tackles, who it is for and why it was made. The words live in `content/guide.ts`; `public/ShiftLab-guide.pdf` is a two-page copy of them. Remake the PDF after changing the text.
- **Guests (admin):** an admin page that shows how many people try the site without an account, how many of them become accounts (including sign-ups that never confirmed their email), how many alerts each guest solved, and a log of what guests did. Needs `supabase/migrations/0007_admin_guests.sql` (safe to run again after an update).
- **Feedback after an alert:** the feedback window opens by itself a moment after a case is closed, with a Skip button. It stops asking after the person sends feedback once or skips twice.
- **Try it as a guest:** the landing page has a guest button (to the alert queue) next to "Create a free account".
- **Send feedback:** a short window (ratings and a few questions) on every page; the owner reads it in an admin page.
- **Get coached:** a score with a breakdown, what you missed, a model report, and how the real world compares.
- **Practise the tools:** intel check (look up an address, domain or file hash), log search, a mailbox to triage, shift handover, playbooks and a glossary.
- **Keep your progress:** guests keep it in the browser. Signed-in users (email or Google) have it saved to their account.

![The evidence card with the free hint panel open](docs/hint.png)

## How it is built

| Part | Choice |
|---|---|
| App | Next.js 16 (App Router), React 19, TypeScript (strict) |
| Styling | Tailwind CSS 4 |
| Accounts and saved progress | Supabase (email sign-in, one `profiles` table, saved state, analytics events) |
| Hosting | Cloudflare Workers through the OpenNext adapter (free plan) |

**The one rule behind the design: the browser may see the questions, never the answers.** The answer keys (`content/*-keys.ts`) and the grading code (`lib/grade.ts`, `lib/review.ts`) only run on the server, behind server actions. A test (`tests/boundary.test.mjs`) walks the import graph from every client file and fails if any of them could reach an answer key.

```
app/          pages, server actions, route handlers
components/   the screens (case workspace, queue, dashboard, tools)
content/      alerts, hints, playbooks, intel and log data, and the server-only answer keys
lib/          grading, progress, sync, small stores
supabase/     SQL migrations, run in order
tests/        content and safety checks
```

More detail is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): how the server/browser split works, the data model, and how to add an alert.

## Run it on your computer

You need Node.js 22.6 or newer and a free [Supabase](https://supabase.com) project.

```bash
npm install
```

Create a file called `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your project URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your publishable (anon) key
```

Use only the publishable key. Never put a secret or service-role key in this project.

In the Supabase SQL editor, run the files in `supabase/migrations/` in order (`0001` to `0008`). Then:

```bash
npm run dev      # http://localhost:3000
npm test         # content and safety checks
npm run build    # production build
```

To see the admin pages on your own copy, sign up once, then make that account an admin (the one SQL line is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)).

Deploy to Cloudflare Workers with `npm run deploy`.

## Tests

`npm test` runs checks that need no extra packages:

- every alert has the text, evidence and questions the page needs, and Beginner questions point at real evidence tabs;
- Hard and AI Era titles and asset labels do not state the finding;
- every alert has three hints, and every tab a hint names really exists;
- every alert has an answer key and a review key;
- no client code can reach an answer key or the grading code.

They also run on every push through GitHub Actions.

## The answers are in this repo

ShiftLab is open source, so anyone can read the answer keys in `content/*-keys.ts`. The *live site* never sends an answer to your browser before you commit to yours, and scores are for learning, not for a test or a leaderboard. If you want the real exercise, don't peek.

## Status

A student project that is still growing. The alerts, answers and scoring were written by the author.

## Contributing and security

Read [CONTRIBUTING.md](CONTRIBUTING.md) first (short). To report a security problem privately, see [SECURITY.md](SECURITY.md).

## Credits

The admin pages' layout was inspired by the "Dashboard 1" template at efferd.com and the account menu by "dropdown-menu-01" at 21st.dev. No code was copied from either: ShiftLab's versions are written from scratch with its own colours, fonts and logo.

## Licence

Code and content: [MIT](LICENSE), copyright 2026 Sai Daswadkar. The name "ShiftLab" and its logo are not covered by the licence, so please give a published fork its own name.
