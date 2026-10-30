"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { lookupIndicator } from "@/app/actions";
import type { IntelReport, IntelResult, IntelVerdict } from "@/lib/types";

const TONE: Record<IntelVerdict, { word: string; text: string; chip: string }> = {
  malicious: { word: "Dangerous", text: "text-critical", chip: "border-critical/40 bg-critical/10 text-critical" },
  suspicious: { word: "Suspicious", text: "text-high", chip: "border-high/40 bg-high/10 text-high" },
  clean: { word: "Looks safe", text: "text-correct", chip: "border-correct/40 bg-correct/10 text-correct" },
  internal: { word: "Our own network", text: "text-low", chip: "border-low/40 bg-low/10 text-low" },
  unknown: { word: "Not seen before", text: "text-high", chip: "border-high/40 bg-high/10 text-high" },
};

const CIRC = 2 * Math.PI * 50;
const STEP_MS = 60;

/** Delay each block a little more than the last so the report builds from the top. */
const rise = (i: number) => ({ animationDelay: `${i * 90}ms` });

function Ring({ report, verdict }: { report: IntelReport; verdict: IntelVerdict }) {
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFilled(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const total = report.vendors.length;
  const showCount = verdict !== "internal" && !report.unseen;
  const frac = showCount ? report.flagged / total : 0;

  return (
    <div className={`relative size-28 shrink-0 ${TONE[verdict].text}`}>
      <svg viewBox="0 0 120 120" className="size-28 -rotate-90" aria-hidden>
        <circle cx="60" cy="60" r="50" fill="none" strokeWidth="10" className="stroke-raised" />
        <circle
          cx="60"
          cy="60"
          r="50"
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          className="ring-arc"
          strokeDasharray={`${filled ? CIRC * frac : 0} ${CIRC}`}
        />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <b className="text-3xl leading-none tabular-nums text-ink">{showCount ? report.flagged : verdict === "internal" ? "LAN" : "?"}</b>
        <span className="mt-1 text-[11px] text-muted">{showCount ? `of ${total} vendors` : verdict === "internal" ? "internal" : "no data"}</span>
      </div>
    </div>
  );
}

function Report({ result, report }: { result: IntelResult; report: IntelReport }) {
  const tone = TONE[result.verdict];
  const hits = report.vendors.filter((v) => v.hit);

  return (
    <div className="mt-4 rounded-xl border border-line bg-canvas/60 p-5" aria-live="polite">
      <div className="rise flex flex-wrap items-center gap-5" style={rise(0)}>
        <Ring report={report} verdict={result.verdict} />
        <div className="min-w-0 flex-1">
          <div className="break-all font-mono text-base font-semibold">{result.query}</div>
          <span className={`mt-2 inline-block rounded-full border px-3 py-0.5 text-sm font-semibold ${tone.chip}`}>{tone.word}</span>
          <p className="mt-2 max-w-prose text-sm">{result.note}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {report.tags.map((t) => (
              <span key={t} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {report.facts.length > 0 && (
        <section className="rise mt-5" style={rise(1)}>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">Key facts</h3>
          <dl className="grid grid-cols-[minmax(6rem,9rem)_minmax(0,1fr)] text-sm">
            {report.facts.map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="border-b border-line py-2 text-muted">{k}</dt>
                <dd className="break-words border-b border-line py-2 font-mono text-[13px]">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="rise mt-5" style={rise(2)}>
        <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted">What to do next</h3>
        <div className={`rounded-lg border px-4 py-3 text-sm ${report.unseen ? "border-high/50 bg-high/10" : "border-line bg-raised"}`}>
          {report.unseen && <p className="font-semibold text-high">No record is not the same as safe.</p>}
          <ol className="list-decimal space-y-0.5 pl-5">
            {report.next.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ol>
        </div>
      </section>

      {hits.length > 0 || result.verdict === "clean" ? (
        <details className="rise group mt-5 border-t border-line" style={rise(3)}>
          <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-sm text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
            See all {report.vendors.length} vendors
            <span className="text-base leading-none group-open:hidden">+</span>
            <span className="hidden text-base leading-none group-open:inline">−</span>
          </summary>
          <ul className="grid gap-x-6 pb-2 sm:grid-cols-2 lg:grid-cols-3">
            {report.vendors.map((v) => (
              <li key={v.name} className={`flex items-center justify-between gap-2 border-b border-line py-1.5 text-sm ${v.hit ? "text-critical" : "text-correct"}`}>
                <span className={`min-w-0 truncate ${v.hit ? "text-ink" : "text-muted"}`}>{v.name}</span>
                <span className="shrink-0 text-xs">{v.hit ?? "Clean"}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <p className="rise mt-4 text-xs text-muted" style={rise(4)}>
        ShiftLab Intel is made-up training data. It is not connected to any real reputation service.
      </p>
    </div>
  );
}

export default function LookupBox({ onLookup }: { onLookup?: () => void }) {
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [scan, setScan] = useState<{ n: number; names: string[] } | null>(null);
  const [result, setResult] = useState<IntelResult | null>(null);
  const timer = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => () => clearInterval(timer.current), []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = query.trim();
    if (!value || busy) return;
    onLookup?.();
    setBusy(true);
    setResult(null);
    setScan({ n: 0, names: [] });

    const r = await lookupIndicator(value);
    if (r.report) {
      const names = r.report.vendors.map((v) => v.name);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      await new Promise<void>((resolve) => {
        let n = 0;
        timer.current = setInterval(() => {
          n = Math.min(names.length, n + (reduced ? 6 : 1));
          setScan({ n, names });
          if (n >= names.length) {
            clearInterval(timer.current);
            setTimeout(resolve, reduced ? 0 : 280);
          }
        }, reduced ? 20 : STEP_MS);
      });
    }
    setScan(null);
    setResult(r);
    setBusy(false);
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="IP address, domain, link or file hash"
          aria-label="Indicator to check"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 py-2.5 font-mono text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          type="submit"
          disabled={busy}
          className="btn-shine press rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-canvas hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Checking…" : "Check"}
        </button>
      </form>
      <p className="mt-2 text-xs text-muted">Copy the value straight from the alert or the logs. One wrong character gives a different answer.</p>

      {scan && (
        <div className="fade-in mt-4 grid justify-items-center gap-3 rounded-xl border border-line bg-canvas/60 px-4 py-8 text-center" aria-live="polite">
          <div className="radar" aria-hidden />
          <div className="h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-raised">
            <div className="h-full rounded-full bg-accent transition-[width] duration-100 ease-linear" style={{ width: `${scan.names.length ? (scan.n / scan.names.length) * 100 : 0}%` }} />
          </div>
          <p className="text-sm text-muted">
            {scan.n > 0 ? (
              <>
                Asking vendor <b className="font-semibold text-ink">{scan.n} of {scan.names.length}</b>: {scan.names[scan.n - 1]}
              </>
            ) : (
              "Starting scan…"
            )}
          </p>
        </div>
      )}

      {result?.report && <Report result={result} report={result.report} />}

      {result && !result.report && (
        <div className="fade-in mt-4 rounded-xl border border-line bg-canvas/60 p-4 text-sm" aria-live="polite">
          <span className="font-mono">{result.query || "Nothing entered"}</span>
          <p className="mt-2 text-muted">{result.note}</p>
        </div>
      )}
    </div>
  );
}
