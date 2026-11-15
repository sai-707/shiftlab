// The report is written in one box with headings already typed in. These helpers build that box and read it back as the
// four sections that scoring and coaching already use (lib/types.ts ReportSections), so nothing stored or scored changes.
import type { ReportSections, Verdict } from "./types";

export type Part = "time" | "entities" | "reason" | "escalate" | "remediation" | "indicators" | "unknown";

/** `into` says which stored section a heading feeds. */
const PARTS: { part: Part; label: string; re: RegExp; into: keyof ReportSections }[] = [
  { part: "time", label: "Time of activity", re: /^time of activity\s*:/i, into: "happened" },
  { part: "entities", label: "List of Affected Entities", re: /^list of affected entities\s*:/i, into: "confirmed" },
  { part: "reason", label: "", re: /^reason for classifying as\b[^:\n]*:/i, into: "happened" },
  { part: "escalate", label: "Reason for Escalating the Alert", re: /^reason for escalating( the alert)?\s*:/i, into: "next" },
  { part: "remediation", label: "Recommended Remediation Actions", re: /^recommended remediation actions\s*:/i, into: "next" },
  { part: "indicators", label: "List of Attack Indicators", re: /^list of attack indicators\s*:/i, into: "confirmed" },
  { part: "unknown", label: "What Is Still Unknown", re: /^what is still unknown\s*:/i, into: "unknown" },
];

/** The reason heading follows the verdict the student has chosen. */
export const reasonHeading = (v: Verdict | null) => `Reason for Classifying as ${v === "tp" ? "True Positive" : v === "fp" ? "False Positive" : "True or False Positive"}`;
const heading = (p: (typeof PARTS)[number], v: Verdict | null) => (p.part === "reason" ? reasonHeading(v) : p.label);

/** The text the box starts with: every heading, with room to type under each. */
export const template = (v: Verdict | null) => PARTS.map((p) => `${heading(p, v)}:\n\n`).join("\n");

/** Swaps the reason heading when the verdict changes, keeping everything typed. */
export const retitle = (text: string, v: Verdict) => text.replace(/^reason for classifying as\b[^:\n]*:/im, `${reasonHeading(v)}:`);

/** Splits the box by heading. Text before the first heading, or in a box with no headings left, counts as the reason. */
export function parseReport(text: string): Record<Part, string> {
  const lines = Object.fromEntries(PARTS.map((p) => [p.part, [] as string[]])) as Record<Part, string[]>;
  let cur: Part = "reason";
  for (const line of text.replace(/\r/g, "").split("\n")) {
    const t = line.trim();
    const hit = PARTS.find((p) => p.re.test(t));
    if (!hit) {
      lines[cur].push(line);
      continue;
    }
    cur = hit.part;
    const rest = t.replace(hit.re, "").trim();
    if (rest) lines[cur].push(rest);
  }
  return Object.fromEntries(PARTS.map((p) => [p.part, lines[p.part].join("\n").trim()])) as Record<Part, string>;
}

export function toSections(p: Record<Part, string>): ReportSections {
  const join = (...k: Part[]) => k.map((x) => p[x]).filter(Boolean).join("\n");
  return { happened: join("time", "reason"), confirmed: join("entities", "indicators"), unknown: p.unknown, next: join("escalate", "remediation") };
}

/** Beginner needs only the reason; every other level needs every heading answered. Worded so lib/reportEvents.ts counts it as "empty". */
export function templateProblem(p: Record<Part, string>, v: Verdict | null, easy: boolean): string | null {
  const missing = PARTS.filter((x) => (easy ? x.part === "reason" : true) && !p[x.part]).map((x) => heading(x, v));
  if (!missing.length) return null;
  return missing.length === 1 ? `${missing[0]} is required.` : `${missing.join(", ")} are required.`;
}
