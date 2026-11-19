// Study time of a topic, read from its "2 to 3 weeks" style label. Anything else ("Ongoing") has no fixed length.
export type Weeks = { lo: number; hi: number };

export function weeksOf(label: string | undefined): Weeks | null {
  const m = /^(\d+)(?: to (\d+))? weeks?$/.exec(label ?? "");
  return m ? { lo: +m[1], hi: +(m[2] ?? m[1]) } : null;
}

/** Total of a list of topics, so a phase headline can never disagree with the topics inside it. */
export function sumWeeks(times: (string | undefined)[]): Weeks & { open: number } {
  const t = { lo: 0, hi: 0, open: 0 };
  for (const x of times) {
    const w = weeksOf(x);
    if (w) {
      t.lo += w.lo;
      t.hi += w.hi;
    } else t.open++;
  }
  return t;
}

/** The topic times are written for this pace. A student who studies more or less per week scales them. */
export const BASE_HOURS = 10;

/** "about 6 to 9 months", or weeks while it is short. */
export function spanLabel(t: Weeks & { open: number }, hours = BASE_HOURS) {
  if (t.hi === 0) return "Ongoing";
  const k = BASE_HOURS / hours;
  const lo = Math.max(1, Math.round(t.lo * k));
  const hi = Math.max(lo, Math.round(t.hi * k));
  const range = (a: number, b: number, unit: string) => `about ${a === b ? a : `${a} to ${b}`} ${a === b && a === 1 ? unit.replace(/s$/, "") : unit}`;
  if (hi >= 20) {
    const m = (w: number) => Math.max(1, Math.round(w / 4.345));
    return range(m(lo), m(hi), "months");
  }
  return range(lo, hi, "weeks");
}
