import type { Metadata } from "next";
import RoadmapExplorer from "@/components/roadmap/RoadmapExplorer";
import RoadmapFrame from "@/components/roadmap/RoadmapFrame";

export const metadata: Metadata = {
  title: "Cybersecurity roadmap: SOC analyst and security engineer",
  description: "A free, step-by-step cybersecurity roadmap with two tracks, free resources and practice for every topic, from the basics to a first job.",
};

// Workspace page: the roadmap in content/roadmap.ts as a phase-by-phase timeline whose topic cards open in place.
export default function RoadmapPage() {
  return (
    <RoadmapFrame
      active="/roadmap"
      title="Roadmap"
      description="From zero to your first security job. Pick a track, then work through one topic at a time."
    >
      <RoadmapExplorer />
    </RoadmapFrame>
  );
}
