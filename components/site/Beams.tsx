"use client";

import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;
const SCALE = 0.5; // drawn at half size and stretched by CSS: soft shapes, a quarter of the pixels
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

type Beam = { x: number; w: number; a: number; v: number; p: number; c: string };

// Slanted shafts of light drifting across the page, a few thin and sharp, most wide and soft.
// A soft cyan light follows the pointer. The canvas fades as the page scrolls so text stays readable.
// Reduced motion draws one still frame. No libraries, plain 2D canvas.
export default function Beams() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;

    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, raf = 0, rz = 0;
    let beams: Beam[] = [];
    const m = { x: -9999, y: -9999, sx: -9999, sy: -9999 }; // raw and smoothed pointer
    const t0 = performance.now();

    const build = () => {
      beams = Array.from({ length: 20 }, (_, i) => {
        const thin = i % 4 === 0;
        return { x: rnd(0, 1), w: thin ? rnd(1, 3) : rnd(24, 120), a: thin ? rnd(0.16, 0.3) : rnd(0.05, 0.15), v: rnd(0.006, 0.024), p: rnd(0, TAU), c: Math.random() < 0.8 ? "34,211,238" : "96,165,250" };
      });
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      const L = Math.hypot(W, H) * 1.1, span = W * 1.5;
      const px = m.sx > -999 ? (m.sx / W - 0.5) * -60 : 0;
      for (const b of beams) {
        const x = ((b.x * span + t * b.v) % span) - W * 0.25 + px;
        const al = b.a * (0.6 + 0.4 * Math.sin(t / 2600 + b.p));
        ctx.save();
        ctx.translate(x, H / 2);
        ctx.rotate(0.5);
        const g = ctx.createLinearGradient(-b.w / 2, 0, b.w / 2, 0);
        g.addColorStop(0, `rgba(${b.c},0)`);
        g.addColorStop(0.5, `rgba(${b.c},${al.toFixed(3)})`);
        g.addColorStop(1, `rgba(${b.c},0)`);
        ctx.fillStyle = g;
        ctx.fillRect(-b.w / 2, -L / 2, b.w, L);
        ctx.restore();
      }
      if (m.sx > -999) {
        const sg = ctx.createRadialGradient(m.sx, m.sy, 0, m.sx, m.sy, 280);
        sg.addColorStop(0, "rgba(34,211,238,.17)");
        sg.addColorStop(1, "rgba(34,211,238,0)");
        ctx.fillStyle = sg;
        ctx.fillRect(m.sx - 280, m.sy - 280, 560, 560);
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const size = () => {
      W = innerWidth;
      H = innerHeight;
      cv.width = Math.max(2, Math.round(W * SCALE));
      cv.height = Math.max(2, Math.round(H * SCALE));
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      build();
      if (reduce) draw(4000);
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (m.x < -999 || m.sx < -999) { m.sx = m.x; m.sy = m.y; }
      else { m.sx += (m.x - m.sx) * 0.14; m.sy += (m.y - m.sy) * 0.14; }
      draw(Math.max(0, now - t0)); // rAF time can precede t0 on the first frame
    };

    const dim = () => {
      cv.style.opacity = (1 - 0.6 * Math.min(1, scrollY / (innerHeight * 0.8))).toFixed(2);
    };
    const onMove = (e: PointerEvent) => { m.x = e.clientX; m.y = e.clientY; };
    const onLeave = () => { m.x = m.y = -9999; };
    // Mobile browsers fire resize as the address bar slides. Rebuild only for a real change.
    const onResize = () => {
      clearTimeout(rz);
      rz = window.setTimeout(() => {
        if (innerWidth !== W || Math.abs(innerHeight - H) > 150) size();
      }, 150);
    };

    size();
    dim();
    if (!reduce) raf = requestAnimationFrame(loop);
    addEventListener("scroll", dim, { passive: true });
    addEventListener("resize", onResize);
    if (!reduce) {
      addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rz);
      removeEventListener("scroll", dim);
      removeEventListener("resize", onResize);
      removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={ref} className="bg" aria-hidden="true" />;
}
