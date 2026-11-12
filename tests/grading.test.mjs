import test from "node:test";
import assert from "node:assert/strict";
import { reportWritten, writtenSections, WRITTEN_MIN_CHARS } from "../lib/reportRules.ts";
import { questionsForAlert } from "../lib/logsearch.ts";

const reason = "A phishing email asked a user for payroll bank details. The domain is fake.";
const empty = { happened: "", confirmed: "", unknown: "", next: "" };
const full = { happened: reason, confirmed: reason + " SPF failed.", unknown: reason + " Unsure who else.", next: reason + " Escalate." };

test("a one-line reason scores, and a full report scores full", () => {
  assert.equal(reportWritten({ ...empty, happened: reason }, 25), 10);
  assert.equal(reportWritten(full, 25), 25);
  assert.equal(reportWritten(empty, 25), 0);
});

test("the wording never changes the marks: only whether a section was written", () => {
  const vague = { happened: "x".repeat(WRITTEN_MIN_CHARS), confirmed: "y".repeat(WRITTEN_MIN_CHARS), unknown: "z".repeat(WRITTEN_MIN_CHARS), next: "w".repeat(WRITTEN_MIN_CHARS) };
  assert.equal(reportWritten(vague, 25), reportWritten(full, 25));
});

test("text shorter than a sentence does not count as written", () => {
  assert.deepEqual(writtenSections({ ...empty, happened: "ok" }), []);
  assert.deepEqual(writtenSections({ ...empty, happened: reason, next: "no" }), ["happened"]);
});

test("marks never exceed the maximum they are given", () => {
  assert.equal(reportWritten(full, 20), 20);
  assert.equal(reportWritten(full, 0), 0);
});

const QS = [
  { id: "q1", tryQuery: "src:203.0.113.58 event:failed" },
  { id: "q6", tryQuery: "user:d.okafor event:post" },
  { id: "q7", tryQuery: "source:vpn user:d.rossi" },
];

test("practice questions follow the alert you came from", () => {
  const links = [{ q: "user:d.okafor" }, { q: "src:203.0.113.140" }];
  assert.deepEqual(questionsForAlert("SL-1001", links, QS), ["q6"]);
});

test("no alert, or an alert sharing nothing, matches no question", () => {
  assert.deepEqual(questionsForAlert(null, [{ q: "user:d.okafor" }], QS), []);
  assert.deepEqual(questionsForAlert("SL-1099", [{ q: "user:nobody.here" }], QS), []);
  assert.deepEqual(questionsForAlert("SL-1099", [], QS), []);
});

test("common verbs do not tie a question to an unrelated alert", () => {
  // "post" and "failed" appear in many searches; only the host, address or person should match.
  assert.deepEqual(questionsForAlert("SL-9999", [{ q: "event:post" }, { q: "event:failed" }], QS), []);
});
