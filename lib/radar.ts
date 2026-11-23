// Geometry for the profile skill radar. Pure, so it is tested without a browser.
export type Pt = { x: number; y: number };

const round = (n: number) => Math.round(n * 100) / 100;

/** The point on axis `i` of `n` at `value` (0 to 100) of the way out. Axis 0 points straight up, the rest follow clockwise. */
export function radarPoint(i: number, n: number, value: number, cx: number, cy: number, r: number): Pt {
  const v = Math.min(100, Math.max(0, Number.isFinite(value) ? value : 0)) / 100;
  const angle = (2 * Math.PI * i) / n - Math.PI / 2;
  return { x: round(cx + Math.cos(angle) * r * v), y: round(cy + Math.sin(angle) * r * v) };
}

/** The `points` attribute of a polygon with one corner per value. */
export function radarPath(values: number[], cx: number, cy: number, r: number): string {
  return values.map((v, i) => radarPoint(i, values.length, v, cx, cy, r)).map((p) => `${p.x},${p.y}`).join(" ");
}
