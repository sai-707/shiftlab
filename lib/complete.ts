// Pure helpers for the "alert complete" pop-up (components/case/CompleteModal.tsx), kept apart so they can be tested.
import type { FeedbackItem, Submission } from "./types";

export type Tone = { head: string; color: string; pieces: number; sparks: number };

/** The score bands the score panel already uses. Confetti is for a good score only: no party after a wrong call. */
export function tone(score: number): Tone {
  if (score >= 85) return { head: "Strong work", color: "var(--color-correct)", pieces: 80, sparks: 26 };
  if (score >= 60) return { head: "Solid, with gaps", color: "var(--color-medium)", pieces: 30, sparks: 12 };
  return { head: "Needs another pass", color: "var(--color-missed)", pieces: 0, sparks: 0 };
}

/** The scored decisions that lost marks, in the order they are scored. */
export const decisionFixes = (items: FeedbackItem[]): FeedbackItem[] => items.filter((i) => i.points < i.max);

/** The report page's "what to change" heading: what cost marks first, then wording tips, which never change the score. */
export function fixHeading(lost: number, tips: number): string {
  const t = tips ? ` · ${tips} wording ${tips === 1 ? "tip" : "tips"}` : "";
  return (lost ? `${lost} ${lost === 1 ? "thing costs" : "things cost"} you marks` : "No marks lost") + t;
}

/** The short "what you chose" line beside each score bar. */
export function itemSub(label: string, sub: Submission): string {
  if (label === "Verdict") return sub.verdict === "tp" ? "True positive" : "False positive";
  if (label === "Escalation") return sub.escalate ? "Escalated" : "Not escalated";
  if (label === "Investigation") return `${sub.opened?.length ?? 0} sources opened`;
  return "Written";
}
