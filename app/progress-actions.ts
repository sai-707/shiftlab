"use server";

import { ALERTS } from "@/content/alerts";
import { isUnlocked } from "@/lib/levels";
import { createClient } from "@/lib/supabase/server";
import type { CaseRecord } from "@/lib/types";

// Server actions for saving and loading a signed-in student's progress.
// Every write goes through RLS: only the student's own rows can be touched.
// Column-level UPDATE grants mean we cannot use PostgREST upsert (which sets all payload columns
// in ON CONFLICT DO UPDATE); instead we update-then-insert or use ignoreDuplicates.

const VALID_ALERT = /^SL-[0-9]{4}$/;
const STATE_KEYS = new Set(["mail", "comms", "after", "sprint", "shift", "aicheck", "logs", "handover", "sources"]);
const MAX_DATA_BYTES = 28_000; // leave room for jsonb overhead below the 30 000 column cap

async function uid(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims?.sub ?? null;
}

/** Load every closed case for the signed-in student. Returns null for guests. */
export async function loadProgress(): Promise<{ cases: CaseRecord[]; activeAlertId: string | null } | null> {
  const id = await uid();
  if (!id) return null;
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("cases")
    .select("alert_id, status, score, record, started_at")
    .order("started_at", { ascending: true });
  if (error) {
    console.error("[progress] loadProgress:", error.code);
    return null;
  }

  let activeAlertId: string | null = null;
  const cases: CaseRecord[] = [];
  for (const r of rows ?? []) {
    if (r.status === "active") {
      activeAlertId = r.alert_id;
    } else if (r.status === "closed" && r.record) {
      cases.push(r.record as CaseRecord);
    }
  }
  return { cases, activeAlertId };
}

/** Start a new case. Returns the alert id on success, or null if refused. */
export async function startCase(alertId: string): Promise<{ ok: true; alertId: string } | { ok: false; error: string; activeAlertId?: string }> {
  if (!VALID_ALERT.test(alertId)) return { ok: false, error: "Invalid alert id." };
  if (!ALERTS.some((a) => a.id === alertId)) return { ok: false, error: "Unknown alert." };

  const id = await uid();
  if (!id) return { ok: false, error: "Not signed in." };

  // Check unlock rules on the server with the student's closed cases.
  const supabase = await createClient();
  const { data: rows } = await supabase.from("cases").select("alert_id, status, record");
  const closed: Record<string, CaseRecord> = {};
  let currentActive: string | null = null;
  for (const r of rows ?? []) {
    if (r.status === "closed" && r.record) closed[r.alert_id] = r.record as CaseRecord;
    if (r.status === "active") currentActive = r.alert_id;
  }

  if (currentActive) return { ok: false, error: "Close the current case first.", activeAlertId: currentActive };
  if (closed[alertId]) return { ok: false, error: "Already completed." };

  const alert = ALERTS.find((a) => a.id === alertId)!;
  if (!isUnlocked(alert.difficulty, closed)) return { ok: false, error: "Level locked." };

  const { error } = await supabase.from("cases").insert({ user_id: id, alert_id: alertId, status: "active" });
  if (error) {
    // 23505 = unique violation (already active or already exists)
    if (error.code === "23505") return { ok: false, error: "Case already exists." };
    console.error("[progress] startCase:", error.code);
    return { ok: false, error: "Could not start the case." };
  }
  return { ok: true, alertId };
}

/** Import closed cases from localStorage into the database (guest-to-account merge). Skips duplicates. */
export async function importCases(records: CaseRecord[]): Promise<{ imported: number }> {
  const id = await uid();
  if (!id) return { imported: 0 };
  if (!Array.isArray(records) || records.length === 0) return { imported: 0 };

  // Validate each record before inserting
  const valid = records.filter((r) => {
    if (!r || typeof r !== "object") return false;
    if (!VALID_ALERT.test(r.alertId)) return false;
    if (!ALERTS.some((a) => a.id === r.alertId)) return false;
    if (typeof r.feedback?.score !== "number" || r.feedback.score < 0 || r.feedback.score > 100) return false;
    if (!r.submission || !r.closedAt) return false;
    return true;
  });

  if (valid.length === 0) return { imported: 0 };

  const supabase = await createClient();
  const rows = valid.map((r) => ({
    user_id: id,
    alert_id: r.alertId,
    status: "closed" as const,
    score: r.feedback.score,
    record: { alertId: r.alertId, submission: r.submission, feedback: r.feedback, closedAt: r.closedAt },
    closed_at: new Date(r.closedAt).toISOString(),
  }));

  // ignoreDuplicates = ON CONFLICT DO NOTHING: skip rows that already exist without needing UPDATE privilege on the PK columns
  const { data: inserted, error } = await supabase.from("cases").insert(rows, { defaultToNull: false }).select("alert_id");
  if (error) {
    console.error("[progress] importCases:", error.code);
    return { imported: 0 };
  }
  return { imported: inserted?.length ?? 0 };
}

/** Save one key of practice state (mail scores, log exercises, etc.). */
export async function saveState(key: string, data: unknown): Promise<{ ok: boolean }> {
  if (!STATE_KEYS.has(key)) return { ok: false };
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false };
  if (JSON.stringify(data).length > MAX_DATA_BYTES) return { ok: false };

  const id = await uid();
  if (!id) return { ok: false };

  const supabase = await createClient();

  // Try update first; if 0 rows changed, insert.
  const { data: updated, error: ue } = await supabase
    .from("saved_state")
    .update({ data })
    .eq("key", key)
    .select("key");

  if (ue) {
    console.error("[progress] saveState update:", ue.code);
    return { ok: false };
  }

  if (updated && updated.length > 0) return { ok: true };

  // Row does not exist yet: insert.
  const { error: ie } = await supabase.from("saved_state").insert({ user_id: id, key, data });
  if (ie) {
    // 23505 = race: another tab inserted between our update and insert
    if (ie.code === "23505") return { ok: true };
    console.error("[progress] saveState insert:", ie.code);
    return { ok: false };
  }
  return { ok: true };
}

/** Load all saved state keys for the signed-in student. */
export async function loadState(): Promise<Record<string, object> | null> {
  const id = await uid();
  if (!id) return null;

  const supabase = await createClient();
  const { data: rows, error } = await supabase.from("saved_state").select("key, data");
  if (error) {
    console.error("[progress] loadState:", error.code);
    return null;
  }
  const out: Record<string, object> = {};
  for (const r of rows ?? []) {
    if (r.data && typeof r.data === "object") out[r.key] = r.data as object;
  }
  return out;
}

/** Delete everything: cases and saved state. This is "Reset progress" for signed-in users. */
export async function resetRemote(): Promise<{ ok: boolean }> {
  const id = await uid();
  if (!id) return { ok: false };
  const supabase = await createClient();
  const { error: e1 } = await supabase.from("cases").delete().neq("alert_id", "");
  const { error: e2 } = await supabase.from("saved_state").delete().neq("key", "");
  if (e1) console.error("[progress] resetRemote cases:", e1.code);
  if (e2) console.error("[progress] resetRemote state:", e2.code);
  return { ok: !e1 && !e2 };
}
