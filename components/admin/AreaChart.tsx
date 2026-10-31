// A small area chart drawn as plain SVG, so the dashboard needs no chart library. Hover (or long-press) a day to see its number.
// Pure markup: it runs on the server and ships no JavaScript to the browser.

const W = 720;
const H = 200;

/** Round the top of the scale up to 1, 2, 4, 5 or 10 times a power of ten, so the grid labels stay tidy. */
function niceMax(value: number): number {
  const v = Math.max(value, 2); // at least 2, so the middle grid label is a whole number
  const pow = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 4, 5, 10].map((m) => m * pow).find((m) => m >= v) ?? 10 * pow;
}

type Point = { label: string; value: number };

export default function AreaChart({ points, unit, label }: { points: Point[]; unit: string; label: string }) {
  const n = points.length;
  const gid = `admin-area-${label.replace(/\W/g, "")}`; // one gradient id per chart, so two charts on a page do not share an id
  const top = niceMax(Math.max(0, ...points.map((p) => p.value)));
  const x = (i: number) => (n < 2 ? W / 2 : (i / (n - 1)) * W);
  const y = (v: number) => H - (v / top) * H;
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const area = n ? `${line} L${x(n - 1).toFixed(1)} ${H} L${x(0).toFixed(1)} ${H} Z` : "";
  const col = n ? W / n : W;
  // about five date labels, evenly spaced; with few points show them all
  const ticks = n <= 8 ? points.map((p) => p.label) : [0, 0.25, 0.5, 0.75, 1].map((f) => points[Math.round(f * (n - 1))].label);
  const total = points.reduce((s, p) => s + p.value, 0);
  const peak = points.reduce((a, p) => (p.value > a.value ? p : a), points[0] ?? { label: "", value: 0 });

  return (
    <div className="flex gap-2">
      <div className="flex h-[200px] flex-col justify-between pb-0 text-[11px] leading-none text-muted tabular-nums" aria-hidden="true">
        <span>{top}</span>
        <span>{top / 2}</span>
        <span>0</span>
      </div>
      <div className="min-w-0 flex-1">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="none"
          className="block h-[200px] w-full overflow-visible"
          role="img"
          aria-label={`${label} per day. ${total} in total${total ? `, busiest day ${peak.label} with ${peak.value}` : ""}.`}
        >
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--color-accent)", stopOpacity: 0.32 }} />
              <stop offset="1" style={{ stopColor: "var(--color-accent)", stopOpacity: 0 }} />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((f) => (
            <line key={f} x1="0" x2={W} y1={H * f} y2={H * f} stroke="var(--color-line)" strokeDasharray={f === 1 ? undefined : "3 4"} vectorEffect="non-scaling-stroke" />
          ))}
          {n > 0 && <path d={area} fill={`url(#${gid})`} />}
          {n > 0 && <path d={line} fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />}
          {points.map((p, i) => (
            <g key={p.label + i} className="group">
              <line x1={x(i)} x2={x(i)} y1="0" y2={H} stroke="var(--color-muted)" strokeWidth="1" className="opacity-0 group-hover:opacity-60" vectorEffect="non-scaling-stroke" />
              <rect x={x(i) - col / 2} y="0" width={col} height={H} fill="transparent">
                <title>{`${p.label}: ${p.value} ${unit}`}</title>
              </rect>
            </g>
          ))}
        </svg>
        <div className="mt-2 flex justify-between text-[11px] leading-none text-muted" aria-hidden="true">
          {ticks.map((t, i) => (
            <span key={t + i}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
