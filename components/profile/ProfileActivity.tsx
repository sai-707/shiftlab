"use client";

import { useMemo } from "react";
import ActivityHeatmap from "@/components/ui/activity-heatmap";
import { lastDays, reportsPerDay } from "@/lib/streak";
import type { CaseRecord } from "@/lib/types";
import { useToday } from "@/lib/useToday";
import SectionHead from "./SectionHead";

const SPAN = 365;
const PERIOD = "the last year";
const UNIT = { one: "report", other: "reports" };

/** One year of reports, the same picture as the dashboard streak card. */
export default function ProfileActivity({ cases }: { cases: Record<string, CaseRecord> }) {
  const today = useToday();
  const days = useMemo(() => (today ? lastDays(reportsPerDay(cases), today, SPAN) : []), [cases, today]);
  const active = days.filter((d) => d.count > 0).length;

  return (
    <section className="border-t border-line p-5 md:p-6" aria-labelledby="activity-h">
      <SectionHead
        eyebrow="Habit"
        title="Activity, last year"
        id="activity-h"
        aside={
          today && (
            <p className="font-mono text-[11px] uppercase tracking-wide text-muted">
              {active} active {active === 1 ? "day" : "days"}
            </p>
          )
        }
      />
      <div className="mt-4 min-h-40">
        {today && <ActivityHeatmap days={days} label={`Reports submitted in ${PERIOD}`} period={PERIOD} unit={UNIT} thresholds={[1, 3, 5]} weekStartsOn={1} />}
      </div>
    </section>
  );
}
