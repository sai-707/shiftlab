"use server";

import { SHIFTS } from "@/content/shifts";
import { SHIFT_KEYS } from "@/content/shift-keys";

export type ShiftItemResult = {
  id: string;
  rank: number | null;
  tier: number;
  picked: string | null;
  ideal: string;
  rightTreatment: boolean;
  why: string;
};

export type ShiftResult =
  | { ok: false; error: string }
  | {
      ok: true;
      score: number;
      order: number;
      treatment: number;
      pairsRight: number;
      pairsTotal: number;
      treatmentRight: number;
      total: number;
      firstTier: number | null;
      overEscalated: number;
      items: ShiftItemResult[];
    };

const TREATMENT_IDS = ["escalate", "handle", "close"];
const W_ORDER = 60;
const W_TREAT = 40;

/** Scores the order (pairs of alerts from different tiers) and the treatment of each alert. Alerts the student did not rank count as last. */
export async function checkShift(shiftId: string, ranks: string[], treat: Record<string, string>): Promise<ShiftResult> {
  const shift = typeof shiftId === "string" ? SHIFTS.find((s) => s.id === shiftId) : undefined;
  const keys = shift && Object.hasOwn(SHIFT_KEYS, shift.id) ? SHIFT_KEYS[shift.id] : undefined;
  if (!shift || !keys) return { ok: false, error: "Unknown shift." };
  const ids = shift.alerts.map((a) => a.id);
  if (!Array.isArray(ranks) || ranks.some((r) => typeof r !== "string" || !ids.includes(r)) || new Set(ranks).size !== ranks.length) {
    return { ok: false, error: "Your order was not valid. Reload the page and try again." };
  }
  const picks = treat && typeof treat === "object" ? treat : {};

  const pos = (id: string) => (ranks.includes(id) ? ranks.indexOf(id) : 99);
  let pairsRight = 0;
  let pairsTotal = 0;
  for (let i = 0; i < ids.length; i++) {
    for (let j = i + 1; j < ids.length; j++) {
      const a = keys[ids[i]];
      const b = keys[ids[j]];
      if (a.tier === b.tier) continue;
      pairsTotal++;
      const pa = pos(ids[i]);
      const pb = pos(ids[j]);
      if (pa !== pb && a.tier < b.tier === pa < pb) pairsRight++;
    }
  }
  const order = pairsTotal ? Math.round((W_ORDER * pairsRight) / pairsTotal) : W_ORDER;

  const items: ShiftItemResult[] = ids.map((id) => {
    const p = typeof picks[id] === "string" && TREATMENT_IDS.includes(picks[id]) ? picks[id] : null;
    return {
      id,
      rank: ranks.includes(id) ? ranks.indexOf(id) + 1 : null,
      tier: keys[id].tier,
      picked: p,
      ideal: keys[id].ideal,
      rightTreatment: p === keys[id].ideal,
      why: keys[id].why,
    };
  });
  const treatmentRight = items.filter((i) => i.rightTreatment).length;
  const treatment = Math.round((W_TREAT * treatmentRight) / ids.length);
  const overEscalated = items.filter((i) => i.picked === "escalate" && i.ideal !== "escalate").length;
  const firstTier = ranks.length ? keys[ranks[0]].tier : null;

  return { ok: true, score: order + treatment, order, treatment, pairsRight, pairsTotal, treatmentRight, total: ids.length, firstTier, overEscalated, items };
}
