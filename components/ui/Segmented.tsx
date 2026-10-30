"use client";

import { useEffect, useRef } from "react";

/** A row of options with a highlight that slides to the chosen one. Wraps onto several lines when it has to. */
export default function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
  small = false,
}: {
  value: T;
  options: { value: T; label: string; title?: string }[];
  onChange: (v: T) => void;
  label: string;
  small?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const place = () => {
      const r = root.current;
      const on = r?.querySelector<HTMLElement>('[aria-pressed="true"]');
      const thumb = r?.firstElementChild as HTMLElement | null;
      if (!on || !thumb) return;
      thumb.style.width = `${on.offsetWidth}px`;
      thumb.style.height = `${on.offsetHeight}px`;
      thumb.style.transform = `translate(${on.offsetLeft}px, ${on.offsetTop}px)`;
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [value]);

  return (
    <div ref={root} role="group" aria-label={label} className="relative inline-flex max-w-full flex-wrap rounded-xl border border-line bg-canvas/70 p-1">
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-0 w-0 rounded-lg border border-line bg-raised transition-[transform,width,height] duration-300 ease-out motion-reduce:transition-none"
      />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          title={o.title}
          onClick={() => onChange(o.value)}
          className={`relative z-10 rounded-lg font-medium transition-colors ${small ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-sm"} ${
            o.value === value ? "text-accent" : "text-muted hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
