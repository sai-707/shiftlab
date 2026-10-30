"use client";

import { createStore } from "./localStore";

/** Best score per email / scenario / alert follow-up, kept in this browser until accounts arrive. */
export const mailProgress = createStore("shiftlab.mail.v1", { scores: {} as Record<string, number> });
export const commsProgress = createStore("shiftlab.comms.v1", { scores: {} as Record<string, number> });
export const afterProgress = createStore("shiftlab.after.v1", { right: {} as Record<string, boolean> });
export const sprintProgress = createStore("shiftlab.sprint.v1", { best: null as number | null, total: 0 });

export function saveBest(store: typeof mailProgress | typeof commsProgress, id: string, score: number) {
  const prev = store.get().scores;
  store.set({ scores: { ...prev, [id]: Math.max(prev[id] ?? 0, score) } });
}

/** Best score for each shift and each AI-check drill. */
export const shiftProgress = createStore("shiftlab.shift.v1", { best: {} as Record<string, number> });
export const aiCheckProgress = createStore("shiftlab.aicheck.v1", { best: {} as Record<string, number> });
