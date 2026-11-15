import test from "node:test";
import assert from "node:assert/strict";
import { parseReport, reasonHeading, retitle, template, templateProblem, toSections } from "../lib/reportTemplate.ts";
import { reportProblems, reportWritten } from "../lib/reportRules.ts";

const fill = (t, heading, text) => t.replace(`${heading}:\n`, `${heading}:\n${text}`);

test("the box starts with every heading and the reason heading follows the verdict", () => {
  const t = template(null);
  for (const h of ["Time of activity", "List of Affected Entities", "Reason for Escalating the Alert", "Recommended Remediation Actions", "List of Attack Indicators", "What Is Still Unknown"])
    assert.ok(t.includes(`${h}:`), h);
  assert.ok(t.includes("Reason for Classifying as True or False Positive:"));
  assert.ok(retitle(t, "tp").includes("Reason for Classifying as True Positive:"));
  assert.ok(retitle(retitle(t, "tp"), "fp").includes("Reason for Classifying as False Positive:"));
});

test("changing the verdict keeps what was typed", () => {
  const typed = fill(template("tp"), reasonHeading("tp"), "It is a look-alike domain.");
  assert.ok(retitle(typed, "fp").includes("False Positive:\nIt is a look-alike domain."));
});

test("an empty box reads as empty, and the text under each heading goes to the right section", () => {
  assert.deepEqual(Object.values(parseReport(template("tp"))), ["", "", "", "", "", "", ""]);
  let t = template("tp");
  t = fill(t, "Time of activity", "09:12 to 09:15");
  t = fill(t, "List of Affected Entities", "d.okafor");
  t = fill(t, reasonHeading("tp"), "The domain copies ours.");
  t = fill(t, "Reason for Escalating the Alert", "A user typed in bank details.");
  t = fill(t, "Recommended Remediation Actions", "Reset the password.");
  t = fill(t, "List of Attack Indicators", "harborpine-hr.test");
  t = fill(t, "What Is Still Unknown", "Whether others clicked.");
  assert.deepEqual(toSections(parseReport(t)), {
    happened: "09:12 to 09:15\nThe domain copies ours.",
    confirmed: "d.okafor\nharborpine-hr.test",
    unknown: "Whether others clicked.",
    next: "A user typed in bank details.\nReset the password.",
  });
});

test("headings still work when typed on the same line, in any case, or when the student deletes them all", () => {
  const p = parseReport("TIME OF ACTIVITY: 09:12\nReason for classifying as false positive: routine scan");
  assert.equal(p.time, "09:12");
  assert.equal(p.reason, "routine scan");
  assert.equal(parseReport("It was a scan from our own tester.").reason, "It was a scan from our own tester.");
  assert.equal(parseReport("stray words\nTime of activity:\n09:12").reason, "stray words");
});

test("Beginner needs only the reason, every other level needs every heading", () => {
  const blank = parseReport(template("tp"));
  assert.equal(templateProblem(blank, "tp", true), "Reason for Classifying as True Positive is required.");
  assert.equal(templateProblem({ ...blank, reason: "x" }, "tp", true), null);
  const msg = templateProblem({ ...blank, reason: "x" }, "tp", false);
  assert.match(msg, /Time of activity, List of Affected Entities.*What Is Still Unknown are required\./);
  assert.ok(!msg.includes("Reason for Classifying"));
  assert.equal(templateProblem({ time: "a", entities: "a", reason: "a", escalate: "a", remediation: "a", indicators: "a", unknown: "a" }, "tp", false), null);
});

test("a missing-heading message ends the way lib/reportEvents.ts counts as empty", () => {
  for (const easy of [true, false]) assert.match(templateProblem(parseReport(template("tp")), "tp", easy), /\b(is|are) required\.$/);
});

test("a full report still earns the full 25 report marks", () => {
  const s = toSections({ time: "09:12 to 09:15", entities: "d.okafor and 10.20.4.37", reason: "The sender domain copies ours.", escalate: "A user typed in bank details.", remediation: "Reset the password.", indicators: "harborpine-hr.test", unknown: "Whether others clicked the link." });
  assert.equal(reportWritten(s, 25), 25);
});

test("lists under the two List headings are not rejected as keyword piles on harder alerts", () => {
  const s = toSections({
    time: "Oct 23, 09:12 to 09:15",
    entities: "d.okafor, 10.20.4.37, harborpine-hr.test, payroll mailbox, freemail.test",
    reason: "The sender domain is a look-alike of ours, so this is a real phishing email.",
    escalate: "A user opened the link and submitted a form, so this needs a senior analyst.",
    remediation: "Reset the account password and block the sender domain at the gateway.",
    indicators: "harborpine-hr.test, 203.0.113.140, freemail.test, spf fail, reply-to mismatch, payroll lure",
    unknown: "I do not know whether the other recipients clicked the link.",
  });
  assert.deepEqual(reportProblems(s, "Hard"), []);
});
