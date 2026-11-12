// Shared by the pages and the server action for feedback replies (see supabase/migrations/0011_feedback_replies.sql).
// Plain types and one pure function, so the browser and the tests can import it. Message text is cleaned with cleanText() from
// lib/feedbackRules.ts.
export const MESSAGE_MAX = 1000; // same as TEXT_MAX in lib/feedbackRules.ts and the check in 0011_feedback_replies.sql

export type Message = { id: number; from_admin: boolean; body: string; at: string; seen: boolean };
export type Thread = { id: number; alert: string | null; path: string | null; confusing: string; opinion: string; at: string; last: string; messages: Message[] };
export type Inbox = { threads: number; unread: number };
export type SendResult = { error?: string };

/** What the person reads when the database refuses a message. Codes come from send_feedback_message(). */
export function messageError(code?: string): string {
  if (code === "P0001") return "You have sent 10 messages today. Please try again tomorrow.";
  if (code === "42501") return "This conversation is not open for replies.";
  if (code === "22023") return "Write a message first.";
  return "Could not send that. Try again in a moment.";
}
