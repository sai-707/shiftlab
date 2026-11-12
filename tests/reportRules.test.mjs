import test from "node:test";
import assert from "node:assert/strict";
import { reportProblems } from "../lib/reportRules.ts";

const empty = { happened: "", confirmed: "", unknown: "", next: "" };
const reason = "The sender domain is a look-alike, so this is phishing and it should be escalated.";

test("Beginner: one short reason is enough", () => {
  assert.deepEqual(reportProblems({ ...empty, happened: reason }, "Beginner"), []);
  assert.deepEqual(reportProblems({ ...empty, happened: "Fake domain, real attack." }, "Beginner"), []);
});

test("Beginner: the reason itself is still required and checked for gibberish", () => {
  assert.match(reportProblems(empty, "Beginner")[0], /What happened is required/);
  assert.match(reportProblems({ ...empty, happened: "aaaaaaaa" }, "Beginner")[0], /repeated characters/);
  assert.match(reportProblems({ ...empty, happened: "xkcd qwrt zzzx" }, "Beginner")[0], /does not read as sentences/);
});

test("Beginner: an optional section that is filled in is still checked, and copies are caught", () => {
  assert.match(reportProblems({ ...empty, happened: reason, next: "aaaaaaaa" }, "Beginner")[0], /Next action/);
  assert.match(reportProblems({ ...empty, happened: reason, next: reason }, "Beginner")[0], /identical/);
});

test("Beginner: keyword lists pass, because the style checks are for harder alerts", () => {
  const list = "ip domain phishing dkim spf payroll sender mismatch reply-to link";
  assert.deepEqual(reportProblems({ ...empty, happened: list }, "Beginner"), []);
  assert.ok(reportProblems({ ...empty, happened: list }, "Intermediate").length > 0);
});

test("Intermediate and above still need all four sections", () => {
  for (const d of ["Intermediate", "Hard", "AI Era", undefined]) {
    const p = reportProblems({ ...empty, happened: reason }, d);
    assert.equal(p.length, 3, String(d));
    assert.ok(p.every((m) => m.endsWith("is required.")));
  }
});
