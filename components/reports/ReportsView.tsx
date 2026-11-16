"use client";

import Link from "next/link";
import { ALERTS } from "@/content/alerts";
import { useProgress } from "@/lib/progress";

export default function ReportsView() {
  const progress = useProgress();
  const records = Object.values(progress.cases).sort((a, b) => b.closedAt - a.closedAt);

  if (records.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-panel p-8 text-sm text-muted">
        No reports yet.{" "}
        <Link href="/queue" className="text-accent hover:underline">
          Take an alert from the queue
        </Link>{" "}
        to write your first one.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {records.map((r) => {
        const alert = ALERTS.find((a) => a.id === r.alertId);
        const right = r.submission.verdict === r.feedback.correctVerdict;
        return (
          <Link
            key={r.alertId}
            href={`/reports/${r.alertId}`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-panel px-5 py-4 hover:border-accent"
          >
            <span className="min-w-0">
              <span className="font-mono text-xs text-accent">{r.alertId}</span>
              <span className="block truncate font-medium">{alert?.title ?? "Alert"}</span>
            </span>
            <span className="flex items-center gap-4 text-sm">
              <span className={right ? "text-correct" : "text-missed"}>{r.submission.verdict === "tp" ? "True positive" : "False positive"}</span>
              <span className="font-mono">{r.feedback.score}/100</span>
              <span className="text-xs text-muted">{new Date(r.closedAt).toLocaleDateString()}</span>
              <span className="text-accent">View report →</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
