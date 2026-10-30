"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ALERTS, TOPICS, bySeverity } from "@/content/alerts";
import { isUnlocked } from "@/lib/levels";
import { useProgress } from "@/lib/progress";
import { rank, scoreColor } from "@/lib/stats";
import { TOPIC_COLOR } from "@/lib/topics";
import CountUp from "@/components/ui/CountUp";
import SeverityBadge from "@/components/ui/SeverityBadge";
import type { Severity } from "@/lib/types";

const panel = "spot rounded-2xl border border-line bg-panel p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]";

const SEVERITY_COLOR: Record<Severity, string> = {
  critical: "var(--color-critical)",
  high: "var(--color-high)",
  medium: "var(--color-medium)",
  low: "var(--color-low)",
};

function Ring({ pct, label }: { pct: number; label: string }) {
  return (
    <svg viewBox="0 0 42 42" className="h-24 w-24 shrink-0" role="img" aria-label={`Shift progress ${pct} percent`}>
      <circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--color-line)" strokeWidth="3.5" />
      <circle
        cx="21"
        cy="21"
        r="15.9155"
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={`${pct} ${100 - pct}`}
        strokeDashoffset="25"
        style={{ filter: "drop-shadow(0 0 2px rgb(34 211 238 / 0.7))" }}
      />
      <text x="21" y="22.5" textAnchor="middle" className="fill-ink text-[8px] font-semibold">
        {pct}%
      </text>
      <text x="21" y="28" textAnchor="middle" className="fill-muted text-[3px]">
        {label}
      </text>
    </svg>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
  color,
  bar,
  delay,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  color: string;
  bar?: number;
  delay: number;
}) {
  return (
    <div className={`${panel} rise relative overflow-hidden`} style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: color, opacity: 0.8 }} />
      <div className="flex items-start justify-between">
        <p className="text-sm text-muted">{label}</p>
        <span
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{ background: `color-mix(in srgb, ${color} 14%, transparent)`, color }}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4.5 w-4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            {icon}
          </svg>
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight">
        <CountUp value={value} />
      </p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
      {bar !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
          <div className="grow h-full rounded-full" style={{ width: `${bar}%`, background: color }} />
        </div>
      )}
    </div>
  );
}

export default function DashboardView() {
  const progress = useProgress();

  const total = ALERTS.length;
  const closed = ALERTS.filter((a) => progress.cases[a.id]);
  const open = ALERTS.filter((a) => !progress.cases[a.id] && isUnlocked(a.difficulty, progress.cases)).sort(bySeverity);
  const correct = closed.filter(
    (a) => progress.cases[a.id].submission.verdict === progress.cases[a.id].feedback.correctVerdict,
  ).length;
  const accuracyPct = closed.length ? Math.round((100 * correct) / closed.length) : 0;
  const average = closed.length
    ? Math.round(closed.reduce((sum, a) => sum + progress.cases[a.id].feedback.score, 0) / closed.length)
    : null;
  const active = ALERTS.find((a) => a.id === progress.activeAlertId);
  const shiftPct = Math.round((100 * closed.length) / total);

  const sizes = TOPICS.map((topic) => {
    const count = open.filter((a) => a.topic === topic).length;
    return { topic, count, length: open.length ? (count / open.length) * 100 : 0 };
  });
  // each segment starts where the ones before it end
  const segments = sizes.map((s, i) => ({ ...s, offset: sizes.slice(0, i).reduce((n, x) => n + x.length, 0) }));

  const coverage = TOPICS.map((topic) => {
    const all = ALERTS.filter((a) => a.topic === topic);
    const done = all.filter((a) => progress.cases[a.id]);
    return { topic, done: done.length, total: all.length };
  });

  const severityCounts = (["critical", "high", "medium", "low"] as Severity[]).map((s) => ({
    severity: s,
    count: open.filter((a) => a.severity === s).length,
  }));

  const recent = [...closed]
    .sort((a, b) => progress.cases[b.id].closedAt - progress.cases[a.id].closedAt)
    .slice(0, 4);

  return (
    <div className="space-y-4">
      <div
        className={`${panel} rise relative flex flex-wrap items-center justify-between gap-5 overflow-hidden border-l-4 border-l-accent bg-linear-to-r from-accent/10 via-panel to-panel`}
      >
        <div className="flex items-center gap-5">
          <Ring pct={shiftPct} label="of shift" />
          <div>
            <p className="text-xs uppercase tracking-wide text-accent">{rank(closed.length, average)}</p>
            {active ? (
              <>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted">On your desk</p>
                <p className="mt-0.5 font-medium">
                  <span className="font-mono text-accent">{active.id}</span> {active.title}
                </p>
              </>
            ) : (
              <>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted">On your desk</p>
                <p className="mt-0.5 font-medium">
                  {closed.length === total
                    ? "Queue cleared. Review your case reports for coaching."
                    : "Nothing assigned. Pick an alert from the queue to start your shift."}
                </p>
              </>
            )}
            <p className="mt-1 text-sm text-muted">
              {closed.length} of {total} alerts closed this shift
            </p>
            {closed.length === 0 && (
              <Link href="/start" className="mt-2 inline-block text-sm text-accent hover:underline">
                New here? Read the quick guide →
              </Link>
            )}
          </div>
        </div>
        <Link
          href={active ? `/alerts/${active.id}` : "/queue"}
          className="btn-shine press rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-canvas shadow-[0_0_20px_-4px_rgb(34_211_238/0.6)] hover:shadow-[0_0_28px_-2px_rgb(34_211_238/0.85)]"
        >
          {active ? "Continue case" : "Open queue"}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Open alerts"
          value={String(open.length)}
          hint={`${severityCounts[0].count} critical, ${severityCounts[1].count} high`}
          color="var(--color-high)"
          delay={60}
          icon={<path d="M4 6h16M4 12h16M4 18h10" />}
        />
        <StatCard
          label="Cases closed"
          value={String(closed.length)}
          hint={`${total - closed.length} still to go`}
          color="var(--color-correct)"
          bar={shiftPct}
          delay={120}
          icon={<path d="m5 12.5 4.5 4.5L19 7.5" />}
        />
        <StatCard
          label="Verdict accuracy"
          value={closed.length ? `${accuracyPct}%` : "-"}
          hint={closed.length ? `${correct} of ${closed.length} verdicts correct` : "Close a case to see this"}
          color="var(--color-accent)"
          bar={closed.length ? accuracyPct : undefined}
          delay={180}
          icon={
            <>
              <circle cx="12" cy="12" r="8" />
              <circle cx="12" cy="12" r="3" />
            </>
          }
        />
        <StatCard
          label="Average score"
          value={average === null ? "-" : `${average}/100`}
          hint={average === null ? "Close a case to see this" : "Across all closed cases"}
          color="#a78bfa"
          bar={average ?? undefined}
          delay={240}
          icon={<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${panel} rise`} style={{ animationDelay: "300ms" }}>
          <h2 className="font-semibold">Open alerts by topic</h2>
          <div className="mt-5 flex flex-wrap items-center gap-6">
            <svg viewBox="0 0 42 42" className="h-40 w-40 shrink-0" role="img" aria-label="Open alerts by topic">
              <circle cx="21" cy="21" r="15.9155" fill="none" stroke="var(--color-line)" strokeWidth="4.5" />
              {segments
                .filter((s) => s.length > 0)
                .map((s) => (
                  <circle
                    key={s.topic}
                    cx="21"
                    cy="21"
                    r="15.9155"
                    fill="none"
                    stroke={TOPIC_COLOR[s.topic]}
                    strokeWidth="4.5"
                    strokeDasharray={`${Math.max(s.length - 1, 0.5)} ${100 - Math.max(s.length - 1, 0.5)}`}
                    strokeDashoffset={25 - s.offset}
                  />
                ))}
              <text x="21" y="22" textAnchor="middle" className="fill-ink text-[8px] font-semibold">
                {open.length}
              </text>
              <text x="21" y="27" textAnchor="middle" className="fill-muted text-[3px]">
                open
              </text>
            </svg>
            <ul className="grid flex-1 grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {segments.map((s) => (
                <li key={s.topic} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: TOPIC_COLOR[s.topic] }} />
                  <span className="truncate">{s.topic}</span>
                  <span className="ml-auto text-muted">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className={`${panel} rise`} style={{ animationDelay: "360ms" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Next in the queue</h2>
            <Link href="/queue" className="text-sm text-accent hover:underline">
              See all
            </Link>
          </div>
          {open.length > 0 && (
            <div className="mt-3">
              <div className="flex h-1.5 gap-0.5 overflow-hidden rounded-full">
                {severityCounts
                  .filter((s) => s.count > 0)
                  .map((s) => (
                    <div
                      key={s.severity}
                      title={`${s.count} ${s.severity}`}
                      style={{ flex: s.count, background: SEVERITY_COLOR[s.severity] }}
                    />
                  ))}
              </div>
              <p className="mt-1.5 text-xs text-muted">
                {severityCounts
                  .filter((s) => s.count > 0)
                  .map((s) => `${s.count} ${s.severity}`)
                  .join(" · ")}
              </p>
            </div>
          )}
          {open.length === 0 ? (
            <p className="mt-4 text-sm text-muted">Queue cleared. Check your case reports for coaching.</p>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {open.slice(0, 5).map((a) => (
                <li key={a.id}>
                  <Link
                    href={`/alerts/${a.id}`}
                    className="group flex items-center justify-between gap-3 py-3 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-mono text-xs text-muted">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: TOPIC_COLOR[a.topic] }} />
                        {a.id} · {a.topic}
                      </span>
                      <span className="block truncate transition-colors group-hover:text-accent">{a.title}</span>
                    </span>
                    <SeverityBadge severity={a.severity} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={`${panel} rise`} style={{ animationDelay: "420ms" }}>
          <h2 className="font-semibold">Skill coverage</h2>
          <p className="mt-1 text-xs text-muted">How much of each topic you have worked through.</p>
          <ul className="mt-4 space-y-3">
            {coverage.map((c) => (
              <li key={c.topic} className="text-sm">
                <div className="flex items-center justify-between">
                  <span>{c.topic}</span>
                  <span className="text-xs text-muted">
                    {c.done}/{c.total}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(100 * c.done) / c.total}%`, background: TOPIC_COLOR[c.topic] }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${panel} rise`} style={{ animationDelay: "480ms" }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent cases</h2>
            <Link href="/reports" className="text-sm text-accent hover:underline">
              All reports
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-line px-4 py-6 text-center text-sm text-muted">
              No closed cases yet. Your scored reports will appear here.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {recent.map((a) => {
                const rec = progress.cases[a.id];
                return (
                  <li key={a.id}>
                    <Link href={`/alerts/${a.id}`} className="group flex items-center justify-between gap-3 py-3 text-sm">
                      <span className="min-w-0">
                        <span className="font-mono text-xs text-muted">{a.id}</span>
                        <span className="block truncate transition-colors group-hover:text-accent">{a.title}</span>
                      </span>
                      <span className={`shrink-0 font-semibold ${scoreColor(rec.feedback.score)}`}>
                        {rec.feedback.score}
                        <span className="text-xs font-normal text-muted">/100</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
