// Retries. A student may try an alert up to MAX_ATTEMPTS times; the case keeps every try and counts the best one.
// Pure helpers with no browser or server code, so the page, the server action and the sync layer all share one set of rules.
import type { Attempt, CaseRecord } from "./types";

export const MAX_ATTEMPTS = 3;

/** Every try, oldest first. A case closed before retries existed has exactly one. */
export const attemptsOf = (r: CaseRecord): Attempt[] => (r.attempts?.length ? r.attempts : [{ score: r.feedback.score, at: r.closedAt }]);
export const attemptsUsed = (r: CaseRecord): number => attemptsOf(r).length;
export const attemptsLeft = (r: CaseRecord): number => Math.max(0, MAX_ATTEMPTS - attemptsUsed(r));
export const firstScore = (r: CaseRecord): number => attemptsOf(r)[0].score;

/**
 * Adds a new try to a case. The record keeps the best try (submission, feedback, closedAt all belong to it),
 * so every page that already reads those three fields keeps working. A tie keeps the earlier try.
 */
export function addAttempt(prev: CaseRecord | undefined, next: CaseRecord): CaseRecord {
  const tries = [...(prev ? attemptsOf(prev) : []), { score: next.feedback.score, at: next.closedAt }].slice(0, MAX_ATTEMPTS);
  const best = prev && prev.feedback.score >= next.feedback.score ? prev : next;
  return { alertId: next.alertId, submission: best.submission, feedback: best.feedback, closedAt: best.closedAt, attempts: tries };
}

/** Joins two copies of the same case (this browser and the server): all tries are kept once, the best try wins. */
export function mergeCases(a: CaseRecord, b: CaseRecord): CaseRecord {
  const byTime = new Map<number, Attempt>();
  for (const t of [...attemptsOf(a), ...attemptsOf(b)]) byTime.set(t.at, t);
  const attempts = [...byTime.values()].sort((x, y) => x.at - y.at).slice(0, MAX_ATTEMPTS);
  const best = b.feedback.score > a.feedback.score ? b : a;
  return { alertId: a.alertId, submission: best.submission, feedback: best.feedback, closedAt: best.closedAt, attempts };
}

/** For records that arrive from the browser: a list of at most MAX_ATTEMPTS tries with sane numbers, or null. */
export function cleanAttempts(v: unknown): Attempt[] | null {
  if (!Array.isArray(v) || v.length === 0 || v.length > MAX_ATTEMPTS) return null;
  const out: Attempt[] = [];
  for (const t of v) {
    if (!t || typeof t.score !== "number" || typeof t.at !== "number") return null;
    if (!Number.isFinite(t.score) || t.score < 0 || t.score > 100 || !Number.isFinite(t.at)) return null;
    out.push({ score: Math.round(t.score), at: Math.round(t.at) });
  }
  return out;
}
