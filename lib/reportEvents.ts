// Browser side. Tells /api/e that a report was started or was blocked by a check, so the admin Analytics page can show where people give up.
// Sends only the alert id and a short reason code, never anything typed. Sends nothing when the browser says "Do Not Track".
import { visitorId } from "@/lib/visitor";

export type ReportEvent = "started" | "blocked";
/** Why a submit was stopped: no verdict or escalation chosen, a section left empty, or text a check did not accept. */
export type BlockReason = "decision" | "empty" | "quality";

export function reportEvent(k: ReportEvent, alertId: string, reason?: BlockReason): void {
  try {
    if (navigator.doNotTrack === "1") return;
    navigator.sendBeacon("/api/e", JSON.stringify({ k, a: alertId, r: reason, v: visitorId() }));
  } catch {
    // counting must never get in the way of writing a report
  }
}

/** "empty" when the problem is a missing section, otherwise "quality". Matches the wording in lib/reportRules.ts. */
export const blockReason = (problem: string): BlockReason => (problem.endsWith("is required.") ? "empty" : "quality");
