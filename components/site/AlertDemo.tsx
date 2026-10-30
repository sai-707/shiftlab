"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { START_HREF } from "./links";

const CIRC = 2 * Math.PI * 50;
// Same numbers as the app's Intel check for 203.0.113.58 (19 of 24 vendors flag it), so the demo never disagrees with the product.
const FLAGGED = 19;
const VENDORS = 24;

type Call = "tp" | "fp";

const LOG: { t: string; text: string; cls?: string }[] = [
  { t: "02:13:58", text: "Failed password for d.okafor" },
  { t: "02:13:59", text: "Failed password for d.okafor" },
  { t: "02:14:00", text: "… 38 more failures in 41 seconds", cls: "gap" },
  { t: "02:14:41", text: "Accepted password for d.okafor", cls: "ok" },
];

// One small playable alert for the landing page: tap the IP for the intel verdict, then make the call.
export default function AlertDemo() {
  const [checked, setChecked] = useState(false);
  const [pick, setPick] = useState<Call | null>(null);
  const [done, setDone] = useState(false);

  const answer = (v: Call) => {
    setPick(v);
    setDone(true);
  };
  const good = pick === "tp";

  return (
    <article className="alert" aria-label="Sample alert you can try">
      <div className="a-head">
        <span className="sev">High</span>
        <span className="id">SL-0412</span>
      </div>
      <h3 className="a-title">Many failed logins, then a success</h3>
      <dl className="facts">
        <dt>Account</dt>
        <dd>d.okafor</dd>
        <dt>Source</dt>
        <dd>
          <button type="button" className="ip" aria-expanded={checked} aria-controls="demo-intel" onClick={() => setChecked((c) => !c)}>
            203.0.113.58
          </button>
          {!checked && (
            <span className="tap" aria-hidden="true">
              tap
            </span>
          )}
        </dd>
      </dl>
      <div className="log" role="log" aria-label="Authentication log">
        {LOG.map((l, i) => (
          <div key={l.t} className={l.cls} style={{ "--i": i } as CSSProperties}>
            <span className="t">{l.t}</span>
            {l.text}
            {l.cls === "ok" && <span className="caret" />}
          </div>
        ))}
      </div>
      <div className={checked ? "intel open" : "intel"} id="demo-intel" inert={!checked}>
        <div>
          <div className="intel-in">
            <svg className="ring" viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-raised)" strokeWidth="12" />
              <circle
                className="arc"
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--color-critical)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${checked ? ((CIRC * FLAGGED) / VENDORS).toFixed(1) : 0} ${CIRC.toFixed(1)}`}
              />
            </svg>
            <div>
              <b>Dangerous</b>
              <br />
              <span style={{ color: "var(--color-muted)" }}>
                {FLAGGED} of {VENDORS} vendors flag it.
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="ask">
        <p>{!done ? "Your call?" : good ? "Nice work." : "Here is how it reads."}</p>
        <div className="choices">
          <button type="button" className={done ? "choice right" : "choice"} disabled={done} onClick={() => answer("tp")}>
            True positive
          </button>
          <button type="button" className={done && !good ? "choice wrong" : "choice"} disabled={done} onClick={() => answer("fp")}>
            False positive
          </button>
        </div>
      </div>
      <div className={done ? "fb open" : "fb"} aria-live="polite" inert={!done}>
        <div>
          <div className={good ? "fb-in good" : "fb-in bad"}>
            <b>{good ? "Correct. Escalate it." : "Not this time. Escalate it."}</b>
            <p>
              Forty guesses, then a way in, from an address {FLAGGED} of {VENDORS} vendors flag.
            </p>
            <div className="row">
              <Link className="btn primary sm" href={START_HREF}>
                Try a full case
              </Link>
              <button type="button" className="link" onClick={() => setDone(false)}>
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
