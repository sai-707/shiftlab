export type Severity = "critical" | "high" | "medium" | "low";
export type Topic = "Phishing" | "Brute force" | "Network" | "Malware" | "Web attack" | "Cloud" | "Insider" | "AI";
export type Difficulty = "Beginner" | "Intermediate" | "Hard" | "AI Era";

export type EvidenceBlock =
  | { kind: "fields"; title: string; rows: { label: string; value: string }[] }
  | { kind: "logs"; title: string; lines: string[] }
  | { kind: "table"; title: string; columns: string[]; rows: string[][] }
  | { kind: "timeline"; title: string; events: { time: string; text: string }[] };

/** Plain-English context shown above the evidence so a beginner knows what they are looking at. */
export type Briefing = {
  /** Which tool raised the alert, e.g. "Mail gateway" or "EDR" */
  source: string;
  rule: string;
  /** What the rule looks for, in simple words */
  looksFor: string;
  assets: { name: string; kind: "User" | "Host" | "Account" | "Service" | "Address"; role: string }[];
  /** Starter questions, not answers */
  askFirst: string[];
};

/** Everything the student may see. Answers live in content/answer-keys.ts, server only. */
export type Alert = {
  id: string;
  title: string;
  topic: Topic;
  /** ATT&CK-style stage the rule maps to, shown in the alert header like a real console. */
  category?: string;
  /** ATT&CK technique the rule maps to (for example "T1566.002 Phishing: Spearphishing Link"). Not set when the rule has none. */
  technique?: string;
  severity: Severity;
  difficulty: Difficulty;
  raisedAt: string;
  summary: string;
  /** A few plain sentences: what fired, why it matters, and which evidence to open. Shown first on the case page. */
  description?: string;
  /** One plain sentence saying what the student has to decide. Shown in a highlighted line on the alert page (Beginner alerts). */
  task?: string;
  briefing: Briefing;
  indicators: string[];
  evidence: EvidenceBlock[];
};

export type Verdict = "tp" | "fp";

/** Why a false positive was benign (see content/fp-reasons.ts). */
export type FpReason = "business" | "testing" | "admin" | "system" | "user";

export type ReportSections = {
  happened: string;
  confirmed: string;
  unknown: string;
  next: string;
};

export type Submission = {
  alertId: string;
  verdict: Verdict;
  escalate: boolean;
  /** Only for false positives: why it was benign. Shown as unscored feedback. */
  reason?: FpReason;
  sections: ReportSections;
  /** Sources the student opened while investigating (Intermediate and Hard alerts). */
  opened?: string[];
};

export type FeedbackItem = {
  label: string;
  points: number;
  max: number;
  note: string;
};

export type Feedback = {
  score: number;
  correctVerdict: Verdict;
  correctEscalate: boolean;
  /** Unscored. Present for false positives: what the student picked and the right reason. */
  reason?: { picked: FpReason | null; correct: FpReason; ok: boolean };
  items: FeedbackItem[];
  explanation: string;
};

export type SubmitResult =
  | { ok: true; feedback: Feedback }
  | { ok: false; error: string };

export type CaseRecord = {
  alertId: string;
  submission: Submission;
  feedback: Feedback;
  closedAt: number;
};

export type AnswerKey = {
  verdict: Verdict;
  escalate: boolean;
  /** Required when verdict is "fp". */
  reason?: FpReason;
  /** label is shown as coaching when missed; matches are lowercase words that count as mentioning it */
  evidence: { label: string; matches: string[] }[];
  explanation: string;
};

export type IntelVerdict = "malicious" | "suspicious" | "clean" | "internal" | "unknown";

/** The vendor-style report behind a lookup. Missing when the text was not a valid indicator. */
export type IntelReport = {
  flagged: number;
  vendors: { name: string; hit: string | null }[];
  tags: string[];
  facts: [string, string][];
  next: string[];
  /** True when the indicator is not in the feed: no record is not the same as safe. */
  unseen?: boolean;
};

export type IntelResult = {
  query: string;
  verdict: IntelVerdict;
  kind: string;
  note: string;
  report?: IntelReport;
};
