// Certificates: the rules, the labels and the pure helpers. The database makes the final call (see 0014_certificates.sql);
// the browser uses these only to show progress and to decide when to offer "Claim".
import { ALERTS } from "@/content/alerts";
import { firstScore } from "./attempts";
import { MIN_AVG, type Cert, type CertKind } from "./certificateRules";
import { LEVELS } from "./levels";
import { SITE_URL } from "./site";
import type { CaseRecord, Difficulty } from "./types";

export * from "./certificateRules";

export const verifyPath = (id: string) => `/verify/${id}`;
export const verifyUrl = (id: string) => `${SITE_URL}${verifyPath(id)}`;

/** The "Add to LinkedIn" link. LinkedIn opens its Licenses and certifications form filled in; the person still has to press Save. */
export function linkedInUrl(c: Cert): string {
  const d = new Date(c.issuedAt);
  const name = c.kind === "Master" ? "ShiftLab SOC Level 1 Analyst, Master" : `ShiftLab SOC Level 1 Analyst, ${c.kind} level`;
  const q = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name,
    organizationName: "ShiftLab",
    issueYear: String(d.getUTCFullYear()),
    issueMonth: String(d.getUTCMonth() + 1),
    certUrl: verifyUrl(c.id),
    certId: c.id,
  });
  return `https://www.linkedin.com/profile/add?${q.toString()}`;
}

export const topicsIn = (level: Difficulty): number => new Set(ALERTS.filter((a) => a.difficulty === level).map((a) => a.topic)).size;

export type LevelStatus = {
  level: Difficulty;
  total: number;
  done: number;
  /** Average of the best score on each closed alert, or null before any alert is closed. */
  avg: number | null;
  /** Average of the first try on each closed alert. */
  firstAvg: number | null;
  /** Every alert closed and the average is high enough: the certificate can be claimed. */
  ready: boolean;
};

const mean = (xs: number[]) => (xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : null);

export function levelStatuses(cases: Record<string, CaseRecord>): LevelStatus[] {
  return LEVELS.map((level) => {
    const mine = ALERTS.filter((a) => a.difficulty === level);
    const closed = mine.filter((a) => cases[a.id]);
    const avg = mean(closed.map((a) => cases[a.id].feedback.score));
    return {
      level,
      total: mine.length,
      done: closed.length,
      avg,
      firstAvg: mean(closed.map((a) => firstScore(cases[a.id]))),
      ready: closed.length === mine.length && avg !== null && avg >= MIN_AVG,
    };
  });
}

/** Overall average across every alert, for the Master certificate. */
export function overall(cases: Record<string, CaseRecord>): { done: number; total: number; avg: number | null } {
  const closed = ALERTS.filter((a) => cases[a.id]);
  return { done: closed.length, total: ALERTS.length, avg: mean(closed.map((a) => cases[a.id].feedback.score)) };
}

/** Sent by the case page when the last alert of a level has just been closed with a high enough average. */
export const CERT_EVENT = "shiftlab:cert-earned";

const SEEN_KEY = "shiftlab.cert.seen.v1";

/** The earned window opens once per certificate in each browser. If the person closes it, the dashboard still has Claim. */
export function certSeen(kind: CertKind): boolean {
  try {
    return (JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "[]") as string[]).includes(kind);
  } catch {
    return false;
  }
}

export function markCertSeen(kind: CertKind) {
  try {
    const seen = new Set(JSON.parse(window.localStorage.getItem(SEEN_KEY) ?? "[]") as string[]);
    seen.add(kind);
    window.localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]));
  } catch {
    // storage blocked: the window may show again next time, which is harmless
  }
}

/** The Master certificate needs the four level certificates first, and every alert closed with an overall average of at least MIN_AVG. */
export function masterReady(cases: Record<string, CaseRecord>, certs: Cert[]): boolean {
  const o = overall(cases);
  return o.done === o.total && o.avg !== null && o.avg >= MIN_AVG && LEVELS.every((l) => certs.some((c) => c.kind === l));
}
