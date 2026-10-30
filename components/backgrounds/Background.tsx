"use client";

import { useEffect, useRef } from "react";

type Scene = { frame: (dt: number) => void };
type MakeScene = (ctx: CanvasRenderingContext2D, w: number, h: number) => Scene;

const CYAN = "34,211,238";
const RED = "244,63,94";
const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** Full-screen canvas behind every page of the app. Pauses when the tab is hidden and draws one still frame for reduced motion. */
function CanvasLayer({ make }: { make: MakeScene }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let scene: Scene;
    let raf = 0;
    let last = 0;
    let w = 0;
    let h = 0;

    const setup = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * dpr;
      cv.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene = make(ctx, w, h);
      if (reduce) scene.frame(0.016);
    };
    const loop = (ts: number) => {
      const dt = Math.min(0.05, (ts - last) / 1000 || 0.016);
      last = ts;
      ctx.clearRect(0, 0, w, h);
      scene.frame(dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduce) return;
      cancelAnimationFrame(raf);
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    // a phone's address bar changes the height while scrolling; only rebuild for a real size change
    const onResize = () => {
      if (window.innerWidth !== w || Math.abs(window.innerHeight - h) > 150) setup();
    };
    const onVisible = () => (document.hidden ? cancelAnimationFrame(raf) : start());

    setup();
    start();
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [make]);

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}

/** Linked nodes like a network diagram. Every few seconds one node turns red, pulses, and its links glow. */
const threatMap: MakeScene = (ctx, w, h) => {
  const count = Math.min(90, Math.round((w * h) / 20000));
  const nodes = Array.from({ length: count }, () => ({
    x: rnd(0, w),
    y: rnd(0, h),
    vx: rnd(-0.3, 0.3),
    vy: rnd(-0.3, 0.3),
    r: rnd(1.2, 2.2),
  }));
  const reach = 150;
  let threat = -1;
  let t = 0;
  let next = 1.5;

  return {
    frame(dt) {
      t += dt;
      if (threat < 0 && t > next) {
        threat = Math.floor(Math.random() * nodes.length);
        t = 0;
      } else if (threat >= 0 && t > 4.5) {
        threat = -1;
        t = 0;
        next = rnd(2, 5);
      }
      for (const n of nodes) {
        n.x += n.vx * dt * 60;
        n.y += n.vy * dt * 60;
        if (n.x < -10) n.x = w + 10;
        else if (n.x > w + 10) n.x = -10;
        if (n.y < -10) n.y = h + 10;
        else if (n.y > h + 10) n.y = -10;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
          if (d >= reach) continue;
          const hot = i === threat || j === threat;
          ctx.strokeStyle = `rgba(${hot ? RED : CYAN},${(1 - d / reach) * (hot ? 0.55 : 0.16)})`;
          ctx.lineWidth = hot ? 1.2 : 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
      nodes.forEach((n, i) => {
        const hot = i === threat;
        ctx.fillStyle = hot ? `rgba(${RED},.95)` : `rgba(${CYAN},.55)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, hot ? 3.2 : n.r, 0, Math.PI * 2);
        ctx.fill();
        if (hot) {
          const k = (t % 1.5) / 1.5;
          ctx.strokeStyle = `rgba(${RED},${0.6 * (1 - k)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 6 + k * 34, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    },
  };
};

export const ThreatMap = () => <CanvasLayer make={threatMap} />;
