"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { ALERTS, TOPICS, bySeverity } from "@/content/alerts";
import { TOPIC_COLOR } from "@/lib/topics";
import { assignAlert, guestLimitReached, useProgress } from "@/lib/progress";
import GuestLimit from "@/components/ui/GuestLimit";
import { LEVELS, levelStates } from "@/lib/levels";
import SeverityBadge from "@/components/ui/SeverityBadge";
import Segmented from "@/components/ui/Segmented";
import { toast } from "@/lib/toast";
import type { Alert, Severity, Topic } from "@/lib/types";

type SortKey = "id" | "title" | "severity" | "topic" | "difficulty";
const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];
const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "id", label: "ID" },
  { key: "title", label: "Alert" },
  { key: "severity", label: "Severity" },
  { key: "topic", label: "Topic" },
  { key: "difficulty", label: "Level" },
];

function compare(a: Alert, b: Alert, key: SortKey): number {
  if (key === "severity") return SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity);
  if (key === "difficulty") return LEVELS.indexOf(a.difficulty) - LEVELS.indexOf(b.difficulty);
  return a[key].localeCompare(b[key], undefined, { numeric: true });
}

const control =
  "rounded-lg border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-accent";

export default function QueueView() {
  const router = useRouter();
  const progress = useProgress();
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState<Severity | "all">("all");
  const [topic, setTopic] = useState<Topic | "all">("all");
  const [status, setStatus] = useState<"all" | "open" | "closed">("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const levels = levelStates(progress.cases);
  const unlocked = (d: string) => levels.find((l) => l.level === d)?.unlocked ?? false;
  const active = ALERTS.find((a) => a.id === progress.activeAlertId);
  const rows = ALERTS.filter((a) => {
    const closed = Boolean(progress.cases[a.id]);
    return (
      (severity === "all" || a.severity === severity) &&
      (topic === "all" || a.topic === topic) &&
      (status === "all" || (status === "closed") === closed) &&
      `${a.id} ${a.title}`.toLowerCase().includes(search.trim().toLowerCase())
    );
  }).sort((a, b) =>
    sort
      ? compare(a, b, sort.key) * sort.dir || bySeverity(a, b)
      : LEVELS.indexOf(a.difficulty) - LEVELS.indexOf(b.difficulty) || bySeverity(a, b),
  );

  function assign(id: string) {
    if (guestLimitReached()) {
      toast("Create a free account to keep going");
      return;
    }
    assignAlert(id);
    toast(`${id} assigned to you`);
    router.push(`/alerts/${id}`);
  }

  return (
    <div className="space-y-6">
      <GuestLimit />
      <section className="rounded-2xl border border-line bg-panel">
        <h2 className="border-b border-line px-5 py-3 text-sm font-semibold">Assigned to you</h2>
        {active ? (
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="min-w-0">
              <span className="font-mono text-xs text-accent">{active.id}</span>
              <p className="truncate font-medium">{active.title}</p>
            </div>
            <Link
              href={`/alerts/${active.id}`}
              className="btn-shine press rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:shadow-[0_0_20px_-4px_rgb(34_211_238/0.7)]"
            >
              Open case
            </Link>
          </div>
        ) : (
          <p className="m-4 rounded-lg border border-dashed border-line px-4 py-3 text-sm text-muted">
            You have no alert assigned. Choose one below and press Assign to me. You can work on one alert at a time.
          </p>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {levels.map((l) => (
          <div key={l.level} className={`spot rounded-2xl border bg-panel p-4 ${l.unlocked ? "border-line" : "border-dashed border-line opacity-70"}`}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold">{l.level}</span>
              <span className="text-xs text-muted">{l.unlocked ? `${l.done} of ${l.total} closed` : "Locked"}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-raised">
              <div className="h-full bg-accent" style={{ width: `${l.total ? (100 * l.done) / l.total : 0}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted">
              {l.total === 0
                ? "New alerts are on the way."
                : l.unlocked
                  ? l.done === l.total
                    ? "Level complete."
                    : `Close all ${l.total} to finish this level.`
                  : `Close every ${l.previous} alert to unlock.`}
            </p>
          </div>
        ))}
      </section>

      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search alerts"
          aria-label="Search alerts"
          className={`${control} min-w-48 flex-1`}
        />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as Severity | "all")}
          aria-label="Filter by severity"
          className={control}
        >
          <option value="all">All severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value as Topic | "all")}
          aria-label="Filter by topic"
          className={control}
        >
          <option value="all">All topics</option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <Segmented
          label="Filter by status"
          value={status}
          onChange={setStatus}
          options={[
            { value: "all", label: "All" },
            { value: "open", label: "Open" },
            { value: "closed", label: "Closed" },
          ]}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-panel">
        <table className="w-full min-w-176 text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
            <tr>
              {COLUMNS.map((c) => {
                const dir = sort && sort.key === c.key ? sort.dir : 0;
                return (
                  <th key={c.key} aria-sort={dir === 0 ? undefined : dir === 1 ? "ascending" : "descending"} className="font-medium">
                    <button
                      type="button"
                      onClick={() => setSort(dir === -1 ? null : { key: c.key, dir: dir === 1 ? -1 : 1 })}
                      className={`flex w-full items-center gap-1.5 px-4 py-3 text-left uppercase tracking-wide transition-colors hover:text-accent ${dir ? "text-accent" : ""}`}
                    >
                      {c.label}
                      <span aria-hidden="true" className={`text-[9px] transition-all ${dir === 0 ? "opacity-0" : dir === -1 ? "rotate-180 opacity-100" : "opacity-100"}`}>
                        ▲
                      </span>
                    </button>
                  </th>
                );
              })}
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((a, i) => {
              const record = progress.cases[a.id];
              const isActive = progress.activeAlertId === a.id;
              const locked = !record && !unlocked(a.difficulty);
              const blocked = progress.activeAlertId !== null && !isActive;
              return (
                <Fragment key={a.id}>
                <tr
                  className={`row-in group border-t border-line first:border-t-0 transition-colors ${locked ? "opacity-50" : "hover:bg-accent/5"}`}
                  style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted shadow-[inset_0_0_0_0_var(--color-accent)] transition-shadow group-hover:shadow-[inset_3px_0_0_0_var(--color-accent)]">{a.id}</td>
                  <td className="px-4 py-3 font-medium">
                    <button
                      type="button"
                      aria-expanded={expanded === a.id}
                      onClick={() => setExpanded(expanded === a.id ? null : a.id)}
                      className="text-left hover:text-accent"
                    >
                      {a.title}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <SeverityBadge severity={a.severity} />
                  </td>
                  <td className="px-4 py-3 text-muted">
                    <span
                      className="mr-2 inline-block h-2 w-2 rounded-full align-middle"
                      style={{ background: TOPIC_COLOR[a.topic] }}
                    />
                    {a.topic}
                  </td>
                  <td className="px-4 py-3 text-muted">{a.difficulty}</td>
                  <td className="px-4 py-3">
                    {record ? (
                      <span className="text-correct">Closed · {record.feedback.score}/100</span>
                    ) : isActive ? (
                      <span className="text-accent">Assigned to you</span>
                    ) : locked ? (
                      <span className="text-muted">Locked</span>
                    ) : (
                      <span className="text-muted">Awaiting action</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {record ? (
                      <Link href={`/alerts/${a.id}`} className="text-accent hover:underline">
                        Review
                      </Link>
                    ) : isActive ? (
                      <Link href={`/alerts/${a.id}`} className="text-accent hover:underline">
                        Open case
                      </Link>
                    ) : locked ? (
                      <span className="text-xs text-muted">🔒 {a.difficulty}</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => assign(a.id)}
                        disabled={blocked}
                        title={blocked ? "Finish your assigned alert first" : undefined}
                        className="press rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink"
                      >
                        Assign to me
                      </button>
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan={7} className="p-0">
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${expanded === a.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                    >
                      <div className="overflow-hidden">
                        <p className="bg-canvas/60 px-4 py-3 text-sm text-muted">{a.summary}</p>
                      </div>
                    </div>
                  </td>
                </tr>
                </Fragment>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  No alerts match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
