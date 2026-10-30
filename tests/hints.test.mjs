import test from "node:test";
import assert from "node:assert/strict";
import { ALERTS } from "../content/alerts.ts";
import { HINTS } from "../content/hints.ts";

const label = (title) => title.replace(/\s*\(.*\)\s*$/, "");

test("every alert has three hints and no hint is for an unknown alert", () => {
  for (const a of ALERTS) {
    const h = HINTS[a.id];
    assert.ok(h, `${a.id}: no hints`);
    assert.equal(h.length, 3, `${a.id}: needs exactly 3 hints`);
    for (const text of h) assert.ok(text.length >= 15, `${a.id}: hint too short`);
  }
  for (const id of Object.keys(HINTS)) assert.ok(ALERTS.some((a) => a.id === id), `hints for unknown alert ${id}`);
});

test("hint 2 names a real tab and every tab named in hints 2 and 3 exists", () => {
  for (const a of ALERTS) {
    const h = HINTS[a.id];
    const tabs = a.evidence.map((b) => label(b.title)).filter((t) => t !== "Alert details").concat(["Log search", "Intel check"]);
    assert.ok(tabs.some((t) => h[1].includes(t)), `${a.id}: hint 2 names no real tab: ${h[1]}`);
    const mentions = [...`${h[1]} ${h[2]}`.matchAll(/(?:[Tt]he |\()([A-Z/][^().,;]*?) tab/g)].map((m) => m[1].replace(/^(and|then|the) /i, ""));
    for (const m of mentions) assert.ok(tabs.some((t) => t === m || t.endsWith(` ${m}`) || m.endsWith(t)), `${a.id}: hint names a tab that does not exist: "${m}"`);
  }
});

test("hints never give the verdict", () => {
  for (const [id, h] of Object.entries(HINTS)) {
    assert.ok(!/true positive|false positive|is malicious|is benign|is harmless|is safe/i.test(h.join(" ")), `${id}: a hint states the verdict`);
  }
});
