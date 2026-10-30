import Link from "next/link";
import type { ReactNode } from "react";
import { RANGES, shortDay, type Delta, type Range } from "@/lib/adminStats";

// Small pieces shared by the Dashboard and Analytics pages. Server-rendered markup only; the pickers are plain links.

export const cell = "bg-canvas p-4 md:p-5";
export const title = "text-base font-medium";
export const sub = "mt-1 text-sm text-muted";
export const th = "py-2 pr-4 text-left text-xs font-normal uppercase tracking-wide text-muted";
export const td = "border-t border-line py-2.5 pr-4 align-top";
export const pill = (on: boolean) => `rounded-md px-3 py-1 text-sm whitespace-nowrap ${on ? "bg-raised text-ink" : "text-muted hover:text-ink"}`;

export function Chevron({ up }: { up: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-3 w-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={up ? "m18 15-6-6-6 6" : "m6 9 6 6 6-6"} />
    </svg>
  );
}

export const tone = (d: Delta) => (d.dir === "up" ? "text-correct" : d.dir === "down" ? "text-missed" : "text-muted");

export function DeltaText({ d }: { d: Delta }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs tabular-nums ${tone(d)}`}>
      {(d.dir === "up" || d.dir === "down") && <Chevron up={d.dir === "up"} />}
      {d.text}
      <span className="sr-only">{d.dir === "up" ? " up on the period before" : d.dir === "down" ? " down on the period before" : ""}</span>
    </span>
  );
}

export function Bar({ pct, className = "bg-accent" }: { pct: number; className?: string }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-raised">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="mt-4 rounded-lg border border-dashed border-line p-4 text-sm text-muted">{children}</p>;
}

/** The "Welcome back" heading of a page, with an optional control on the right. */
export function PageTitle({ heading, text, action }: { heading: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold leading-tight">{heading}</h1>
        <p className="text-base text-muted">{text}</p>
      </div>
      {action}
    </div>
  );
}

/** 7 / 30 / 90 days. `hrefOf` says where each choice goes, so each page keeps its own other settings. */
export function RangePicker({ current, hrefOf }: { current: Range; hrefOf: (r: Range) => string }) {
  return (
    <div role="group" aria-label="Time range" className="inline-flex shrink-0 self-start rounded-lg border border-line p-0.5">
      {RANGES.map((r) => (
        <Link key={r} href={hrefOf(r)} aria-current={r === current ? "true" : undefined} className={pill(r === current)}>
          {r} days
        </Link>
      ))}
    </div>
  );
}

/** The one bordered box a page's cards sit in; the cards inside are separated by 1px rules. */
export function Grid({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

export function NoData() {
  return (
    <p className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm">
      Tracking is on, but nothing has been recorded yet. Open the site in another browser, or sign out and browse as a guest, and the
      numbers will start to fill in. To preview the screen with made-up guest traffic, run <code className="font-mono text-xs">supabase/demo/seed_demo_events.sql</code>.
    </p>
  );
}

export function Footnote({ since }: { since: string | null }) {
  return (
    <p className="text-xs text-muted">
      {since ? `Counting visits and closed cases since ${shortDay(since)}. ` : ""}
      Days follow India time. Admin accounts and your own signed-in visits are left out of every number.
    </p>
  );
}

export function Unavailable({ code }: { code: string }) {
  return (
    <p role="alert" className="rounded-xl border border-missed/40 bg-missed/5 p-4 text-sm">
      The numbers could not be loaded (code {code}). Did you run <code className="font-mono text-xs">supabase/migrations/0003_analytics.sql</code> in the Supabase SQL Editor?
    </p>
  );
}
