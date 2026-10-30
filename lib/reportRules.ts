import type { ReportSections } from "./types";

/** Every section is compulsory (it cannot be empty). There is no minimum length; checked in the browser and again on the server. */
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
export function sectionProblem(key: keyof ReportSections, raw: string): string | null {
  const text = raw.trim();
  const words = text.toLowerCase().match(/[a-z0-9][a-z0-9'.:/_-]*/g) ?? [];
  const name = FIELD_NAME[key];
  if (words.length === 0) return `${name} is required.`;
  if (/(.)\1{4,}/.test(text)) return `${name} contains repeated characters. Write real sentences.`;
  // Acronyms such as SPF, DKIM or MFA have no vowels but are normal in a report, so capitalised ones count as readable.
  const acronyms = new Set(text.match(/\b[A-Z]{2,6}\b/g)?.map((a) => a.toLowerCase()));
  const readable = words.filter((w) => /[aeiouy]/.test(w) || /\d/.test(w) || acronyms.has(w)).length / words.length;
  if (readable < 0.7) return `${name} does not read as sentences.`;
  // The two checks below only judge longer text: a short note has too few words to measure.
  const long = words.length >= 8;
  // A pile of keywords with no sentence around it is not a report. Short bullet notes are fine, so the bar is low.
  if (long && words.filter((w) => FUNCTION_WORDS.has(w)).length / words.length < 0.08) return `${name} reads like a list of keywords. Write full sentences that explain them.`;
  if (long && new Set(words).size / words.length < 0.5) return `${name} repeats the same words. Say something new in each sentence.`;
  return null;
}

/** All problems in a report, including copy-pasting one answer into several sections. */
export function reportProblems(s: ReportSections): string[] {
  const out: string[] = [];
  KEYS.forEach((k) => {
    const p = sectionProblem(k, s[k] ?? "");
    if (p) out.push(p);
  });
  const norm = (k: keyof ReportSections) => (s[k] ?? "").trim().toLowerCase().replace(/\s+/g, " ");
  const keys = KEYS;
  for (let i = 0; i < keys.length; i++)
    for (let j = i + 1; j < keys.length; j++)
      if (norm(keys[i]) && norm(keys[i]) === norm(keys[j])) out.push(`${FIELD_NAME[keys[i]]} and ${FIELD_NAME[keys[j]]} are identical. Each section answers a different question.`);
  return out;
}
