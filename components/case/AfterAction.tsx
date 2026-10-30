"use client";

import { useState, useTransition } from "react";
import { checkAfterAction, type AfterResult } from "@/app/practice-actions";
import { TACTICS, TUNING } from "@/content/afteraction";
import { afterProgress } from "@/lib/practiceProgress";
import type { Verdict } from "@/lib/types";

/** One extra question after a case closes: an ATT&CK tactic for real threats, a tuning idea for false alarms. */
export default function AfterAction({ alertId, verdict }: { alertId: string; verdict: Verdict }) {
  const tuning = TUNING[alertId];
  const hasQuestion = verdict === "tp" ? true : Boolean(tuning);
  const [choice, setChoice] = useState("");
  const [result, setResult] = useState<AfterResult | null>(null);
  const [pending, start] = useTransition();
  if (!hasQuestion) return null;

  const done = result?.ok ? result : null;
  const options = verdict === "tp" ? [...TACTICS] : tuning.options;
  const values = verdict === "tp" ? [...TACTICS] : tuning.options.map((_, i) => String(i));

  function submit() {
    start(async () => {
      const r = await checkAfterAction(alertId, choice);
      setResult(r);
      if (r.ok) afterProgress.set({ right: { ...afterProgress.get().right, [alertId]: r.correct } });
    });
  }

  return (
    <section className="rounded-2xl border border-line bg-panel p-5">
      <p className="text-xs uppercase tracking-wide text-muted">Bonus question (not scored)</p>
      <h3 className="mt-1 font-semibold">
        {verdict === "tp" ? "Which MITRE ATT&CK tactic best describes this attack?" : tuning.question}
      </h3>
      {verdict === "tp" && (
        <p className="mt-1 text-sm text-muted">
          ATT&CK is a public map of attacker behaviour. A tactic is the goal of a step, like getting in or stealing data.
        </p>
      )}

      <div className="mt-4 grid gap-2 sm:grid-cols-2" role="radiogroup">
        {options.map((label, i) => {
          const value = values[i];
          const isAnswer = done && done.answer === value;
          return (
            <label
              key={value}
              className={`cursor-pointer rounded-lg border px-3 py-2 text-sm has-checked:border-accent has-checked:bg-raised ${
                done ? "pointer-events-none" : "border-line hover:border-muted"
              } ${isAnswer ? "border-correct text-correct" : ""}`}
            >
              <input type="radio" name={`aa-${alertId}`} className="sr-only" checked={choice === value} disabled={!!done} onChange={() => setChoice(value)} />
              {label}
            </label>
          );
        })}
      </div>

      {!done && (
        <button
          type="button"
          onClick={submit}
          disabled={!choice || pending}
          className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Checking…" : "Check"}
        </button>
      )}
      {result && !result.ok && <p className="mt-3 text-sm text-missed">{result.error}</p>}
      {done && (
        <p className={`mt-4 text-sm ${done.correct ? "text-correct" : "text-missed"}`}>
          {done.correct ? "Correct. " : "Not quite. "}
          <span className="text-muted">
            {done.detail ? `${done.detail}. ` : ""}
            {done.why}
          </span>
        </p>
      )}
    </section>
  );
}
