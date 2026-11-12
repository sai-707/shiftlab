// SERVER ONLY. Reads and marks the signed-in person's own feedback threads through database functions that only ever see that person.
// If 0011_feedback_replies.sql has not been run yet these return "nothing", so no page breaks.
import { createClient } from "@/lib/supabase/server";
import type { Inbox, Thread } from "@/lib/messages";

/** For the bell. Call only for someone who is signed in (a guest has no permission for it). */
export async function getInbox(): Promise<Inbox | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_inbox");
  if (error) {
    console.error("[messages] inbox failed:", error.code); // code only
    return null;
  }
  return data as Inbox;
}

export async function getMyThreads(): Promise<{ ok: true; threads: Thread[] } | { ok: false; code: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("my_threads");
  if (error) {
    console.error("[messages] threads failed:", error.code);
    return { ok: false, code: error.code ?? "empty" };
  }
  return { ok: true, threads: (data ?? []) as Thread[] };
}

export async function markSeen(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_my_messages_seen");
  if (error) console.error("[messages] mark seen failed:", error.code);
}
