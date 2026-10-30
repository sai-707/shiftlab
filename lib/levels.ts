import { ALERTS } from "@/content/alerts";
import type { CaseRecord, Difficulty } from "./types";

export const LEVELS: Difficulty[] = ["Beginner", "Intermediate", "Hard", "AI Era"];

export type LevelState = { level: Difficulty; total: number; done: number; unlocked: boolean; previous: Difficulty | null };

/** A level opens when every alert in the level before it is closed. An empty level never blocks. */
export function levelStates(cases: Record<string, CaseRecord>): LevelState[] {
  let open = true;
  return LEVELS.map((level, i) => {
    const mine = ALERTS.filter((a) => a.difficulty === level);
    const done = mine.filter((a) => cases[a.id]).length;
    const state = { level, total: mine.length, done, unlocked: open, previous: i ? LEVELS[i - 1] : null };
    open = open && done === mine.length;
    return state;
  });
}

export function isUnlocked(difficulty: Difficulty, cases: Record<string, CaseRecord>): boolean {
  // Testing switch for the owner: put NEXT_PUBLIC_UNLOCK_ALL=1 in .env.local to open every level. Never set it on the live site.
  if (process.env.NEXT_PUBLIC_UNLOCK_ALL === "1") return true;
  return levelStates(cases).find((s) => s.level === difficulty)?.unlocked ?? false;
}
