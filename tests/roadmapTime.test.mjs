import test from "node:test";
import assert from "node:assert/strict";
import { PHASES } from "../content/roadmap.ts";
import { spanLabel, sumWeeks, weeksOf } from "../lib/roadmapTime.ts";

test("reads the time labels used in the roadmap", () => {
  assert.deepEqual(weeksOf("2 to 3 weeks"), { lo: 2, hi: 3 });
  assert.deepEqual(weeksOf("1 week"), { lo: 1, hi: 1 });
  assert.equal(weeksOf("Ongoing"), null);
  assert.equal(weeksOf(undefined), null);
});

test("every topic time is either a week range or Ongoing", () => {
  for (const p of PHASES) for (const s of p.sections) for (const t of s.topics) assert.ok(weeksOf(t.time) || t.time === "Ongoing" || !t.time, `${t.name}: "${t.time}"`);
});

test("a total adds up its topics", () => {
  assert.deepEqual(sumWeeks(["2 to 3 weeks", "1 week", "Ongoing"]), { lo: 3, hi: 4, open: 1 });
});

test("labels switch to months when long, and scale with weekly hours", () => {
  const t = { lo: 27, hi: 37, open: 0 };
  assert.equal(spanLabel(t), "about 6 to 9 months");
  assert.equal(spanLabel(t, 20), "about 14 to 19 weeks");
  assert.equal(spanLabel(t, 5), "about 12 to 17 months");
  assert.equal(spanLabel({ lo: 10, hi: 14, open: 0 }), "about 10 to 14 weeks");
  assert.equal(spanLabel({ lo: 10, hi: 14, open: 0 }, 20), "about 5 to 7 weeks");
  assert.equal(spanLabel({ lo: 1, hi: 1, open: 0 }), "about 1 week");
  assert.equal(spanLabel({ lo: 0, hi: 0, open: 2 }), "Ongoing");
});
