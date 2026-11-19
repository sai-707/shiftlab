import test from "node:test";
import assert from "node:assert/strict";
import { countTopics, stallPoints } from "../lib/adminRoadmap.ts";

const topics = [
  { slug: "a", name: "A", phase: 1, essential: true },
  { slug: "b", name: "B", phase: 1, essential: true },
  { slug: "c", name: "C", phase: 2, essential: false },
  { slug: "d", name: "D", phase: 2, essential: true },
];
const stats = { saved: 5, started: 4, tracks: { soc: 4, eng: 1 }, topics: { a: 4, b: 3, c: 0, d: 1, gone: 9 } };

test("counts follow the roadmap's order, missing topics count zero, removed topics are ignored", () => {
  const rows = countTopics(stats, topics);
  assert.deepEqual(rows.map((r) => [r.slug, r.done]), [["a", 4], ["b", 3], ["c", 0], ["d", 1]]);
});

test("stall points are essential topics only, fewest first; most finished skips topics nobody finished", () => {
  const { least, most } = stallPoints(countTopics(stats, topics), 2);
  assert.deepEqual(least.map((r) => r.slug), ["d", "b"]);
  assert.deepEqual(most.map((r) => r.slug), ["a", "b"]);
});
