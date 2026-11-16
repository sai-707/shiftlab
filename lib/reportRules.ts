import type { Difficulty, ReportSections } from "./types";

/** Intermediate and above: every section is compulsory (it cannot be empty). Beginner: only "What happened" is, and the rest may stay empty.
 *  There is no minimum length and no check on the wording: gibberish is flagged in the review and earns no report marks. Checked in the browser and again on the server. */
const EASY: Difficulty = "Beginner";
export const isEasy = (d?: Difficulty) => d === EASY;
const KEYS: (keyof ReportSections)[] = ["happened", "confirmed", "unknown", "next"];
export const FIELD_NAME: Record<keyof ReportSections, string> = {
  happened: "What happened",
  confirmed: "What is confirmed",
  unknown: "What is still unknown",
  next: "Next action",
};

/** True when the text is random characters or not words at all. Poor English made of real words passes: only gibberish does not. */
export function unreadable(raw: string): boolean {
  const text = raw.trim();
  if (!text) return false;
  const words = text.toLowerCase().match(/[a-z0-9][a-z0-9'.:/_-]*/g) ?? [];
  if (words.length === 0 || /(.)\1{4,}/.test(text)) return true;
  // Acronyms such as SPF, DKIM or MFA have no vowels but are normal in a report, so capitalised ones count as readable.
  const acronyms = new Set(text.match(/\b[A-Z]{2,6}\b/g)?.map((a) => a.toLowerCase()));
  return words.filter((w) => /[aeiouy]/.test(w) || /\d/.test(w) || acronyms.has(w)).length / words.length < 0.7;
}

/** About a short sentence: enough to count as written, low enough that a one-line Beginner reason passes. */
export const WRITTEN_MIN_CHARS = 20;

/** The sections with something real in them: long enough, made of words, and not a copy of an earlier section. */
export function writtenSections(s: ReportSections): (keyof ReportSections)[] {
  const seen = new Set<string>();
  return KEYS.filter((k) => {
    const text = (s[k] ?? "").trim();
    const norm = text.toLowerCase().replace(/\s+/g, " ");
    if (text.length < WRITTEN_MIN_CHARS || unreadable(text) || seen.has(norm)) return false;
    seen.add(norm);
    return true;
  });
}

/** Marks for having written each section: the reason section carries 10, each other one 5. Never for the words in it. */
export const SECTION_MAX: Record<keyof ReportSections, number> = { happened: 10, confirmed: 5, unknown: 5, next: 5 };
export function sectionMarks(s: ReportSections): Record<keyof ReportSections, number> {
  const w = writtenSections(s);
  return { happened: 0, confirmed: 0, unknown: 0, next: 0, ...Object.fromEntries(w.map((k) => [k, SECTION_MAX[k]])) };
}

/** The report's marks (lib/grade.ts) are those section marks added up, so a one-line Beginner reason still scores and a full report scores full. */
export function reportWritten(s: ReportSections, max: number): number {
  return Math.min(max, KEYS.reduce((sum, k) => sum + sectionMarks(s)[k], 0));
}

/** The only reason to stop a submit is a compulsory section left empty. What was written is judged afterwards, in the review. */
export function reportProblems(s: ReportSections, difficulty?: Difficulty): string[] {
  const easy = isEasy(difficulty);
  return KEYS.filter((k) => !(easy && k !== "happened") && !(s[k] ?? "").trim()).map((k) => `${FIELD_NAME[k]} is required.`);
}
