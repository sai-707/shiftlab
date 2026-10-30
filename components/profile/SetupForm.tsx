"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { signOut } from "@/app/auth-actions";
import { completeProfile } from "@/app/profile-actions";
import { resizeAvatar } from "@/lib/profile";
import { GITHUB_RE, githubName, initialsOf, NAME_MAX, typedUsername, usernameProblem } from "@/lib/profileRules";

const input = "h-11 w-full rounded-[10px] border border-line bg-canvas px-3.5 text-[15px] text-ink placeholder:text-muted focus:border-accent";
const affix = "flex h-11 items-center rounded-[10px] border border-line bg-canvas pl-3.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40";
const bare = "h-full min-w-0 flex-1 bg-transparent pr-3.5 font-mono text-sm text-ink outline-none placeholder:text-muted";
const hint = "text-[13px] text-muted";

function Label({ id, text, tag }: { id: string; text: string; tag: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <label htmlFor={id} className="text-sm font-medium">{text}</label>
      <span className="text-xs text-muted">{tag}</span>
    </div>
  );
}

function Avatar({ photo, name, className }: { photo: string; name: string; className: string }) {
  return (
    <div
      role="img"
      aria-label={photo ? "Your profile photo" : "Your initials"}
      className={`flex shrink-0 items-center justify-center rounded-full border border-line bg-raised bg-cover bg-center font-semibold ${className}`}
      style={photo ? { backgroundImage: `url(${photo})` } : undefined}
    >
      {photo ? "" : initialsOf(name)}
    </div>
  );
}

// The first thing a new account sees: name and username (required), photo and GitHub (optional), with a live preview.
// The email comes from the account and is shown read-only. completeProfile() saves it and then opens the dashboard.
export default function SetupForm({ email, initial }: { email: string; initial: { name: string; avatar: string } }) {
  const [name, setName] = useState(initial.name);
  const [username, setUsername] = useState(() => {
    const s = typedUsername(email.split("@")[0] ?? ""); // a starting suggestion from the email, easy to change
    return usernameProblem(s) ? "" : s;
  });
  const [github, setGithub] = useState("");
  const [photo, setPhoto] = useState(initial.avatar);
  const [photoError, setPhotoError] = useState("");
  const [error, setError] = useState("");
  const [saving, startSave] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const g = githubName(github);
  const githubOk = g === "" || GITHUB_RE.test(g);
  const userProblem = username ? usernameProblem(username) : null;

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 8_000_000) {
      setPhotoError("Choose a picture (PNG, JPG, WebP or GIF) under 8 MB.");
      return;
    }
    try {
      setPhoto(await resizeAvatar(file));
      setPhotoError("");
    } catch {
      setPhotoError("That picture could not be read. Try another one.");
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (Array.from(name.trim()).length < 2) return setError("Enter your full name (at least 2 characters).");
    const problem = usernameProblem(username);
    if (problem) return setError(problem);
    if (!githubOk) return setError("That does not look like a GitHub username.");
    startSave(async () => {
      const r = await completeProfile({ name, username, github, avatar: photo });
      setError(r.error); // on success the action redirects and this line never runs
    });
  }

  return (
    <div
      className="min-h-screen bg-void text-ink"
      style={{ backgroundImage: "radial-gradient(60rem 28rem at 85% -8%, rgb(34 211 238 / 0.10), transparent 60%), radial-gradient(40rem 30rem at -8% 108%, rgb(167 139 250 / 0.07), transparent 60%)" }}
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-9 px-4 py-7 md:px-8 md:pb-16">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-[17px] font-semibold tracking-tight">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-hidden="true" />
            ShiftLab
          </div>
          <form action={signOut} className="flex flex-wrap items-center gap-x-3 text-[13px] text-muted">
            <span className="break-all">Signed in as {email}</span>
            <button type="submit" className="rounded-md px-2 py-1 underline hover:text-ink">Sign out</button>
          </form>
        </header>

        <div className="flex flex-col gap-2.5">
          <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-accent">Welcome</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">Set up your profile</h1>
          <p className="max-w-xl text-base leading-relaxed text-muted">
            This is how you appear in ShiftLab. It takes under a minute, and you can change any of it later on your Profile page.
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-6">
          <form onSubmit={submit} noValidate className="flex min-w-0 flex-[999_1_500px] flex-col gap-6 rounded-2xl border border-line bg-panel p-5 sm:p-7">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar photo={photo} name={name} className="h-[84px] w-[84px] text-3xl" />
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="h-10 rounded-[10px] border border-line bg-raised px-4 text-sm font-medium hover:border-accent hover:text-accent"
                  >
                    {photo ? "Change photo" : "Add a photo"}
                  </button>
                  {photo && (
                    <button type="button" onClick={() => setPhoto("")} className="text-xs text-muted hover:text-missed">
                      Remove
                    </button>
                  )}
                </div>
                <span className={hint}>Optional. JPG, PNG or WebP, under 8 MB.</span>
                {photoError && <span role="alert" className="text-xs text-missed">{photoError}</span>}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  tabIndex={-1}
                  aria-hidden="true"
                  onChange={(e) => {
                    pickPhoto(e.target.files?.[0]);
                    e.target.value = "";
                  }}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label id="setup-name" text="Full name" tag="Required" />
                <input
                  id="setup-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, NAME_MAX))}
                  placeholder="Your full name"
                  autoComplete="name"
                  maxLength={NAME_MAX}
                  className={input}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label id="setup-user" text="Username" tag="Required" />
                <div className={affix}>
                  <span className="font-mono text-sm text-muted" aria-hidden="true">@</span>
                  <input
                    id="setup-user"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(typedUsername(e.target.value))}
                    placeholder="username"
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    maxLength={20}
                    aria-invalid={!!userProblem}
                    aria-describedby="setup-user-hint"
                    className={`${bare} pl-1`}
                  />
                </div>
                <span id="setup-user-hint" className={userProblem ? "text-[13px] text-missed" : hint}>
                  {userProblem ?? "3 to 20 lowercase letters, numbers or underscores."}
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label id="setup-mail" text="Email" tag="From your account" />
                <div className="flex h-11 items-center gap-2.5 rounded-[10px] border border-dashed border-line bg-canvas/60 px-3.5">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="4" y="11" width="16" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                  <input id="setup-mail" type="email" readOnly value={email} aria-describedby="setup-mail-hint" className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-ink/80 outline-none" />
                </div>
                <span id="setup-mail-hint" className={hint}>The email you signed up with. It is shown on your profile and cannot be changed here.</span>
              </div>

              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label id="setup-gh" text="GitHub profile" tag="Optional" />
                <div className={affix}>
                  <span className="font-mono text-sm text-muted" aria-hidden="true">github.com/</span>
                  <input
                    id="setup-gh"
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value.slice(0, 80))}
                    placeholder="your-username"
                    autoCapitalize="none"
                    spellCheck={false}
                    aria-invalid={!githubOk}
                    aria-describedby="setup-gh-hint"
                    className={`${bare} pl-0.5`}
                  />
                </div>
                <span id="setup-gh-hint" className={githubOk ? hint : "text-[13px] text-missed"}>
                  {githubOk ? "Only if you have one. Recruiters can open it from your profile. Pasting the full link works too." : "That does not look like a GitHub username."}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-line pt-5">
              <button
                type="submit"
                disabled={saving}
                className="h-[46px] rounded-[10px] bg-accent px-6 text-[15px] font-semibold text-void hover:brightness-110 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Continue to ShiftLab"}
              </button>
              <span className={hint}>Full name and username are required.</span>
            </div>
            <p role="alert" className={error ? "text-sm text-missed" : "sr-only"}>{error}</p>
          </form>

          <aside aria-label="Profile preview" className="flex min-w-0 flex-[1_1_300px] flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted">Live preview</p>
            <div className="overflow-hidden rounded-2xl border border-line bg-panel">
              <div className="h-16 bg-linear-to-r from-accent/25 via-accent/5 to-transparent" />
              <div className="-mt-9 flex flex-col gap-4 px-6 pb-6">
                <Avatar photo={photo} name={name} className="h-[72px] w-[72px] border-[3px] border-panel text-2xl ring-1 ring-line" />
                <div className="flex flex-col gap-1">
                  <span className="text-[22px] font-semibold tracking-tight [overflow-wrap:anywhere]">{name.trim() || "Your name"}</span>
                  <span className="font-mono text-sm text-muted">{username ? `@${username}` : "@username"}</span>
                </div>
                <div className="flex flex-col gap-2.5 border-t border-line pt-4 text-sm">
                  <div className="flex min-w-0 items-center gap-2.5 text-ink/85">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                    <span className="[overflow-wrap:anywhere]">{email}</span>
                  </div>
                  {g !== "" && githubOk && (
                    <div className="flex min-w-0 items-center gap-2.5 text-accent">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
                        <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
                      </svg>
                      <span className="font-mono text-[13px] [overflow-wrap:anywhere]">github.com/{g}</span>
                    </div>
                  )}
                </div>
                <span className="self-start rounded-full border border-accent/40 px-2.5 py-0.5 text-xs font-medium text-accent">New analyst</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
