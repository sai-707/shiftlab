"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Dialog from "./Dialog";

const CHIPS = [
  { n: "01", name: "Triage", text: "Pick what matters." },
  { n: "02", name: "Investigate", text: "Follow the evidence." },
  { n: "03", name: "Report", text: "Hand it off clearly." },
];

const b = (t: string) => <b className="font-semibold text-ink">{t}</b>;
const STEPS: ReactNode[] = [
  <>Pick an alert in {b("Alert queue")} and press {b("Assign to me")}.</>,
  <>Open the evidence tabs. On Intermediate and Hard, the report unlocks after you open 3 or 4 sources.</>,
  <>Choose {b("True")} or {b("False positive")}, write under each heading, then say whether to escalate.</>,
  <>Press {b("Submit and close alert")}. You get a score and coaching, and the model answer is in {b("Case reports")}.</>,
];

/** The one-minute card for people who have used a tool like this before. */
export default function ReadCard({ onClose, onGo }: { onClose: () => void; onGo?: () => void }) {
  return (
    <Dialog labelledBy="ob-read-title" onClose={onClose} wide>
      <p className="pr-12 font-mono text-[11px] font-medium tracking-[0.18em] text-accent">HOW SHIFTLAB WORKS</p>
      <h2 id="ob-read-title" className="mt-2 pr-12 text-2xl font-semibold tracking-tight">
        A one-minute read
      </h2>

      <ul className="mt-5 grid gap-2 sm:grid-cols-3">
        {CHIPS.map((c) => (
          <li key={c.n} className="rounded-xl border border-line bg-raised/70 px-3.5 py-3">
            <span className="font-mono text-xs text-accent">{c.n}</span>
            <p className="mt-0.5 text-sm font-semibold">{c.name}</p>
            <p className="text-sm text-muted">{c.text}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-6 text-sm font-semibold">How to close an alert</h3>
      <ol className="mt-3 space-y-3">
        {STEPS.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-muted">
            <span className="mt-px grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent/15 font-mono text-xs font-semibold text-accent">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
        <p className="text-sm text-muted">Stuck? Every alert has a free Hint and a playbook.</p>
        <Link
          href="/queue"
          onClick={onGo}
          data-autofocus
          className="btn-shine press inline-flex min-h-11 items-center rounded-xl bg-accent px-5 text-sm font-semibold text-canvas hover:shadow-[0_0_22px_-4px_rgb(34_211_238/0.7)]"
        >
          Go to alert queue →
        </Link>
      </div>
    </Dialog>
  );
}
