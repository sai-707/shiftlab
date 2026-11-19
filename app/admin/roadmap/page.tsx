import { connection } from "next/server";
import { Suspense } from "react";
import RoadmapAdminView from "@/components/admin/RoadmapAdminView";
import { PHASES } from "@/content/roadmap";
import { countTopics, type TopicInfo } from "@/lib/adminRoadmap";
import { getRoadmapStats } from "@/lib/adminRoadmapData";

export const metadata = { title: "Admin · Roadmap" };

// The roadmap in learning order. The SOC track's essential topics are the ones whose low numbers mean a student is stuck.
const TOPICS: TopicInfo[] = PHASES.flatMap((p, pi) => p.sections.flatMap((s) => s.topics.map((t) => ({ slug: t.slug, name: t.name, phase: pi + 1, essential: t.soc === "E" }))));

async function Content() {
  await connection(); // live numbers; see lib/supabase/server.ts
  const res = await getRoadmapStats();
  if (!res.ok) {
    return (
      <p role="alert" className="rounded-xl border border-missed/40 bg-missed/5 p-4 text-sm">
        The roadmap numbers could not be loaded (code {res.code}). Did you run <code className="font-mono text-xs">supabase/migrations/0012_roadmap_progress.sql</code> in the Supabase SQL Editor?
      </p>
    );
  }
  return <RoadmapAdminView stats={res.data} rows={countTopics(res.data, TOPICS)} />;
}

export default function RoadmapAdminPage() {
  return (
    <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
      <Content />
    </Suspense>
  );
}
