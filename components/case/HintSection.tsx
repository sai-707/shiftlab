"use client";

import { useState, type ReactNode } from "react";
import { HINTS, HINT_STEPS } from "@/content/hints";
import { hintsUsed } from "@/lib/hintsUsed";

/**
 * The "Look at the evidence" card with a free Hint toggle in its header.
 * Opening it shows hint 1; "Show next hint" reveals the next one. The count is kept per alert for the feedback screen.
 */
export default function HintSection({ alertId, n, title, children }: { alertId: string; n: number; title: string; children: ReactNode }) {
  const hints = HINTS[alertId];
  const used = hintsUsed.useStore().used[alertId] ?? 0;
  const [open, setOpen] = useState(false);

  const shown = Math.min(Math.max(used, 1), 3);
  const save = (count: number) => hintsUsed.set({ used: { ...hintsUsed.get().used, [alertId]: count } });
  const toggle = () => {
    if (!open && used === 0) save(1);
    setOpen(!open);
  };
  const panelId = `hint-panel-${alertId}`;

  return (
    <section className="rounded-2xl border border-line bg-panel shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-2">
        <h2 className="text-[15px] font-semibold">
          <span className="mr-2 font-mono text-accent">{n}</span>
          {title}
        </h2>
        {hints && (
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls={panelId}
            className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold ${
              open ? "border-medium bg-medium/10 text-medium" : "border-line bg-raised hover:border-medium"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
              <path d="M9 18h6" />
              <path d="M10 22h4" />
            </svg>
            <span>{open ? "Hide hint" : "Hint"}</span>
            {used > 0 && <span className="rounded-full bg-medium/15 px-2 text-xs text-medium">{used}/3</span>}
          </button>
        )}
      </div>

      {hints && open && (
        <div id={panelId} className="space-y-3 border-b border-medium/30 bg-medium/5 px-5 py-4">
          <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wide text-medium">
            <span>
              Hint {shown} · {HINT_STEPS[shown - 1]}
            </span>
            <span className="flex gap-1.5" aria-hidden="true">
              {[1, 2, 3].map((i) => (
                <span key={i} className={`h-2 w-2 rounded-full ${i <= shown ? "bg-medium" : "bg-medium/25"}`} />
              ))}
            </span>
          </p>
          <p aria-live="polite" className="text-[15px] leading-relaxed">
            {hints[shown - 1]}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm text-muted">Hints are free. They never tell you the answer.</span>
            <button
              type="button"
              onClick={() => save(shown + 1)}
              disabled={shown >= 3}
              className="min-h-11 rounded-lg border border-medium px-4 text-sm font-semibold text-medium disabled:cursor-default disabled:border-line disabled:text-muted"
            >
              {shown >= 3 ? "No more hints" : "Show next hint"}
            </button>
          </div>
        </div>
      )}

      <div className="p-5">{children}</div>
    </section>
  );
}
