"use server";

// Sends one message in a feedback thread. The database decides whether the sender is the admin or the tester and whether the
// message is allowed (see send_feedback_message in supabase/migrations/0011_feedback_replies.sql); this only cleans the text first.

import { revalidatePath } from "next/cache";
import { cleanText } from "@/lib/feedbackRules";
import { messageError, type SendResult } from "@/lib/messages";
import { createClient } from "@/lib/supabase/server";

export async function sendMessage(fid: number, text: string): Promise<SendResult> {
  const body = cleanText(text);
  if (!body) return { error: messageError("22023") };
  if (!Number.isSafeInteger(fid) || fid < 1) return { error: messageError() };

  const supabase = await createClient();
  const { error } = await supabase.rpc("send_feedback_message", { fid, msg: body });
  if (error) {
    console.error("[messages] send failed:", error.code); // code only, never the text
    return { error: messageError(error.code) };
  }
  revalidatePath("/messages");
  revalidatePath("/admin/feedback");
  return {};
}
