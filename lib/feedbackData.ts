// SERVER ONLY. Reads feedback for the admin page. The database policy lets only an admin read the table, so for anyone else
// this returns nothing even if the page gate were removed.
import type { Message } from "@/lib/messages";
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
  /** Linked to an account (signed in and ticked "reply to me"), so a reply can reach them. */
  has_account: boolean;
  messages: Message[];
};

export type Show = "all" | "unread" | "contact";
export const parseShow = (v: unknown): Show => (v === "unread" || v === "contact" ? v : "all");

export type FeedbackResult = { ok: true; items: FeedbackItem[]; unread: number } | { ok: false; code: string };

// shortcut: the newest 100 only, no paging. Fine while feedback is a trickle; add paging when it is not.
export async function getFeedback(show: Show): Promise<FeedbackResult> {
  const supabase = await createClient();
  let q = supabase
    .from("feedback")
    .select("id, at, path, alert, level, rating, evidence, confusing, opinion, role, contact_ok, signed_in, read, user_id")
    .order("at", { ascending: false })
    .limit(100);
  if (show === "unread") q = q.eq("read", false);
  if (show === "contact") q = q.eq("contact_ok", true);
  const [list, count] = await Promise.all([q, supabase.from("feedback").select("id", { count: "exact", head: true }).eq("read", false)]);
  if (list.error) {
    console.error("[admin] feedback failed:", list.error.code); // code only
    return { ok: false, code: list.error.code ?? "empty" };
  }
  const rows = list.data ?? [];
  // The threads for these rows. If 0011_feedback_replies.sql has not been run yet this fails; the list still works, just without threads.
  const ids = rows.filter((r) => r.user_id).map((r) => r.id);
  const byId = new Map<number, Message[]>();
  if (ids.length) {
    const msgs = await supabase.from("feedback_messages").select("id, feedback_id, from_admin, body, at, seen").in("feedback_id", ids).order("at").order("id");
    if (msgs.error) console.error("[admin] messages failed:", msgs.error.code);
    for (const m of msgs.data ?? []) byId.set(m.feedback_id, [...(byId.get(m.feedback_id) ?? []), m]);
  }
  const items = rows.map(({ user_id, ...r }) => ({ ...r, has_account: user_id !== null, messages: byId.get(r.id) ?? [] }));
  return { ok: true, items: items as FeedbackItem[], unread: count.count ?? 0 };
}
