"use client";

import Link from "next/link";
import { ALERTS, TOPICS } from "@/content/alerts";
import { useProgress } from "@/lib/progress";

export default function StartChecklist() {
  const progress = useProgress();
  const closed = Object.keys(progress.cases);
  // The AI topic lives in the last level, so the starter goal covers the original topics only.
  const coreTopics = TOPICS.filter((t) => t !== "AI");
  const topicsDone = new Set(closed.map((id) => ALERTS.find((a) => a.id === id)?.topic));

  const goals = [
    { label: "Take your first alert from the queue", href: "/queue", done: progress.activeAlertId !== null || closed.length > 0 },
    { label: "Submit your first case report", href: "/queue", done: closed.length >= 1 },
    { label: "Close five alerts", href: "/queue", done: closed.length >= 5 },
    { label: `Work at least one alert in every topic (${coreTopics.length})`, href: "/queue", done: coreTopics.every((t) => topicsDone.has(t)) },
  ];
  const finished = goals.filter((g) => g.done).length;

  return (
    <div>
      <p className="text-sm text-muted">
        {finished} of {goals.length} goals complete
      </p>
      <ul className="mt-3 space-y-2">
        {goals.map((g) => (
          <li key={g.label}>
            <Link
              href={g.href}
              className="flex items-center gap-3 rounded-lg border border-line bg-canvas/50 px-4 py-3 text-sm transition-colors hover:border-accent/60"
            >
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs ${
                  g.done ? "border-correct bg-correct/15 text-correct" : "border-line text-transparent"
                }`}
                aria-hidden="true"
              >
                ✓
              </span>
              <span className={g.done ? "text-muted line-through" : ""}>{g.label}</span>
              <span className="sr-only">{g.done ? "(done)" : "(not done yet)"}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
