import type { Metadata } from "next";
import RoadmapExplorer from "@/components/roadmap/RoadmapExplorer";
import RoadmapFrame from "@/components/roadmap/RoadmapFrame";
import { PHASES } from "@/content/roadmap";

export const metadata: Metadata = {
  title: "Cybersecurity roadmap: SOC analyst and security engineer",
  description: "A free, step-by-step cybersecurity roadmap with two tracks, free resources and practice for every topic, from the basics to a first job.",
};

const topics = PHASES.flatMap((p) => p.sections.flatMap((s) => s.topics));

// Workspace page: the roadmap in content/roadmap.ts as a course explorer, with a ShiftLab practice link beside each topic that has one.
export default function RoadmapPage() {
  return (
    <RoadmapFrame
      active="/roadmap"
      title="Roadmap"
      description="From zero to your first security job. Pick a track, then work through one topic at a time."
    >
      <p className="rm-stats">
        <span>
          <b>{topics.length}</b> topics
        </span>
        <span>
          <b>{topics.filter((t) => t.practice).length}</b> with practice on ShiftLab
        </span>
        <span>
          <b>2</b> tracks
        </span>
        <span>
          <b>Free</b> resources only
        </span>
      </p>
      <RoadmapExplorer />
    </RoadmapFrame>
  );
}
