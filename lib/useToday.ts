"use client";

import { useSyncExternalStore } from "react";
import { localIso } from "./streak";

const noop = () => () => {};

/** Today in the visitor's time zone, as YYYY-MM-DD. Null on the server, so the server never guesses a day that the browser then disagrees with. */
export function useToday(): string | null {
  return useSyncExternalStore(noop, () => localIso(Date.now()), () => null);
}
