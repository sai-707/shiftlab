"use client";

import { useEffect, useRef } from "react";

// A burst of paper pieces from both bottom corners, drawn on one canvas that sits behind the window's card.
// No package: about a hundred small rectangles with gravity and drag, flipping as they fall. Skipped with reduced motion.

type Piece = { x: number; y: number; vx: number; vy: number; w: number; h: number; rot: number; vr: number; flip: number; vf: number; color: string; life: number };

const rand = (a: number, b: number) => a + Math.random() * (b - a);

export default function PaperBlast({ colors, big = false }: { colors: string[]; big?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    const size = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();

    const perSide = big ? 70 : 44;
    const speed = Math.sqrt(h * 0.416) * 1.2; // the fastest pieces climb to about two thirds of the screen height, whatever its size
    const pieces: Piece[] = [];
    for (const side of [-1, 1]) {
      for (let i = 0; i < perSide; i++) {
        const angle = (side < 0 ? rand(-78, -48) : rand(-132, -102)) * (Math.PI / 180);
        const v = rand(0.55, 1.05) * speed;
        pieces.push({
          x: side < 0 ? -8 : w + 8,
          y: h + 8,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v,
          w: rand(7, 13),
          h: rand(10, 20),
          rot: rand(0, Math.PI * 2),
          vr: rand(-0.22, 0.22),
          flip: rand(0, Math.PI * 2),
          vf: rand(0.12, 0.3),
          color: colors[i % colors.length],
          life: rand(2.6, 3.6),
        });
      }
    }

    let raf = 0;
    let last = performance.now();
    const t0 = last;
    const frame = (now: number) => {
      const dt = Math.min(0.034, (now - last) / 1000) * 60; // in 60 fps steps
      last = now;
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of pieces) {
        const age = (now - t0) / 1000;
        if (age > p.life || p.y > h + 40) continue;
        alive++;
        p.vx *= 0.985 ** dt;
        p.vy = p.vy * 0.985 ** dt + 0.32 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.flip += p.vf * dt;
        ctx.save();
        ctx.globalAlpha = Math.min(1, (p.life - age) * 1.4);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.flip)); // a paper turning over
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (alive > 0) raf = requestAnimationFrame(frame);
      else ctx.clearRect(0, 0, w, h);
    };
    raf = requestAnimationFrame(frame);
    window.addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, [colors, big]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 h-full w-full" />;
}
