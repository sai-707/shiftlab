import type { Metadata } from "next";
import Link from "next/link";
import RoadmapExplorer from "@/components/roadmap/RoadmapExplorer";
import RoadmapFrame from "@/components/roadmap/RoadmapFrame";
import { GUEST_HREF } from "@/components/site/links";
import { PHASES } from "@/content/roadmap";

export const metadata: Metadata = {
  title: "Cybersecurity roadmap: SOC analyst and security engineer",
  description: "A free, step-by-step cybersecurity roadmap with two tracks, free resources and practice for every topic, from the basics to a first job.",
};

const topics = PHASES.flatMap((p) => p.sections.flatMap((s) => s.topics));

// Public page: the roadmap in content/roadmap.ts as a course explorer, with a ShiftLab practice link beside each topic that has one.
export default function RoadmapPage() {
  return (
    <RoadmapFrame
      active="/roadmap"
      label="Cybersecurity roadmap"
      title="From zero to your first security job."
      lead="Pick a track, then work through one topic at a time. Every topic lists what to learn, a free place to start, and something to practise."
    >
      <section className="g-sec">
        <div className="wrap rm-wide">
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
        </div>
      </section>

      <section className="g-sec">
        <div className="wrap rm-wide">
          <p className="label">Ready to practise</p>
          <h2>Learn it, then work it on a shift.</h2>
          <div className="g-cta">
            <Link className="btn primary" href={GUEST_HREF}>
              Try a free alert
            </Link>
            <Link className="btn" href="/roadmap/projects">
              See the projects to build
            </Link>
          </div>
        </div>
      </section>
    </RoadmapFrame>
  );
}
