"use client";

import { createStore } from "./localStore";

// How many hints (0 to 3) the student has opened on each alert. Hints are free; this only feeds the "Hints used" line in feedback.
// shortcut: browser-only, not saved to the account (saved_state only accepts a fixed list of keys). Wiped on sign-out and reset by sync.ts.
export const hintsUsed = createStore("shiftlab.hints.v1", {
  used: {} as Record<string, number>,
});
