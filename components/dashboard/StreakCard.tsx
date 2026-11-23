"use client";

import { useMemo, useSyncExternalStore } from "react";
import ActivityHeatmap from "@/components/ui/activity-heatmap";
import { useProgress } from "@/lib/progress";
import { lastDays, localIso, reportsPerDay, streaks } from "@/lib/streak";

// One year of days. A shorter view was tried and dropped: the year is the better picture of a habit.
const SPAN = 365;
const PERIOD = "the last year";
const UNIT = { one: "report", other: "reports" };

const noop = () => () => {};
/** Today in the visitor's time zone. Null on the server, so the server never guesses a day that the browser then disagrees with. */
function useToday(): string | null {
  return useSyncExternalStore(noop, () => localIso(Date.now()), () => null);
}

/** Dashboard streak: one square per day, darker for more reports. Counts every submitted try, not only the first. */
export default function StreakCard() {
  const progress = useProgress();
  const today = useToday();

  const perDay = useMemo(() => reportsPerDay(progress.cases), [progress.cases]);
  const days = useMemo(() => (today ? lastDays(perDay, today, SPAN) : []), [perDay, today]);
  const { current, longest } = useMemo(() => (today ? streaks(perDay, today) : { current: 0, longest: 0 }), [perDay, today]);

  return (
    <section className="spot rise rounded-2xl border border-line bg-panel p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]" style={{ animationDelay: "300ms" }} aria-label="Study streak">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold">Streak</h2>
          <p className="mt-1 text-xs text-muted">One square per day you submitted a report. Darker means more.</p>
        </div>
        <dl className="flex gap-5 text-right">
          <div>
            <dt className="text-xs text-muted">Current</dt>
            <dd className="text-lg font-semibold tabular-nums text-correct">
              {current} <span className="text-xs font-normal text-muted">{current === 1 ? "day" : "days"}</span>
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted">Longest</dt>
            <dd className="text-lg font-semibold tabular-nums">
              {longest} <span className="text-xs font-normal text-muted">{longest === 1 ? "day" : "days"}</span>
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 min-h-40">
        {today && (
          <ActivityHeatmap
            days={days}
            label={`Reports submitted in ${PERIOD}`}
            period={PERIOD}
            unit={UNIT}
            thresholds={[1, 3, 5]}
            weekStartsOn={1}
          />
        )}
      </div>
    </section>
  );
}
