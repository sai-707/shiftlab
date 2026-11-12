// SERVER ONLY. The score is the decision: the verdict, whether to escalate, and on gated alerts whether the sources
// that mattered were opened. The report earns marks for being written, never for containing particular words, so a
// correct call written in the student's own words is never marked down. How well it is written is coached instead, in
// the written review (lib/review.ts, shown by components/case/ReviewPanel.tsx) and in the model report beside it.
import { REVIEW_KEYS } from "@/content/review-keys";
import { contradictions } from "@/lib/review";
import { reportWritten, writtenSections } from "@/lib/reportRules";
import { INVESTIGATION_KEYS } from "@/content/investigation-keys";
import type { AnswerKey, Feedback, FeedbackItem, Submission, Verdict } from "./types";

const name = (v: Verdict) => (v === "tp" ? "true positive" : "false positive");
const WRONG_VERDICT_CAP = 40;
const CONTRADICTION_CAP = 70;

/** Decision first. Beginner: 50 verdict / 25 escalation / 25 report. Gated levels trade 25 of that for investigation. */
export function gradeSubmission(key: AnswerKey, sub: Submission, gated = false): Feedback {
  const W = gated ? { verdict: 35, esc: 15, inv: 25, report: 25 } : { verdict: 50, esc: 25, inv: 0, report: 25 };
  const rk = Object.hasOwn(REVIEW_KEYS, sub.alertId) ? REVIEW_KEYS[sub.alertId] : null;
  const items: FeedbackItem[] = [];

  const verdictOk = sub.verdict === key.verdict;
  items.push({
    label: "Verdict",
    points: verdictOk ? W.verdict : 0,
    max: W.verdict,
    note: verdictOk
      ? `Correct: this was a ${name(key.verdict)}.`
      : `This alert was a ${name(key.verdict)}, but you marked it as a ${name(sub.verdict)}. A wrong verdict caps the whole score at ${WRONG_VERDICT_CAP}.`,
  });

  const escalateOk = sub.escalate === key.escalate;
  items.push({
    label: "Escalation",
    points: escalateOk ? W.esc : 0,
    max: W.esc,
    note: escalateOk
      ? key.escalate
        ? "Right call: this needed to go to a senior analyst."
        : "Right call: nothing here needs escalating."
      : key.escalate
        ? "This should have been escalated: the activity needs action beyond your level."
        : "No escalation was needed: the activity is explained and contained.",
  });

  let invFraction = 1;
  if (gated) {
    const keySources = Object.hasOwn(INVESTIGATION_KEYS, sub.alertId) ? INVESTIGATION_KEYS[sub.alertId] : [];
    const opened = new Set(sub.opened ?? []);
    const unopened = keySources.filter((k) => !opened.has(k));
    invFraction = keySources.length ? (keySources.length - unopened.length) / keySources.length : 1;
    items.push({
      label: "Investigation",
      points: Math.round(W.inv * invFraction),
      max: W.inv,
      note: unopened.length
        ? `You did not look at: ${unopened.join("; ")}. A report is only as good as the sources behind it.`
        : "You checked every source that mattered.",
    });
  }

  const filled = writtenSections(sub.sections);
  const reportItem: FeedbackItem = {
    label: "Report written",
    points: reportWritten(sub.sections, W.report),
    max: W.report,
    note:
      filled.length === 4
        ? "Every section has something in it. The review below is about how it reads, not whether it is there."
        : gated
          ? `${filled.length} of 4 sections have something in them. The review below shows what to add.`
          : "You gave your reason, which is all this level asks for. Each extra section you fill in adds marks, and the review below shows what would go in them.",
  };
  items.push(reportItem);

  // Saying the opposite of what the evidence shows is an analyst error, not a wording one, so it still costs.
  const wrong = contradictions(Object.values(sub.sections).join("\n").toLowerCase(), rk?.avoid);
  if (wrong.length) reportItem.note = `${wrong[0]} A report that contradicts the evidence caps the score at ${CONTRADICTION_CAP}.`;

  let score = items.reduce((sum, i) => sum + i.points, 0);
  if (!verdictOk) score = Math.min(score, WRONG_VERDICT_CAP);
  else if (gated && invFraction < 0.5) {
    score = Math.min(score, 60);
    items[2].note += " Checking fewer than half of the key sources caps the score at 60.";
  }
  if (wrong.length) score = Math.min(score, CONTRADICTION_CAP);

  return { score, correctVerdict: key.verdict, correctEscalate: key.escalate, items, explanation: key.explanation };
}
