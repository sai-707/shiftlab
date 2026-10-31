import test from "node:test";
import assert from "node:assert/strict";
import { MAX_SKIPS, parseAsk, shouldAsk } from "../lib/feedbackAsk.ts";

test("a new visitor is asked", () => {
  assert.equal(shouldAsk(parseAsk(null)), true);
});

test("someone who sent feedback is never asked again", () => {
  assert.equal(shouldAsk({ sent: true, skips: 0 }), false);
});

test("asking stops after MAX_SKIPS skips, not before", () => {
  assert.equal(shouldAsk({ sent: false, skips: MAX_SKIPS - 1 }), true);
  assert.equal(shouldAsk({ sent: false, skips: MAX_SKIPS }), false);
});

test("junk in storage falls back to 'ask', and cannot break the page", () => {
  for (const raw of ["", "{", "null", "[]", '{"skips":"9"}', '{"skips":-3}', '{"skips":1.5}']) {
    assert.deepEqual(parseAsk(raw), { sent: false, skips: 0 }, raw);
  }
  assert.equal(parseAsk('{"skips":5000}').skips, 99);
  assert.equal(parseAsk('{"sent":"yes"}').sent, false);
});
