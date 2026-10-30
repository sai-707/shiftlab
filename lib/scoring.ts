import type { AnswerKey, Feedback, FeedbackItem, Submission, Verdict } from "./types";

const SECTION_MIN_CHARS = 20;

const name = (v: Verdict) => (v === "tp" ? "true positive" : "false positive");

/** Pure scoring: 40 verdict + 20 escalation + 25 evidence cited + 15 report completeness. */
export function scoreSubmission(key: AnswerKey, sub: Submission): Feedback {
  const items: FeedbackItem[] = [];

  const verdictOk = sub.verdict === key.verdict;
  items.push({
    label: "Verdict",
    points: verdictOk ? 40 : 0,
    max: 40,
    note: verdictOk
      ? `Correct: this was a ${name(key.verdict)}.`
      : `This alert was a ${name(key.verdict)}, but you marked it as a ${name(sub.verdict)}.`,
  });

  const escalateOk = sub.escalate === key.escalate;
  items.push({
    label: "Escalation",
    points: escalateOk ? 20 : 0,
    max: 20,
    note: escalateOk
      ? key.escalate
        ? "Right call: this needed to go to a senior analyst."
        : "Right call: nothing here needs escalating."
      : key.escalate
        ? "This should have been escalated: the activity needs action beyond your level."
        : "No escalation was needed: the activity is explained and contained.",
  });

  const text = Object.values(sub.sections).join(" ").toLowerCase();
  const missed = key.evidence.filter((e) => !e.matches.some((m) => text.includes(m)));
  const found = key.evidence.length - missed.length;
  items.push({
    label: "Evidence in your report",
    points: key.evidence.length === 0 ? 25 : Math.round((25 * found) / key.evidence.length),
    max: 25,
    note:
      missed.length === 0
        ? "You cited all of the key evidence."
        : `Not mentioned in your report: ${missed.map((e) => e.label).join("; ")}.`,
  });

  const sections = Object.values(sub.sections);
  const filled = sections.filter((s) => s.trim().length >= SECTION_MIN_CHARS).length;
  items.push({
    label: "Report completeness",
    points: Math.round((15 * filled) / sections.length),
    max: 15,
    note:
      filled === sections.length
        ? "All four sections are filled in."
        : `${sections.length - filled} of ${sections.length} sections are empty or too short. Aim for at least a full sentence in each.`,
  });

  return {
    score: items.reduce((sum, i) => sum + i.points, 0),
    correctVerdict: key.verdict,
    correctEscalate: key.escalate,
    items,
    explanation: key.explanation,
  };
}
