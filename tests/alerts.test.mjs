// Content checks for every alert. Run with: npm test
import test from "node:test";
import assert from "node:assert/strict";
import { ALERTS } from "../content/alerts.ts";

const LEVELS = ["Beginner", "Intermediate", "Hard", "AI Era"];
const SEVERITIES = ["low", "medium", "high", "critical"];
const label = (title) => title.replace(/\s*\(.*\)\s*$/, "");

test("alerts have unique ids, known levels and severities", () => {
  assert.ok(ALERTS.length > 0);
  assert.equal(new Set(ALERTS.map((a) => a.id)).size, ALERTS.length, "duplicate alert id");
  for (const a of ALERTS) {
    assert.match(a.id, /^SL-\d{4}$/, a.id);
    assert.ok(LEVELS.includes(a.difficulty), `${a.id}: level ${a.difficulty}`);
    assert.ok(SEVERITIES.includes(a.severity), `${a.id}: severity ${a.severity}`);
  }
});

test("every alert has the text the page needs", () => {
  for (const a of ALERTS) {
    for (const k of ["title", "summary", "description"]) assert.ok(a[k]?.length > 20, `${a.id}: ${k} missing or too short`);
    assert.ok(a.description.length <= 700, `${a.id}: description too long (${a.description.length})`);
    assert.ok(a.briefing.source && a.briefing.rule && a.briefing.looksFor, `${a.id}: briefing incomplete`);
    assert.ok(a.briefing.askFirst.length >= 3, `${a.id}: needs at least 3 questions to ask first`);
    assert.ok(a.briefing.assets.length >= 1, `${a.id}: needs at least one asset`);
    assert.ok(a.evidence.length >= 3, `${a.id}: needs at least 3 evidence blocks`);
  }
});

test("evidence block titles are unique inside an alert", () => {
  for (const a of ALERTS) {
    const titles = a.evidence.map((b) => label(b.title));
    assert.equal(new Set(titles).size, titles.length, `${a.id}: two evidence blocks share a tab name`);
  }
});

test("Beginner questions point at an evidence block that exists", () => {
  for (const a of ALERTS.filter((x) => x.difficulty === "Beginner")) {
    const titles = a.evidence.map((b) => label(b.title).toLowerCase());
    for (const q of a.briefing.askFirst.filter((s) => s.includes("(see "))) {
      // "(see Web proxy log, the record of sites visited)" or "(see Asset record and Change calendar)": at least one name must match a tab.
      const names = q.slice(q.lastIndexOf("(see ") + 5).replace(/\)\.?$/, "").toLowerCase().split(/ and |, /);
      assert.ok(names.some((n) => titles.some((t) => t.startsWith(n) || n.startsWith(t))), `${a.id}: "${q}" points at no evidence block`);
    }
    assert.ok(a.task, `${a.id}: Beginner alerts need a "Your task" line`);
  }
});

// The higher levels must leave the judging to the student.
const SPOILERS = /\b(fake|malicious|stolen|hijack\w*|attacker)\b/i;

test("Hard and AI Era titles and asset roles do not state the finding", () => {
  for (const a of ALERTS.filter((x) => x.difficulty === "Hard" || x.difficulty === "AI Era")) {
    assert.ok(!SPOILERS.test(a.title), `${a.id}: title gives the finding away: ${a.title}`);
    for (const asset of a.briefing.assets) assert.ok(!SPOILERS.test(asset.role), `${a.id}: asset role gives the finding away: ${asset.role}`);
  }
});
