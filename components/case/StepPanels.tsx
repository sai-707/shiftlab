"use client";

import { useState, useTransition } from "react";
import { checkScope, checkTimeline, type ScopeResult, type TimelineResult } from "@/app/steps-actions";
import { STEP_CHALLENGES, type StepChallenge } from "@/content/steps";
import { INTEL_SOURCE, LOG_SOURCE, isGated, sourceBlocks } from "@/lib/sourceRules";
import { stepsProgress } from "@/lib/stepsProgress";
import type { Alert } from "@/lib/types";

const panel = "rounded-2xl border border-line bg-panel p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]";
const btn = "press rounded-lg border border-line px-3 py-2 text-sm font-medium hover:border-accent hover:text-accent disabled:opacity-60";

const LABELS = ["Review the alert", "Check the logs", "Gather context", "Investigate indicators", "Build a timeline", "Scope and impact", "Document and escalate"];

type Status = "done" | "todo" | "na";

/** Where the student is in the 7-step method. Steps 2 to 4 are only tracked on alerts that hide their evidence. */
function statuses(alert: Alert, opened: string[], active: boolean, closed: boolean, ch: StepChallenge | undefined, steps: { timeline: Record<string, number>; scope: Record<string, number> }): Status[] {
  if (closed) return LABELS.map((_, i) => (i === 4 && !ch?.timeline) || (i === 5 && !ch?.scope) ? "na" : "done");
  const gated = isGated(alert);
  const logTitles = alert.evidence.filter((b) => b.kind === "logs").map((b) => b.title);
  const otherTitles = sourceBlocks(alert).filter((b) => b.kind !== "logs").map((b) => b.title);
  return [
    active ? "done" : "todo",
    gated && (opened.includes(LOG_SOURCE) || logTitles.some((t) => opened.includes(t))) ? "done" : "todo",
    gated && otherTitles.some((t) => opened.includes(t)) ? "done" : "todo",
    gated && opened.includes(INTEL_SOURCE) ? "done" : "todo",
    !ch?.timeline ? "na" : steps.timeline[alert.id] !== undefined ? "done" : "todo",
    !ch?.scope ? "na" : steps.scope[alert.id] !== undefined ? "done" : "todo",
    "todo",
  ];
}

export function StepTracker({ alert, opened, active, closed }: { alert: Alert; opened: string[]; active: boolean; closed: boolean }) {
  const steps = stepsProgress.useStore();
  // Beginner and Intermediate alerts stay simple: the 7-step tracker is for the high-difficulty levels.
  if (alert.difficulty !== "Hard" && alert.difficulty !== "AI Era") return null;
  const ch = STEP_CHALLENGES[alert.id];
  const st = statuses(alert, opened, active, closed, ch, steps);
  const current = st.findIndex((s) => s === "todo");
  const gated = isGated(alert);
  return (
    <section className={panel} aria-label="Investigation steps">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold">Your investigation</h2>
        <span className="text-xs text-muted">{gated ? "7 steps, tracked as you go" : "The 7 steps analysts follow"}</span>
      </div>
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {LABELS.map((label, i) => {
          const s = st[i];
          const now = i === current && active;
          const bar = s === "done" ? "border-correct" : now ? "border-accent" : "border-line";
          return (
            <li key={label} className={`rounded-b-lg border-t-2 px-3 pb-2.5 pt-2 ${bar} ${now ? "bg-raised" : ""} ${s === "na" ? "opacity-50" : ""}`}>
              <span className={`font-mono text-xs ${s === "done" ? "text-correct" : now ? "text-accent" : "text-muted"}`}>
                {i + 1}
                {s === "done" ? " · Done" : s === "na" ? " · Not on this alert" : ""}
              </span>
              <span className="mt-0.5 block text-xs font-semibold leading-snug">{label}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function TimelineStep({ alertId, ch }: { alertId: string; ch: NonNullable<StepChallenge["timeline"]> }) {
  const best = stepsProgress.useStore().timeline[alertId];
  const [picks, setPicks] = useState<string[]>([]);
  const [result, setResult] = useState<TimelineResult | null>(null);
  const [pending, startTransition] = useTransition();
  const byId = (id: string) => ch.events.find((e) => e.id === id)!;

  const toggle = (id: string) => {
    setResult(null);
    setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  };
  const move = (i: number, d: number) => {
    setResult(null);
    setPicks((p) => {
      const j = i + d;
      if (j < 0 || j >= p.length) return p;
      const n = p.slice();
      [n[i], n[j]] = [n[j], n[i]];
      return n;
    });
  };
  const check = () =>
    startTransition(async () => {
      const r = await checkTimeline(alertId, picks);
      setResult(r);
      if (r.ok) stepsProgress.set({ timeline: { ...stepsProgress.get().timeline, [alertId]: Math.max(best ?? 0, r.score) } });
    });

  const tag = (id: string) => {
    if (!result?.ok) return null;
    if (result.found.includes(id)) return <span className="text-xs text-correct">Key event</span>;
    if (result.noise.includes(id)) return <span className="text-xs text-missed">Not part of the story</span>;
    if (result.missed.includes(id)) return <span className="text-xs text-medium">You missed this</span>;
    return null;
  };

  return (
    <section className={`${panel} space-y-4`}>
      <div>
        <p className="text-xs font-semibold tracking-wide text-accent">STEP 5 · BONUS</p>
        <h3 className="text-base font-semibold">Build the timeline</h3>
        <p className="mt-1 text-sm text-muted">
          Pick the events that tell the story of this incident and put them in the order they happened. Skip the noise. This does not change your case score.
          {best !== undefined && <span className="ml-1 text-accent">Best so far: {best}/100</span>}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ul className="space-y-2">
          {ch.events.map((e) => {
            const on = picks.includes(e.id);
            return (
              <li key={e.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(e.id)}
                  className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2 text-left text-sm ${on ? "border-accent bg-raised" : "border-line"} hover:border-accent`}
                >
                  <span className="font-mono text-xs text-muted">{e.time}</span>
                  <span className="grow">{e.text}</span>
                  {tag(e.id)}
                </button>
              </li>
            );
          })}
        </ul>
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Your timeline</h4>
          {picks.length === 0 ? (
            <p className="text-sm text-muted">Nothing yet. Choose events on the left.</p>
          ) : (
            <ol className="space-y-2">
              {picks.map((id, i) => (
                <li key={id} className="flex items-center gap-2 rounded-lg bg-raised px-3 py-2 text-sm">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-canvas">{i + 1}</span>
                  <span className="font-mono text-xs text-muted">{byId(id).time}</span>
                  <span className="grow">{byId(id).text}</span>
                  <button type="button" className={btn} aria-label="Move up" onClick={() => move(i, -1)}>
                    Up
                  </button>
                  <button type="button" className={btn} aria-label="Move down" onClick={() => move(i, 1)}>
                    Down
                  </button>
                </li>
              ))}
            </ol>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={check} disabled={pending || picks.length === 0} className="btn-shine press rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas disabled:opacity-60">
              {pending ? "Checking…" : "Check my timeline"}
            </button>
            <button type="button" className={btn} onClick={() => { setPicks([]); setResult(null); }}>
              Clear
            </button>
          </div>
          {result && !result.ok && <p role="alert" className="text-sm text-missed">{result.error}</p>}
          {result?.ok && (
            <div className="space-y-1.5 rounded-lg border border-line p-3 text-sm">
              <p className="font-semibold">{result.score}/100</p>
              <p>You found {result.found.length} of {result.found.length + result.missed.length} key events.</p>
              {result.noise.length > 0 && <p>{result.noise.length} event(s) are not part of this incident.</p>}
              <p>{result.ordered ? "Your events are in the order they happened." : "Some events are out of order. Check the times."}</p>
              <p className="text-muted">{result.why}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ScopeStep({ alertId, ch }: { alertId: string; ch: NonNullable<StepChallenge["scope"]> }) {
  const best = stepsProgress.useStore().scope[alertId];
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ScopeResult | null>(null);
  const [pending, startTransition] = useTransition();

  const check = () =>
    startTransition(async () => {
      const r = await checkScope(alertId, marks);
      setResult(r);
      if (r.ok) stepsProgress.set({ scope: { ...stepsProgress.get().scope, [alertId]: Math.max(best ?? 0, r.score) } });
    });

  return (
    <section className={`${panel} space-y-4`}>
      <div>
        <p className="text-xs font-semibold tracking-wide text-accent">STEP 6 · BONUS</p>
        <h3 className="text-base font-semibold">Scope and impact</h3>
        <p className="mt-1 text-sm text-muted">
          {ch.question} This does not change your case score.
          {best !== undefined && <span className="ml-1 text-accent">Best so far: {best}/100</span>}
        </p>
      </div>
      <ul className="space-y-2">
        {ch.rows.map((r) => {
          const res = result?.ok ? result.rows.find((x) => x.id === r.id) : undefined;
          return (
            <li key={r.id} className="rounded-lg bg-raised p-3">
              <fieldset>
                <legend className="text-sm font-semibold">{r.name}</legend>
                <p className="font-mono text-xs text-muted">{r.log}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ch.options.map((o) => (
                    <button
                      key={o}
                      type="button"
                      aria-pressed={marks[r.id] === o}
                      onClick={() => { setResult(null); setMarks((m) => ({ ...m, [r.id]: o })); }}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${marks[r.id] === o ? "border-accent bg-accent/15 text-ink" : "border-line text-muted"} hover:border-accent`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
                {res && (
                  <p className={`mt-2 text-xs ${res.correct ? "text-correct" : "text-missed"}`}>
                    {res.correct ? "Correct. " : `Not quite: ${res.answer}. `}
                    <span className="text-muted">{res.why}</span>
                  </p>
                )}
              </fieldset>
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={check} disabled={pending} className="btn-shine press rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas disabled:opacity-60">
        {pending ? "Checking…" : "Check my scope"}
      </button>
      {result && !result.ok && <p role="alert" className="text-sm text-missed">{result.error}</p>}
      {result?.ok && <p className="text-sm font-semibold">{result.score}/100</p>}
    </section>
  );
}

/** The optional timeline and scope steps for alerts that have them. */
export default function StepPanels({ alertId }: { alertId: string }) {
  const ch = STEP_CHALLENGES[alertId];
  if (!ch) return null;
  return (
    <>
      {ch.timeline && <TimelineStep alertId={alertId} ch={ch.timeline} />}
      {ch.scope && <ScopeStep alertId={alertId} ch={ch.scope} />}
    </>
  );
}
