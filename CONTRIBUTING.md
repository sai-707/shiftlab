# Contributing

Thanks for looking. ShiftLab is a small project, so the rules are short.

## Run it

See "Run it on your computer" in the [README](README.md). Before you open a pull request, run:

```bash
npm test
npm run lint
```

## Rules that keep the project safe

1. **Everything is fictional.** The company is "Harbor & Pine Logistics". Use `.test` domains and the documentation IP ranges (203.0.113.0/24, 198.51.100.0/24). No real people, real companies, real indicators or live links in alerts.
2. **Answers stay on the server.** Answer keys (`content/*-keys.ts`, `intel.ts`, `log-answers.ts`, `whois.ts`) and grading (`lib/grade.ts`, `lib/review.ts`) must never be imported by browser code. `tests/boundary.test.mjs` checks this.
3. **Only the publishable Supabase key** belongs in this project. Never add a secret or service-role key, and never commit `.env*` files.
4. **No report text, names or emails** in the `events` table or in logs.
5. **Original work only.** Alert text, wording, logos and design must be your own. Do not copy another product's scenarios, branding or text.
6. **Database changes go in a new numbered file** in `supabase/migrations/`, safe to run twice.

## Ideas that fit

New alerts (see "Adding an alert" in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)), clearer wording, accessibility fixes, tests, bug fixes. For anything large, open an issue first so we can agree before you spend time.

The name "ShiftLab" and its logo are not covered by the MIT licence: please pick another name for a fork you publish.
