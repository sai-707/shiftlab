"use client";

import { useSyncExternalStore } from "react";

/** Called by sync.ts after it loads to hook into store writes without a circular import. */
let _onWrite: ((localKey: string) => void) | null = null;
export function registerOnWrite(fn: (localKey: string) => void) { _onWrite = fn; }

/**
 * A tiny localStorage-backed store for small pieces of state (handover notes, log exercises).
 * Each write also schedules a debounced save to the server for signed-in students.
 */
export function createStore<T extends object>(key: string, empty: T) {
  let cache: T | null = null;
  const listeners = new Set<() => void>();

  function read(): T {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") return { ...empty, ...parsed };
      }
    } catch {
      // corrupted or blocked storage: start from the empty value
    }
    return empty;
  }

  const get = () => (cache ??= read());
  const subscribe = (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  };

  return {
    get,
    useStore: () => useSyncExternalStore(subscribe, get, () => empty),
    set(patch: Partial<T>) {
      cache = { ...get(), ...patch };
      try {
        window.localStorage.setItem(key, JSON.stringify(cache));
      } catch {
        // storage blocked: the value lasts until the page is closed
      }
      listeners.forEach((l) => l());
      // Schedule a debounced save to the server for signed-in students (lazy import to avoid circular deps)
      if (_onWrite) _onWrite(key);
    },
    /** Back to the empty value (reset, sign-out). Does not schedule a server save. */
    reset() {
      cache = empty;
      try {
        window.localStorage.removeItem(key);
      } catch {
        // storage blocked: the in-memory value is already cleared
      }
      listeners.forEach((l) => l());
    },
  };
}
