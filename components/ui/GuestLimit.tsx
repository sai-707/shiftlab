"use client";

import Link from "next/link";
import { GUEST_LIMIT, useGuestLimit } from "@/lib/progress";

/** Shown to a guest who has closed GUEST_LIMIT alerts. Renders nothing for everyone else. */
export default function GuestLimit() {
  if (!useGuestLimit()) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent/10 px-5 py-4">
      <p className="text-sm">
        You have closed {GUEST_LIMIT} alerts as a guest. Create a free account to keep going. Your progress comes with you.
      </p>
      <div className="flex gap-2">
        <Link href="/signup" className="btn-shine press rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas">
          Create account
        </Link>
        <Link href="/login" className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent">
          Sign in
        </Link>
      </div>
    </div>
  );
}
