import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { alertFromPath, checkFeedback, cleanText, TEXT_MAX } from "../lib/feedbackRules.ts";

const ok = (r) => {
  assert.equal(r.kind, "ok");
  return r.row;
};

test("an empty form is refused", () => {
  assert.equal(checkFeedback({}).kind, "bad");
  assert.equal(checkFeedback({ rating: 0, evidence: "", confusing: "   ", opinion: "\n" }).kind, "bad");
  assert.equal(checkFeedback(null).kind, "bad");
});

test("one answer is enough, and bad values are dropped, not trusted", () => {
  assert.equal(ok(checkFeedback({ rating: 4 })).rating, 4);
  const row = ok(checkFeedback({ opinion: "good", rating: 9, evidence: "maybe", role: "boss" }));
  assert.equal(row.rating, null);
  assert.equal(row.evidence, null);
  assert.equal(row.role, null);
});

test("a filled trap field means a bot: nothing is saved", () => {
  assert.equal(checkFeedback({ rating: 5, trap: "http://spam" }).kind, "bot");
});

test("text is cleaned and capped at the database limit", () => {
  assert.equal(cleanText("  hi\u0000 there \n\n\n\nbye "), "hi there\n\nbye");
  assert.equal(Array.from(cleanText("x".repeat(5000))).length, TEXT_MAX);
  const sql = readFileSync(new URL("../supabase/migrations/0006_feedback.sql", import.meta.url), "utf8");
  assert.ok(sql.includes(`char_length(confusing) <= ${TEXT_MAX}`) && sql.includes(`char_length(opinion) <= ${TEXT_MAX}`), "SQL limit differs from TEXT_MAX");
});

test("path and visitor are checked; admin pages are never accepted", () => {
  const row = ok(checkFeedback({ rating: 3, path: "/alerts/SL-1014", visitor: "abcd-1234-efgh" }));
  assert.equal(row.alert, "SL-1014");
  assert.equal(row.visitor, "abcd-1234-efgh");
  const bad = ok(checkFeedback({ rating: 3, path: "/admin/feedback", visitor: "x" }));
  assert.equal(bad.path, null);
  assert.equal(bad.visitor, null);
  assert.equal(alertFromPath("/alerts/SL-1014/extra"), null);
  assert.equal(alertFromPath("/dashboard"), null);
});

test("contact_ok is true only for a real true", () => {
  assert.equal(ok(checkFeedback({ rating: 3, contactOk: "yes" })).contact_ok, false);
  assert.equal(ok(checkFeedback({ rating: 3, contactOk: true })).contact_ok, true);
});

test("the migration keeps feedback readable by admins only", () => {
  const sql = readFileSync(new URL("../supabase/migrations/0006_feedback.sql", import.meta.url), "utf8");
  assert.ok(sql.includes("enable row level security"));
  assert.ok(!/grant\s+(select|update|delete)[^;]*to\s+anon/i.test(sql), "anon must only insert");
  assert.ok(/for select[\s\S]*is_admin\(\)/.test(sql));
});
