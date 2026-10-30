"use client";

import { useEffect } from "react";
import { hydrate } from "@/lib/sync";

/** Kicks off the one-time hydration that merges remote progress into local stores. */
export function ProgressSyncClient({ userId }: { userId: string }) {
  useEffect(() => {
    hydrate(userId);
  }, [userId]);
  return null;
}
