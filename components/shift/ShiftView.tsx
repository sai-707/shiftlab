"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { checkShift, type ShiftResult } from "@/app/shift-actions";
import { SHIFTS, TREATMENTS, type Shift } from "@/content/shifts";
import { shiftProgress } from "@/lib/practiceProgress";
import SeverityBadge from "@/components/ui/SeverityBadge";

const CLOCK_SECONDS = 120;
const TIER_LABEL: Record<number, string> = { 1: "Do first", 2: "Next", 3: "Then", 4: "Last" };
const treatLabel = (id: string | null) => TREATMENTS.find((t) => t.id === id)?.label ?? "No choice";

export default function ShiftView() {
  const [shift, setShift] = useState<Shift | null>(null);
  const [useClock, setUseClock] = useState(false);
  const [ranks, setRanks] = useState<string[]>([]);
  const [treat, setTreat] = useState<Record<string, string>>({});
  const [left, setLeft] = useState(CLOCK_SECONDS);
  const [result, setResult] = useState<ShiftResult | null>(null);
  const [pending, startTransition] = useTransition();
  const { best } = shiftProgress.useStore();
  const latest = useRef({ shift, ranks, treat });
  useEffect(() => {
    latest.current = { shift, ranks, treat };
  });
  const done = result?.ok ? result : null;

  const submit = useCallback(() => {
    const { shift: s, ranks: r, treat: t } = latest.current;
    if (!s) return;
    startTransition(async () => {
      const res = await checkShift(s.id, r, t);
      setResult(res);
      if (res.ok) shiftProgress.set({ best: { ...shiftProgress.get().best, [s.id]: Math.max(shiftProgress.get().best[s.id] ?? 0, res.score) } });
    });
  }, []);

  // The clock only runs while a shift is open, the clock is on and nothing has been scored.
  const running = !!shift && useClock && !result;
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setLeft((n) => n - 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  useEffect(() => {
    if (running && left <= 0) submit();
  }, [running, left, submit]);

  function open(s: Shift) {
    setShift(s);
    setRanks([]);
    setTreat({});
    setResult(null);
    setLeft(CLOCK_SECONDS);
  }

  function toggleRank(id: string) {
    setRanks((r) => (r.includes(id) ? r.filter((x) => x !== id) : [...r, id]));
  }

  if (!shift) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">
          Real shifts are not one alert at a time. Several land together, and the order you work them in matters as much as
          your verdict on each. Pick a shift, put the alerts in the order you would work them, then choose how to treat each one.
        </p>
        <label className="flex w-fit items-center gap-2 text-sm">
          <input type="checkbox" checked={useClock} onChange={(e) => setUseClock(e.target.checked)} />
          Add pressure: 2 minute clock (it submits whatever you have done when time runs out)
        </label>
        <ul className="grid gap-3 sm:grid-cols-3">
          {SHIFTS.map((s) => (
            <li key={s.id} className="flex flex-col rounded-2xl border border-line bg-panel p-4">
              <p className="text-xs text-muted">{s.level} · {s.alerts.length} alerts</p>
              <h2 className="mt-1 font-semibold">{s.name}</h2>
              <p className="mt-2 flex-1 text-sm text-muted">{s.intro}</p>
              <p className="mt-3 text-xs text-muted">
                {best[s.id] !== undefined ? <span className="text-correct">Best: {best[s.id]}/100</span> : "Not tried yet"}
              </p>
              <button type="button" onClick={() => open(s)} className="mt-3 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90">
                Start shift
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const treated = Object.keys(treat).length;
  const mm = String(Math.max(0, Math.floor(left / 60)));
  const ss = String(Math.max(0, left % 60)).padStart(2, "0");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">{shift.name}</h2>
          <p className="text-sm text-muted">{shift.intro}</p>
        </div>
        {useClock && !done && (
          <p className={`rounded-lg border px-3 py-1 font-mono text-lg ${left <= 20 ? "border-missed text-missed" : "border-line"}`} role="timer" aria-label="Time left">
            {mm}:{ss}
          </p>
        )}
      </div>

      {!done && (
        <p className="text-xs text-muted">
          Step 1: tap each alert in the order you would work it (tap again to remove). Step 2: choose a treatment for each.
        </p>
      )}

      <ul className="space-y-3">
        {shift.alerts.map((a) => {
          const rank = ranks.indexOf(a.id) + 1;
          const item = done?.items.find((i) => i.id === a.id);
          return (
            <li key={a.id} className="rounded-2xl border border-line bg-panel p-4">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  disabled={!!done}
                  aria-pressed={rank > 0}
                  aria-label={rank > 0 ? `${a.title}, ranked ${rank}. Tap to remove.` : `Rank ${a.title} next`}
                  onClick={() => toggleRank(a.id)}
                  className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-full border text-sm font-semibold ${rank > 0 ? "border-accent bg-raised text-accent" : "border-line text-muted hover:border-muted"}`}
                >
                  {rank > 0 ? rank : "·"}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <SeverityBadge severity={a.severity} />
                    <span>{a.source}</span>
                    <span>{a.age}</span>
                    {a.live && <span className="rounded-full border border-high/40 px-2 py-0.5 text-high">Still growing</span>}
                  </div>
                  <p className="mt-1 font-medium">{a.title}</p>
                  <p className="mt-1 text-sm text-muted">{a.signal}</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label={`Treatment for ${a.title}`}>
                    {TREATMENTS.map((t) => (
                      <label
                        key={t.id}
                        title={t.hint}
                        className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm has-checked:border-accent has-checked:bg-raised ${done ? "pointer-events-none" : "border-line hover:border-muted"}`}
                      >
                        <input
                          type="radio"
                          name={a.id}
                          className="sr-only"
                          checked={treat[a.id] === t.id}
                          disabled={!!done}
                          onChange={() => setTreat((p) => ({ ...p, [a.id]: t.id }))}
                        />
                        {t.label}
                      </label>
                    ))}
                  </div>
                  {item && (
                    <div className="mt-3 space-y-1 text-sm">
                      <p className="text-xs text-muted">
                        Urgency: <span className="text-ink">{TIER_LABEL[item.tier]}</span> · You ranked it {item.rank ?? "not at all"}
                      </p>
                      <p className={item.rightTreatment ? "text-correct" : "text-missed"}>
                        {item.rightTreatment ? "Right treatment: " : `You chose ${treatLabel(item.picked)}. Better: `}
                        {treatLabel(item.ideal)}
                      </p>
                      <p className="text-muted">{item.why}</p>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {!done ? (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={submit}
            disabled={ranks.length < shift.alerts.length || treated < shift.alerts.length || pending}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90 disabled:opacity-40"
          >
            {pending ? "Checking…" : "End shift"}
          </button>
          <span className="text-xs text-muted">
            {ranks.length} ordered · {treated} treated
          </span>
          <button type="button" onClick={() => setShift(null)} className="text-xs text-muted underline hover:text-accent">
            Choose another shift
          </button>
          {result && !result.ok && <span className="text-sm text-missed">{result.error}</span>}
        </div>
      ) : (
        <div className="rounded-2xl border border-line bg-panel p-5">
          <p className="text-3xl font-semibold">
            {done.score}
            <span className="text-lg text-muted">/100</span>
          </p>
          <p className="mt-1 text-sm text-muted">
            Order: {done.order}/60 ({done.pairsRight} of {done.pairsTotal} pairs the right way round). Treatment: {done.treatment}/40 ({done.treatmentRight} of {done.total} right).
          </p>
          <p className="mt-2 text-sm">
            {done.firstTier === 1
              ? "You started with the most urgent alert. That is the habit that matters most."
              : done.firstTier === null
                ? "You did not rank anything, so every alert counted as last."
                : "Your first pick was not the most urgent alert. Look for the one that is still doing damage and read its reason below."}
          </p>
          {done.overEscalated >= 2 && (
            <p className="mt-2 text-sm text-muted">
              You escalated {done.overEscalated} alerts that did not need it. Escalating everything feels safe, but Level 2 stops trusting your escalations.
            </p>
          )}
          <div className="mt-4 flex gap-3">
            <button type="button" onClick={() => open(shift)} className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent">
              Try again
            </button>
            <button type="button" onClick={() => setShift(null)} className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent">
              Choose another shift
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
