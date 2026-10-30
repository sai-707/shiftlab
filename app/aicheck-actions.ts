"use server";

import { AI_DRILLS } from "@/content/aicheck";
import { AI_KEYS } from "@/content/aicheck-keys";

export type AiCheckRow = { index: number; flagged: boolean; wrong: boolean; why: string | null };

export type AiCheckResult =
  | { ok: false; error: string }
  | { ok: true; score: number; found: number; wrongTotal: number; falseAlarms: number; rows: AiCheckRow[]; habit: string };

/** Scores which sentences the student flagged as wrong. A false alarm cancels a catch, so flagging everything does not pay. */
export async function checkAiDraft(drillId: string, flagged: number[]): Promise<AiCheckResult> {
  const drill = typeof drillId === "string" ? AI_DRILLS.find((d) => d.id === drillId) : undefined;
  const key = drill && Object.hasOwn(AI_KEYS, drill.id) ? AI_KEYS[drill.id] : undefined;
  if (!drill || !key) return { ok: false, error: "Unknown drill." };
  if (!Array.isArray(flagged) || flagged.some((n) => !Number.isInteger(n) || n < 0 || n >= drill.draft.length)) {
    return { ok: false, error: "Your answer was not valid. Reload the page and try again." };
  }
  const picked = new Set(flagged);
  const wrongIdx = Object.keys(key.wrong).map(Number);
  const found = wrongIdx.filter((i) => picked.has(i)).length;
  const falseAlarms = [...picked].filter((i) => !(i in key.wrong)).length;
  const score = wrongIdx.length
    ? Math.max(0, Math.round((100 * (found - falseAlarms)) / wrongIdx.length))
    : Math.max(0, 100 - 50 * falseAlarms);
  const rows = drill.draft.map((_, index) => ({ index, flagged: picked.has(index), wrong: index in key.wrong, why: key.wrong[index] ?? null }));
  return { ok: true, score, found, wrongTotal: wrongIdx.length, falseAlarms, rows, habit: key.habit };
}
