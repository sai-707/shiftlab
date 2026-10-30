// The rules for the "Send feedback" window. Plain functions, used by the browser (to show what is allowed) and again by the
// server action, because the browser cannot be trusted. Keep the limits in step with supabase/migrations/0006_feedback.sql.

export const TEXT_MAX = 1000;
export const EVIDENCE = ["yes", "mostly", "no"] as const;
export const ROLES = ["student", "l1", "l2plus", "other"] as const;
export type Evidence = (typeof EVIDENCE)[number];
export type Role = (typeof ROLES)[number];

/** What the window sends. Everything is optional except that at least one answer must be given. */
export type FeedbackInput = {
  rating?: number | null;
  evidence?: string | null;
  confusing?: string;
  opinion?: string;
  role?: string | null;
  contactOk?: boolean;
  path?: string;
  visitor?: string;
  trap?: string; // a hidden field a person never fills in; bots do
};

export type Level = "Beginner" | "Intermediate" | "Hard" | "AI Era";

/** The row as it is stored (without who is signed in and the alert's level, which only the server knows). */
export type FeedbackRow = {
  visitor: string | null;
  path: string | null;
  alert: string | null;
  rating: number | null;
  evidence: Evidence | null;
  confusing: string;
  opinion: string;
  role: Role | null;
  contact_ok: boolean;
};

const PATH = /^\/[A-Za-z0-9_\-/]{0,100}$/;
const VISITOR = /^[A-Za-z0-9-]{8,40}$/;
const ALERT_PATH = /^\/alerts\/(SL-\d{3,6})$/;

/** Trims, drops control characters (keeps line breaks), collapses long blank runs and cuts at the limit. */
export function cleanText(v: unknown): string {
  if (typeof v !== "string") return "";
  return Array.from(v.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "").replace(/[^\S\n]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{3,}/g, "\n\n").trim())
    .slice(0, TEXT_MAX)
    .join("");
}

/** "/alerts/SL-1014" -> "SL-1014"; anything else -> null. */
export const alertFromPath = (path: string | null): string | null => path?.match(ALERT_PATH)?.[1] ?? null;

export type Checked = { kind: "bot" } | { kind: "bad"; error: string } | { kind: "ok"; row: FeedbackRow };

export function checkFeedback(input: unknown): Checked {
  if (!input || typeof input !== "object") return { kind: "bad", error: "Something went wrong. Try again in a moment." };
  const i = input as FeedbackInput;
  if (typeof i.trap === "string" && i.trap.trim() !== "") return { kind: "bot" };

  const rating = typeof i.rating === "number" && Number.isInteger(i.rating) && i.rating >= 1 && i.rating <= 5 ? i.rating : null;
  const evidence = (EVIDENCE as readonly string[]).includes(i.evidence ?? "") ? (i.evidence as Evidence) : null;
  const role = (ROLES as readonly string[]).includes(i.role ?? "") ? (i.role as Role) : null;
  const confusing = cleanText(i.confusing);
  const opinion = cleanText(i.opinion);

  if (rating === null && evidence === null && !confusing && !opinion) {
    return { kind: "bad", error: "Give a rating, pick an answer or write something, then send." };
  }
  const path = typeof i.path === "string" && PATH.test(i.path) && !i.path.startsWith("/admin") ? i.path : null;
  const visitor = typeof i.visitor === "string" && VISITOR.test(i.visitor) ? i.visitor : null;
  return {
    kind: "ok",
    row: { visitor, path, alert: alertFromPath(path), rating, evidence, confusing, opinion, role, contact_ok: i.contactOk === true },
  };
}

/** The browser event that opens the window. Any "Send feedback" link fires it; <FeedbackWindow /> listens. */
export const FEEDBACK_EVENT = "shiftlab:feedback";
