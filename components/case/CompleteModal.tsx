"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import SeverityBadge from "@/components/ui/SeverityBadge";
import { decisionFixes, itemSub, tone } from "@/lib/complete";
import type { Alert, CaseRecord } from "@/lib/types";

const COLORS = ["var(--color-accent)", "var(--color-correct)", "var(--color-medium)", "var(--color-high)", "var(--color-critical)", "var(--color-low)", "var(--color-ink)"];
const SPARK = ["var(--color-accent)", "var(--color-medium)", "var(--color-correct)", "var(--color-ink)"];
// Fixed pseudo-random numbers, so the same score always throws the same confetti.
const seed = (i: number) => {
  const x = Math.sin(i * 77.3 + 1.7) * 10000;
  return x - Math.floor(x);
};
const css = (v: Record<string, string>) => v as CSSProperties;
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Shown once, right after a case is submitted: the score, what was right and wrong, and a way into the full report. */
export default function CompleteModal({
  alert,
  record,
  onClose,
}: {
  alert: Pick<Alert, "id" | "title" | "topic" | "severity" | "difficulty">;
  record: CaseRecord;
  /** viewReport is true when the student chose "View report". */
  onClose: (viewReport: boolean) => void;
}) {
  const { feedback, submission } = record;
  const t = tone(feedback.score);
  const fixes = decisionFixes(feedback.items);
  const [n, setN] = useState(() => (reduced() ? feedback.score : 0));
  const viewRef = useRef<HTMLButtonElement>(null);

  // The number counts up once the stamp has landed. With reduced motion it simply shows the score.
  useEffect(() => {
    if (reduced()) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, Math.max(0, (now - t0 - 600) / 1100));
      setN(Math.round(feedback.score * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [feedback.score]);

  useEffect(() => {
    viewRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const pieces = useMemo(
    () =>
      Array.from({ length: t.pieces }, (_, i) =>
        css({
          left: `${(seed(i) * 100).toFixed(1)}vw`,
          "--sx": `${(seed(i + 20) * 160 - 80).toFixed(0)}px`,
          "--rot": `${(seed(i + 30) * 1080).toFixed(0)}deg`,
          "--d": `${(2.6 + seed(i + 40) * 1.6).toFixed(2)}s`,
          "--dl": `${(0.55 + seed(i + 50) * 1.2).toFixed(2)}s`,
          width: `${(7 + seed(i + 3) * 7).toFixed(0)}px`,
          height: `${(4 + seed(i + 6) * 6).toFixed(0)}px`,
          borderRadius: i % 4 === 0 ? "50%" : "2px",
          background: COLORS[i % COLORS.length],
        }),
      ),
    [t.pieces],
  );
  const sparks = useMemo(
    () =>
      Array.from({ length: t.sparks }, (_, i) =>
        css({ "--a": `${((i * 360) / t.sparks + 6).toFixed(0)}deg`, "--r": i % 2 ? "150px" : "210px", background: SPARK[i % SPARK.length] }),
      ),
    [t.sparks],
  );

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-labelledby="cc-title">
      <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={() => onClose(false)} />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {pieces.map((style, i) => (
          <i key={i} className="cc-fall" style={style} />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center overflow-y-auto p-4">
        <div className="cc-pop w-full max-w-[620px] max-h-full">
          <div className="cc-shake relative rounded-2xl border border-line bg-panel p-6 shadow-2xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs tracking-widest text-muted">
              <span className="flex flex-wrap items-center gap-2">
                <span className="text-accent">{alert.id}</span>
                <span>{alert.topic.toUpperCase()}</span>
                <SeverityBadge severity={alert.severity} />
              </span>
              <span>CASE FILE</span>
            </div>
            <h2 id="cc-title" className="mt-3 max-w-md text-xl font-semibold leading-snug tracking-tight">
              {alert.title}
            </h2>

            <div className="relative mt-5 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="sr-only">
                  Score {feedback.score} out of 100. {t.head}.
                </p>
                <p className="text-sm text-muted" aria-hidden="true">
                  Your score
                </p>
                <p className="mt-0.5 flex items-baseline gap-1.5" aria-hidden="true">
                  <span className="font-mono text-7xl font-bold leading-none tracking-tighter sm:text-[88px]" style={{ color: t.color }}>
                    {n}
                  </span>
                  <span className="text-xl text-muted">/100</span>
                </p>
                <p className="mt-1.5 text-base font-semibold" style={{ color: t.color }} aria-hidden="true">
                  {t.head}
                </p>
              </div>

              <div className="relative h-[110px] w-[230px] sm:h-[120px] sm:w-[260px]" aria-hidden="true">
                <div className="absolute left-1/2 top-1/2 h-0 w-0">
                  <i className="cc-wave" style={{ borderColor: t.color }} />
                  {sparks.map((style, i) => (
                    <i key={i} className="cc-spark" style={style} />
                  ))}
                </div>
                <div
                  className="cc-stamp absolute inset-0 flex flex-col items-center justify-center rounded-[10px] border-4 font-mono font-bold leading-none tracking-wider"
                  style={{ borderColor: t.color, color: t.color, boxShadow: `inset 0 0 0 2px ${t.color}` }}
                >
                  <span className="text-[30px] sm:text-[34px]">CASE</span>
                  <span className="text-[30px] sm:text-[34px]">CLOSED</span>
                </div>
              </div>
            </div>

            <ul className="mt-6 space-y-3.5">
              {feedback.items.map((it, i) => {
                const col = it.points === it.max ? "var(--color-correct)" : "var(--color-missed)";
                const delay = `${(0.9 + i * 0.2).toFixed(1)}s`;
                return (
                  <li key={it.label} className="cc-in" style={css({ "--dl": delay })}>
                    <div className="flex justify-between text-[13px]">
                      <span className="font-medium">
                        {it.label} <span className="font-normal text-muted">· {itemSub(it.label, submission)}</span>
                      </span>
                      <span className="font-mono" style={{ color: col }}>
                        {it.points}/{it.max}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-raised">
                      <div className="cc-bar h-full rounded-full" style={css({ width: `${it.max ? (it.points / it.max) * 100 : 0}%`, background: col, "--dl": delay })} />
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className={`cc-in mt-5 rounded-xl border bg-canvas p-3.5 ${fixes.length ? "border-medium/40" : "border-correct/40"}`} style={css({ "--dl": "1.3s" })}>
              <p className={`text-xs uppercase tracking-wide ${fixes.length ? "text-medium" : "text-correct"}`}>{fixes.length ? "What to change" : "No marks lost"}</p>
              {fixes.length ? (
                <ul className="mt-2 space-y-1.5 text-[13px]">
                  {fixes.slice(0, 2).map((f) => (
                    <li key={f.label} className="flex gap-2">
                      <span className="text-medium">›</span>
                      <span>
                        <b>{f.label}:</b> {f.note}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-[13px]">Your decisions were right. Open the report to compare your wording with the model report.</p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                ref={viewRef}
                type="button"
                onClick={() => onClose(true)}
                className="min-h-12 flex-1 rounded-xl bg-accent px-6 text-[15px] font-semibold text-canvas hover:opacity-90"
              >
                View report
              </button>
              <Link
                href="/queue"
                onClick={() => onClose(false)}
                className="inline-flex min-h-12 items-center rounded-xl border border-line px-6 text-[15px] font-medium hover:border-accent hover:text-accent"
              >
                Next alert
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
