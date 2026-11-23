"use client";

import { useId, useState } from "react";

// A finished report for an alert that is NOT in ShiftLab, written under the same headings as the real report box.
const PARTS: { head: string; text: string }[] = [
  { head: "Time of activity", text: "14:05 to 14:20 on 21 Oct. The installer ran at 14:05, the tool connected out at 14:07 and was still connected at 14:20." },
  { head: "List of Affected Entities", text: "Laptop LT-2208 and user j.mehta." },
  { head: "Reason for Classifying as True Positive *", text: "The tool is not on the approved software list and there is no IT ticket for it. It connected to an outside address two minutes after install. A real support tool would have a ticket." },
  { head: "Reason for Escalating the Alert", text: "Someone outside can control this laptop right now. Level 2 should find out what they did." },
  { head: "Recommended Remediation Actions", text: "Isolate LT-2208 from the network. Remove the tool. Reset j.mehta's password. Ask j.mehta who told them to install it." },
  { head: "List of Attack Indicators", text: "Installer run from the Downloads folder at 14:05. Outbound connection to 203.0.113.50 from 14:07. No change ticket." },
  { head: "What Is Still Unknown", text: "What the person on the other end did, whether any files were copied, and how j.mehta found the tool." },
];

const GOOD = [
  "Short, plain sentences.",
  "Real times, names and addresses from the evidence.",
  "The reason says why, not just what.",
  "Every heading answered, and honest about what is still unknown.",
];

/** A collapsible bar above the report box. It opens smoothly and shows what a finished report looks like. */
export default function SampleReport() {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div data-tour="sample" className="rounded-xl border border-line bg-canvas/50">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={id}
        className="press flex min-h-14 w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left hover:bg-raised/50"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5M9 13h6M9 17h6" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold">See a sample report</span>
          <span className="block text-sm text-muted">See what a finished report looks like before you write yours.</span>
        </span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className={`ob-chev shrink-0 text-muted ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* The panel grows from zero to its natural height; collapsed, it is hidden from tab order and screen readers. */}
      <div className="ob-fold" data-open={open ? "1" : ""}>
        <div id={id} inert={!open} className="min-h-0 overflow-hidden">
          <div className="space-y-4 border-t border-line px-4 pb-4 pt-4">
            <p className="font-mono text-[11px] font-medium tracking-[0.14em] text-accent">DIFFERENT ALERT · IT WON&apos;T GIVE YOURS AWAY</p>
            <p className="text-sm font-semibold">An unapproved remote-access tool was installed on a staff laptop</p>

            <dl className="space-y-3 rounded-lg border border-line bg-canvas p-4 text-sm">
              {PARTS.map((p) => (
                <div key={p.head}>
                  <dt className="font-semibold">{p.head}:</dt>
                  <dd className="mt-0.5 leading-relaxed text-muted">{p.text}</dd>
                </div>
              ))}
            </dl>

            <div>
              <p className="text-sm font-semibold">What makes it good</p>
              <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                {GOOD.map((g) => (
                  <li key={g} className="flex gap-2.5 text-sm text-muted">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="mt-0.5 shrink-0 text-correct">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
