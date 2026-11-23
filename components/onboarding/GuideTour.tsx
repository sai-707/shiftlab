"use client";

import { useEffect, useRef } from "react";
import { SEEN_NOTE, TOUR_STEPS, tour } from "@/lib/onboarding";
import { toast } from "@/lib/toast";
import Dialog from "./Dialog";

// Each step spotlights one part of the alert page. The page marks those parts with data-tour="...".
// If a part is not on screen (for example the student already assigned the alert), the next one in the list is used, and with none the card simply sits in the middle.
const STEPS = [
  { targets: ["assign", "s1"], title: "Assign it, then read it", text: "Press Assign to me. Then read what happened and what your task is." },
  { targets: ["s2"], title: "The evidence", text: "Open the tabs and look for proof, not guesses. The Hint button is free." },
  { targets: ["s3"], title: "Your report", text: "Say if it is a real attack, whether to escalate, and why. Short plain sentences are fine." },
  { targets: ["sample"], title: "Stuck on writing it?", text: "Open the sample report. It shows a finished report for a different alert." },
];

const PAD = 8; // breathing room around the spotlight
const MAX_H = 280; // tall sections are lit only at the top, so the card never has to sit on top of what it points at
const CARD_GAP = 16;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function find(names: string[]) {
  for (const n of names) {
    const el = document.querySelector<HTMLElement>(`[data-tour="${n}"]`);
    if (el) return el;
  }
  return null;
}

const end = () => {
  tour.set({ step: 0, alertId: "" });
  toast(SEEN_NOTE);
};

function Run({ step, assigned }: { step: number; assigned: boolean }) {
  const spot = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const cur = STEPS[step - 1];
  const wait = step === 1 && !assigned;

  // Follows the highlighted part every frame, so scrolling, resizing and parts that appear late (the evidence card shows up
  // once the alert is assigned) all stay in step. It writes straight to the two elements and only when something moved.
  useEffect(() => {
    const sp = spot.current;
    const cd = card.current;
    if (!sp || !cd) return;
    const calm = reduced();
    if (!calm) {
      sp.classList.add("ob-glide");
      cd.classList.add("ob-glide");
    }
    const settle = window.setTimeout(() => {
      sp.classList.remove("ob-glide");
      cd.classList.remove("ob-glide");
    }, 520);

    let raf = 0;
    let scrolled = false;
    let last = "";
    const frame = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const el = find(STEPS[step - 1].targets);
      const cw = cd.offsetWidth;
      const ch = cd.offsetHeight;
      let key = "";

      if (el) {
        if (!scrolled) {
          scrolled = true;
          const top = el.getBoundingClientRect().top;
          // Bring the part into view with room above it, unless it is already comfortably there.
          if (top < 72 || top > vh * 0.45) window.scrollTo({ top: window.scrollY + top - 96, behavior: calm ? "auto" : "smooth" });
        }
        const r = el.getBoundingClientRect();
        // On a short window the lit area shrinks so the card still fits underneath it.
        const h = Math.min(r.height, Math.max(120, Math.min(MAX_H, vh - ch - 96 - PAD * 2 - CARD_GAP * 2)));
        const onScreen = r.bottom > 0 && r.top < vh;
        const sx = Math.max(r.left - PAD, 4);
        const sy = r.top - PAD;
        const sw = Math.min(r.width + PAD * 2, vw - sx - 4);
        const sh = h + PAD * 2;
        let cx = Math.min(Math.max(r.left, 16), Math.max(16, vw - cw - 16));
        let cy = sy + sh + CARD_GAP;
        if (cy + ch > vh - 16) cy = sy - ch - CARD_GAP; // no room below: try above
        if (cy < 16 || !onScreen) cy = vh - ch - 16; // no room either side, or scrolled away: rest at the bottom
        if (!onScreen) cx = Math.max(16, vw - cw - 16);
        key = [sx, sy, sw, sh, cx, cy, onScreen].map((n) => (typeof n === "number" ? Math.round(n) : n)).join(",");
        if (key !== last) {
          last = key;
          sp.style.left = `${sx}px`;
          sp.style.top = `${sy}px`;
          sp.style.width = `${sw}px`;
          sp.style.height = `${sh}px`;
          sp.dataset.on = onScreen ? "1" : "";
          cd.style.left = vw < 640 ? "" : `${cx}px`;
          cd.style.top = vw < 640 ? "" : `${cy}px`;
        }
      } else {
        key = `none,${vw},${vh},${ch}`;
        if (key !== last) {
          last = key;
          sp.dataset.on = "";
          cd.style.left = vw < 640 ? "" : `${Math.max(16, (vw - cw) / 2)}px`;
          cd.style.top = vw < 640 ? "" : `${Math.max(16, (vh - ch) / 2)}px`;
        }
      }
      cd.dataset.ready = "1";
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
  }, [step]);

  // Escape skips, like the Skip tour button. The first card takes focus so a keyboard user lands on it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") end();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    if (step === 1) card.current?.focus({ preventScroll: true });
  }, [step]);

  return (
    <>
      <div ref={spot} className="ob-spot pointer-events-none fixed z-[65] rounded-2xl" aria-hidden="true" />
      <div
        ref={card}
        role="dialog"
        aria-modal="false"
        aria-labelledby="ob-tour-title"
        tabIndex={-1}
        className="ob-card fixed z-[66] w-[380px] max-w-[calc(100vw-1.5rem)] rounded-2xl border border-accent/50 bg-raised p-5 shadow-2xl outline-none max-sm:inset-x-3 max-sm:bottom-3 max-sm:w-auto"
      >
        <div className="flex items-center justify-between gap-3 pr-9">
          <p className="font-mono text-[11px] font-medium tracking-[0.18em] text-accent">
            STEP {step} OF {TOUR_STEPS}
          </p>
          <span className="flex gap-1" aria-hidden="true">
            {STEPS.map((_, i) => (
              <span key={i} className={`h-1 w-5 rounded-full transition-colors duration-300 ${i < step ? "bg-accent" : "bg-line"}`} />
            ))}
          </span>
        </div>
        <button
          type="button"
          onClick={end}
          aria-label="Close the tour"
          className="press absolute right-2 top-2 grid h-11 w-11 place-items-center rounded-xl text-muted hover:bg-canvas hover:text-ink"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div key={step} className="ob-swap mt-3" aria-live="polite">
          <h2 id="ob-tour-title" className="text-lg font-semibold tracking-tight">
            {cur.title}
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{cur.text}</p>
          {wait && <p className="mt-2.5 text-sm text-accent">Press Assign to me in the highlighted panel to carry on.</p>}
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button type="button" onClick={end} className="press min-h-11 rounded-lg px-1 text-sm font-medium text-muted underline-offset-4 hover:text-ink hover:underline">
            Skip tour
          </button>
          <div className="flex gap-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => tour.set({ step: step - 1 })}
                className="press min-h-11 rounded-xl border border-line px-4 text-sm font-medium hover:border-accent hover:text-accent"
              >
                Back
              </button>
            )}
            <button
              type="button"
              disabled={wait}
              onClick={() => tour.set({ step: step + 1 })}
              className="btn-shine press min-h-11 rounded-xl bg-accent px-5 text-sm font-semibold text-canvas hover:shadow-[0_0_20px_-4px_rgb(34_211_238/0.7)] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:shadow-none"
            >
              {step === TOUR_STEPS ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/** The first-alert tour. Mounted on every alert page; it shows only on the alert the tour was started for. */
export default function GuideTour({ alertId, assigned }: { alertId: string; assigned: boolean }) {
  const t = tour.useStore();
  if (t.alertId !== alertId) return null;
  if (t.step >= 1 && t.step <= TOUR_STEPS) return <Run step={t.step} assigned={assigned} />;
  if (t.step === TOUR_STEPS + 1) {
    const done = () => tour.set({ step: 0, alertId: "" });
    return (
      <Dialog labelledBy="ob-done-title" onClose={end}>
        <p className="pr-12 font-mono text-[11px] font-medium tracking-[0.18em] text-accent">TOUR COMPLETE</p>
        <h2 id="ob-done-title" className="mt-2 pr-10 text-2xl font-semibold tracking-tight">
          That is the tour. You are ready.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">Playbooks, hints and the sample report are one click away whenever you want them.</p>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            data-autofocus
            onClick={() => {
              done();
              // Land on the evidence, which is what to do next.
              window.setTimeout(() => find(["s2"])?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" }), 60);
            }}
            className="btn-shine press min-h-11 rounded-xl bg-accent px-5 text-sm font-semibold text-canvas hover:shadow-[0_0_22px_-4px_rgb(34_211_238/0.7)]"
          >
            Start investigating →
          </button>
        </div>
      </Dialog>
    );
  }
  return null;
}
