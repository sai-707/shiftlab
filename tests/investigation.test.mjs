import test from "node:test";
import assert from "node:assert/strict";
import { ALERTS } from "../content/alerts.ts";
import { INVESTIGATION_KEYS } from "../content/investigation-keys.ts";
import { INTEL_SOURCE, LOG_SOURCE, MIN_SOURCES, isGated, sourceBlocks } from "../lib/sourceRules.ts";

// A key the student can never open would cap the Investigation marks below full (SL-1046 once listed the withheld Timeline).
test("every investigation key is a source the student can actually open", () => {
  for (const a of ALERTS.filter(isGated)) {
    const keys = INVESTIGATION_KEYS[a.id];
    assert.ok(keys?.length, `${a.id}: gated alert has no investigation keys`);
    const openable = new Set([...sourceBlocks(a).map((b) => b.title), INTEL_SOURCE, LOG_SOURCE]);
    for (const k of keys) assert.ok(openable.has(k), `${a.id}: "${k}" cannot be opened, so full marks are impossible`);
    // Intel lookup and Log search count toward the unlock, so the pool, not the key list, must reach the level's minimum.
    assert.ok(openable.size >= MIN_SOURCES[a.difficulty], `${a.id}: only ${openable.size} sources exist, the level needs ${MIN_SOURCES[a.difficulty]} to unlock the report`);
  }
});

test("investigation keys exist only for real alerts", () => {
  for (const id of Object.keys(INVESTIGATION_KEYS)) assert.ok(ALERTS.some((a) => a.id === id), `investigation keys for unknown alert ${id}`);
});
