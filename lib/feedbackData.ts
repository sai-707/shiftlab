// SERVER ONLY. Reads feedback for the admin page. The database policy lets only an admin read the table, so for anyone else
// this returns nothing even if the page gate were removed.
import { createClient } from "@/lib/supabase/server";

export type FeedbackItem = {
  id: number;
  at: string;
  path: string | null;
  alert: string | null;
  level: string | null;
  rating: number | null;
  evidence: "yes" | "mostly" | "no" | null;
  confusing: string;
  opinion: string;
  role: "student" | "l1" | "l2plus" | "other" | null;
  contact_ok: boolean;
  signed_in: boolean;
  read: boolean;
};

export type Show = "all" | "unread" | "contact";
export const parseShow = (v: unknown): Show => (v === "unread" || v === "contact" ? v : "all");

export type FeedbackResult = { ok: true; items: FeedbackItem[]; unread: number } | { ok: false; code: string };

// shortcut: the newest 100 only, no paging. Fine while feedback is a trickle; add paging when it is not.
export async function getFeedback(show: Show): Promise<FeedbackResult> {
  const supabase = await createClient();
  let q = supabase
    .from("feedback")
    .select("id, at, path, alert, level, rating, evidence, confusing, opinion, role, contact_ok, signed_in, read")
    .order("at", { ascending: false })
    .limit(100);
  if (show === "unread") q = q.eq("read", false);
  if (show === "contact") q = q.eq("contact_ok", true);
  const [list, count] = await Promise.all([q, supabase.from("feedback").select("id", { count: "exact", head: true }).eq("read", false)]);
  if (list.error) {
    console.error("[admin] feedback failed:", list.error.code); // code only
    return { ok: false, code: list.error.code ?? "empty" };
  }
  return { ok: true, items: (list.data ?? []) as FeedbackItem[], unread: count.count ?? 0 };
}
