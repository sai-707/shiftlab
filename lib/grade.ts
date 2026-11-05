// SERVER ONLY. Strict scoring: every point has to be earned in the right section, in real sentences.
import { REVIEW_KEYS } from "@/content/review-keys";
import { ACTION, SOURCE, UNCERTAIN, anyOf, contradictions } from "@/lib/review";
import { INVESTIGATION_KEYS } from "@/content/investigation-keys";
import type { AnswerKey, Feedback, FeedbackItem, Submission, Verdict } from "./types";

const name = (v: Verdict) => (v === "tp" ? "true positive" : "false positive");
const WRONG_VERDICT_CAP = 40;

/** Facts only count in their own section. Beginner: 30/15/15/15/10/15. Gated levels add 15 for investigation. */
export function gradeSubmission(key: AnswerKey, sub: Submission, gated = false): Feedback {
  // Gated (Intermediate and Hard) alerts carry 15 points for how well the student investigated.
  const W = gated
    ? { verdict: 25, esc: 10, happened: 12, confirmed: 13, unknown: 10, next: 15, inv: 15 }
    : { verdict: 30, esc: 15, happened: 15, confirmed: 15, unknown: 10, next: 15, inv: 0 };
  const rk = Object.hasOwn(REVIEW_KEYS, sub.alertId) ? REVIEW_KEYS[sub.alertId] : null;
  const items: FeedbackItem[] = [];
  const low = {
    happened: sub.sections.happened.toLowerCase(),
    confirmed: sub.sections.confirmed.toLowerCase(),
    unknown: sub.sections.unknown.toLowerCase(),
    next: sub.sections.next.toLowerCase(),
  };

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

  const wrong = contradictions(Object.values(low).join("\n"), rk?.avoid);
  let totalHits = 0;

  for (const s of ["happened", "confirmed"] as const) {
    const facts = rk?.facts.filter((f) => f.in === s) ?? [];
    const hit = facts.filter((f) => anyOf(low[s], f.matches));
    const missed = facts.filter((f) => !hit.includes(f));
    totalHits += hit.length;
    // Full marks need about 80% of the facts, so one lucky keyword never earns much.
    const need = Math.max(1, Math.ceil(facts.length * 0.8));
    const max = s === "happened" ? W.happened : W.confirmed;
    let points = facts.length ? Math.round((max * Math.min(hit.length, need)) / need) : max;
    let note =
      missed.length === 0
        ? "Every key fact is in this section."
        : `Not in this section: ${missed.map((f) => f.label).join("; ")}.`;
    if (s === "confirmed" && wrong.length) {
      points = 0;
      note = `${wrong[0]} ${missed.length ? note : ""}`.trim();
    }
    items.push({ label: s === "happened" ? "What happened" : "What is confirmed", points, max, note });
  }

  const uw = low.unknown.trim().split(/\s+/).filter(Boolean).length;
  const uncertain = UNCERTAIN.test(low.unknown);
  const factsHere = (rk?.facts ?? []).some((f) => anyOf(low.unknown, f.matches));
  let unkPoints: number;
  let unkNote: string;
  if (key.verdict === "fp") {
    unkPoints = (uw >= 6 ? 5 : 0) + (SOURCE.test(low.unknown) || uncertain || /(nothing|did not|didn't|no need)/.test(low.unknown) ? 5 : 0);
    unkNote = unkPoints === 10 ? "Clear: nothing open, and you said what you checked." : "For a false positive, say what you checked and that nothing open changes the call.";
  } else {
    unkPoints = (uncertain ? 5 : 0) + (uw >= 12 && factsHere ? 5 : 0);
    unkNote =
      unkPoints === 10
        ? "You named specific gaps in what you know."
        : !uncertain
          ? "This does not state a gap. Say what you cannot tell yet, for example 'I do not know whether…'."
          : "Be specific: name the host, account or file your gap is about, in at least a full sentence or two.";
  }
  items.push({ label: "What is still unknown", points: unkPoints, max: 10, note: unkNote });

  const nextHits = rk?.next.filter((x) => anyOf(low.next, x.matches)) ?? [];
  const nextMiss = rk?.next.filter((x) => !nextHits.includes(x)) ?? [];
  const needNext = Math.max(1, Math.ceil((rk?.next.length ?? 1) * 0.6));
  const hasAction = ACTION.test(low.next);
  const nextPoints = rk ? (hasAction ? Math.round((W.next * Math.min(nextHits.length, needNext)) / needNext) : 0) : W.next;
  items.push({
    label: "Next action",
    points: nextPoints,
    max: W.next,
    note: !hasAction
      ? "No clear action. Say what should happen and who does it."
      : nextMiss.length === 0 || nextHits.length >= needNext
        ? "Your actions cover what this case needs."
        : `Consider also: ${nextMiss.map((x) => x.label).join("; ")}.`,
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

  let score = items.reduce((sum, i) => sum + i.points, 0);
  if (!verdictOk) score = Math.min(score, WRONG_VERDICT_CAP);
  else if (gated && invFraction < 0.5) {
    score = Math.min(score, 60);
    items[items.length - 1].note += " Checking fewer than half of the key sources caps the score at 60.";
  } else if (rk && totalHits < 2) {
    score = Math.min(score, WRONG_VERDICT_CAP);
    items[0].note += " But your report cites fewer than two of the key facts, so the score is capped at 40.";
  }

  if (wrong.length) {
    score = Math.min(score, 70);
    items[3].note += " A report that contradicts the evidence caps the score at 70.";
  }

  return { score, correctVerdict: key.verdict, correctEscalate: key.escalate, items, explanation: key.explanation };
}
