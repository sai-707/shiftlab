"use client";

import Link from "next/link";
import { useState } from "react";
import { ALERTS, bySeverity } from "@/content/alerts";
import { handoverNotes } from "@/lib/handover";
import { isUnlocked } from "@/lib/levels";
import { useProgress, type Progress } from "@/lib/progress";
import { toast } from "@/lib/toast";

const panel = "rounded-2xl border border-line bg-panel p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]";
const area =
  "mt-2 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent";

function titleOf(id: string) {
  return ALERTS.find((a) => a.id === id)?.title ?? id;
}

/** Plain-text handover note, the kind an analyst would paste into a ticket or chat. */
function buildText(progress: Progress, notes: { watch: string; followups: string }): string {
  const closed = Object.values(progress.cases).sort((a, b) => a.closedAt - b.closedAt);
  const escalated = closed.filter((c) => c.submission.escalate);
  const open = ALERTS.filter((a) => !progress.cases[a.id] && isUnlocked(a.difficulty, progress.cases)).sort(bySeverity);
  const urgent = open.filter((a) => a.severity === "critical" || a.severity === "high");
  const lines: string[] = [];

  lines.push("Closed this shift:");
  if (closed.length === 0) lines.push("- None");
  closed.forEach((c) =>
    lines.push(
      `- ${c.alertId} ${titleOf(c.alertId)}: ${c.submission.verdict === "tp" ? "true positive" : "false positive"}${
        c.submission.escalate ? ", escalated" : ", not escalated"
      }`,
    ),
  );

  lines.push("", "Escalated to L2:");
  if (escalated.length === 0) lines.push("- None");
  escalated.forEach((c) => lines.push(`- ${c.alertId} ${titleOf(c.alertId)}`));

  lines.push("", "In progress:");
  lines.push(progress.activeAlertId ? `- ${progress.activeAlertId} ${titleOf(progress.activeAlertId)}` : "- None");

  lines.push("", `Still in the queue: ${open.length} alert${open.length === 1 ? "" : "s"}`);
  urgent.forEach((a) => lines.push(`- ${a.id} (${a.severity}) ${a.title}`));

  lines.push("", "Watch for:", notes.watch.trim() || "- Nothing noted");
  lines.push("", "Follow-ups and open questions:", notes.followups.trim() || "- Nothing noted");
  return lines.join("\n");
}

export default function HandoverView() {
  const progress = useProgress();
  const notes = handoverNotes.useStore();
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  const closedCount = Object.keys(progress.cases).length;
  const text = buildText(progress, notes);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`SHIFT HANDOVER, ${new Date().toLocaleString()}\n\n${text}`);
      setCopied("done");
      toast("Handover note copied");
    } catch {
      setCopied("failed");
    }
    setTimeout(() => setCopied("idle"), 2500);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-6 lg:col-span-3">
        <section className={panel}>
          <h2 className="font-semibold">Why handovers matter</h2>
          <p className="mt-2 text-sm text-muted">
            A SOC runs around the clock, so work passes from one analyst to the next. A good handover lets the next person
            continue without asking you anything. The sections below fill in from your cases. Add what the numbers cannot
            say.
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
            <li>What you closed and why, in one line each.</li>
            <li>What you escalated, and to whom.</li>
            <li>What is half done, so nothing is dropped.</li>
            <li>What to watch: a host, an address, or a pattern that may come back.</li>
          </ul>
        </section>

        <section className={panel}>
          <label htmlFor="watch" className="font-semibold">
            What should the next shift watch?
          </label>
          <p className="text-sm text-muted">For example an IP that was blocked, a user to keep an eye on, or a rule that is noisy.</p>
          <textarea
            id="watch"
            rows={4}
            value={notes.watch}
            onChange={(e) => handoverNotes.set({ watch: e.target.value })}
            placeholder="- Keep an eye on FIN-WS-114 after it was isolated"
            className={area}
          />
        </section>

        <section className={panel}>
          <label htmlFor="followups" className="font-semibold">
            Follow-ups and open questions
          </label>
          <p className="text-sm text-muted">Things you could not finish or verify, and who you are waiting on.</p>
          <textarea
            id="followups"
            rows={4}
            value={notes.followups}
            onChange={(e) => handoverNotes.set({ followups: e.target.value })}
            placeholder="- Waiting for L2 to confirm whether the downloaded script ran"
            className={area}
          />
        </section>
      </div>

      <section className={`${panel} lg:col-span-2 lg:self-start`}>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Handover note</h2>
          <button
            type="button"
            onClick={copy}
            className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-canvas hover:opacity-90"
          >
            {copied === "done" ? "Copied" : copied === "failed" ? "Copy failed" : "Copy note"}
          </button>
        </div>
        {closedCount === 0 && !progress.activeAlertId && (
          <p className="mt-3 rounded-lg border border-dashed border-line px-3 py-2 text-sm text-muted">
            Nothing closed yet.{" "}
            <Link href="/queue" className="text-accent hover:underline">
              Take an alert
            </Link>{" "}
            and this note fills itself in.
          </p>
        )}
        <pre className="mt-3 max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-lg bg-canvas p-3 font-mono text-xs leading-relaxed">
          {text}
        </pre>
      </section>
    </div>
  );
}
