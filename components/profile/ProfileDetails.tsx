"use client";

import { useState, useTransition, type KeyboardEvent } from "react";
import { GITHUB_RE, githubName, typedUsername, usernameProblem } from "@/lib/profileRules";

const affix = "flex h-11 items-center rounded-[10px] border border-line bg-canvas pl-3.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40";
const bare = "h-full min-w-0 flex-1 bg-transparent pr-3.5 font-mono text-sm text-ink outline-none placeholder:text-muted";

// A signed-in person's username and GitHub link, editable here; the email comes from the account and is read-only.
// Each field saves when the person leaves it (or presses Enter), and only if it changed and is valid. onSave returns an error message or null.
export default function ProfileDetails({
  email, username, github, onSave,
}: {
  email: string; username: string; github: string; onSave: (patch: { username?: string; github?: string }) => Promise<string | null>;
}) {
  const [u, setU] = useState(username);
  const [gh, setGh] = useState(github);
  const [note, setNote] = useState("");
  const [bad, setBad] = useState(false);
  const [saving, startSave] = useTransition();

  function send(patch: { username?: string; github?: string }, done: string) {
    startSave(async () => {
      const err = await onSave(patch);
      setBad(err !== null);
      setNote(err ?? done);
    });
  }

  function saveUsername() {
    if (u === username) return;
    const problem = usernameProblem(u);
    if (problem) {
      setBad(true);
      setNote(problem);
      return;
    }
    send({ username: u }, "Username saved.");
  }

  function saveGithub() {
    const g = githubName(gh);
    setGh(g); // a pasted link turns into just the username
    if (g === github) return;
    if (g !== "" && !GITHUB_RE.test(g)) {
      setBad(true);
      setNote("That does not look like a GitHub username.");
      return;
    }
    send({ github: g }, g ? "GitHub link saved." : "GitHub link removed.");
  }

  const enter = (e: KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && e.currentTarget.blur();

  return (
    <section aria-labelledby="details-h" className="border-t border-line p-5 md:p-6">
      <h2 id="details-h" className="font-semibold">Profile details</h2>
      <p className="mt-1 text-sm text-muted">What other people can see about you. Your email comes from your account and cannot be changed here.</p>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label htmlFor="pd-user" className="text-sm font-medium">Username</label>
          <div className={affix}>
            <span className="font-mono text-sm text-muted" aria-hidden="true">@</span>
            <input
              id="pd-user"
              value={u}
              onChange={(e) => setU(typedUsername(e.target.value))}
              onBlur={saveUsername}
              onKeyDown={enter}
              maxLength={20}
              autoCapitalize="none"
              spellCheck={false}
              className={`${bare} pl-1`}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="pd-gh" className="text-sm font-medium">GitHub <span className="font-normal text-muted">(optional)</span></label>
          <div className={affix}>
            <span className="font-mono text-sm text-muted" aria-hidden="true">github.com/</span>
            <input
              id="pd-gh"
              value={gh}
              onChange={(e) => setGh(e.target.value.slice(0, 80))}
              onBlur={saveGithub}
              onKeyDown={enter}
              placeholder="your-username"
              autoCapitalize="none"
              spellCheck={false}
              className={`${bare} pl-0.5`}
            />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="pd-mail" className="text-sm font-medium">Email <span className="font-normal text-muted">(locked)</span></label>
          <div className="flex h-11 items-center gap-2.5 rounded-[10px] border border-dashed border-line bg-canvas/60 px-3.5">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="4" y="11" width="16" height="9" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
            <input id="pd-mail" type="email" readOnly value={email} className="h-full min-w-0 flex-1 bg-transparent text-sm text-ink/80 outline-none" />
          </div>
        </div>
      </div>
      <p aria-live="polite" className={`mt-2 min-h-4 text-xs ${bad ? "text-missed" : "text-muted"}`}>
        {saving ? "Saving…" : note}
      </p>
    </section>
  );
}
