import test from "node:test";
import assert from "node:assert/strict";
import { reportProblems, reportWritten, sectionMarks, unreadable, writtenSections } from "../lib/reportRules.ts";

const empty = { happened: "", confirmed: "", unknown: "", next: "" };
const reason = "The sender domain is a look-alike, so this is phishing and it should be escalated.";

test("Beginner: one short reason is enough", () => {
  assert.deepEqual(reportProblems({ ...empty, happened: reason }, "Beginner"), []);
  assert.deepEqual(reportProblems({ ...empty, happened: "Fake domain, real attack." }, "Beginner"), []);
});

test("Beginner: only the reason is compulsory", () => {
  assert.match(reportProblems(empty, "Beginner")[0], /What happened is required/);
  assert.equal(reportProblems(empty, "Beginner").length, 1);
});

test("Intermediate and above still need all four sections", () => {
  for (const d of ["Intermediate", "Hard", "AI Era", undefined]) {
    const p = reportProblems({ ...empty, happened: reason }, d);
    assert.equal(p.length, 3, String(d));
    assert.ok(p.every((m) => m.endsWith("is required.")));
  }
});

test("nothing is blocked for how it is written: gibberish, copies, keyword piles and poor English all submit", () => {
  const junk = "aaaaaaaa";
  const list = "ip domain phishing dkim spf payroll sender mismatch reply-to link";
  for (const d of ["Beginner", "Intermediate", "Hard"]) {
    assert.deepEqual(reportProblems({ happened: junk, confirmed: junk, unknown: junk, next: junk }, d), [], d);
    assert.deepEqual(reportProblems({ happened: list, confirmed: list, unknown: list, next: list }, d), [], d);
  }
});

test("gibberish is spotted, but poor English made of real words is not", () => {
  for (const g of ["aaaaaaaa", "xkcd qwrt zzzx", "!!!! ????", "qwrtp zxcvb mnbvc hjkl"]) assert.ok(unreadable(g), g);
  for (const ok of ["mail is fake sender not our company domain", "me see user click link and give bank detail", "SPF DKIM fail", "10.20.4.37 to 203.0.113.140", reason]) assert.ok(!unreadable(ok), ok);
  assert.ok(!unreadable(""), "empty is a missing section, not gibberish");
});

test("poor English earns the same report marks as polished English", () => {
  const polished = { happened: reason, confirmed: "SPF failed and the Reply-To is a free mailbox.", unknown: "I do not know whether others clicked.", next: "Escalate to Level 2 and reset the password." };
  const rough = { happened: "domain is fake so it phishing, must escalate it", confirmed: "spf is fail and reply to is free mail box", unknown: "not know if other people click the link", next: "send to level 2 and change password for user" };
  assert.equal(reportWritten(rough, 25), reportWritten(polished, 25));
  assert.equal(reportWritten(rough, 25), 25);
});

test("gibberish earns no report marks, and pasting one answer everywhere earns them once", () => {
  const junk = "x".repeat(40);
  assert.equal(reportWritten({ happened: junk, confirmed: junk, unknown: junk, next: junk }, 25), 0);
  assert.equal(reportWritten({ happened: reason, confirmed: reason, unknown: reason, next: reason }, 25), 10);
  assert.deepEqual(writtenSections({ happened: reason, confirmed: reason, unknown: "", next: "" }), ["happened"]);
});

test("section marks are 10 for the reason and 5 for each other written section, and add up to the report marks", () => {
  const some = { happened: reason, confirmed: "SPF failed and the reply-to is a free mailbox.", unknown: "dfgd hjk", next: "Escalate to L2 and reset the password." };
  assert.deepEqual(sectionMarks(some), { happened: 10, confirmed: 5, unknown: 0, next: 5 });
  assert.equal(Object.values(sectionMarks(some)).reduce((a, b) => a + b, 0), reportWritten(some, 25));
  assert.deepEqual(sectionMarks(empty), { happened: 0, confirmed: 0, unknown: 0, next: 0 });
});
