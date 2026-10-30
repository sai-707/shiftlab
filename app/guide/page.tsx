import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import FeedbackLink from "@/components/feedback/FeedbackLink";
import SiteShell from "@/components/site/SiteShell";
import { START_HREF } from "@/components/site/links";
import { GUIDE } from "@/content/guide";

export const metadata: Metadata = {
  title: "About ShiftLab",
  description: "What ShiftLab is, the problem it tackles, who it is for and why it was made. A plain-English guide, no experience needed.",
};

const LEVEL_COLOR = ["var(--color-low)", "var(--color-medium)", "var(--color-high)", "var(--color-critical)"];

// A public page for someone who has never heard of a SOC. The words live in content/guide.ts so the PDF says the same.
export default function GuidePage() {
  const g = GUIDE;
  return (
    <SiteShell>
      <header className="nav">
        <div className="wrap">
          <Link className="brand" href="/">
            <span className="mark" aria-hidden="true">
              <i />
            </span>
            ShiftLab
          </Link>
          <div className="right">
            <Link className="signin" href="/login">
              Sign in
            </Link>
            <Link className="btn primary sm" href={START_HREF}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="g">
        <section className="g-sec g-first">
          <div className="wrap">
            <p className="label">{g.eyebrow}</p>
            <h1>{g.title}</h1>
            <p className="g-lead">{g.lead}</p>
            <dl className="g-glance">
              {g.glance.map((x) => (
                <div key={x.k}>
                  <dt>{x.k}</dt>
                  <dd>{x.v}</dd>
                </div>
              ))}
            </dl>
            <div className="g-cta">
              <Link className="btn primary" href="/dashboard">
                Try it as a guest
              </Link>
              <a className="btn" href="/ShiftLab-guide.pdf" download>
                Download this guide (PDF)
              </a>
            </div>
          </div>
        </section>

        <section className="g-sec">
          <div className="wrap">
            <p className="label">{g.problem.eyebrow}</p>
            <h2>{g.problem.title}</h2>
            <p className="g-p">{g.problem.intro}</p>
            <div className="g-cards">
              {g.problem.cards.map((c) => (
                <div key={c.title} className="g-card">
                  <span className={c.plain ? "big plain" : "big"}>{c.big}</span>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  <span className="src">{c.source}</span>
                </div>
              ))}
            </div>
            <p className="g-caveat">{g.problem.caveat}</p>
          </div>
        </section>

        <section className="g-sec">
          <div className="wrap">
            <p className="label">{g.does.eyebrow}</p>
            <h2>{g.does.title}</h2>
            <p className="g-p">{g.does.intro}</p>
            <ol className="g-steps">
              {g.does.steps.map((s, i) => (
                <li key={s.title}>
                  <span className="n" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="g-sec">
          <div className="wrap">
            <p className="label">{g.example.eyebrow}</p>
            <h2>{g.example.title}</h2>
            <p className="g-p">{g.example.intro}</p>
            <div className="g-ex">
              <div className="head">
                <span className="tag">Example</span>
                <span>Alert: {g.example.alert}</span>
              </div>
              <ol>
                {g.example.rows.map((r) => (
                  <li key={r.k}>
                    <span className="k">{r.k}</span>
                    <p>
                      {r.call && <span className="call">{r.call}</span>} {r.text}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="g-sec">
          <div className="wrap">
            <p className="label">{g.benefits.eyebrow}</p>
            <h2>{g.benefits.title}</h2>
            <div className="g-cards">
              {g.benefits.items.map((b) => (
                <div key={b.title} className="g-card">
                  <h3>{b.title}</h3>
                  <p>{b.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="g-sec">
          <div className="wrap">
            <p className="label">{g.who.eyebrow}</p>
            <h2>{g.who.title}</h2>
            <div className="g-who">
              <div className="g-card">
                <h3>{g.who.forYouTitle}</h3>
                <ul>
                  {g.who.forYou.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="g-card not">
                <h3>{g.who.notTitle}</h3>
                <ul>
                  {g.who.notFor.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="g-levels">
              {g.levels.map((l, i) => (
                <div key={l.name} className="g-lvl" style={{ "--c": LEVEL_COLOR[i] } as CSSProperties}>
                  <h3>{l.name}</h3>
                  <p>{l.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="g-sec">
          <div className="wrap">
            <p className="label">{g.why.eyebrow}</p>
            <h2>{g.why.title}</h2>
            <div className="g-note">
              {g.why.paragraphs.map((t) => (
                <p key={t}>{t}</p>
              ))}
              <p className="sign">{g.why.author}</p>
            </div>
          </div>
        </section>

        <section className="g-sec">
          <div className="wrap">
            <p className="label">{g.start.eyebrow}</p>
            <h2>{g.start.title}</h2>
            <ol className="g-start">
              {g.start.steps.map((t, i) => (
                <li key={t}>
                  <span className="k">Step {i + 1}</span>
                  <p>{t}</p>
                </li>
              ))}
            </ol>
            <div className="g-cta">
              <Link className="btn primary" href="/dashboard">
                Start your first shift
              </Link>
              <FeedbackLink className="btn" />
            </div>
          </div>
        </section>

        <section className="g-sec">
          <div className="wrap">
            <p className="label">Questions people ask</p>
            <h2>Before you start</h2>
            <div className="g-faq">
              {g.faq.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
            <div className="g-sources">
              <p>
                <b>Sources</b>
              </p>
              {g.sources.map((s) => (
                <p key={s.n}>
                  {s.n}.{" "}
                  <a href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.text}
                  </a>
                </p>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <p>Fictional company. Nothing here is real. {g.footnote}</p>
          <p>
            <Link href="/">Home</Link> · <Link href="/privacy">Privacy</Link> · ShiftLab
          </p>
        </div>
      </footer>
    </SiteShell>
  );
}
