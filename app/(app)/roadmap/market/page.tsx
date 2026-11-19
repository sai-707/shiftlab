import type { Metadata } from "next";
import RoadmapFrame from "@/components/roadmap/RoadmapFrame";
import { ExtLink } from "@/components/roadmap/bits";
import { CHECKED } from "@/content/roadmap";
import { MARKET } from "@/content/roadmap-extra";

export const metadata: Metadata = {
  title: "Cybersecurity job market and the two tracks",
  description: "What 2026 job-posting data says about SOC analyst and security engineer roles, and what to do about it.",
};

const TRACK_KEY = ["soc", "eng"] as const;

export default function MarketPage() {
  return (
    <RoadmapFrame
      active="/roadmap/market"
      title="Job market"
      description="Why this roadmap has two tracks. Job-posting data from 2026 shows engineer roles outnumber SOC analyst roles, and junior postings are scarce. So you start where ShiftLab trains you, and add engineering skills early."
    >
      <section className="rm-sec">
          <p className="rm-label">Four numbers to know</p>
          <ul className="rm-stat-grid">
            {MARKET.stats.map((s) => (
              <li key={s.big}>
                <b>{s.big}</b>
                <p>{s.label}</p>
                <small>{s.src}</small>
              </li>
            ))}
          </ul>
        </section>

      <section className="rm-sec">
          <p className="rm-label">What I would do with that</p>
          <h2 className="rm-h2">Four steps, in this order.</h2>
          <ol className="rm-steps2">
            {MARKET.steps.map((s, i) => (
              <li key={s.t}>
                <span className="n" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3>{s.t}</h3>
                  <p>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

      <section className="rm-sec">
          <p className="rm-label">Pick your track</p>
          <h2 className="rm-h2">You can switch later.</h2>
          <div className="rm-two">
            {MARKET.tracks.map((k, i) => (
              <article key={k.n} data-who={TRACK_KEY[i]}>
                <p className="tag">{k.tag}</p>
                <h3>{k.n}</h3>
                <p className="pick">{k.pick}</p>
                <dl>
                  <dt>Roles</dt>
                  <dd>{k.roles}</dd>
                  <dt>Path</dt>
                  <dd>{k.phases}</dd>
                  <dt>First tools</dt>
                  <dd>{k.tools}</dd>
                  <dt>On ShiftLab</dt>
                  <dd>{k.shiftlab}</dd>
                </dl>
              </article>
            ))}
          </div>
        </section>

      <section className="rm-sec">
          <div className="rm-note">
            <p className="rm-label">How to read these numbers</p>
            <ul>
              {MARKET.caveats.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
          <p className="rm-label rm-gap">Sources</p>
          <ul className="rm-src">
            {MARKET.sources.map((s) => (
              <li key={s.u}>
                <ExtLink href={s.u}>{s.n}</ExtLink>
              </li>
            ))}
          </ul>
          <p className="rm-credit">Figures read on {CHECKED}. The opinions marked as mine are judgment, not data.</p>
        </section>
    </RoadmapFrame>
  );
}
