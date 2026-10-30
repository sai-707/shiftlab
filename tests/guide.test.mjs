import test from "node:test";
import assert from "node:assert/strict";
import { ALERTS } from "../content/alerts.ts";
import { GUIDE } from "../content/guide.ts";

test("every level named in the guide has alerts, and every alert is in a named level", () => {
  const names = GUIDE.levels.map((l) => l.name);
  for (const n of names) assert.ok(ALERTS.some((a) => a.difficulty === n), `${n} has alerts`);
  for (const a of ALERTS) assert.ok(names.includes(a.difficulty), `${a.id} level is in the guide`);
});

test("the guide text never writes an alert count by hand (the number grows)", () => {
  assert.doesNotMatch(JSON.stringify(GUIDE), /\b\d+ alerts\b/i);
});

test("every guide entry has text, and every source has a link", () => {
  const texts = [GUIDE.title, GUIDE.lead, ...GUIDE.glance.flatMap((g) => [g.k, g.v]), ...GUIDE.problem.cards.flatMap((c) => [c.big, c.title, c.text, c.source]),
    ...GUIDE.does.steps.flatMap((s) => [s.title, s.text]), ...GUIDE.example.rows.flatMap((r) => [r.k, r.text]), ...GUIDE.benefits.items.flatMap((b) => [b.title, b.text]),
    ...GUIDE.who.forYou, ...GUIDE.who.notFor, ...GUIDE.why.paragraphs, ...GUIDE.start.steps, ...GUIDE.faq.flatMap((f) => [f.q, f.a])];
  for (const t of texts) assert.ok(t.trim().length > 2, `empty text near: ${t}`);
  for (const s of GUIDE.sources) assert.match(s.url, /^https:\/\//);
  assert.equal(GUIDE.problem.cards.length, 3);
});
