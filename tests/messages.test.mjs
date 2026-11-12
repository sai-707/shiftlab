import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { MESSAGE_MAX, messageError } from "../lib/messages.ts";
import { TEXT_MAX } from "../lib/feedbackRules.ts";

const sql = readFileSync(new URL("../supabase/migrations/0011_feedback_replies.sql", import.meta.url), "utf8");

test("the message limit matches the feedback text limit and the database check", () => {
  assert.equal(MESSAGE_MAX, TEXT_MAX);
  assert.match(sql, new RegExp(`char_length\\(body\\) between 1 and ${MESSAGE_MAX}`));
});

test("each database refusal has its own plain message, and anything else is generic", () => {
  assert.match(messageError("P0001"), /10 messages/);
  assert.match(messageError("42501"), /not open/);
  assert.match(messageError("22023"), /Write a message/);
  for (const other of [undefined, "", "XX000"]) assert.match(messageError(other), /Could not send/);
});

test("the migration only adds: nothing is dropped, deleted or truncated, and a guest gets no access", () => {
  const code = sql.replace(/--.*$/gm, "");
  assert.doesNotMatch(code, /\b(drop table|drop column|truncate|delete from|alter table [^;]* drop)\b/i);
  assert.doesNotMatch(code, /grant [^;]* to [^;]*\banon\b/i);
  assert.match(code, /enable row level security/i);
});

test("replies are decided by the database: the sender's role is never taken from the caller", () => {
  assert.match(sql, /public\.is_admin\(\)/);
  assert.match(sql, /'no reply yet'/); // a tester cannot start a thread
  assert.match(sql, /interval '1 day'\) >= 10/); // and is limited to 10 a day
});
