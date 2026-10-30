"use client";

import { createStore } from "./localStore";

// Best score per alert for the bonus timeline and scope steps.
// shortcut: browser-only, not saved to the account (saved_state only accepts a fixed list of keys). Wiped on sign-out and reset by sync.ts.
export const stepsProgress = createStore("shiftlab.steps.v1", {
  timeline: {} as Record<string, number>,
  scope: {} as Record<string, number>,
});
