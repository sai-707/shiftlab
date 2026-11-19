import type { Metadata } from "next";
import RoadmapFrame from "@/components/roadmap/RoadmapFrame";
import { ExtLink, WhoTag } from "@/components/roadmap/bits";
import { PROJECTS } from "@/content/roadmap-extra";

export const metadata: Metadata = {
  title: "Cybersecurity projects to build",
  description: "Eleven portfolio projects for a SOC analyst or security engineer, in build order, each with what to build, the tools and what to publish.",
};

const LEVELS = [
  { lvl: "Starter", sub: "Weekend projects. Start here." },
  { lvl: "Core", sub: "The projects most hiring managers want to see." },
  { lvl: "Stretch", sub: "Harder. Pick the ones that match your track." },
] as const;

export default function ProjectsPage() {
  let n = 0;
  return (
    <RoadmapFrame
      active="/roadmap/projects"
      label="Projects"
      title="Eleven projects to build, in order."
      lead="Do them top to bottom. Each one becomes a GitHub repo with a README that says the problem, the steps, a screenshot and what you learned. With so few junior roles, a good repo says more than a certificate."
    >
      {LEVELS.map((g) => (
        <section className="g-sec" key={g.lvl} data-level={g.lvl}>
          <div className="wrap rm-wide">
            <p className="label">{g.lvl}</p>
            <h2>{g.sub}</h2>
            <ol className="rm-projects" start={n + 1}>
              {PROJECTS.filter((p) => p.lvl === g.lvl).map((p) => {
                n++;
                return (
                  <li key={p.n}>
                    <span className="n" aria-hidden="true">
                      {n}
                    </span>
                    <div className="body">
                      <div className="head">
                        <h3>{p.n}</h3>
                        <WhoTag who={p.who} />
                        <span className="hrs">{p.hrs}</span>
                      </div>
                      <dl>
                        <dt>Build</dt>
                        <dd>{p.build}</dd>
                        <dt>Tools</dt>
                        <dd>{p.tools}</dd>
                        <dt>Ship</dt>
                        <dd>{p.ship}</dd>
                      </dl>
                    </div>
                    <ExtLink className="btn" href={p.u}>
                      {p.un}
                    </ExtLink>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      ))}
    </RoadmapFrame>
  );
}
