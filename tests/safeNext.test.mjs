import test from "node:test";
import assert from "node:assert/strict";
import { safeNext } from "../lib/safeNext.ts";

const O = "https://shiftlab.example";

test("same-site paths are kept, with query and hash", () => {
  assert.equal(safeNext("/alerts/SL-1001", O), "/alerts/SL-1001");
  assert.equal(safeNext("/reset?x=1#a", O), "/reset?x=1#a");
});

test("anything that leaves the site falls back", () => {
  for (const bad of ["//evil.com", "/\\evil.com", "/\t/evil.com", "/\n/evil.com", "/\r/evil.com", "https://evil.com", "javascript:alert(1)", "evil.com", "", null, undefined]) {
    assert.equal(safeNext(bad, O), "/dashboard", String(bad));
  }
});
