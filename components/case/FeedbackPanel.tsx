"use client";

import Link from "next/link";
import { tone } from "@/lib/complete";
import type { CaseRecord } from "@/lib/types";

/** The short result shown on a closed alert. The score breakdown, the review and the model answer live on the case report page. */
export default function FeedbackPanel({ record }: { record: CaseRecord }) {
  const { feedback, submission } = record;
  const name = (v: "tp" | "fp") => (v === "tp" ? "True positive" : "False positive");
  // The call is the thing being taught, so it is said plainly before the number: a right call with a thin report still reads as a right call.
  const verdictOk = submission.verdict === feedback.correctVerdict;

  return (
    <section className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-line bg-panel p-5">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">Case closed · your call</p>
        <p className={`mt-1 text-2xl font-semibold tracking-tight ${verdictOk ? "text-correct" : "text-missed"}`}>{verdictOk ? "Correct" : "Not this time"}</p>
        <p className="mt-1 text-sm text-muted">
          You marked this as <span className="text-ink">{name(submission.verdict)}</span>
          {submission.escalate ? " and escalated it." : " without escalating."}
          {verdictOk ? "" : ` It was a ${name(feedback.correctVerdict)}.`}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="text-right">
          <p className="text-3xl font-semibold tracking-tight">
            {feedback.score}
            <span className="text-base text-muted">/100</span>
          </p>
          <p className="text-sm font-medium text-accent">{tone(feedback.score).head}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/reports/${record.alertId}`} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90">
            View report
          </Link>
          <Link href="/queue" className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent">
            Next alert
          </Link>
        </div>
      </div>
    </section>
  );
}
