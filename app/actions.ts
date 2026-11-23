"use server";

import { ALERTS } from "@/content/alerts";
import { ANSWER_KEYS } from "@/content/answer-keys";
import { INTEL } from "@/content/intel";
import { WHOIS } from "@/content/whois";
import { LOG_ANSWERS } from "@/content/log-answers";
import { matchesAny } from "@/lib/answer";
import { VISITOR } from "@/lib/feedbackRules";
import { describeUnknown } from "@/lib/indicator";
import { buildReport } from "@/lib/intelReport";
import { MAX_ATTEMPTS, addAttempt, attemptsUsed } from "@/lib/attempts";
import { gradeSubmission } from "@/lib/grade";
import { reportProblems } from "@/lib/reportRules";
import { createClient } from "@/lib/supabase/server";
import { track } from "@/lib/track";
import { MIN_SOURCES, isGated, openedCount } from "@/lib/sourceRules";
import type { CaseRecord, IntelResult, Submission, SubmitResult } from "@/lib/types";

const MAX_TEXT = 2000;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_TEXT) : "";
}

/** Scores a case on the server so the answer keys never reach the browser. */
// `visitor` is the random browser id, so the admin Guests page can count how many alerts each guest solved. It is checked here, not trusted.
// `attempt` is this try's number (1, 2 or 3). A signed-in student's saved case decides it; a guest's number comes from the browser and only decides whether the try is counted in the admin numbers.
export async function submitCase(input: Submission, visitor?: string, attempt?: number): Promise<SubmitResult> {
  const alertId = text(input?.alertId);
  if (!ALERTS.some((a) => a.id === alertId)) return { ok: false, error: "Unknown alert." };
  if (input.verdict !== "tp" && input.verdict !== "fp") {
    return { ok: false, error: "Choose true positive or false positive." };
  }
  if (typeof input.escalate !== "boolean") {
    return { ok: false, error: "Choose whether to escalate." };
  }

  const submission: Submission = {
    alertId,
    verdict: input.verdict,
    escalate: input.escalate,
    sections: {
      happened: text(input.sections?.happened),
      confirmed: text(input.sections?.confirmed),
      unknown: text(input.sections?.unknown),
      next: text(input.sections?.next),
    },
  };

  const alert = ALERTS.find((x) => x.id === alertId)!;
  const gated = isGated(alert);
  if (gated) {
    const opened = Array.isArray(input.opened) ? input.opened.filter((x) => typeof x === "string").slice(0, 30) : [];
    submission.opened = opened;
    if (openedCount(opened) < MIN_SOURCES[alert.difficulty]) {
      return { ok: false, error: `Open at least ${MIN_SOURCES[alert.difficulty]} sources before you submit.` };
    }
  }

  const problems = reportProblems(submission.sections, alert.difficulty);
  if (problems.length) return { ok: false, error: problems[0] };

  // A signed-in student's saved case says whether this is a retry and whether any tries are left.
  let supabase: Awaited<ReturnType<typeof createClient>> | null = null;
  let userId: string | null = null;
  let prev: CaseRecord | null = null;
  try {
    supabase = await createClient();
    const { data: claims } = await supabase.auth.getClaims();
    userId = claims?.claims?.sub ?? null;
    if (userId) {
      const { data: row } = await supabase.from("cases").select("status, record").eq("alert_id", alertId).maybeSingle();
      if (row?.status === "closed" && row.record) prev = row.record as CaseRecord;
    }
  } catch (err) {
    console.error("[submitCase] read:", err);
  }
  if (prev && attemptsUsed(prev) >= MAX_ATTEMPTS) return { ok: false, error: `You have used all ${MAX_ATTEMPTS} attempts on this alert.` };
  const isRetry = prev !== null || (typeof attempt === "number" && attempt > 1);

  const feedback = gradeSubmission(ANSWER_KEYS[alertId], submission, gated);
  // Counted here, not in the browser, because only the server knows the real score. Only numbers and yes/no flags, never the report text.
  // Only the first try is counted, so the admin pages keep meaning "alerts solved".
  if (!isRetry) {
    await track("case_closed", {
      path: `/alerts/${alertId}`,
      visitor: typeof visitor === "string" && VISITOR.test(visitor) ? visitor : undefined,
      props: {
        alert: alertId,
        score: feedback.score,
        verdict_ok: submission.verdict === feedback.correctVerdict,
        escalate_ok: submission.escalate === feedback.correctEscalate,
      },
    });
  }

  // Save the case for signed-in students. A retry updates the closed row: the database keeps the best score, allows one new try at a time and at most 3 (migration 0013).
  // If the student is a guest this silently does nothing.
  const record: CaseRecord = { alertId, submission, feedback, closedAt: Date.now() };
  try {
    if (supabase && userId) {
      if (prev) {
        const merged = addAttempt(prev, record);
        await supabase
          .from("cases")
          .update({ score: merged.feedback.score, record: merged, closed_at: new Date(merged.closedAt).toISOString() })
          .eq("alert_id", alertId)
          .eq("status", "closed");
      } else {
        // Try closing the active row first; if no active row, insert a closed row (ignoreDuplicates skips if it already exists).
        const first = { ...record, attempts: [{ score: feedback.score, at: record.closedAt }] };
        const { data: updated } = await supabase
          .from("cases")
          .update({ status: "closed", score: feedback.score, record: first, closed_at: new Date().toISOString() })
          .eq("alert_id", alertId)
          .select("alert_id");
        if (!updated?.length) {
          await supabase.from("cases").upsert(
            { user_id: userId, alert_id: alertId, status: "closed", score: feedback.score, record: first, closed_at: new Date().toISOString() },
            { ignoreDuplicates: true },
          );
        }
      }
    }
  } catch (err) {
    // Best-effort: grading succeeded, so the student always gets their feedback even if the save fails.
    console.error("[submitCase] save:", err);
  }

  return { ok: true, feedback };
}

/** Looks an IP, domain, URL or file hash up in ShiftLab's fictional intelligence feed. */
export async function lookupIndicator(raw: string): Promise<IntelResult> {
  const query = text(raw);
  if (!query) {
    return {
      query,
      verdict: "unknown",
      kind: "Empty",
      note: "Enter an IP address, domain, URL or file hash.",
    };
  }

  const lower = query.toLowerCase();
  let host = lower;
  try {
    if (lower.includes("://")) host = new URL(lower).hostname;
  } catch {
    // not a valid URL, fall back to the raw text
  }

  const found = [lower, host].find((k) => Object.hasOwn(INTEL, k));
  const entry = found ? INTEL[found] : describeUnknown(host);

  const who = Object.hasOwn(WHOIS, host) ? WHOIS[host] : undefined;
  const facts: [string, string][] = who
    ? [["Registered", who.ageDays < 30 ? `${who.ageDays} days ago` : who.registered], ["Registrar", who.registrar], ["Owner", who.owner]]
    : [];
  return { query, ...entry, report: buildReport(query, entry, facts) };
}

/** Checks a Log search practice answer on the server so the answers never reach the browser. */
export async function checkLogAnswer(id: string, raw: string): Promise<{ correct: boolean; explain: string }> {
  const key = Object.hasOwn(LOG_ANSWERS, text(id)) ? LOG_ANSWERS[text(id)] : null;
  if (!key) return { correct: false, explain: "Unknown question." };
  const answer = text(raw).toLowerCase();
  if (!answer) return { correct: false, explain: "Type your answer first." };
  const correct = matchesAny(answer, key.accept);
  return { correct, explain: correct ? key.explain : "Not quite. Try the suggested search and read the rows again." };
}
