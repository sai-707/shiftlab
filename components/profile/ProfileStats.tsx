"use client";

import { useMemo } from "react";
import { ALERTS } from "@/content/alerts";
import { KINDS } from "@/lib/certificates";
import { reportsPerDay, streaks } from "@/lib/streak";
import { caseStats, scoreColor } from "@/lib/stats";
import type { CaseRecord } from "@/lib/types";
import { useCertificates } from "@/lib/useCertificates";
import { useToday } from "@/lib/useToday";

type Stats = ReturnType<typeof caseStats>;

function Tile({ label, value, unit, hint, tone }: { label: string; value: string; unit?: string; hint: string; tone?: string }) {
  return (
    <div className="pf-tile bg-panel p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className={`mt-1 font-display text-3xl font-bold tracking-tight tabular-nums ${tone ?? ""}`}>
        {value}
        {unit && <span className="ml-1 text-sm font-normal text-muted">{unit}</span>}
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </div>
  );
}

const days = (n: number) => (n === 1 ? "day" : "days");

/** The numbers at the top of the profile: how the student is doing, their streak and their certificates. */
export default function ProfileStats({ cases, stats }: { cases: Record<string, CaseRecord>; stats: Stats }) {
  const today = useToday();
  const mine = useCertificates();
  const run = useMemo(() => (today ? streaks(reportsPerDay(cases), today) : null), [cases, today]);
  const certs = mine?.certs ?? [];

  return (
    <div className="grid grid-cols-2 gap-px border-t border-line bg-line md:grid-cols-3">
      <Tile label="Cases closed" value={String(stats.closed)} unit={`/ ${ALERTS.length}`} hint="Alerts you have written up" />
      <Tile
        label="Average score"
        value={stats.average === null ? "-" : String(stats.average)}
        unit={stats.average === null ? undefined : "/ 100"}
        tone={stats.average === null ? "" : scoreColor(stats.average)}
        hint={stats.best === null ? "Close a case to see this" : `Best case: ${stats.best}`}
      />
      <Tile label="Verdict accuracy" value={stats.verdictPct === null ? "-" : `${stats.verdictPct}%`} hint="True or false positive called right" />
      <Tile label="Escalation accuracy" value={stats.escalationPct === null ? "-" : `${stats.escalationPct}%`} hint="Escalated when you should, and not when you should not" />
      <Tile
        label="Current streak"
        value={run ? String(run.current) : "-"}
        unit={run ? days(run.current) : undefined}
        tone={run && run.current > 0 ? "text-correct" : ""}
        hint={run ? `Longest: ${run.longest} ${days(run.longest)}` : "Counting days"}
      />
      <Tile
        label="Certificates"
        value={mine ? String(certs.length) : "-"}
        unit={mine ? `/ ${KINDS.length}` : undefined}
        tone={certs.length > 0 ? "text-[#a78bfa]" : ""}
        hint={mine === null ? "Sign in to earn certificates" : certs.length ? certs.map((c) => c.kind).join(", ") : "None yet"}
      />
    </div>
  );
}
