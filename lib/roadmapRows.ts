import { PHASES, type Priority, type Topic } from "@/content/roadmap";

export type Track = "soc" | "eng";
export type Row = { topic: Topic; pi: number; section: string; code: string };

export const prio = (t: Topic, track: Track): Priority => (track === "soc" ? t.soc : t.eng);

/** The topics of one track in learning order, with their phase number and code such as 2.3. */
export function rowsFor(track: Track): Row[] {
  const out: Row[] = [];
  PHASES.forEach((p, pi) => {
    let k = 0;
    for (const s of p.sections) for (const t of s.topics) if (prio(t, track) !== "-") out.push({ topic: t, pi, section: s.name, code: `${pi + 1}.${++k}` });
  });
  return out;
}

/** Names only, so a page that just needs "next topic" does not ship the whole roadmap to the browser. */
export type Outline = Record<Track, { slug: string; name: string }[]>;
export const outline = (): Outline => ({
  soc: rowsFor("soc").map((r) => ({ slug: r.topic.slug, name: r.topic.name })),
  eng: rowsFor("eng").map((r) => ({ slug: r.topic.slug, name: r.topic.name })),
});
