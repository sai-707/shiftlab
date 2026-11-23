import type { CSSProperties } from "react";

/** A ring that shows how far the student is towards the next rank. The fill animation lives in profile.css. */
export default function RankRing({ pct }: { pct: number }) {
  const p = Math.min(100, Math.max(0, Math.round(pct)));
  const offset = 289 * (1 - p / 100);
  return (
    <div className="relative h-28 w-28 shrink-0" role="img" aria-label={`${p}% of the way to the next rank`}>
      <svg viewBox="0 0 112 112" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="56" cy="56" r="46" fill="none" stroke="var(--color-line)" strokeWidth="8" />
        <circle className="pf-ring" cx="56" cy="56" r="46" fill="none" stroke="var(--color-accent)" strokeWidth="8" strokeLinecap="round" style={{ "--pf-off": offset } as CSSProperties} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className="font-display text-2xl font-bold tabular-nums">{p}%</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">to next</span>
      </div>
    </div>
  );
}
