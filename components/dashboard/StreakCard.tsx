"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import ActivityHeatmap from "@/components/ui/activity-heatmap";
import Segmented from "@/components/ui/Segmented";
import { useProgress } from "@/lib/progress";
import { lastDays, localIso, reportsPerDay, streaks } from "@/lib/streak";

type Range = "weeks" | "year";
const RANGES: Record<Range, { span: number; period: string; label: string }> = {
  weeks: { span: 84, period: "the last 12 weeks", label: "12 weeks" },
  year: { span: 365, period: "the last year", label: "Year" },
};
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
  const [range, setRange] = useState<Range>("weeks");

  const perDay = useMemo(() => reportsPerDay(progress.cases), [progress.cases]);
  const days = useMemo(() => (today ? lastDays(perDay, today, RANGES[range].span) : []), [perDay, today, range]);
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
            label={`Reports submitted in ${RANGES[range].period}`}
            period={RANGES[range].period}
            unit={UNIT}
            thresholds={[1, 3, 5]}
            weekStartsOn={1}
            actions={
              <Segmented<Range>
                label="Streak range"
                small
                value={range}
                onChange={setRange}
                options={[
                  { value: "weeks", label: RANGES.weeks.label },
                  { value: "year", label: RANGES.year.label },
                ]}
              />
            }
          />
        )}
      </div>
    </section>
  );
}
