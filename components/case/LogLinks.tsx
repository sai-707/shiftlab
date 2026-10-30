"use client";

import Link from "next/link";
import { LOG_LINKS } from "@/content/logLinks";
import { LOG_SOURCE } from "@/lib/sourceRules";
import { markOpened } from "@/lib/sources";

export default function LogLinks({ alertId, track = false }: { alertId: string; track?: boolean }) {
  const links = LOG_LINKS[alertId];
  if (!links) return null;

  return (
    <section className="rounded-2xl border border-line bg-panel p-5">
      <h2 className="font-semibold">Look in the logs</h2>
      <p className="mt-1 text-sm text-muted">
        Logs are the record of what computers did. Pick a question and ShiftLab runs the search for you.
      </p>
      <ul className="mt-3 space-y-2">
        {links.map((l) => (
          <li key={l.q}>
            <Link
              href={`/logs?q=${encodeURIComponent(l.q)}&from=${alertId}`}
              onClick={track ? () => markOpened(alertId, LOG_SOURCE) : undefined}
              className="block rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm hover:border-accent"
            >
              <span className="flex items-start justify-between gap-3">
                <span>{l.ask}</span>
                <span aria-hidden="true" className="text-accent">→</span>
              </span>
              <span className="mt-0.5 block font-mono text-xs text-muted">{l.q}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
