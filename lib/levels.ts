import { ALERTS } from "@/content/alerts";
import type { CaseRecord, Difficulty } from "./types";

export const LEVELS: Difficulty[] = ["Beginner", "Intermediate", "Hard", "AI Era"];

export type LevelState = { level: Difficulty; total: number; done: number; unlocked: boolean; previous: Difficulty | null };

/** Every level is open from the start. shortcut: to gate levels again, open a level only when every alert in the one before it is closed. */
export function levelStates(cases: Record<string, CaseRecord>): LevelState[] {
  return LEVELS.map((level, i) => {
    const mine = ALERTS.filter((a) => a.difficulty === level);
    return { level, total: mine.length, done: mine.filter((a) => cases[a.id]).length, unlocked: true, previous: i ? LEVELS[i - 1] : null };
  });
}

export function isUnlocked(difficulty: Difficulty, cases: Record<string, CaseRecord>): boolean {
  return levelStates(cases).find((s) => s.level === difficulty)?.unlocked ?? false;
}
