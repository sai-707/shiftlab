"use client";

import { importCases, loadProgress, loadState, resetRemote, saveState, startCase } from "@/app/progress-actions";
import { handoverNotes } from "./handover";
import { registerOnWrite } from "./localStore";
import { logProgress } from "./logProgress";
import { afterProgress, aiCheckProgress, commsProgress, mailProgress, shiftProgress, sprintProgress } from "./practiceProgress";
import { resetProgress, setProgressFromSync, type Progress } from "./progress";
import { sourcesStore } from "./sources";
import { stepsProgress } from "./stepsProgress";
import { hintsUsed } from "./hintsUsed";
import type { CaseRecord } from "./types";

// Sync layer: merges local (localStorage) and remote (Supabase) progress for signed-in students.
// Design: localStorage stays the working cache; the server is the saved copy. A grow-only merge
// means the larger value wins for numbers, OR for booleans, union for arrays, and recursive merge for objects.
// On first load: remote wins for anything the local copy does not have; local wins if dirty.
// shortcut: if two devices edit the same key at the same time, the last save wins for that key.
//           Good enough while there is no concurrent-editing scenario.

const SYNC_META_KEY = "shiftlab.sync.v1";
type SyncMeta = { owner: string; dirty: Record<string, boolean> };

function readMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(SYNC_META_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.owner) return { owner: p.owner, dirty: p.dirty ?? {} };
    }
  } catch { /* empty */ }
  return { owner: "", dirty: {} };
}

function writeMeta(m: SyncMeta) {
  try { localStorage.setItem(SYNC_META_KEY, JSON.stringify(m)); } catch { /* blocked */ }
}

/** Mark a state key as dirty so the next save sends it to the server. */
export function markDirty(key: string) {
  const m = readMeta();
  m.dirty[key] = true;
  writeMeta(m);
}

// ─── Grow-only merge ───────────────────────────────────────────────────

function mergeValue(local: unknown, remote: unknown): unknown {
  // An empty local default (a fresh device) must never beat saved content.
  if (local == null || local === "") return remote;
  if (typeof local === "number" && typeof remote === "number") return Math.max(local, remote);
  if (typeof local === "boolean" && typeof remote === "boolean") return local || remote;
  if (Array.isArray(local) && Array.isArray(remote)) {
    const set = new Set([...remote, ...local]);
    return [...set];
  }
  if (local && remote && typeof local === "object" && typeof remote === "object" && !Array.isArray(local) && !Array.isArray(remote)) {
    return mergeObjects(local as Record<string, unknown>, remote as Record<string, unknown>);
  }
  // Strings and other types: local wins (it is the most recent edit).
  return local;
}

export function mergeObjects(local: Record<string, unknown>, remote: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...remote };
  for (const k of Object.keys(local)) {
    out[k] = k in remote ? mergeValue(local[k], remote[k]) : local[k];
  }
  return out;
}

// ─── Store registry (maps saved_state keys to their createStore instances) ──

type StoreRef = { get: () => object; set: (v: object) => void; reset: () => void };

const STORES: Record<string, StoreRef> = {
  mail: mailProgress,
  comms: commsProgress,
  after: afterProgress,
  sprint: sprintProgress,
  shift: shiftProgress,
  aicheck: aiCheckProgress,
  logs: logProgress,
  handover: handoverNotes,
  sources: sourcesStore,
};

// ─── Hydrate (first load) ──────────────────────────────────────────────

let hydrated = false;

/**
 * Called once when the signed-in layout mounts. Loads remote progress and merges it into local stores.
 * If the localStorage belongs to a different user, wipe it first.
 */
export async function hydrate(userId: string) {
  if (hydrated) return;
  hydrated = true;

  const meta = readMeta();
  // First sign-in on this browser: whatever a guest did here has never been uploaded, so treat every key as dirty.
  const firstSignIn = !meta.owner;

  // Owner mismatch: another account was using this browser. Wipe local data.
  if (meta.owner && meta.owner !== userId) {
    resetProgress();
    for (const store of [...Object.values(STORES), stepsProgress, hintsUsed]) store.reset();
    writeMeta({ owner: userId, dirty: {} });
  } else if (!meta.owner) {
    writeMeta({ ...meta, owner: userId });
  }

  // Load remote cases
  const remote = await loadProgress();
  if (remote) {
    // Import local closed cases that the server does not have yet.
    const localProg = getCurrentProgress();
    const localCases = Object.values(localProg.cases);
    if (localCases.length > 0) {
      await importCases(localCases);
    }

    // Merge remote cases into local: remote wins for anything not already local
    const mergedCases: Record<string, CaseRecord> = { ...localProg.cases };
    for (const rc of remote.cases) {
      if (!mergedCases[rc.alertId]) {
        mergedCases[rc.alertId] = rc;
      }
    }

    // If the server has an active alert, use it
    const activeAlertId = remote.activeAlertId ?? localProg.activeAlertId;

    // Apply merged progress to local store
    setProgressFromSync({ activeAlertId, cases: mergedCases });
  }

  // Load remote state and merge into each store
  const remoteState = await loadState();
  if (remoteState) {
    const dirty = firstSignIn ? Object.fromEntries(Object.keys(STORES).map((k) => [k, true])) : readMeta().dirty;
    const push: string[] = [];
    for (const [key, store] of Object.entries(STORES)) {
      const remoteData = remoteState[key];
      // If local is dirty for this key, merge (local wins on conflicts) and upload the result. Otherwise, remote overwrites.
      if (dirty[key]) {
        push.push(key);
        if (remoteData) store.set(mergeObjects(store.get() as Record<string, unknown>, remoteData as Record<string, unknown>) as object);
      } else if (remoteData) {
        store.set(remoteData);
      }
    }
    // The store writes above queued saves and marked keys dirty; reset the flags, then queue exactly the keys that need uploading.
    writeMeta({ owner: userId, dirty: {} });
    for (const key of push) scheduleSave(key);
  }
}

// ─── Direct progress store read (bypasses useSyncExternalStore for the sync layer) ──

function getCurrentProgress(): Progress {
  try {
    const raw = localStorage.getItem("shiftlab.progress.v1");
    if (raw) {
      const p = JSON.parse(raw);
      if (p?.cases) return { activeAlertId: p.activeAlertId ?? null, cases: p.cases };
    }
  } catch { /* empty */ }
  return { activeAlertId: null, cases: {} };
}

// ─── Save (debounced) ──────────────────────────────────────────────────

let saveTimer: ReturnType<typeof setTimeout> | null = null;
const DEBOUNCE_MS = 3000;

function flushSave() {
  if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
  const meta = readMeta();
  if (!meta.owner) return;
  const dirty = { ...meta.dirty };
  // Clear dirty flags immediately so new changes accumulate into the next batch
  writeMeta({ ...meta, dirty: {} });

  for (const key of Object.keys(dirty)) {
    const store = STORES[key];
    if (!store) continue;
    saveState(key, store.get()).catch(() => {
      // Re-mark dirty on failure so the next save retries
      const m = readMeta();
      m.dirty[key] = true;
      writeMeta(m);
    });
  }
}

export function scheduleSave(key: string) {
  markDirty(key);
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, DEBOUNCE_MS);
}

// Flush on pagehide / visibilitychange so progress is saved when the tab closes
if (typeof window !== "undefined") {
  const flush = () => flushSave();
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
}

// ─── Hooks for assign/reset ────────────────────────────────────────────

/** Start a case on the server too (signed-in students). */
export async function syncAssign(alertId: string): Promise<boolean> {
  const meta = readMeta();
  if (!meta.owner) return true; // guest: local-only, always ok
  const result = await startCase(alertId);
  return result.ok;
}

/** Reset both local and remote progress. */
export async function syncReset(): Promise<void> {
  resetProgress();
  for (const store of [...Object.values(STORES), stepsProgress, hintsUsed]) store.reset();
  const meta = readMeta();
  if (meta.owner) {
    writeMeta({ ...meta, dirty: {} });
    await resetRemote();
  }
}

/** Wipe local data on sign-out so the next student does not see someone else's progress. */
export function wipeOnSignOut() {
  resetProgress();
  for (const store of [...Object.values(STORES), stepsProgress, hintsUsed]) store.reset();
  try { localStorage.removeItem(SYNC_META_KEY); } catch { /* blocked */ }
}

// ─── Hook into localStore writes ────────────────────────────────────────

const LOCAL_TO_STATE: Record<string, string> = {
  "shiftlab.mail.v1": "mail",
  "shiftlab.comms.v1": "comms",
  "shiftlab.after.v1": "after",
  "shiftlab.sprint.v1": "sprint",
  "shiftlab.shift.v1": "shift",
  "shiftlab.aicheck.v1": "aicheck",
  "shiftlab.logs.v1": "logs",
  "shiftlab.handover.v1": "handover",
  "shiftlab.sources.v1": "sources",
};

// Register the callback so every store.set() triggers a debounced server save.
registerOnWrite((localKey) => {
  const sk = LOCAL_TO_STATE[localKey];
  if (sk) scheduleSave(sk);
});
