import type { Metadata } from "next";
import RoadmapFrame from "@/components/roadmap/RoadmapFrame";
import { ExtLink, WhoTag } from "@/components/roadmap/bits";
import { TOOLS } from "@/content/roadmap-extra";

export const metadata: Metadata = {
  title: "Security tools to learn, in order",
  description: "Free security tools in the order to learn them, with why each one was picked, where to learn it and where to practise it.",
};

export default function ToolsPage() {
  return (
    <RoadmapFrame
      active="/roadmap/tools"
      title="Tools to learn"
      description="Every tool is free. Learn one stage at a time. For each tool you get the reason it was picked, one place to learn it and one place to practise it."
    >
      {TOOLS.map((st) => (
        <section className="rm-sec" key={st.stage}>
            <div className="rm-stage">
              <span className="n" aria-hidden="true">
                {st.stage}
              </span>
              <div>
                <h2 className="rm-h2">{st.title}</h2>
                <p>{st.sub}</p>
              </div>
            </div>
            <ul className="rm-tools2">
              {st.tools.map((t) => (
                <li key={t.n}>
                  <div className="name">
                    <h3>{t.n}</h3>
                    <WhoTag who={t.who} />
                    <span className="time">{t.time}</span>
                  </div>
                  <p className="why">{t.why}</p>
                  <div className="go">
                    <span>Learn it</span>
                    <ExtLink href={t.lu}>{t.ln}</ExtLink>
                  </div>
                  <div className="go">
                    <span>Practise it</span>
                    <ExtLink href={t.pu}>{t.pn}</ExtLink>
                  </div>
                </li>
              ))}
            </ul>
          </section>
      ))}
    </RoadmapFrame>
  );
}
