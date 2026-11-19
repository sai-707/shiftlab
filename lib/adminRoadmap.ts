// What the admin_roadmap() database function returns: counts only, never one student's list.
export type RoadmapStats = {
  saved: number; // accounts with any roadmap progress saved
  started: number; // accounts that finished at least one topic
  tracks: { soc?: number; eng?: number };
  topics: Record<string, number>; // topic slug -> accounts that marked it done
};

export type TopicInfo = { slug: string; name: string; phase: number; essential: boolean };
export type TopicCount = TopicInfo & { done: number };

/** The roadmap's topics in learning order, each with how many students finished it. Slugs the roadmap no longer has are ignored. */
export const countTopics = (stats: RoadmapStats, topics: TopicInfo[]): TopicCount[] =>
  topics.map((t) => ({ ...t, done: stats.topics[t.slug] ?? 0 }));

/** The essential topics that fewest started students finished, and the ones most finished. "Essential" so an optional topic nobody opens is not a stall. */
export function stallPoints(rows: TopicCount[], n = 5): { least: TopicCount[]; most: TopicCount[] } {
  const byDone = [...rows].sort((a, b) => a.done - b.done);
  return { least: byDone.filter((r) => r.essential).slice(0, n), most: byDone.reverse().filter((r) => r.done > 0).slice(0, n) };
}
