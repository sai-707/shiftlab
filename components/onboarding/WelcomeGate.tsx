"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useProgress } from "@/lib/progress";
import { SEEN_NOTE, onboarding, startTour, useSyncReady } from "@/lib/onboarding";
import { toast } from "@/lib/toast";
import Dialog from "./Dialog";
import ReadCard from "./ReadCard";

type View = "ask" | "card" | null;

const OPTION =
  "ob-opt press group flex min-h-[88px] flex-col items-start justify-center gap-1 rounded-xl border border-line bg-raised/70 px-4 py-3.5 text-left hover:border-accent hover:bg-accent/10";

/**
 * Opens by itself on the Dashboard, once, before any alert has been opened. One question decides how much help to show:
 * a step-by-step tour for beginners, a short read card for people who know the job.
 * Anyone who already has progress is skipped: they are not new, and the question would only get in the way.
 */
export default function WelcomeGate() {
  const router = useRouter();
  const progress = useProgress();
  const ready = useSyncReady();
  const { level } = onboarding.useStore();
  const [view, setView] = useState<View>(null);
  const eligible = ready && level === "" && progress.activeAlertId === null && Object.keys(progress.cases).length === 0;

  // A beat after the dashboard has drawn, so the window arrives on its own rather than competing with the page.
  useEffect(() => {
    if (!eligible) return;
    const t = window.setTimeout(() => setView((v) => v ?? "ask"), 450);
    return () => window.clearTimeout(t);
  }, [eligible]);

  if (view === "ask") {
    return (
      <Dialog
        labelledBy="ob-ask-title"
        onClose={() => {
          // Closing without choosing counts as an answer, so it does not come back on every visit.
          onboarding.set({ level: "skip" });
          setView(null);
          toast(SEEN_NOTE);
        }}
      >
        <p className="pr-12 font-mono text-[11px] font-medium tracking-[0.18em] text-accent">WELCOME TO SHIFTLAB</p>
        <h2 id="ob-ask-title" className="mt-2 pr-10 text-2xl font-semibold leading-tight tracking-tight">
          Have you used something like this before?
        </h2>
        <p className="mt-2 text-sm text-muted">One tap. We will show you the right amount of help.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            data-autofocus
            className={OPTION}
            onClick={() => {
              onboarding.set({ level: "new" });
              const id = startTour(progress);
              setView(null);
              router.push(`/alerts/${id}`);
            }}
          >
            <span className="text-base font-semibold group-hover:text-accent">No, I&apos;m new</span>
            <span className="text-sm text-muted">Take me through it, step by step</span>
          </button>
          <button
            type="button"
            className={OPTION}
            onClick={() => {
              onboarding.set({ level: "pro" });
              setView("card");
            }}
          >
            <span className="text-base font-semibold group-hover:text-accent">Yes, I have</span>
            <span className="text-sm text-muted">Quick read, then straight to the alert queue</span>
          </button>
        </div>

        <p className="mt-5 text-xs text-muted">Shown once. You can open it again any time under Start here.</p>
      </Dialog>
    );
  }

  if (view === "card") {
    return (
      <ReadCard
        onClose={() => {
          setView(null);
          toast(SEEN_NOTE);
        }}
        onGo={() => setView(null)}
      />
    );
  }

  return null;
}
