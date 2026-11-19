import test from "node:test";
import assert from "node:assert/strict";
import { LOGS, LOG_QUESTIONS, LOG_SOURCES } from "../content/logs.ts";
import { LOG_ANSWERS } from "../content/log-answers.ts";
import { matchesAny } from "../lib/answer.ts";
import { searchLogs } from "../lib/logsearch.ts";

test("every log question has an answer on the server, and only real questions do", () => {
  assert.equal(new Set(LOG_QUESTIONS.map((q) => q.id)).size, LOG_QUESTIONS.length);
  for (const q of LOG_QUESTIONS) assert.ok(LOG_ANSWERS[q.id]?.accept.length > 0 && LOG_ANSWERS[q.id].explain.length > 20, `${q.id}: no answer`);
  for (const id of Object.keys(LOG_ANSWERS)) assert.ok(LOG_QUESTIONS.some((q) => q.id === id), `answer for unknown question ${id}`);
});

test("every question can be answered from its own suggested search", () => {
  for (const q of LOG_QUESTIONS) {
    const rows = searchLogs(LOGS, q.tryQuery, "all");
    assert.ok(rows.length > 0, `${q.id}: the suggested search finds nothing`);
    const accept = LOG_ANSWERS[q.id].accept;
    const text = rows.map((r) => `${r.time} ${r.host} ${r.user} ${r.src} ${r.dst} ${r.detail}`).join("\n");
    // A count question is answered by the number of rows; the others by something written in a row.
    const byCount = accept.some((a) => /^\d+$/.test(a) && Number(a) === rows.length);
    assert.ok(byCount || matchesAny(text, accept), `${q.id}: the answer is not in the rows its search shows`);
  }
});

test("every event uses a source the Log search page lists", () => {
  const ids = new Set(LOG_SOURCES.map((s) => s.id));
  for (const e of LOGS) assert.ok(ids.has(e.source), `${e.host} ${e.time}: unknown source ${e.source}`);
});
