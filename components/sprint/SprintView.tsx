"use client";

import { useState, useTransition } from "react";
import { checkSprint, type SprintResult } from "@/app/practice-actions";
import { CHOICES, SPRINT } from "@/content/sprint";
import { sprintProgress } from "@/lib/practiceProgress";
import SeverityBadge from "@/components/ui/SeverityBadge";

export default function SprintView() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<SprintResult | null>(null);
  const [pending, start] = useTransition();
  const { best } = sprintProgress.useStore();
  const done = result?.ok ? result : null;
  const answered = Object.keys(answers).length;

  function submit() {
    start(async () => {
      const r = await checkSprint(answers);
      setResult(r);
      if (r.ok) sprintProgress.set({ best: Math.max(best ?? 0, r.correct), total: r.total });
    });
  }

  function again() {
    setAnswers({});
    setResult(null);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        A noisy shift: {SPRINT.length} alerts landed at once. You have no time for a full investigation, so make a call
        on each. {best !== null && <span className="text-correct">Best so far: {best}/{SPRINT.length}.</span>}
      </p>

      <ul className="space-y-3">
        {SPRINT.map((a) => {
          const item = done?.items.find((i) => i.id === a.id);
          return (
            <li key={a.id} className="rounded-2xl border border-line bg-panel p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <SeverityBadge severity={a.severity} />
                <span>{a.source}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed">{a.text}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={`Decision for ${a.source} alert`}>
                {CHOICES.map((c) => (
                  <label
                    key={c.id}
                    title={c.hint}
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm has-checked:border-accent has-checked:bg-raised ${
                      done ? "pointer-events-none" : "border-line hover:border-muted"
                    } ${done && item?.answer === c.id ? "border-correct text-correct" : ""}`}
                  >
                    <input
                      type="radio"
                      name={a.id}
                      className="sr-only"
                      checked={answers[a.id] === c.id}
                      disabled={!!done}
                      onChange={() => setAnswers((p) => ({ ...p, [a.id]: c.id }))}
                    />
                    {c.label}
                  </label>
                ))}
              </div>
              {item && (
                <p className={`mt-3 text-sm ${item.right ? "text-correct" : "text-missed"}`}>
                  {item.right ? "Right. " : "Not this one. "}
                  <span className="text-muted">{item.why}</span>
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {!done ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={answered < SPRINT.length || pending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90 disabled:opacity-40"
          >
            {pending ? "Checking…" : "Finish sprint"}
          </button>
          <span className="text-xs text-muted">
            {answered} of {SPRINT.length} decided
          </span>
          {result && !result.ok && <span className="text-sm text-missed">{result.error}</span>}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-panel p-5">
          <p className="text-3xl font-semibold">
            {done.correct}
            <span className="text-lg text-muted">/{done.total}</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            {done.correct >= 9
              ? "Sharp triage. You can tell noise from real trouble quickly."
              : done.correct >= 6
                ? "Good instincts. Review the ones you missed, they teach the pattern."
                : "Keep practising. Read the playbooks, then try again."}
          </p>
          <button type="button" onClick={again} className="mt-4 rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
