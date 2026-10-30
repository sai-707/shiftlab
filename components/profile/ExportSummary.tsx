"use client";

import { useState } from "react";
import { ALERTS, TOPICS } from "@/content/alerts";
import { COMMS } from "@/content/comms";
import { LOG_QUESTIONS } from "@/content/logs";
import { MAILS } from "@/content/mailbox";
import { PLAYBOOKS } from "@/content/playbooks";
import { AI_DRILLS } from "@/content/aicheck";
import { SHIFTS } from "@/content/shifts";
import { logProgress } from "@/lib/logProgress";
import { afterProgress, aiCheckProgress, commsProgress, mailProgress, shiftProgress, sprintProgress } from "@/lib/practiceProgress";
import { useProgress } from "@/lib/progress";
import { toast } from "@/lib/toast";

/** Builds a plain Markdown summary a student can paste into a portfolio, README or interview notes. */
export default function ExportSummary() {
  const { cases } = useProgress();
  const mail = mailProgress.useStore().scores;
  const comms = commsProgress.useStore().scores;
  const after = afterProgress.useStore().right;
  const sprint = sprintProgress.useStore();
  const shifts = shiftProgress.useStore().best;
  const drills = aiCheckProgress.useStore().best;
  const logs = logProgress.useStore().solved;
  const [copied, setCopied] = useState(false);

  const records = Object.values(cases);
  const avg = records.length ? Math.round(records.reduce((n, r) => n + r.feedback.score, 0) / records.length) : 0;
  const correctCalls = records.filter((r) => r.submission.verdict === r.feedback.correctVerdict).length;
  const lines: string[] = [
    "# ShiftLab progress summary",
    "",
    "All scenarios in ShiftLab are fictional practice data.",
    "",
    "## Alert cases",
    `- Cases closed: ${records.length} of ${ALERTS.length}`,
    `- Average score: ${records.length ? `${avg}/100` : "n/a"}`,
    `- True/false positive calls correct: ${correctCalls} of ${records.length}`,
    "",
    "| Topic | Closed | Average |",
    "| --- | --- | --- |",
    ...TOPICS.map((t) => {
      const rs = records.filter((r) => ALERTS.find((a) => a.id === r.alertId)?.topic === t);
      const a = rs.length ? Math.round(rs.reduce((n, r) => n + r.feedback.score, 0) / rs.length) : null;
      return `| ${t} | ${rs.length} | ${a ?? "-"} |`;
    }),
    "",
    "## Other practice",
    `- Phishing mailbox: ${Object.keys(mail).length} of ${MAILS.length} emails reviewed`,
    `- Log search questions solved: ${logs.length} of ${LOG_QUESTIONS.length}`,
    `- Communication scenarios attempted: ${Object.keys(comms).length} of ${COMMS.length}`,
    `- Triage sprint best: ${sprint.best === null ? "not tried" : `${sprint.best}/${sprint.total}`}`,
    `- Shift planner: ${Object.keys(shifts).length} of ${SHIFTS.length} shifts tried, best ${Math.max(0, ...Object.values<number>(shifts))}%`,
    `- AI check drills: ${Object.keys(drills).length} of ${AI_DRILLS.length} tried, best ${Math.max(0, ...Object.values<number>(drills))}%`,
    `- After-action questions right: ${Object.values(after).filter(Boolean).length} of ${Object.keys(after).length} answered`,
    `- Playbooks available: ${PLAYBOOKS.length}`,
    "",
  ];
  const md = lines.join("\n");

  function download() {
    const url = URL.createObjectURL(new Blob([md], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "shiftlab-summary.md";
    a.click();
    URL.revokeObjectURL(url);
    toast("Summary downloaded");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(md);
      setCopied(true);
      toast("Summary copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked: the download button still works
    }
  }

  return (
    <div>
      <pre className="max-h-72 overflow-auto rounded-lg border border-line bg-canvas p-3 text-xs leading-relaxed text-muted">{md}</pre>
      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" onClick={download} className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90">
          Download .md
        </button>
        <button type="button" onClick={copy} className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}
