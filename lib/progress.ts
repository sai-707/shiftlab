"use client";

import { useSyncExternalStore } from "react";
import { ALERTS } from "@/content/alerts";
import { isUnlocked } from "./levels";
import { addAttempt, attemptsLeft } from "./attempts";
import type { CaseRecord } from "./types";

export type Progress = {
  activeAlertId: string | null;
  cases: Record<string, CaseRecord>;
  /** A closed alert the student is trying again. Only one alert is worked on at a time, so this and activeAlertId are never both set. */
  retrying?: string | null;
};

const KEY = "shiftlab.progress.v1";
const EMPTY: Progress = { activeAlertId: null, cases: {}, retrying: null };

// shortcut: progress lives in this browser's localStorage, replaced by the database in phase 3
let cache: Progress | null = null;
const listeners = new Set<() => void>();

function load(): Progress {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.cases && typeof parsed.cases === "object") {
        return {
          activeAlertId: typeof parsed.activeAlertId === "string" ? parsed.activeAlertId : null,
          cases: parsed.cases,
          retrying: typeof parsed.retrying === "string" ? parsed.retrying : null,
        };
      }
    }
  } catch {
    // corrupted or blocked storage: start from empty progress
  }
  return EMPTY;
}

function getSnapshot(): Progress {
  if (cache === null) cache = load();
  return cache;
}

function getServerSnapshot(): Progress {
  return EMPTY;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function save(next: Progress) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // storage blocked: progress lasts until the page is closed
  }
  listeners.forEach((l) => l());
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// Guests (no account) can close this many alerts, then are asked to sign up. Progress carries over when they do.
// shortcut: the count lives in the browser, so a guest who clears site data gets a fresh allowance. Guests have no identity the server can count; fine for a portfolio demo.
export const GUEST_LIMIT = 3;
let guestMode = false; // set by ProgressSyncClient once the layout knows whether someone is signed in

export function setGuestMode(v: boolean) {
  if (guestMode === v) return;
  guestMode = v;
  listeners.forEach((l) => l());
}

export function guestLimitReached(): boolean {
  return guestMode && Object.keys(getSnapshot().cases).length >= GUEST_LIMIT;
}

export function useGuestLimit(): boolean {
  const p = useProgress();
  const guest = useSyncExternalStore(subscribe, () => guestMode, () => false);
  return guest && Object.keys(p.cases).length >= GUEST_LIMIT;
}

/** One active alert at a time, and closed alerts cannot be reopened. Also starts the case on the server for signed-in students. */
export function assignAlert(alertId: string) {
  const p = getSnapshot();
  const alert = ALERTS.find((a) => a.id === alertId);
  if (!alert || p.activeAlertId !== null || p.retrying || p.cases[alertId] || !isUnlocked(alert.difficulty, p.cases) || guestLimitReached()) return;
  save({ ...p, activeAlertId: alertId });
  // Fire-and-forget: the server action is best-effort; local progress is already set.
  import("./sync").then((m) => m.syncAssign(alertId)).catch(() => {});
}

/** Saves a submitted try. For an alert that was already closed this is a retry: the case keeps every try and counts the best. Returns the case as saved. */
export function closeCase(record: CaseRecord): CaseRecord {
  const p = getSnapshot();
  const saved = addAttempt(p.cases[record.alertId], record);
  save({
    ...p,
    activeAlertId: p.activeAlertId === record.alertId ? null : p.activeAlertId,
    retrying: p.retrying === record.alertId ? null : (p.retrying ?? null),
    cases: { ...p.cases, [record.alertId]: saved },
  });
  return saved;
}

/** Start trying a closed alert again. Refused while another alert is assigned or when all tries are used. */
export function startRetry(alertId: string): boolean {
  const p = getSnapshot();
  const rec = p.cases[alertId];
  if (!rec || p.activeAlertId !== null || attemptsLeft(rec) === 0) return false;
  save({ ...p, retrying: alertId });
  return true;
}

export function cancelRetry() {
  const p = getSnapshot();
  if (p.retrying) save({ ...p, retrying: null });
}

export function resetProgress() {
  save(EMPTY);
}

/** Used by the sync layer to apply merged progress from the server without triggering a server save. */
export function setProgressFromSync(p: Progress) {
  save(p);
}
