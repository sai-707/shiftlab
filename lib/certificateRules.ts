// Certificate rules that need nothing else to run: the pass mark, the kinds, the printed sentence, name tidying and shape checks.
// Kept apart from certificates.ts so the plain-node tests (tests/certificates.test.mjs) can load it without the site's "@/" paths.
import type { Difficulty } from "./types";

/** A level certificate needs every alert of the level closed and an average of at least this. Same number as in the database function. */
export const MIN_AVG = 70;

export type CertKind = Difficulty | "Master";

export const KINDS: CertKind[] = ["Beginner", "Intermediate", "Hard", "AI Era", "Master"];

export const KIND_META: Record<CertKind, { code: string; color: string; short: string }> = {
  Beginner: { code: "BGN", color: "#34d399", short: "Beginner" },
  Intermediate: { code: "INT", color: "#60a5fa", short: "Intermediate" },
  Hard: { code: "HRD", color: "#fb923c", short: "Hard" },
  "AI Era": { code: "AIE", color: "#a78bfa", short: "AI Era" },
  Master: { code: "MST", color: "#c8d3e4", short: "Master" },
};

export type Cert = {
  id: string;
  kind: CertKind;
  holder: string;
  alerts: number;
  /** Final average: each alert counts its best try. */
  avg: number;
  /** Average of the first try on each alert. */
  firstAvg: number;
  /** Master only: the average of each level. */
  levels: Partial<Record<Difficulty, number>> | null;
  issuedAt: string;
};

export const CERT_ID = /^SL-(BGN|INT|HRD|AIE|MST)-[0-9A-F]{10}$/;

export const issuedLabel = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

/** The sentence under the name. Words flagged `b` are shown bold. */
export function statement(c: Pick<Cert, "kind" | "alerts" | "avg">): { t: string; b?: boolean; hl?: boolean }[] {
  if (c.kind === "Master")
    return [
      { t: "has successfully completed " },
      { t: `all ${c.alerts} alerts`, b: true },
      { t: " across the " },
      { t: "four levels", b: true },
      { t: " of ShiftLab, from Beginner to AI Era, investigating real-world scenarios hands-on as a SOC Level 1 analyst, with an overall average score of " },
      { t: `${c.avg} out of 100`, b: true },
      { t: "." },
    ];
  return [
    { t: "has successfully completed " },
    { t: `all ${c.alerts} alerts`, b: true },
    { t: " of the " },
    { t: `${c.kind} level`, b: true },
    { t: " on ShiftLab, investigating real-world scenarios hands-on as a SOC Level 1 analyst, with an average score of " },
    { t: `${c.avg} out of 100`, b: true, hl: true },
    { t: "." },
  ];
}

/** What the person typed for the name on the certificate, tidied. Null if it is not usable. */
export function cleanHolder(v: string): string | null {
  const s = v.replace(/\s+/g, " ").trim();
  return s.length >= 2 && s.length <= 60 && !/[<>\u0000-\u001f]/.test(s) ? s : null;
}

/** The database row, checked to be the shape the page expects. */
export function asCert(v: unknown): Cert | null {
  if (!v || typeof v !== "object") return null;
  const o = v as Record<string, unknown>;
  if (typeof o.id !== "string" || !CERT_ID.test(o.id)) return null;
  if (!KINDS.includes(o.kind as CertKind)) return null;
  if (typeof o.holder !== "string" || typeof o.issuedAt !== "string") return null;
  const num = (x: unknown) => (typeof x === "number" ? x : Number(x));
  return {
    id: o.id,
    kind: o.kind as CertKind,
    holder: o.holder,
    alerts: num(o.alerts),
    avg: num(o.avg),
    firstAvg: num(o.firstAvg),
    levels: o.levels && typeof o.levels === "object" ? (o.levels as Cert["levels"]) : null,
    issuedAt: o.issuedAt,
  };
}


