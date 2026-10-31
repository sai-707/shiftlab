# Security

## Report a problem

Please report security problems privately, not in a public issue.

- On GitHub: open the **Security** tab of this repository and choose **Report a vulnerability**.
- Or email saidaswadkar14@gmail.com.

ShiftLab is a student project run by one person. I will read every report and answer as soon as I can, but I cannot promise a fixed time.

## What is in scope

The live site, the code in this repository, and the database rules in `supabase/migrations/`. Examples: reading another person's saved progress, becoming an admin, running someone else's code in the browser, getting the site to redirect to another domain.

## What is not a bug

- **The answer keys are public.** This is open source, so `content/*-keys.ts` can be read by anyone. The rule is only that the *running site* never sends an answer to your browser before you commit to yours. Scores are for learning, not for a test or a leaderboard.
- **Guest limits and progress in your browser** (the three-alert guest limit, local scores) can be edited by the person using them. They are nudges, not security.
- **The publishable Supabase key** in the browser code is public by design. The secret (service-role) key is never part of this project.

Thank you for helping keep ShiftLab safe.
