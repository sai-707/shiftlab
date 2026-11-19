import type { Metadata } from "next";
import RoadmapFrame from "@/components/roadmap/RoadmapFrame";
import { ExtLink, WhoTag } from "@/components/roadmap/bits";
import { CHECKED } from "@/content/roadmap";
import { CERTS } from "@/content/roadmap-extra";

export const metadata: Metadata = {
  title: "Free cybersecurity certificates, in order",
  description: "Free cybersecurity courses and certificates with links to the issuer's own page, in the order to do them, plus which ones are not free.",
};

export default function CertificatesPage() {
  return (
    <RoadmapFrame
      active="/roadmap/certificates"
      title="Free certificates"
      description={`Each one was checked on the issuer's own page on ${CHECKED}. Rules change, so confirm the cost on the page before you start.`}
    >
      <section className="rm-sec">
          <p className="rm-label">Step by step · all free to start</p>
          <ol className="rm-ladder">
            {CERTS.free.map((c, i) => (
              <li key={c.n}>
                <span className="n" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="body">
                  <h3>{c.n}</h3>
                  <p className="by">{c.by}</p>
                  <p>{c.get}</p>
                  <p className="note">{c.note}</p>
                </div>
                <div className="meta">
                  <span className="when">{c.when}</span>
                  <WhoTag who={c.who} />
                </div>
                <ExtLink className="rm-btn primary" href={c.u}>
                  Open page
                </ExtLink>
              </li>
            ))}
          </ol>
        </section>

      <section className="rm-sec">
          <p className="rm-label">Free to learn, paid to certify</p>
          <h2 className="rm-h2">Use the free training. Pay for the exam only when you are ready.</h2>
          <ul className="rm-plain">
            {CERTS.learnFree.map((c) => (
              <li key={c.n}>
                <div className="body">
                  <h3>{c.n}</h3>
                  <p className="by">{c.by}</p>
                  <p>{c.get}</p>
                </div>
                <WhoTag who={c.who} />
                <ExtLink className="rm-btn" href={c.u}>
                  Open page
                </ExtLink>
              </li>
            ))}
          </ul>
        </section>

      <section className="rm-sec">
          <div className="rm-note bad">
            <p className="rm-label">Not free any more</p>
            <h3>{CERTS.notFree.n}</h3>
            <p>{CERTS.notFree.get}</p>
            <p>
              <ExtLink href={CERTS.notFree.u}>ISC2 announcement</ExtLink>
            </p>
          </div>
        </section>

      <section className="rm-sec">
          <p className="rm-label">Worth saving for · my picks, paid</p>
          <ul className="rm-plain">
            {CERTS.paid.map((c) => (
              <li key={c.n}>
                <div className="body">
                  <h3>{c.n}</h3>
                  <p>{c.why}</p>
                </div>
                <ExtLink className="rm-btn" href={c.u}>
                  Open page
                </ExtLink>
              </li>
            ))}
          </ul>
          <div className="rm-note rm-gap">
            <p className="rm-label">An honest note</p>
            <p>{CERTS.honest}</p>
          </div>
        </section>
    </RoadmapFrame>
  );
}
