"use client";

import { useState, useTransition } from "react";
import { checkMessage, type CommsResult } from "@/app/practice-actions";
import { COMMS, type CommsScenario } from "@/content/comms";
import { commsProgress, saveBest } from "@/lib/practiceProgress";

const panel = "rounded-2xl border border-line bg-panel p-5";

function Scenario({ s }: { s: CommsScenario }) {
  const [text, setText] = useState("");
  const [result, setResult] = useState<CommsResult | null>(null);
  const [pending, start] = useTransition();
  const done = result?.ok ? result : null;
  const words = text.trim().split(/\s+/).filter(Boolean).length;

  function submit() {
    start(async () => {
      const r = await checkMessage(s.id, text);
      setResult(r);
      if (r.ok) saveBest(commsProgress, s.id, r.score);
    });
  }

  return (
    <div className="space-y-4">
      <section className={panel}>
        <p className="text-xs text-muted">
          {s.difficulty} · talking to: {s.audience}
        </p>
        <h2 className="mt-1 text-lg font-semibold">{s.title}</h2>
        <blockquote className="mt-3 rounded-lg border-l-2 border-accent bg-canvas p-4 text-sm leading-relaxed">{s.situation}</blockquote>
        <p className="mt-4 text-xs uppercase tracking-wide text-muted">What you know</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          {s.facts.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </section>

      <section className={panel}>
        <label htmlFor={`msg-${s.id}`} className="font-semibold">
          {s.task}
        </label>
        <textarea
          id={`msg-${s.id}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          readOnly={!!done}
          rows={7}
          maxLength={3000}
          className="mt-3 w-full rounded-lg border border-line bg-canvas p-3 text-sm leading-relaxed outline-none focus:border-accent"
          placeholder="Write your message here…"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-muted">
          <span>{words} words</span>
          {done && (
            <button type="button" onClick={() => { setText(""); setResult(null); }} className="text-accent hover:underline">
              Try again
            </button>
          )}
        </div>
        {!done && (
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90 disabled:opacity-40"
          >
            {pending ? "Checking…" : "Check my message"}
          </button>
        )}
        {result && !result.ok && <p className="mt-3 text-sm text-missed">{result.error}</p>}
      </section>

      {done && (
        <section className={`${panel} space-y-4`}>
          <div className="flex items-end justify-between">
            <h3 className="font-semibold">Checklist</h3>
            <p className="text-2xl font-semibold">
              {done.score}
              <span className="text-sm text-muted">/100</span>
            </p>
          </div>
          <ul className="space-y-1.5 text-sm">
            {done.checks.map((c) => (
              <li key={c.label} className="flex gap-2">
                <span className={c.hit ? "text-correct" : "text-missed"} aria-hidden="true">
                  {c.hit ? "✓" : "✗"}
                </span>
                <span>
                  <span className="sr-only">{c.hit ? "Covered: " : "Missing: "}</span>
                  {c.label}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">{done.tip}</p>
          <div className="rounded-lg border border-line bg-canvas p-4 text-sm">
            <p className="text-xs uppercase tracking-wide text-muted">One good version</p>
            <p className="mt-1 leading-relaxed">{done.sample}</p>
          </div>
          <p className="text-xs text-muted">
            The checker looks for key ideas in your words, so a different wording can still be good. Compare, do not copy.
          </p>
        </section>
      )}
    </div>
  );
}

export default function CommsView() {
  const [selected, setSelected] = useState(COMMS[0].id);
  const { scores } = commsProgress.useStore();
  const s = COMMS.find((c) => c.id === selected) ?? COMMS[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
      <div>
        <p className="mb-2 text-xs text-muted">
          {Object.keys(scores).length} of {COMMS.length} attempted
        </p>
        <ul className="space-y-2">
          {COMMS.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setSelected(c.id)}
                aria-current={c.id === selected ? "true" : undefined}
                className={`w-full rounded-xl border p-3 text-left text-sm transition-colors ${
                  c.id === selected ? "border-accent bg-raised" : "border-line bg-panel hover:border-muted"
                }`}
              >
                <span className="flex items-center justify-between gap-2 text-xs text-muted">
                  <span>{c.difficulty}</span>
                  {scores[c.id] !== undefined && <span className="text-correct">best {scores[c.id]}</span>}
                </span>
                <span className="mt-1 block font-medium leading-snug">{c.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Scenario key={s.id} s={s} />
    </div>
  );
}
