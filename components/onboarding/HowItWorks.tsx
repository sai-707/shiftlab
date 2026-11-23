"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useProgress } from "@/lib/progress";
import { startTour } from "@/lib/onboarding";
import ReadCard from "./ReadCard";

/** On Start here: the way back to the welcome help, because the closing note promises it is there. */
export default function HowItWorks() {
  const router = useRouter();
  const progress = useProgress();
  const [card, setCard] = useState(false);

  return (
    <>
    <section className="spot rounded-2xl border border-accent/30 bg-accent/5 p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 max-w-xl">
          <h2 className="font-semibold">How ShiftLab works</h2>
          <p className="mt-1 text-sm text-muted">New here, or want a refresher? Walk through your first alert step by step, or read the one-minute version.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => router.push(`/alerts/${startTour(progress)}`)}
            className="btn-shine press min-h-11 rounded-xl bg-accent px-5 text-sm font-semibold text-canvas hover:shadow-[0_0_20px_-4px_rgb(34_211_238/0.7)]"
          >
            Take the tour again
          </button>
          <button
            type="button"
            onClick={() => setCard(true)}
            className="press min-h-11 rounded-xl border border-line px-5 text-sm font-medium hover:border-accent hover:text-accent"
          >
            Read the quick card
          </button>
        </div>
      </div>
    </section>
    {/* Outside the card: the card lifts on hover, and that would move a window placed inside it. */}
    {card && <ReadCard onClose={() => setCard(false)} onGo={() => setCard(false)} />}
    </>
  );
}
