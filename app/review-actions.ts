"use server";

import { reviewReport, type ReviewData } from "@/lib/review";
import type { ReportSections } from "@/lib/types";

export type ReviewResult = { ok: false; error: string } | ({ ok: true } & ReviewData);

/** Gives written feedback on a submitted report. Does not score or save anything. */
export async function reviewCase(alertId: string, sections: ReportSections): Promise<ReviewResult> {
  if (typeof alertId !== "string") return { ok: false, error: "Unknown alert." };
  const r = reviewReport(alertId, {
    happened: String(sections?.happened ?? ""),
    confirmed: String(sections?.confirmed ?? ""),
    unknown: String(sections?.unknown ?? ""),
    next: String(sections?.next ?? ""),
  });
  return r ? { ok: true, ...r } : { ok: false, error: "No review available for this alert." };
}
