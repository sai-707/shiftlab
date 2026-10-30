"use client";

import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const WORD = "ShiftLab";
const RADIUS = 130; // how far the pointer pushes dots
const RIPPLE_MS = 900;

type Dot = { x: number; y: number; hx: number; hy: number; vx: number; vy: number; r: number };

type Props = { scale?: number; gap?: number; className?: string };

// The "ShiftLab" wordmark drawn as dots that spring away from the pointer and ripple on click.
// Ported from the DottedShiftLab component with four fixes: transparent canvas (the page shows through),
// rebuild on resize, wait for the font before measuring, no per-frame grain.
export default function DottedWordmark({ scale = 0.72, gap = 7, className }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const cv = el?.querySelector("canvas");
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // next/font puts the real family name in this variable; the canvas cannot use the CSS variable directly
    const family = getComputedStyle(document.body).getPropertyValue("--font-inter").trim() || "Inter";
    const font = (px: number) => `800 ${px}px ${family}, 'Helvetica Neue', Arial, sans-serif`;

    let dots: Dot[] = [];
    let W = 0, H = 0, dpr = 1, raf = 0, visible = true, dead = false;
    let px = -99999, py = -99999; // pointer, local to the canvas
    let rx = 0, ry = 0, rt = -1; // last click ripple

    const build = () => {
      const r = cv.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      W = Math.round(r.width);
      H = Math.round(r.height);
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = W * dpr;
      cv.height = H * dpr;

      // draw the word once in a scratch canvas, then sample it into dots
      const m = document.createElement("canvas");
      m.width = W;
      m.height = H;
      const mc = m.getContext("2d", { willReadFrequently: true });
      if (!mc) return;
      const narrow = W < 520;
      const sc = narrow ? Math.min(0.9, scale + 0.24) : scale;
      mc.font = font(100);
      const size = (W * sc) / mc.measureText(WORD).width * 100;
      mc.font = font(size);
      const ms = mc.measureText(WORD);
      const asc = ms.actualBoundingBoxAscent || size * 0.72;
      mc.fillStyle = "#fff";
      mc.fillText(WORD, (W - ms.width) / 2, H / 2 + asc / 2);
      const data = mc.getImageData(0, 0, W, H).data;
      const step = Math.max(3, narrow ? Math.min(gap, 4) : gap);

      dots = [];
      for (let y = 0; y < H; y += step)
        for (let x = 0; x < W; x += step) {
          let a = 0;
          for (let sy = 0; sy < 3; sy++)
            for (let sx = 0; sx < 3; sx++) {
              const X = Math.min(W - 1, Math.floor(x + ((sx + 0.5) * step) / 3));
              const Y = Math.min(H - 1, Math.floor(y + ((sy + 0.5) * step) / 3));
              a += data[(Y * W + X) * 4 + 3];
            }
          const cov = a / (9 * 255);
          if (cov < 0.06) continue;
          const hx = x + step / 2, hy = y + step / 2;
          dots.push({ x: hx, y: hy, hx, hy, vx: 0, vy: 0, r: Math.sqrt(cov) * step * 0.56 });
        }
      wake();
    };

    const frame = (t: number) => {
      raf = 0;
      if (dead || !visible || !W) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const age = rt < 0 ? Infinity : t - rt;
      const rad = age * 1.1;
      let moving = false;
      for (const d of dots) {
        if (!reduce) {
          const dx = d.x - px, dy = d.y - py, dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < RADIUS) {
            const f = (1 - dist / RADIUS) * 4.2;
            d.vx += (dx / (dist + 0.001)) * f;
            d.vy += (dy / (dist + 0.001)) * f;
          }
          if (age < RIPPLE_MS) {
            const qx = d.hx - rx, qy = d.hy - ry, qd = Math.sqrt(qx * qx + qy * qy);
            const band = 1 - Math.min(1, Math.abs(qd - rad) / 30);
            if (band > 0) {
              const rf = band * 3.2 * (1 - age / RIPPLE_MS);
              d.vx += (qx / (qd + 0.001)) * rf;
              d.vy += (qy / (qd + 0.001)) * rf;
            }
          }
          d.vx += (d.hx - d.x) * 0.055;
          d.vy += (d.hy - d.y) * 0.055;
          d.vx *= 0.84;
          d.vy *= 0.84;
          d.x += d.vx;
          d.y += d.vy;
          if (Math.abs(d.vx) + Math.abs(d.vy) > 0.02 || Math.abs(d.x - d.hx) + Math.abs(d.y - d.hy) > 0.05) moving = true;
          else { d.x = d.hx; d.y = d.hy; d.vx = d.vy = 0; }
        }
        // white at rest, tinting cyan the further a dot is pushed from home
        const k = Math.min(1, Math.hypot(d.x - d.hx, d.y - d.hy) / 34);
        ctx.fillStyle = k > 0.02 ? `rgb(${Math.round(255 - 221 * k)},${Math.round(255 - 44 * k)},${Math.round(255 - 17 * k)})` : "#fff";
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, TAU);
        ctx.fill();
      }
      // keep animating while dots move, a ripple runs, or the pointer is close enough to push
      const near = px > -RADIUS && px < W + RADIUS && py > -RADIUS && py < H + RADIUS;
      if (moving || age < RIPPLE_MS || near) raf = requestAnimationFrame(frame);
    };

    function wake() {
      if (!raf && visible && !dead && cv!.offsetParent) raf = requestAnimationFrame(frame);
    }

    const local = (e: PointerEvent) => {
      const b = cv.getBoundingClientRect();
      return [e.clientX - b.left, e.clientY - b.top];
    };
    const onMove = (e: PointerEvent) => { [px, py] = local(e); wake(); };
    const onLeave = () => { px = py = -99999; wake(); };
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest("button, a, input, label, .card, .alert")) return;
      [rx, ry] = local(e);
      rt = performance.now();
      wake();
    };

    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; wake(); });
    io.observe(cv);
    let ro: ResizeObserver | undefined;
    // measure only after the font is ready, or the dots are built from a fallback font
    const ready = document.fonts?.load ? document.fonts.load(font(100), WORD) : Promise.resolve();
    ready
      .catch(() => {})
      .then(() => {
        if (dead) return;
        ro = new ResizeObserver(build);
        ro.observe(cv);
      });

    if (!reduce) {
      addEventListener("pointermove", onMove, { passive: true });
      addEventListener("pointerdown", onDown);
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro?.disconnect();
      removeEventListener("pointermove", onMove);
      removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, [scale, gap]);

  return (
    <div ref={root} className={className ? `wm ${className}` : "wm"} role="img" aria-label={WORD}>
      <canvas aria-hidden="true" />
    </div>
  );
}
