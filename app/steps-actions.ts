"use server";

import { STEP_CHALLENGES } from "@/content/steps";
import { STEP_KEYS } from "@/content/steps-keys";

const own = <T,>(obj: Record<string, T>, key: unknown): T | null =>
  typeof key === "string" && Object.hasOwn(obj, key) ? obj[key] : null;

export type TimelineResult =
  | { ok: false; error: string }
  | { ok: true; score: number; found: string[]; noise: string[]; missed: string[]; ordered: boolean; why: string };

/** Grades the picked events (in the order the student put them). Bonus practice: nothing here touches the case score. */
export async function checkTimeline(alertId: string, picks: string[]): Promise<TimelineResult> {
  const ch = own(STEP_CHALLENGES, alertId)?.timeline;
  const key = own(STEP_KEYS, alertId)?.timeline;
  if (!ch || !key) return { ok: false, error: "This alert has no timeline step." };
  const ids = Array.isArray(picks) ? picks.filter((p): p is string => typeof p === "string").slice(0, 30) : [];
  if (new Set(ids).size !== ids.length || ids.some((id) => !ch.events.some((e) => e.id === id))) {
    return { ok: false, error: "Something is wrong with your picks. Reload and try again." };
  }
  if (ids.length === 0) return { ok: false, error: "Pick at least one event first." };

  const found = ids.filter((id) => key.key.includes(id));
  const noise = ids.filter((id) => !key.key.includes(id));
  const missed = key.key.filter((id) => !ids.includes(id));
  const times = ids.map((id) => ch.events.find((e) => e.id === id)!.time);
  const ordered = times.every((t, i) => i === 0 || times[i - 1] <= t);
  const content = Math.max(0, found.length - noise.length) / key.key.length;
  return { ok: true, score: Math.round(100 * content * (ordered ? 1 : 0.8)), found, noise, missed, ordered, why: key.why };
}

export type ScopeResult =
  | { ok: false; error: string }
  | { ok: true; score: number; rows: { id: string; correct: boolean; answer: string; why: string }[] };

export async function checkScope(alertId: string, marks: Record<string, string>): Promise<ScopeResult> {
  const ch = own(STEP_CHALLENGES, alertId)?.scope;
  const key = own(STEP_KEYS, alertId)?.scope;
  if (!ch || !key) return { ok: false, error: "This alert has no scope step." };
  const m = marks && typeof marks === "object" ? marks : {};
  if (ch.rows.some((r) => typeof m[r.id] !== "string" || !ch.options.includes(m[r.id]))) {
    return { ok: false, error: "Mark every row first." };
  }
  const rows = ch.rows.map((r) => ({ id: r.id, correct: m[r.id] === key.answers[r.id], answer: key.answers[r.id], why: key.why[r.id] }));
  return { ok: true, score: Math.round((100 * rows.filter((r) => r.correct).length) / rows.length), rows };
}
