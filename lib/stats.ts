import type { CaseRecord } from "./types";

/** Rank shown on the dashboard and profile. Based on cases closed and the average score. */
export function rank(closed: number, average: number | null): string {
  if (closed === 0) return "New starter";
  if (closed < 4) return "Trainee analyst";
  return average !== null && average >= 80 ? "Senior L1 analyst" : "L1 analyst";
}

export function scoreColor(score: number): string {
  return score >= 85 ? "text-correct" : score >= 60 ? "text-medium" : "text-missed";
}

/** Headline numbers for a set of closed cases. Pure, so the dashboard and profile agree. */
export function caseStats(records: CaseRecord[]) {
  const n = records.length;
  const pct = (count: number) => (n ? Math.round((100 * count) / n) : null);
  return {
    closed: n,
    average: n ? Math.round(records.reduce((s, r) => s + r.feedback.score, 0) / n) : null,
    best: n ? Math.max(...records.map((r) => r.feedback.score)) : null,
    verdictPct: pct(records.filter((r) => r.submission.verdict === r.feedback.correctVerdict).length),
    escalationPct: pct(records.filter((r) => r.submission.escalate === r.feedback.correctEscalate).length),
  };
}

/** What the student needs to reach the next rank, or null at the top. */
export function nextRank(closed: number, average: number | null): { name: string; hint: string; pct: number } | null {
  if (closed === 0) return { name: "Trainee analyst", hint: "Close your first alert", pct: 0 };
  if (closed < 4) return { name: "L1 analyst", hint: `Close ${4 - closed} more alert${4 - closed === 1 ? "" : "s"}`, pct: (100 * closed) / 4 };
  if (average !== null && average < 80) return { name: "Senior L1 analyst", hint: `Raise your average score to 80 (now ${average})`, pct: (100 * average) / 80 };
  return null;
}
