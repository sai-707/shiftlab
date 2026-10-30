import type { Alert, Difficulty, EvidenceBlock } from "./types";

/** Intermediate, Hard and AI Era alerts hide their evidence. The student must open this many sources before the report unlocks. */
export const MIN_SOURCES: Record<Difficulty, number> = { Beginner: 0, Intermediate: 3, Hard: 4, "AI Era": 4 };
export const INTEL_SOURCE = "Intel lookup";
export const LOG_SOURCE = "Log search";

export const isGated = (a: Pick<Alert, "difficulty">) => MIN_SOURCES[a.difficulty] > 0;

/** Evidence the student has to open. The alert's own details stay visible, and the ready-made timeline is withheld. */
export const sourceBlocks = (a: Alert): EvidenceBlock[] =>
  a.evidence.filter((b) => b.title !== "Alert details" && b.kind !== "timeline");

export const openedCount = (opened: string[] | undefined) => new Set(opened ?? []).size;
