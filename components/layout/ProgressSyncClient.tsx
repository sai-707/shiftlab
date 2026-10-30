"use client";

import { useEffect } from "react";
import { setGuestMode } from "@/lib/progress";
import { hydrate } from "@/lib/sync";

/** Tells the progress layer whether this is a guest, and for a signed-in student kicks off the one-time merge of remote progress. */
export function ProgressSyncClient({ userId }: { userId: string | null }) {
  useEffect(() => {
    setGuestMode(userId === null);
    if (userId) hydrate(userId);
  }, [userId]);
  return null;
}
