import type { Difficulty, ReportSections } from "./types";

/** Intermediate and above: every section is compulsory (it cannot be empty). Beginner: only "What happened" is, and the rest may stay empty.
 *  There is no minimum length either way. Checked in the browser and again on the server. */
const EASY: Difficulty = "Beginner";
export const isEasy = (d?: Difficulty) => d === EASY;
const KEYS: (keyof ReportSections)[] = ["happened", "confirmed", "unknown", "next"];
export const FIELD_NAME: Record<keyof ReportSections, string> = {
  happened: "What happened",
  confirmed: "What is confirmed",
  unknown: "What is still unknown",
  next: "Next action",
};

const FUNCTION_WORDS = new Set(
  "a an the and or but if then so of in on at to from by for with without as is are was were be been it its this that these those there their they he she we i you not no did do does has have had will would can could should may after before while when into over under than also which who what how why".split(" "),
);

/** Returns a plain-English problem with one section, or null when it is acceptable. */
export function sectionProblem(key: keyof ReportSections, raw: string, easy = false): string | null {
  const text = raw.trim();
  const words = text.toLowerCase().match(/[a-z0-9][a-z0-9'.:/_-]*/g) ?? [];
  const name = FIELD_NAME[key];
  if (words.length === 0) return `${name} is required.`;
  if (/(.)\1{4,}/.test(text)) return `${name} contains repeated characters. Write real sentences.`;
  // Acronyms such as SPF, DKIM or MFA have no vowels but are normal in a report, so capitalised ones count as readable.
  const acronyms = new Set(text.match(/\b[A-Z]{2,6}\b/g)?.map((a) => a.toLowerCase()));
  const readable = words.filter((w) => /[aeiouy]/.test(w) || /\d/.test(w) || acronyms.has(w)).length / words.length;
  if (readable < 0.7) return `${name} does not read as sentences.`;
  // A first-timer's short note is judged only for gibberish, so the style checks below are for harder alerts.
  if (easy) return null;
  // The two checks below only judge longer text: a short note has too few words to measure.
  const long = words.length >= 8;
  // A pile of keywords with no sentence around it is not a report. Short bullet notes are fine, so the bar is low.
  if (long && words.filter((w) => FUNCTION_WORDS.has(w)).length / words.length < 0.08) return `${name} reads like a list of keywords. Write full sentences that explain them.`;
  if (long && new Set(words).size / words.length < 0.5) return `${name} repeats the same words. Say something new in each sentence.`;
  return null;
}

/** About a short sentence: enough to count as written, low enough that a one-line Beginner reason passes. */
export const WRITTEN_MIN_CHARS = 20;

/** The sections with something real in them. */
export function writtenSections(s: ReportSections): (keyof ReportSections)[] {
  return KEYS.filter((k) => (s[k] ?? "").trim().length >= WRITTEN_MIN_CHARS);
}

/** Marks for having written the report, never for the words in it (lib/grade.ts). The reason carries most of it and each
 *  further section adds the rest, so a one-line Beginner answer still scores and a full report scores full. */
export function reportWritten(s: ReportSections, max: number): number {
  const w = writtenSections(s);
  return Math.min(max, (w.includes("happened") ? 10 : 0) + 5 * w.filter((k) => k !== "happened").length);
}

/** All problems in a report, including copy-pasting one answer into several sections. */
export function reportProblems(s: ReportSections, difficulty?: Difficulty): string[] {
  const easy = isEasy(difficulty);
  const out: string[] = [];
  KEYS.forEach((k) => {
    // Beginner: the extra sections are optional, but if someone writes in one it is still checked for gibberish.
    if (easy && k !== "happened" && !(s[k] ?? "").trim()) return;
    const p = sectionProblem(k, s[k] ?? "", easy);
    if (p) out.push(p);
  });
  const norm = (k: keyof ReportSections) => (s[k] ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  const keys = KEYS;
  for (let i = 0; i < keys.length; i++)
    for (let j = i + 1; j < keys.length; j++)
      if (norm(keys[i]) && norm(keys[i]) === norm(keys[j])) out.push(`${FIELD_NAME[keys[i]]} and ${FIELD_NAME[keys[j]]} are identical. Each section answers a different question.`);
  return out;
}
