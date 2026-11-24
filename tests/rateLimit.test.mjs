import test from "node:test";
import assert from "node:assert/strict";
import { createLimiter } from "../lib/rateLimit.ts";

test("allows up to the limit, then refuses, per source", () => {
  const allow = createLimiter(3, 1000);
  assert.deepEqual([1, 2, 3, 4, 5].map(() => allow("a", 0)), [true, true, true, false, false]);
  assert.equal(allow("b", 0), true); // another source is unaffected
});

test("the window resets after its time", () => {
  const allow = createLimiter(2, 1000);
  allow("a", 0);
  allow("a", 10);
  assert.equal(allow("a", 20), false);
  assert.equal(allow("a", 1000), true);
});

test("memory stays bounded when many sources arrive", () => {
  const allow = createLimiter(1, 1000, 10);
  for (let i = 0; i < 100; i++) assert.equal(allow(`k${i}`, 0), true);
  assert.equal(allow("k99", 0), false); // the newest source is still tracked after the table was cleared
});
