"use client";

import { useEffect, useRef } from "react";

/** Counts a whole number up from zero and keeps any text around it, so "92%" and "84/100" both work. */
export default function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    const m = value.match(/^(\d+)(.*)$/);
    if (!el || !m || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const end = Number(m[1]);
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 900);
      el.textContent = `${Math.round(end * (1 - Math.pow(1 - k, 3)))}${m[2]}`;
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <span ref={ref}>{value}</span>;
}
