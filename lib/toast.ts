"use client";

import { useSyncExternalStore } from "react";

export type Toast = { id: number; text: string; leaving?: boolean };

const EMPTY: Toast[] = [];
let list: Toast[] = EMPTY;
let next = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

/** Shows a small confirmation in the corner for a couple of seconds. */
export function toast(text: string) {
  const id = ++next;
  list = [...list, { id, text }].slice(-4);
  emit();
  setTimeout(() => {
    list = list.map((t) => (t.id === id ? { ...t, leaving: true } : t));
    emit();
    setTimeout(() => {
      list = list.filter((t) => t.id !== id);
      emit();
    }, 300);
  }, 2600);
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const useToasts = () =>
  useSyncExternalStore(
    subscribe,
    () => list,
    () => EMPTY,
  );
