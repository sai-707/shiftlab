"use server";

import { CERT_ID, KINDS, asCert, cleanHolder, type Cert, type CertKind } from "@/lib/certificates";
import { createClient } from "@/lib/supabase/server";

// Server actions for certificates. Every call goes through the database functions in 0014_certificates.sql, which check the
// rules (all alerts closed, average of at least 70) against the student's own cases. No secret key is used anywhere.

export type ClaimResult = { cert: Cert } | { error: string };

const MESSAGES: Record<string, string> = {
  sign_in: "Sign in to claim a certificate.",
  not_complete: "This certificate needs every alert of the level closed first.",
  avg_low: "The average score is below 70. Try some alerts again to raise it.",
  bad_name: "Enter your name as you want it printed (2 to 60 characters).",
  not_found: "That certificate was not found.",
  unknown_kind: "That certificate does not exist.",
};

function fail(message: string | undefined): { error: string } {
  const key = Object.keys(MESSAGES).find((k) => message?.includes(k));
  return { error: key ? MESSAGES[key] : "Something went wrong. Please try again." };
}

/** The signed-in student's certificates, plus the name from their profile to prefill the form. Null for guests. */
export async function myCertificates(): Promise<{ certs: Cert[]; name: string } | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const id = data?.claims?.sub;
  if (!id) return null;

  const [rows, profile] = await Promise.all([
    supabase.from("certificates").select("id, kind, holder, alerts, avg, first_avg, levels, issued_at").order("issued_at", { ascending: true }),
    supabase.from("profiles").select("display_name").eq("id", id).maybeSingle(),
  ]);
  if (rows.error) console.error("[certificates] list:", rows.error.code);
  const certs = (rows.data ?? [])
    .map((r) => asCert({ id: r.id, kind: r.kind, holder: r.holder, alerts: r.alerts, avg: r.avg, firstAvg: r.first_avg, levels: r.levels, issuedAt: r.issued_at }))
    .filter((c): c is Cert => c !== null);
  return { certs, name: profile.data?.display_name ?? "" };
}

/** Issue a certificate (or return the one already issued). The name is what gets printed. */
export async function claimCertificate(kind: string, holder: string): Promise<ClaimResult> {
  const name = cleanHolder(String(holder ?? ""));
  if (!name) return { error: MESSAGES.bad_name };
  if (!KINDS.includes(kind as CertKind)) return { error: MESSAGES.unknown_kind };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_certificate", { p_kind: kind, p_holder: name });
  if (error) return fail(error.message);
  const cert = asCert(data);
  return cert ? { cert } : { error: "Something went wrong. Please try again." };
}

/** Change the printed name on a certificate you own. The ID and the verify link stay the same. */
export async function renameCertificate(id: string, holder: string): Promise<ClaimResult> {
  const name = cleanHolder(String(holder ?? ""));
  if (!name) return { error: MESSAGES.bad_name };
  if (!CERT_ID.test(String(id))) return { error: MESSAGES.not_found };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("rename_certificate", { p_id: id, p_holder: name });
  if (error) return fail(error.message);
  const cert = asCert(data);
  return cert ? { cert } : { error: "Something went wrong. Please try again." };
}
