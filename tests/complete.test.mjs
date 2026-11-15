import test from "node:test";
import assert from "node:assert/strict";
import { decisionFixes, itemSub, tone } from "../lib/complete.ts";

test("score bands match the score panel and only a good score gets confetti", () => {
  assert.equal(tone(85).head, "Strong work");
  assert.equal(tone(84).head, "Solid, with gaps");
  assert.equal(tone(60).head, "Solid, with gaps");
  assert.equal(tone(59).head, "Needs another pass");
  assert.ok(tone(100).pieces > tone(70).pieces && tone(70).pieces > 0);
  assert.equal(tone(25).pieces, 0);
  assert.equal(tone(25).sparks, 0);
});

test("only decisions that lost marks are listed, in scored order", () => {
  const items = [
    { label: "Verdict", points: 50, max: 50, note: "a" },
    { label: "Escalation", points: 0, max: 25, note: "b" },
    { label: "Report written", points: 25, max: 25, note: "c" },
  ];
  assert.deepEqual(decisionFixes(items).map((i) => i.label), ["Escalation"]);
  assert.deepEqual(decisionFixes(items.map((i) => ({ ...i, points: i.max }))), []);
});

test("each bar says what the student chose", () => {
  const sub = { alertId: "SL-1001", verdict: "tp", escalate: false, sections: {}, opened: ["a", "b"] };
  assert.equal(itemSub("Verdict", sub), "True positive");
  assert.equal(itemSub("Verdict", { ...sub, verdict: "fp" }), "False positive");
  assert.equal(itemSub("Escalation", sub), "Not escalated");
  assert.equal(itemSub("Escalation", { ...sub, escalate: true }), "Escalated");
  assert.equal(itemSub("Investigation", sub), "2 sources opened");
  assert.equal(itemSub("Investigation", { ...sub, opened: undefined }), "0 sources opened");
  assert.equal(itemSub("Report written", sub), "Written");
});
