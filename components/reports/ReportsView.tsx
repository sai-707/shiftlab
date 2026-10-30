"use client";

import Link from "next/link";
import { ALERTS } from "@/content/alerts";
import { useProgress } from "@/lib/progress";

const SECTION_LABELS = [
  ["happened", "What happened"],
  ["confirmed", "What is confirmed"],
  ["unknown", "What is still unknown"],
  ["next", "Next action"],
] as const;

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
          <details key={r.alertId} className="group rounded-xl border border-line bg-panel">
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 px-5 py-4">
              <span className="min-w-0">
                <span className="font-mono text-xs text-accent">{r.alertId}</span>
                <span className="block truncate font-medium">{alert?.title ?? "Alert"}</span>
              </span>
              <span className="flex items-center gap-4 text-sm">
                <span className={right ? "text-correct" : "text-missed"}>
                  {r.submission.verdict === "tp" ? "True positive" : "False positive"}
                </span>
                <span className="font-mono">{r.feedback.score}/100</span>
                <span className="text-xs text-muted">{new Date(r.closedAt).toLocaleDateString()}</span>
              </span>
            </summary>
            <div className="space-y-4 border-t border-line px-5 py-4 text-sm">
              {SECTION_LABELS.map(([key, label]) => (
                <div key={key}>
                  <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
                  <p className="mt-1 whitespace-pre-wrap">{r.submission.sections[key] || "Not written."}</p>
                </div>
              ))}
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Coaching</p>
                <ul className="mt-1 space-y-1 text-muted">
                  {r.feedback.items.map((i) => (
                    <li key={i.label}>
                      <span className="text-ink">{i.label}</span> ({i.points}/{i.max}): {i.note}
                    </li>
                  ))}
                </ul>
              </div>
              <Link href={`/alerts/${r.alertId}`} className="inline-block text-accent hover:underline">
                Open full review
              </Link>
            </div>
          </details>
        );
      })}
    </div>
  );
}
