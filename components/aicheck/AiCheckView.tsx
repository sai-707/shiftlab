"use client";

import { useState, useTransition } from "react";
import { checkAiDraft, type AiCheckResult } from "@/app/aicheck-actions";
import { AI_DRILLS, type AiDrill } from "@/content/aicheck";
import { aiCheckProgress } from "@/lib/practiceProgress";

export default function AiCheckView() {
  const [drill, setDrill] = useState<AiDrill | null>(null);
  const [flagged, setFlagged] = useState<number[]>([]);
  const [result, setResult] = useState<AiCheckResult | null>(null);
  const [pending, start] = useTransition();
  const { best } = aiCheckProgress.useStore();
  const done = result?.ok ? result : null;

  function open(d: AiDrill | null) {
    setDrill(d);
    setFlagged([]);
    setResult(null);
  }

  function submit() {
    if (!drill) return;
    start(async () => {
      const r = await checkAiDraft(drill.id, flagged);
      setResult(r);
      if (r.ok) aiCheckProgress.set({ best: { ...aiCheckProgress.get().best, [drill.id]: Math.max(aiCheckProgress.get().best[drill.id] ?? 0, r.score) } });
    });
  }

  if (!drill) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">
          AI assistants can write a triage summary in seconds, and they sound sure even when they are wrong. Your job is to
          check the draft against the evidence before anyone acts on it. Each drill has the evidence and an AI draft.
          Flag every sentence you think is wrong. Some drafts have no mistakes at all.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {AI_DRILLS.map((d) => (
            <li key={d.id} className="flex flex-col rounded-2xl border border-line bg-panel p-4">
              <h2 className="font-semibold">{d.title}</h2>
              <p className="mt-1 flex-1 text-sm text-muted">{d.alert}</p>
              <p className="mt-3 text-xs text-muted">
                {best[d.id] !== undefined ? <span className="text-correct">Best: {best[d.id]}/100</span> : "Not tried yet"}
              </p>
              <button type="button" onClick={() => open(d)} className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90">
                Check this draft
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold">{drill.title}</h2>
        <p className="text-sm text-muted">{drill.alert}</p>
      </div>

      <section className="rounded-2xl border border-line bg-panel p-4" aria-label="Evidence">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">Evidence (this is true)</h3>
        <dl className="mt-2 space-y-2 text-sm">
          {drill.evidence.map((e) => (
            <div key={e.label}>
              <dt className="text-xs text-muted">{e.label}</dt>
              <dd>{e.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-line bg-panel p-4" aria-label="AI draft">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">AI draft summary</h3>
        <ol className="mt-2 space-y-2">
          {drill.draft.map((line, i) => {
            const row = done?.rows[i];
            const on = flagged.includes(i);
            return (
              <li key={i} className="rounded-lg border border-line p-3 text-sm">
                <div className="flex items-start gap-3">
                  <p className="flex-1">{line}</p>
                  <button
                    type="button"
                    disabled={!!done}
                    aria-pressed={on}
                    onClick={() => setFlagged((f) => (f.includes(i) ? f.filter((x) => x !== i) : [...f, i]))}
                    className={`shrink-0 rounded-lg border px-3 py-1 text-xs font-medium ${on ? "border-missed bg-missed/10 text-missed" : "border-line text-muted hover:border-muted"}`}
                  >
                    {on ? "Flagged wrong" : "Flag as wrong"}
                  </button>
                </div>
                {row && (
                  <p className={`mt-2 text-xs ${row.wrong === row.flagged ? "text-correct" : "text-missed"}`}>
                    {row.wrong
                      ? `${row.flagged ? "Caught. " : "Missed. "}${row.why}`
                      : row.flagged
                        ? "False alarm. This sentence matches the evidence."
                        : "Correct, and you left it alone."}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </section>

      {!done ? (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={submit} disabled={pending} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90 disabled:opacity-40">
            {pending ? "Checking…" : flagged.length ? "Submit my flags" : "Submit: the draft is right"}
          </button>
          <button type="button" onClick={() => open(null)} className="text-xs text-muted underline hover:text-accent">
            Choose another drill
          </button>
          {result && !result.ok && <span className="text-sm text-missed">{result.error}</span>}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-panel p-5">
          <p className="text-3xl font-semibold">
            {done.score}
            <span className="text-lg text-muted">/100</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            {done.wrongTotal === 0
              ? done.falseAlarms === 0
                ? "This draft had no mistakes, and you did not invent any."
                : `This draft had no mistakes, but you flagged ${done.falseAlarms}.`
              : `You caught ${done.found} of ${done.wrongTotal} mistakes${done.falseAlarms ? ` and raised ${done.falseAlarms} false alarm${done.falseAlarms > 1 ? "s" : ""}, which cancel catches` : ""}.`}
          </p>
          <p className="mt-2 text-sm">{done.habit}</p>
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => open(drill)} className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent">
              Try again
            </button>
            <button type="button" onClick={() => open(null)} className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent">
              Choose another drill
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
