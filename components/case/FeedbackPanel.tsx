"use client";

import Link from "next/link";
import AfterAction from "./AfterAction";
import RealWorld from "./RealWorld";
import ReviewPanel from "./ReviewPanel";
import { hintsUsed } from "@/lib/hintsUsed";
import type { CaseRecord } from "@/lib/types";

function band(score: number): string {
  if (score >= 85) return "Strong work";
  if (score >= 60) return "Solid, with gaps";
  return "Needs another pass";
}

export default function FeedbackPanel({ record }: { record: CaseRecord }) {
  const { feedback, submission } = record;
  const hints = hintsUsed.useStore().used[record.alertId] ?? 0;
  const name = (v: "tp" | "fp") => (v === "tp" ? "True positive" : "False positive");

  return (
    <div className="space-y-4">
    <section className="space-y-4 rounded-xl border border-line bg-panel p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted">Your score</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">
            {feedback.score}
            <span className="text-lg text-muted">/100</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-accent">{band(feedback.score)}</p>
          <p className="mt-1 text-xs text-muted">Hints used: {hints} of 3. Hints do not change your score.</p>
        </div>
      </div>

      <p className="text-sm text-muted">
        You marked this as <span className="text-ink">{name(submission.verdict)}</span>
        {submission.escalate ? " and escalated it." : " without escalating."} The correct call was{" "}
        <span className="text-ink">{name(feedback.correctVerdict)}</span>
        {feedback.correctEscalate ? ", with escalation." : ", no escalation."}
      </p>

      <ul className="space-y-4">
        {feedback.items.map((item) => {
          const ratio = item.max === 0 ? 0 : item.points / item.max;
          const bar = ratio === 1 ? "bg-correct" : ratio === 0 ? "bg-missed" : "bg-medium";
          return (
            <li key={item.label}>
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.label}</span>
                <span className="font-mono text-xs text-muted">
                  {item.points}/{item.max}
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-raised">
                <div className={`h-full ${bar}`} style={{ width: `${ratio * 100}%` }} />
              </div>
              <p className="mt-2 text-sm text-muted">{item.note}</p>
            </li>
          );
        })}
      </ul>

      <div className="rounded-lg border border-line bg-canvas p-4">
        <p className="text-xs uppercase tracking-wide text-muted">What actually happened</p>
        <p className="mt-2 text-sm leading-relaxed">{feedback.explanation}</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/queue"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90"
        >
          Back to queue
        </Link>
        <Link
          href="/reports"
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent"
        >
          All case reports
        </Link>
      </div>
    </section>
    <ReviewPanel alertId={record.alertId} sections={submission.sections} />
    <RealWorld alertId={record.alertId} />
    <AfterAction alertId={record.alertId} verdict={feedback.correctVerdict} />
    </div>
  );
}
