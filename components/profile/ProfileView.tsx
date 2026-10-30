"use client";

import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { saveProfile } from "@/app/profile-actions";
import { AI_DRILLS } from "@/content/aicheck";
import { ALERTS, TOPICS } from "@/content/alerts";
import { COMMS } from "@/content/comms";
import { LOG_QUESTIONS } from "@/content/logs";
import { MAILS } from "@/content/mailbox";
import { topicSlug } from "@/content/playbooks";
import { SHIFTS } from "@/content/shifts";
import { levelStates } from "@/lib/levels";
import { logProgress } from "@/lib/logProgress";
import { profileStore, resizeAvatar } from "@/lib/profile";
import ProfileDetails from "@/components/profile/ProfileDetails";
import { GITHUB_RE, initialsOf, validAvatar } from "@/lib/profileRules";
import { aiCheckProgress, commsProgress, mailProgress, shiftProgress, sprintProgress } from "@/lib/practiceProgress";
import { useProgress } from "@/lib/progress";
import { caseStats, nextRank, rank, scoreColor } from "@/lib/stats";
import { TOPIC_COLOR } from "@/lib/topics";

// The profile is ONE card (drawn by the page). Each part of it is a section separated from the one above by a hairline.
const part = "border-t border-line p-5 md:p-6";
const icon = "h-4 w-4 shrink-0 text-muted";

function Bar({ pct, color = "var(--color-accent)" }: { pct: number; color?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-raised">
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }} />
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="bg-panel p-5">
      <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

const best = (scores: Record<string, number>) => Object.values(scores);

type Mine = { name: string; avatar: string; email: string; username: string; github: string };

/** The student's profile: who they are in ShiftLab, how they are doing, and what to practise next. `account` is null for a guest. */
export default function ProfileView({ account }: { account: Mine | null }) {
  const progress = useProgress();
  const local = profileStore.useStore();
  const [mine, setMine] = useState(account); // signed in: the details saved on the account; guest: null
  const { name, avatar } = mine ?? local;
  const [note, setNote] = useState("");
  const [saving, startSave] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState("");
  const photo = validAvatar(avatar) ? avatar : "";

  // Guests keep their details in this browser. Signed-in people save them to their account; send only what changed.
  function change(patch: { name?: string; avatar?: string }, save: boolean) {
    if (!mine) {
      profileStore.set(patch);
      return;
    }
    setMine((m) => m && { ...m, ...patch });
    if (!save) return;
    startSave(async () => {
      const r = await saveProfile(patch);
      setNote("error" in r ? r.error : "Saved to your account.");
    });
  }

  // Username and GitHub are saved from the details card below; the card shows any error, and the hero updates only once the save worked.
  async function saveField(patch: { username?: string; github?: string }): Promise<string | null> {
    const r = await saveProfile(patch);
    if ("error" in r) return r.error;
    setMine((m) => m && { ...m, ...patch });
    return null;
  }

  async function pickPhoto(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 8_000_000) {
      setPhotoError("Choose a picture (PNG, JPG, WebP or GIF) under 8 MB.");
      return;
    }
    try {
      change({ avatar: await resizeAvatar(file) }, true);
      setPhotoError("");
    } catch {
      setPhotoError("That picture could not be read. Try another one.");
    }
  }
  const mail = mailProgress.useStore().scores;
  const comms = commsProgress.useStore().scores;
  const sprint = sprintProgress.useStore();
  const shifts = shiftProgress.useStore().best;
  const drills = aiCheckProgress.useStore().best;
  const logs = logProgress.useStore().solved;

  const records = Object.values(progress.cases);
  const stats = caseStats(records);
  const goal = nextRank(stats.closed, stats.average);
  const levels = levelStates(progress.cases);

  const topics = TOPICS.map((topic) => {
    const total = ALERTS.filter((a) => a.topic === topic).length;
    const rs = records.filter((r) => ALERTS.find((a) => a.id === r.alertId)?.topic === topic);
    const avg = rs.length ? Math.round(rs.reduce((n, r) => n + r.feedback.score, 0) / rs.length) : null;
    return { topic, total, done: rs.length, avg };
  });
  const scored = topics.filter((t) => t.avg !== null);
  const weakest = stats.closed >= 3 ? [...scored].sort((a, b) => a.avg! - b.avg!)[0] : undefined;

  const mailDone = Object.keys(mail).length;
  const commsDone = Object.keys(comms).length;
  const bestShift = Math.max(0, ...best(shifts));
  const bestDrill = Math.max(0, ...best(drills));

  const badges = [
    { name: "First case", text: "Close your first alert.", earned: stats.closed >= 1 },
    { name: "On a roll", text: "Close 5 alerts.", earned: stats.closed >= 5 },
    { name: "Perfect report", text: "Score 100 on a case.", earned: stats.best === 100 },
    { name: "Sharp eye", text: "Get 5 verdicts right.", earned: records.filter((r) => r.submission.verdict === r.feedback.correctVerdict).length >= 5 },
    { name: "Level cleared", text: "Close every alert in a level.", earned: levels.some((l) => l.total > 0 && l.done === l.total) },
    { name: "Mailbox pro", text: "Review every email in the mailbox.", earned: mailDone >= MAILS.length },
    { name: "Log hunter", text: "Solve every log question.", earned: logs.length >= LOG_QUESTIONS.length },
    { name: "Clear communicator", text: "Try every comms scenario.", earned: commsDone >= COMMS.length },
    { name: "Calm shift", text: "Score 90 or more in a shift.", earned: bestShift >= 90 },
    { name: "AI sceptic", text: "Score 100 in an AI check drill.", earned: bestDrill === 100 },
  ];
  const earned = badges.filter((b) => b.earned).length;

  const recent = [...records].sort((a, b) => b.closedAt - a.closedAt).slice(0, 5);
  const since = records.length ? new Date(Math.min(...records.map((r) => r.closedAt))).toLocaleDateString() : null;

  return (
    <>
      <section className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-br from-accent/12 via-transparent to-transparent" />
        <div className="relative grid gap-6 p-5 md:p-6 lg:grid-cols-[1fr_17rem] lg:gap-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
            <div className="flex shrink-0 flex-col items-start gap-2 sm:items-center">
              <div className="relative">
                <div
                  role="img"
                  aria-label={photo ? "Your profile photo" : "Your initials"}
                  className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-accent bg-raised bg-cover bg-center text-3xl font-semibold text-accent shadow-[0_0_24px_-6px_rgb(34_211_238/0.7)]"
                  style={photo ? { backgroundImage: `url(${photo})` } : undefined}
                >
                  {photo ? "" : initialsOf(name)}
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  aria-label={photo ? "Change profile photo" : "Add profile photo"}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border border-line bg-panel text-muted transition-colors hover:border-accent hover:text-accent"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
                    <circle cx="12" cy="13" r="3.2" />
                  </svg>
                </button>
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
              {photo && (
                <button type="button" onClick={() => change({ avatar: "" }, true)} className="text-xs text-muted hover:text-missed">
                  Remove photo
                </button>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <span className="inline-block rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
                {rank(stats.closed, stats.average)}
              </span>
              <label className="mt-2 block">
                <span className="sr-only">Display name</span>
                <input
                  value={name}
                  onChange={(e) => change({ name: e.target.value.slice(0, 30) }, false)}
                  onBlur={() => mine && change({ name }, true)}
                  onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                  placeholder="Add your name"
                  maxLength={30}
                  className="w-full max-w-sm rounded-lg border border-transparent bg-transparent px-0 text-2xl font-semibold tracking-tight outline-none placeholder:text-muted hover:border-line focus:border-accent focus:px-2"
                />
              </label>
              {mine && (
                <ul className="mt-3 space-y-2 text-sm">
                  {mine.username && (
                    <li className="flex items-center gap-2.5">
                      <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="8" r="4" />
                        <path d="M4 21a8 8 0 0 1 16 0" />
                      </svg>
                      <span className="font-mono">@{mine.username}</span>
                    </li>
                  )}
                  <li className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <svg viewBox="0 0 24 24" className={icon} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="m3 7 9 6 9-6" />
                    </svg>
                    <span className="min-w-0 [overflow-wrap:anywhere]">{mine.email}</span>
                    <span className="whitespace-nowrap rounded-full border border-line px-2 py-0.5 text-xs text-muted">Signed-in email</span>
                  </li>
                  {mine.github && GITHUB_RE.test(mine.github) && (
                    <li>
                      <a
                        href={`https://github.com/${mine.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 font-mono text-[13px] text-accent hover:underline"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
                          <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
                        </svg>
                        github.com/{mine.github}
                      </a>
                    </li>
                  )}
                </ul>
              )}
              <p className="mt-3 text-sm text-muted">
                {since ? `Practising since ${since}` : "No cases closed yet"}
                {" · "}
                {earned} of {badges.length} badges
                {progress.activeAlertId && (
                  <>
                    {" · "}
                    <Link href={`/alerts/${progress.activeAlertId}`} className="text-accent hover:underline">
                      Continue {progress.activeAlertId}
                    </Link>
                  </>
                )}
              </p>
              {photoError && (
                <p role="alert" className="mt-2 text-xs text-missed">
                  {photoError}
                </p>
              )}
            </div>
          </div>

          {goal && (
            <div className="flex flex-col justify-center border-t border-line pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <p className="text-xs uppercase tracking-wide text-muted">Next rank</p>
              <p className="mt-1 font-semibold">{goal.name}</p>
              <div className="mt-3">
                <Bar pct={goal.pct} />
              </div>
              <p className="mt-2 text-xs text-muted">{goal.hint}</p>
            </div>
          )}
        </div>
        <p className="relative border-t border-line/60 px-5 py-3 text-xs text-muted md:px-6" aria-live="polite">
          {saving
            ? "Saving…"
            : note || (mine ? "Your name and photo are saved to your account." : "Your name and photo are saved in this browser. Create an account to keep them with you.")}
        </p>
      </section>

      {mine && <ProfileDetails email={mine.email} username={mine.username} github={mine.github} onSave={saveField} />}

      <div className="grid grid-cols-2 gap-px border-t border-line bg-line lg:grid-cols-4">
        <Stat label="Cases closed" value={`${stats.closed}/${ALERTS.length}`} hint="Alerts you have written up" />
        <Stat label="Average score" value={stats.average === null ? "-" : `${stats.average}/100`} hint={stats.best === null ? "Close a case to see this" : `Best case: ${stats.best}`} />
        <Stat label="Verdict accuracy" value={stats.verdictPct === null ? "-" : `${stats.verdictPct}%`} hint="True or false positive called right" />
        <Stat label="Escalation accuracy" value={stats.escalationPct === null ? "-" : `${stats.escalationPct}%`} hint="Escalated when you should, and not when you should not" />
      </div>

      <div className="grid grid-cols-1 border-t border-line lg:grid-cols-2 lg:divide-x lg:divide-line">
        <section className="p-5 md:p-6">
          <h2 className="font-semibold">Skills by topic</h2>
          <p className="mt-1 text-sm text-muted">Average score on the alerts you have closed in each topic.</p>
          <ul className="mt-4 space-y-3">
            {topics.map((t) => (
              <li key={t.topic}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: TOPIC_COLOR[t.topic] }} />
                    {t.topic}
                  </span>
                  <span className="text-xs text-muted">
                    {t.done}/{t.total} closed
                    {t.avg !== null && <span className={`ml-2 font-semibold ${scoreColor(t.avg)}`}>{t.avg}</span>}
                  </span>
                </div>
                <div className="mt-1.5">
                  <Bar pct={t.avg ?? 0} color={TOPIC_COLOR[t.topic]} />
                </div>
              </li>
            ))}
          </ul>
          {weakest && weakest.avg! < 85 && (
            <p className="mt-4 rounded-lg border border-line bg-canvas p-3 text-sm">
              <span className="text-muted">Work on next: </span>
              <span className="font-medium">{weakest.topic}</span> is your lowest topic at {weakest.avg}.{" "}
              <Link href={`/playbooks/${topicSlug(weakest.topic)}`} className="text-accent hover:underline">
                Read the playbook →
              </Link>
            </p>
          )}
        </section>

        <div className="divide-y divide-line border-t border-line lg:border-t-0">
          <section className="p-5 md:p-6">
            <h2 className="font-semibold">Levels</h2>
            <ul className="mt-4 space-y-3">
              {levels.map((l) => (
                <li key={l.level}>
                  <div className="flex items-center justify-between text-sm">
                    <span>{l.level}</span>
                    <span className="text-xs text-muted">
                      {l.total === 0 ? "Coming soon" : l.unlocked ? `${l.done}/${l.total} closed` : "Locked"}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <Bar pct={l.total ? (100 * l.done) / l.total : 0} color="var(--color-correct)" />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="p-5 md:p-6">
            <h2 className="font-semibold">Practice</h2>
            <dl className="mt-3 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted">Phishing mailbox</dt>
              <dd>{mailDone}/{MAILS.length} emails</dd>
              <dt className="text-muted">Log questions</dt>
              <dd>{logs.length}/{LOG_QUESTIONS.length} solved</dd>
              <dt className="text-muted">Communication</dt>
              <dd>{commsDone}/{COMMS.length} tried</dd>
              <dt className="text-muted">Triage sprint</dt>
              <dd>{sprint.best === null ? "not tried" : `best ${sprint.best}/${sprint.total}`}</dd>
              <dt className="text-muted">Shift planner</dt>
              <dd>{Object.keys(shifts).length === 0 ? "not tried" : `best ${bestShift}% (${Object.keys(shifts).length}/${SHIFTS.length})`}</dd>
              <dt className="text-muted">AI check</dt>
              <dd>{Object.keys(drills).length === 0 ? "not tried" : `best ${bestDrill}% (${Object.keys(drills).length}/${AI_DRILLS.length})`}</dd>
            </dl>
            <Link href="/practice" className="mt-3 inline-block text-sm text-accent hover:underline">
              Go to practice →
            </Link>
          </section>
        </div>
      </div>

      <section className={part}>
        <h2 className="font-semibold">Badges</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {badges.map((b) => (
            <li
              key={b.name}
              className={`rounded-xl border p-3 text-sm ${b.earned ? "border-accent/50 bg-accent/10" : "border-line opacity-60"}`}
            >
              <p className={`font-medium ${b.earned ? "text-accent" : ""}`}>{b.earned ? "✓ " : ""}{b.name}</p>
              <p className="mt-1 text-xs text-muted">{b.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className={part}>
        <h2 className="font-semibold">Recent cases</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Nothing yet. Your closed cases will show here.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {recent.map((r) => (
              <li key={r.alertId}>
                <Link href={`/alerts/${r.alertId}`} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-accent">
                  <span className="min-w-0 truncate">
                    <span className="font-mono text-xs text-muted">{r.alertId}</span> {ALERTS.find((a) => a.id === r.alertId)?.title}
                  </span>
                  <span className={`shrink-0 font-semibold ${scoreColor(r.feedback.score)}`}>{r.feedback.score}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
