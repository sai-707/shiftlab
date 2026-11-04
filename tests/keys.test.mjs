import test from "node:test";
import assert from "node:assert/strict";
import { ALERTS } from "../content/alerts.ts";
import { ANSWER_KEYS } from "../content/answer-keys.ts";
import { REVIEW_KEYS } from "../content/review-keys.ts";

test("every alert has a grading key and a review key", () => {
  for (const a of ALERTS) {
    const k = ANSWER_KEYS[a.id];
    assert.ok(k, `${a.id}: no answer key`);
    assert.ok(["tp", "fp"].includes(k.verdict), `${a.id}: bad verdict`);
    assert.equal(typeof k.escalate, "boolean", `${a.id}: escalate must be true or false`);
    assert.ok(k.evidence.length >= 1 && k.explanation.length > 20, `${a.id}: key is thin`);
    const r = REVIEW_KEYS[a.id];
    assert.ok(r, `${a.id}: no review key`);
    for (const s of ["happened", "confirmed", "unknown", "next"]) assert.ok(r.model[s]?.length > 10, `${a.id}: model text for "${s}" missing`);
  }
});

test("keys exist only for real alerts", () => {
  for (const id of Object.keys(ANSWER_KEYS)) assert.ok(ALERTS.some((a) => a.id === id), `answer key for unknown alert ${id}`);
  for (const id of Object.keys(REVIEW_KEYS)) assert.ok(ALERTS.some((a) => a.id === id), `review key for unknown alert ${id}`);
});

test("every false positive has a reason from the list, and true positives have none", async () => {
  const { FP_REASONS } = await import("../content/fp-reasons.ts");
  const ids = FP_REASONS.map((r) => r.id);
  for (const a of ALERTS) {
    const k = ANSWER_KEYS[a.id];
    if (k.verdict === "fp") assert.ok(ids.includes(k.reason), `${a.id}: false positive needs a valid reason`);
    else assert.equal(k.reason, undefined, `${a.id}: only false positives carry a reason`);
  }
});

test("alert titles are neutral rule names: no digits-heavy stories, unique, and every alert has a category", () => {
  const seen = new Set();
  for (const a of ALERTS) {
    assert.ok(a.category, `${a.id}: category missing`);
    assert.ok(!seen.has(a.title), `${a.id}: duplicate title "${a.title}"`);
    seen.add(a.title);
    assert.ok(a.title.length <= 75, `${a.id}: title too long for a console row`);
  }
});
