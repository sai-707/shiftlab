"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { sendFeedback } from "@/app/feedback-actions";
import { noteSent, noteSkipped } from "@/lib/feedbackAsk";
import { alertFromPath, FEEDBACK_EVENT, TEXT_MAX } from "@/lib/feedbackRules";
import { visitorId } from "@/lib/visitor";

// The "Send feedback" window. One copy lives in the root layout; any <FeedbackLink /> opens it with a browser event.
// It is a native <dialog>, so Esc, focus trapping and the dimmed backdrop come from the browser. On a phone it slides up from the bottom.

const EVIDENCE = [
  ["yes", "Yes"],
  ["mostly", "Mostly"],
  ["no", "No"],
] as const;
const ROLES = [
  ["student", "Student"],
  ["l1", "Working L1"],
  ["l2plus", "L2 or above"],
  ["other", "Other"],
] as const;

const chip = (on: boolean) =>
  `min-h-11 rounded-lg border px-3.5 text-sm font-semibold ${on ? "border-accent bg-accent/10 text-accent" : "border-line bg-raised hover:border-muted"}`;
const field = "w-full resize-none rounded-lg border border-line bg-void p-3 text-sm leading-relaxed placeholder:text-muted/70";

export default function FeedbackWindow() {
  const path = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const [rating, setRating] = useState(0);
  const [evidence, setEvidence] = useState("");
  const [confusing, setConfusing] = useState("");
  const [opinion, setOpinion] = useState("");
  const [role, setRole] = useState("");
  const [contactOk, setContactOk] = useState(false);
  const [trap, setTrap] = useState("");
  const [sent, setSent] = useState(false);
  const [problem, setProblem] = useState({ msg: "", key: "" }); // an error is shown only while the answers are still the ones that caused it
  const [pending, start] = useTransition();
  const [auto, setAuto] = useState(false); // opened by itself after a closed case, so it offers a Skip button
  const autoRef = useRef(false);
  const sentRef = useRef(false);

  useEffect(() => {
    const open = (e: Event) => {
      const byItself = e instanceof CustomEvent && e.detail?.auto === true;
      if (dialog.current?.open || (byItself && document.querySelector("dialog[open]"))) return; // never stack on top of another window
      setSent(false);
      setProblem({ msg: "", key: "" });
      autoRef.current = byItself;
      sentRef.current = false;
      setAuto(byItself);
      dialog.current?.showModal();
    };
    window.addEventListener(FEEDBACK_EVENT, open);
    return () => window.removeEventListener(FEEDBACK_EVENT, open);
  }, []);

  const close = () => dialog.current?.close();
  const reset = () => {
    setRating(0);
    setEvidence("");
    setConfusing("");
    setOpinion("");
    setRole("");
    setContactOk(false);
  };

  const answers = `${rating}|${evidence}|${confusing}|${opinion}`;
  const err = problem.key === answers ? problem.msg : "";

  const send = () => {
    start(async () => {
      const r = await sendFeedback({ rating: rating || null, evidence: evidence || null, confusing, opinion, role: role || null, contactOk, path, visitor: visitorId(), trap });
      if ("error" in r) setProblem({ msg: r.error, key: answers });
      else {
        sentRef.current = true;
        noteSent();
        setSent(true);
        reset();
      }
    });
  };

  const alertId = alertFromPath(path);

  return (
    <dialog
      ref={dialog}
      aria-labelledby="feedback-title"
      onClick={(e) => e.target === dialog.current && close()} // a click on the dimmed backdrop
      onClose={() => {
        // Closed without sending, after it opened by itself: that counts as a skip.
        if (autoRef.current && !sentRef.current) noteSkipped();
        autoRef.current = false;
        setAuto(false);
      }}
      className="m-auto max-h-[calc(100svh-2rem)] w-[min(34rem,calc(100%-2rem))] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-canvas p-0 text-ink shadow-2xl backdrop:bg-black/65 max-md:mb-0 max-md:mt-auto max-md:max-h-[92svh] max-md:w-full max-md:rounded-b-none"
    >
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-3.5">
        <div>
          <h2 id="feedback-title" className="text-base font-semibold">
            Send feedback
          </h2>
          <p className="mt-0.5 text-xs text-muted">{auto ? "You just closed an alert. About 1 minute, and you can skip." : "About 1 minute. Honest is best."}</p>
        </div>
        {/* when the window opened by itself the corner button says "Skip", so the way out is visible without scrolling the form */}
        <button
          type="button"
          onClick={close}
          aria-label={auto ? "Skip" : "Close"}
          className={`-mr-2 flex h-11 items-center justify-center rounded-lg text-muted hover:text-ink ${auto ? "px-3 text-sm font-semibold" : "w-11 text-2xl leading-none"}`}
        >
          {auto ? "Skip" : "×"}
        </button>
      </div>

      {sent ? (
        <div className="flex flex-col items-center gap-3 px-6 py-12 text-center" role="status">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-correct/50 bg-correct/10 text-2xl text-correct" aria-hidden="true">
            ✓
          </span>
          <p className="text-lg font-semibold">Thank you</p>
          <p className="max-w-xs text-sm leading-relaxed text-muted">Your feedback was saved. It helps make ShiftLab better for the next student.</p>
          <button type="button" onClick={close} className="mt-2 min-h-11 rounded-lg border border-line bg-raised px-5 text-sm font-semibold">
            Close
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex flex-col gap-5 px-5 pb-5 pt-4"
        >
          <p className="inline-flex max-w-full self-start items-center gap-2 rounded-full bg-raised px-3 py-1 text-xs text-muted">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            <span className="truncate">Filled in for you: {alertId ?? path}</span>
          </p>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">1. How realistic did it feel?</legend>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={rating === n}
                  aria-label={`${n} out of 5`}
                  onClick={() => setRating(rating === n ? 0 : n)}
                  className={`h-11 w-12 rounded-lg border text-[15px] font-bold ${rating >= n ? "border-medium bg-medium/10 text-medium" : "border-line bg-raised hover:border-muted"}`}
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="flex w-[17rem] justify-between text-[11px] text-muted" aria-hidden="true">
              <span>Not at all</span>
              <span>Very</span>
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">2. Was the evidence enough to decide?</legend>
            <div className="flex gap-2">
              {EVIDENCE.map(([v, label]) => (
                <button key={v} type="button" aria-pressed={evidence === v} onClick={() => setEvidence(evidence === v ? "" : v)} className={`${chip(evidence === v)} flex-1`}>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="fb-confusing" className="mb-2 block text-sm font-semibold">
              3. What was confusing or missing?
            </label>
            <textarea id="fb-confusing" rows={2} maxLength={TEXT_MAX} value={confusing} onChange={(e) => setConfusing(e.target.value)} placeholder="Optional. For example: I could not tell which tab to open first." className={field} />
          </div>

          <div>
            <label htmlFor="fb-opinion" className="mb-2 block text-sm font-semibold">
              4. Your honest opinion
            </label>
            <textarea id="fb-opinion" rows={3} maxLength={TEXT_MAX} value={opinion} onChange={(e) => setOpinion(e.target.value)} placeholder="Optional. Anything: what felt real, what felt fake, what you would change first." className={field} />
          </div>

          <fieldset>
            <legend className="mb-2 text-sm font-semibold">
              5. Who are you? <span className="font-normal text-muted">(optional)</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {ROLES.map(([v, label]) => (
                <button key={v} type="button" aria-pressed={role === v} onClick={() => setRole(role === v ? "" : v)} className={chip(role === v)}>
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* A trap for bots: hidden from people and from screen readers, never tabbed to. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
            </label>
          </div>

          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm">
            <input type="checkbox" checked={contactOk} onChange={(e) => setContactOk(e.target.checked)} className="h-5 w-5 accent-[var(--color-accent)]" />
            You may contact me about this
          </label>

          {err && (
            <p role="alert" className="text-sm text-missed">
              {err}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
            <p className="max-w-[16rem] text-xs leading-relaxed text-muted">We save your answers. Your account is linked only if you tick the box above.</p>
            <div className="flex shrink-0 items-center gap-2">
              {auto && (
                <button type="button" onClick={close} className="min-h-11 rounded-xl border border-line bg-raised px-4 text-[15px] font-semibold hover:border-muted">
                  Skip
                </button>
              )}
              <button type="submit" disabled={pending} className="min-h-11 shrink-0 rounded-xl border border-accent bg-accent px-6 text-[15px] font-bold text-void disabled:opacity-60">
                {pending ? "Sending…" : "Send feedback"}
              </button>
            </div>
          </div>
        </form>
      )}
    </dialog>
  );
}
