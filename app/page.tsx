import { BrandMark } from "@/components/ui/BrandMark";
import Link from "next/link";
import type { CSSProperties } from "react";
import AlertDemo from "@/components/site/AlertDemo";
import DottedWordmark from "@/components/site/DottedWordmark";
import SiteShell from "@/components/site/SiteShell";
import { START_HREF, GUEST_HREF } from "@/components/site/links";
import FeedbackLink from "@/components/feedback/FeedbackLink";

// Landing page. Public, outside the (app) layout. Do not print an alert count here: the number grows.
// The tagline is the h1 below. Alternatives that were considered: "Be the analyst on shift.", "Train for the night shift.",
// "Where beginners become analysts.", "Every alert is a lesson.", "Make your first call.", "Your way into the SOC."

const STEPS = [
  { n: "01", title: "Triage", text: "Pick what matters." },
  { n: "02", title: "Investigate", text: "Follow the evidence." },
  { n: "03", title: "Report", text: "Hand it off clearly." },
];

const HELPS = [
  "Decide if an alert is a real attack or a false alarm",
  "Check IPs, links and files like an analyst",
  "Write the report, then get scored and coached",
  "Catch where an AI summary gets it wrong",
];

const LEVELS = [
  { name: "Beginner", color: "var(--color-low)" },
  { name: "Intermediate", color: "var(--color-medium)" },
  { name: "Hard", color: "var(--color-high)" },
  { name: "AI era", color: "var(--color-critical)" },
];

const TOOLS = ["Intel check", "Log search", "Phishing mailbox", "Shift mode", "AI review"];

function Arrow() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

const delay = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

export default function Home() {
  return (
    <SiteShell>
      <header className="nav">
        <div className="wrap">
          <Link className="brand" href="/">
            <BrandMark className="h-[26px] w-[26px]" />
            ShiftLab
          </Link>
          <div className="right">
            <Link className="signin how" href="/guide">
              About
            </Link>
            <Link className="signin" href="/login">
              Sign in
            </Link>
            <Link className="btn primary sm" href={START_HREF}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="hero">
          <DottedWordmark scale={0.72} />
          <h1 className="tag">Your first shift starts here.</h1>
          <div className="cta">
            <Link className="btn primary" href={GUEST_HREF}>
              Try it as a guest
              <Arrow />
            </Link>
            <Link className="btn" href={START_HREF}>
              Create a free account
            </Link>
          </div>
          <p className="cta-note">No account needed. Your first alert takes about ten minutes.</p>
        </section>

        <section className="s">
          <div className="wrap">
            <ol className="steps">
              {STEPS.map((s, i) => (
                <li key={s.n} className="rv" style={i ? delay(i / 10) : undefined}>
                  <span className="n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="s">
          <div className="wrap try">
            <div className="rv">
              <p className="label">Who it is for</p>
              <h2 className="h2s">Beginners aiming for a SOC job.</h2>
              <p className="nudge">Students and career switchers. No experience needed.</p>
              <ul className="helps" aria-label="What ShiftLab helps you do">
                {HELPS.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
            <div className="rv" style={delay(0.12)}>
              <p className="label">Try one</p>
              <AlertDemo />
            </div>
          </div>
        </section>

        <section className="s">
          <div className="wrap">
            <div className="rv">
              <p className="label">Levels</p>
              <h2>Harder as you go.</h2>
            </div>
            <div className="lvls">
              {LEVELS.map((l, i) => (
                <div key={l.name} className="lv rv" style={{ "--c": l.color, ...(i ? delay(i * 0.08) : {}) } as CSSProperties}>
                  <div className="bar" role="img" aria-label={`Difficulty ${i + 1} of ${LEVELS.length}`}>
                    {LEVELS.map((_, h) => (
                      <i key={h} className={h <= i ? "on" : undefined} style={{ "--h": h + 1 } as CSSProperties} />
                    ))}
                  </div>
                  <h3>
                    <i />
                    {l.name}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="marq rv" role="img" aria-label={`Tools: ${TOOLS.join(", ")}`}>
          <div className="track" aria-hidden="true">
            {[...TOOLS, ...TOOLS].map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </div>

        <section className="s final">
          <div className="wrap rv">
            <h2>Clock in.</h2>
            <div className="cta">
              <Link className="btn primary" href={GUEST_HREF}>
                Try it as a guest
                <Arrow />
              </Link>
              <Link className="btn" href={START_HREF}>
                Create a free account
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="foot">
        <div className="wrap">
          <p>Fictional company. Nothing here is real. Visits are counted anonymously, with no name or email.</p>
          <p>
            <Link href="/guide">About</Link> · <Link href="/privacy">Privacy</Link> ·{" "}
            <FeedbackLink className="foot-link" />{" "}
            · ShiftLab
          </p>
        </div>
      </footer>
    </SiteShell>
  );
}
