"use server";

import { TACTICS } from "@/content/afteraction";
import { TACTIC_KEYS, TUNING_KEYS } from "@/content/afteraction-keys";
import { COMMS_KEYS } from "@/content/comms-keys";
import { MAIL_KEYS } from "@/content/mailbox-keys";
import { SPRINT_KEYS } from "@/content/sprint-keys";
import { WHOIS, type WhoisRecord } from "@/content/whois";

const own = <T,>(obj: Record<string, T>, key: unknown): T | null =>
  typeof key === "string" && Object.hasOwn(obj, key) ? obj[key] : null;

// ---------- Phishing mailbox ----------
export type MailResult =
  | { ok: false; error: string }
  | {
      ok: true;
      score: number;
      verdictCorrect: boolean;
      correctVerdict: string;
      hit: string[];
      missed: string[];
      wrong: string[];
      explain: string;
      action: string;
    };

export async function checkMail(id: string, verdict: string, flags: string[]): Promise<MailResult> {
  const key = own(MAIL_KEYS, id);
  if (!key) return { ok: false, error: "Unknown email." };
  if (verdict !== "phishing" && verdict !== "spam" && verdict !== "legit") {
    return { ok: false, error: "Choose phishing, spam or safe." };
  }
  const picked = new Set((Array.isArray(flags) ? flags : []).filter((f) => typeof f === "string").slice(0, 20));
  const hit = key.flags.filter((f) => picked.has(f));
  const missed = key.flags.filter((f) => !picked.has(f));
  const wrong = [...picked].filter((f) => !key.flags.includes(f));
  const flagFraction =
    key.flags.length === 0 ? (wrong.length === 0 ? 1 : 0) : Math.max(0, (hit.length - wrong.length) / key.flags.length);
  const verdictCorrect = verdict === key.verdict;
  return {
    ok: true,
    score: (verdictCorrect ? 60 : 0) + Math.round(40 * flagFraction),
    verdictCorrect,
    correctVerdict: key.verdict,
    hit,
    missed,
    wrong,
    explain: key.explain,
    action: key.action,
  };
}

// ---------- Communication practice ----------
export type CommsResult =
  | { ok: false; error: string }
  | { ok: true; score: number; checks: { label: string; hit: boolean }[]; sample: string; tip: string };

export async function checkMessage(id: string, raw: string): Promise<CommsResult> {
  const key = own(COMMS_KEYS, id);
  if (!key) return { ok: false, error: "Unknown scenario." };
  const message = typeof raw === "string" ? raw.trim().slice(0, 3000) : "";
  if (message.split(/\s+/).filter(Boolean).length < 15) return { ok: false, error: "Write at least a couple of sentences first." };
  const lower = message.toLowerCase();
  const words = message.split(/\s+/).filter(Boolean).length;
  const promisedUnlock = /(i('| ha)ve unlocked|i unlocked|account (is|has been) (now )?unlocked)/.test(lower);

  const checks = key.checks.map((c) => {
    if (c.any[0] === "__short__") return { label: c.label, hit: words <= 70 };
    if (c.any[0] === "__no_unlock_promise__") return { label: c.label, hit: !promisedUnlock };
    return { label: c.label, hit: c.any.some((frag) => lower.includes(frag)) };
  });
  const score = Math.round((100 * checks.filter((c) => c.hit).length) / checks.length);
  return { ok: true, score, checks, sample: key.sample, tip: key.tip };
}

// ---------- Triage sprint ----------
export type SprintResult =
  | { ok: false; error: string }
  | { ok: true; correct: number; total: number; items: { id: string; right: boolean; answer: string; why: string }[] };

export async function checkSprint(answers: Record<string, string>): Promise<SprintResult> {
  const ids = Object.keys(SPRINT_KEYS);
  if (!answers || typeof answers !== "object" || ids.some((id) => typeof answers[id] !== "string")) {
    return { ok: false, error: "Make a call on every alert first." };
  }
  const items = ids.map((id) => ({
    id,
    right: answers[id] === SPRINT_KEYS[id].answer,
    answer: SPRINT_KEYS[id].answer,
    why: SPRINT_KEYS[id].why,
  }));
  return { ok: true, correct: items.filter((i) => i.right).length, total: items.length, items };
}

// ---------- After-action quiz ----------
export type AfterResult =
  | { ok: false; error: string }
  | { ok: true; correct: boolean; answer: string; why: string; detail?: string };

export async function checkAfterAction(alertId: string, choice: string): Promise<AfterResult> {
  const tactic = own(TACTIC_KEYS, alertId);
  if (tactic) {
    if (!(TACTICS as readonly string[]).includes(choice)) return { ok: false, error: "Choose one of the options." };
    return { ok: true, correct: choice === tactic.tactic, answer: tactic.tactic, why: tactic.why, detail: tactic.technique };
  }
  const tuning = own(TUNING_KEYS, alertId);
  if (tuning) {
    const n = Number(choice);
    if (!Number.isInteger(n) || n < 0 || n > 3) return { ok: false, error: "Choose one of the options." };
    return { ok: true, correct: n === tuning.answer, answer: String(tuning.answer), why: tuning.why };
  }
  return { ok: false, error: "No follow-up question for this alert." };
}

// ---------- WHOIS ----------
export type WhoisResult =
  | { ok: false; error: string }
  | { ok: true; domain: string; found: false }
  | ({ ok: true; domain: string; found: true } & WhoisRecord);

export async function whoisLookup(raw: string): Promise<WhoisResult> {
  const domain = (typeof raw === "string" ? raw : "").trim().toLowerCase().replace(/^https?:\/\//, "").split(/[/?#:]/)[0];
  if (!domain || domain.length > 253 || !/^[a-z0-9.-]+\.[a-z0-9-]{2,}$/.test(domain)) {
    return { ok: false, error: "Enter a domain such as harborpine-verify.test." };
  }
  const record = own(WHOIS, domain);
  return record ? { ok: true, domain, found: true, ...record } : { ok: true, domain, found: false };
}
