"use client";

import { useEffect, useSyncExternalStore } from "react";
import { myCertificates } from "@/app/certificate-actions";
import type { Cert } from "./certificates";

// The signed-in student's certificates, loaded once and shared by the dashboard panel and the earned window.
// undefined = still loading, null = a guest (no account), otherwise the list. A guest result is not kept, so signing in and coming back loads again.
type State = { certs: Cert[]; name: string } | null | undefined;

let state: State;
let inflight: Promise<State> | null = null;
const listeners = new Set<() => void>();
const set = (s: State) => {
  state = s;
  listeners.forEach((l) => l());
};

export function loadCertificates(force = false): Promise<State> {
  if (!force && state) return Promise.resolve(state);
  inflight ??= myCertificates()
    .then((r) => (set(r), r))
    .catch(() => (set(null), null as State))
    .finally(() => {
      inflight = null;
    });
  return inflight;
}

export function addCertificate(c: Cert) {
  if (!state) return;
  set({ ...state, certs: [...state.certs.filter((x) => x.kind !== c.kind), c] });
}

export function useCertificates(): State {
  const s = useSyncExternalStore(
    (l) => (listeners.add(l), () => void listeners.delete(l)),
    () => state,
    () => undefined,
  );
  useEffect(() => {
    void loadCertificates(s === null);
    // Load on mount only; a guest result is retried on the next mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return s;
}
