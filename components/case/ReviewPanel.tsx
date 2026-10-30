"use client";

import { Fragment, useEffect, useState } from "react";
import { reviewCase, type ReviewResult } from "@/app/review-actions";
import type { ReportSections } from "@/lib/types";
import type { Status } from "@/lib/review";

const CHIP: Record<Status, { label: string; cls: string }> = {
  strong: { label: "Strong", cls: "border-correct/40 text-correct" },
  detail: { label: "Needs detail", cls: "border-medium/40 text-medium" },
  vague: { label: "Too vague", cls: "border-missed/40 text-missed" },
  missing: { label: "Missing", cls: "border-missed/40 text-missed" },
};
const ORDER = ["happened", "confirmed", "unknown", "next"] as const;

/** Renders text where [[double brackets]] mark key facts. */
function Marked({ text }: { text: string }) {
  return (
    <>
      {text.split(/\[\[|\]\]/).map((part, i) =>
        i % 2 ? (
          <mark key={i} className="rounded bg-accent/20 px-0.5 text-ink">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

const TITLE = { happened: "What happened", confirmed: "Confirmed", unknown: "Not known", next: "Next steps" } as const;

/** Written feedback on the submitted report. It never changes the score. */
export default function ReviewPanel({ alertId, sections }: { alertId: string; sections: ReportSections }) {
  const [r, setR] = useState<ReviewResult | null>(null);
  const sig = JSON.stringify(sections);

  useEffect(() => {
    let live = true;
    reviewCase(alertId, JSON.parse(sig) as ReportSections).then((x) => live && setR(x));
    return () => {
      live = false;
    };
  }, [alertId, sig]);

  if (!r) return <p className="text-sm text-muted">Preparing your review…</p>;
  if (!r.ok) return null;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-line bg-panel p-5">
        <p className="text-xs uppercase tracking-wide text-muted">Your report</p>
        <h3 className="mt-1 text-base font-semibold">Review and improve</h3>
        <p className="mt-1 text-sm text-muted">
          Section by section: what worked, what to fix, and a stronger way to say it. This never changes your score.
        </p>

        <div className="mt-2 divide-y divide-line">
          {r.sections.map((s, i) => (
            <div key={s.section} className="py-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-semibold">
                  {i + 1}. {s.title}
                </h4>
                <span className={`rounded-full border px-2.5 py-0.5 text-xs ${CHIP[s.status].cls}`}>{CHIP[s.status].label}</span>
              </div>
              <blockquote className="mt-2 whitespace-pre-wrap rounded-md border-l-2 border-line bg-canvas px-3 py-2 text-sm italic text-ink/80">
                {s.text || <span className="text-muted not-italic">(left empty)</span>}
              </blockquote>
              {(s.good.length > 0 || s.fix.length > 0) && (
                <ul className="mt-2 space-y-1 text-sm">
                  {s.good.map((g) => (
                    <li key={g} className="flex gap-2">
                      <span className="text-correct">✓</span>
                      <span>{g}</span>
                    </li>
                  ))}
                  {s.fix.map((f) => (
                    <li key={f} className="flex gap-2">
                      <span className="text-missed">✗</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}
              {s.tryThis && (
                <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm">
                  <p className="text-xs uppercase tracking-wide text-accent">Try this instead</p>
                  <p className="mt-1 leading-relaxed">
                    <Marked text={s.tryThis} />
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-missed/30 bg-panel p-5">
        <h3 className="text-sm font-semibold">Mistakes to avoid on this kind of alert</h3>
        <ul className="mt-2 space-y-1.5 text-sm">
          {r.mistakes.map((m) => (
            <li key={m} className="flex gap-2">
              <span className="text-missed">✗</span>
              <span>{m}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-correct/30 bg-panel p-5">
        <p className="text-xs uppercase tracking-wide text-correct">One thing to practise next time</p>
        <p className="mt-1 text-sm">{r.tip}</p>
      </section>

      <section className="rounded-2xl border border-line bg-panel p-5">
        <details>
          <summary className="cursor-pointer text-sm text-accent">See a full model report</summary>
          <p className="mt-2 text-sm text-muted">One strong way to write it. Yours can be different if it covers the same facts.</p>
          <div className="mt-3 space-y-2 text-sm leading-relaxed">
            {ORDER.map((k) => (
              <p key={k}>
                <b>{TITLE[k]}.</b> <Marked text={r.model[k]} />
              </p>
            ))}
          </div>
        </details>
      </section>
    </div>
  );
}
