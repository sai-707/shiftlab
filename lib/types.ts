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
  severity: Severity;
  difficulty: Difficulty;
  raisedAt: string;
  summary: string;
  briefing: Briefing;
  indicators: string[];
  evidence: EvidenceBlock[];
};

export type Verdict = "tp" | "fp";

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
