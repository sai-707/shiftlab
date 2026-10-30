import { REAL_WORLD } from "@/content/realworld";

/** Links a finished case to a real public incident. Shown after the alert is closed. */
export default function RealWorld({ alertId }: { alertId: string }) {
  const r = Object.hasOwn(REAL_WORLD, alertId) ? REAL_WORLD[alertId] : null;
  if (!r) return null;
  return (
    <section className="rounded-2xl border border-line bg-panel p-5">
      <p className="text-xs uppercase tracking-wide text-accent">In the real world</p>
      <h3 className="mt-1 font-semibold">
        {r.incident} <span className="font-normal text-muted">({r.year})</span>
      </h3>
      <p className="mt-2 text-sm leading-relaxed">{r.summary}</p>
      <p className="mt-2 text-sm">
        <span className="text-muted">What it teaches: </span>
        {r.lesson}
      </p>
      <p className="mt-2 text-sm">
        <span className="text-muted">How this alert differs: </span>
        {r.differs}
      </p>
      <ul className="mt-3 space-y-1 text-sm">
        {r.sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noreferrer noopener" className="text-accent hover:underline">
              {s.title} ↗
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
