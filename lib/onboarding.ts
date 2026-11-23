"use client";

import { useSyncExternalStore } from "react";
import { ALERTS } from "@/content/alerts";
import { createStore } from "./localStore";
import type { Progress } from "./progress";

// The welcome question and the first-alert tour. Both live in the browser only, like hintsUsed: saved_state accepts a fixed list
// of keys, so syncing the answer would need a database change. Wiped on sign-out and reset by sync.ts.
// shortcut: a student who answered but has not closed an alert yet sees the question once more on a new device. Fine for a one-time hello.

/** "" = not asked yet. "skip" = closed the window without answering. */
export type Level = "" | "new" | "pro" | "skip";

export const onboarding = createStore("shiftlab.onboarding.v1", { level: "" as Level });

/** step 0 = no tour, 1 to 4 = a step, 5 = the closing window. alertId is the alert the tour runs on. */
export const tour = createStore("shiftlab.tour.v1", { step: 0, alertId: "" });

export const TOUR_STEPS = 4;
export const SEEN_NOTE = "You can read this again any time under Start here.";

/** Starts the tour and returns the alert it should open: the one already assigned, else the first Beginner alert not yet closed. */
export function startTour(p: Progress): string {
  const id = p.activeAlertId ?? ALERTS.find((a) => a.difficulty === "Beginner" && !p.cases[a.id])?.id ?? ALERTS[0].id;
  tour.set({ step: 1, alertId: id });
  return id;
}

// The welcome window waits until the sync layer has finished merging saved progress, so a student with progress on an
// older device never sees a "new here?" question flash up first. Guests are ready at once.
let ready = false;
const listeners = new Set<() => void>();

export function markSyncReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((l) => l());
}

export const useSyncReady = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => ready,
    () => false,
  );
