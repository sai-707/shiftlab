import type { ReactNode } from "react";

/** The heading used by every part of the profile card: a small mono label over the title, with an optional note on the right. */
export default function SectionHead({ eyebrow, title, id, aside }: { eyebrow: string; title: string; id?: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">{eyebrow}</p>
        <h2 id={id} className="font-display text-base font-semibold tracking-tight">
          {title}
        </h2>
      </div>
      {aside}
    </div>
  );
}
