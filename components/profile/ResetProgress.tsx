"use client";

import { syncReset } from "@/lib/sync";

/** Clears cases and every practice score, both locally and on the server. */
export default function ResetProgress() {
  return (
    <button
      type="button"
      onClick={() => {
        if (window.confirm("Reset all progress? This cannot be undone.")) syncReset();
      }}
      className="rounded-lg border border-missed/40 px-4 py-2 text-sm font-medium text-missed hover:bg-missed/10"
    >
      Reset progress
    </button>
  );
}
