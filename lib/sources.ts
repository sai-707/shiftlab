"use client";

import { createStore } from "./localStore";

// shortcut: browser-only like the other stores, moves to the database with accounts.
export const sourcesStore = createStore("shiftlab.sources.v1", { opened: {} as Record<string, string[]> });

export function markOpened(alertId: string, source: string) {
  const cur = sourcesStore.get().opened;
  const list = cur[alertId] ?? [];
  if (!list.includes(source)) sourcesStore.set({ opened: { ...cur, [alertId]: [...list, source] } });
}

export function useOpened(alertId: string): string[] {
  return sourcesStore.useStore().opened[alertId] ?? [];
}
