"use server";

// "Send feedback": saves one row (see supabase/migrations/0006_feedback.sql) and, for admins, marks rows as read.
// Every input is checked again here with the same rules as the window (lib/feedbackRules.ts).

import { revalidatePath } from "next/cache";
import { ALERTS } from "@/content/alerts";
import { checkFeedback } from "@/lib/feedbackRules";
import { createClient } from "@/lib/supabase/server";

type Result = { error: string } | { ok: true };

export async function sendFeedback(input: unknown): Promise<Result> {
  const checked = checkFeedback(input);
  if (checked.kind === "bad") return { error: checked.error };
  if (checked.kind === "bot") return { ok: true }; // looks like a bot: say thanks, save nothing

  const { row } = checked;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub ?? null;

  const { error } = await supabase.from("feedback").insert({
    ...row,
    level: ALERTS.find((a) => a.id === row.alert)?.difficulty ?? null,
    signed_in: userId !== null,
    // the account is linked only when the person agreed to be contacted (the database enforces this too)
    user_id: row.contact_ok ? userId : null,
  });
  if (error) {
    console.error("[feedback]", error.code); // code only, never the text
    return { error: error.code === "P0001" ? "You have sent a lot of feedback just now. Please try again in an hour." : "Could not send that. Try again in a moment." };
  }
  return { ok: true };
}

/** Admin only: the database policy lets only an admin change a row, so for anyone else this changes nothing. */
export async function markFeedbackRead(id: number | "all"): Promise<void> {
  const supabase = await createClient();
  const q = supabase.from("feedback").update({ read: true });
  const { error } = id === "all" ? await q.eq("read", false) : await q.eq("id", Number.isInteger(id) ? id : -1);
  if (error) console.error("[feedback] mark read failed:", error.code);
  revalidatePath("/admin/feedback");
}
