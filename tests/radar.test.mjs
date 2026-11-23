import test from "node:test";
import assert from "node:assert/strict";
import { radarPath, radarPoint } from "../lib/radar.ts";

test("axis 0 points straight up and the rest go clockwise", () => {
  assert.deepEqual(radarPoint(0, 4, 100, 50, 50, 40), { x: 50, y: 10 });
  assert.deepEqual(radarPoint(1, 4, 100, 50, 50, 40), { x: 90, y: 50 });
  assert.deepEqual(radarPoint(2, 4, 100, 50, 50, 40), { x: 50, y: 90 });
  assert.deepEqual(radarPoint(3, 4, 100, 50, 50, 40), { x: 10, y: 50 });
});

test("a value is a share of the radius, and bad values stay on the chart", () => {
  assert.deepEqual(radarPoint(0, 4, 50, 50, 50, 40), { x: 50, y: 30 });
  assert.deepEqual(radarPoint(0, 4, 250, 50, 50, 40), { x: 50, y: 10 });
  assert.deepEqual(radarPoint(0, 4, -5, 50, 50, 40), { x: 50, y: 50 });
  assert.deepEqual(radarPoint(1, 4, Number.NaN, 50, 50, 40), { x: 50, y: 50 });
});

test("the path has one corner per value", () => {
  assert.equal(radarPath([100, 100, 100, 100], 50, 50, 40), "50,10 90,50 50,90 10,50");
  assert.equal(radarPath([], 50, 50, 40), "");
});
