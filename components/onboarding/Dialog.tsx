"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The shared floating window: dimmed backdrop, close button at the top right, Escape to close, focus kept inside.
 * It eases in, and leaves a little faster than it arrived. Clicking outside does nothing, so a stray click never loses the choice.
 */
export default function Dialog({
  labelledBy,
  onClose,
  children,
  wide,
}: {
  labelledBy: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [leaving, setLeaving] = useState(false);
  // The latest onClose, so a parent that re-renders does not restart the focus and scroll-lock set-up below.
  const last = useRef(onClose);
  useEffect(() => {
    last.current = onClose;
  });

  const close = useCallback(() => {
    if (reduced()) return last.current();
    setLeaving(true);
    window.setTimeout(() => last.current(), 160);
  }, []);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Start on the first real choice, not on the close button.
    const first = box.current?.querySelector<HTMLElement>("[data-autofocus]") ?? box.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab" || !box.current) return;
      const items = [...box.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (!items.length) return;
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [close]);

  return (
    <div className={`fixed inset-0 z-[70] ${leaving ? "ob-leave" : ""}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
      <div className="ob-back absolute inset-0 bg-void/80 backdrop-blur-sm" aria-hidden="true" />
      <div className="absolute inset-0 flex items-end justify-center overflow-y-auto p-3 sm:items-center sm:p-4">
        <div
          ref={box}
          className={`ob-pop relative my-auto w-full ${wide ? "max-w-[620px]" : "max-w-[540px]"} rounded-2xl border border-line bg-panel p-5 shadow-2xl backdrop-blur-xl sm:p-7`}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="press absolute right-2.5 top-2.5 grid h-11 w-11 place-items-center rounded-xl text-muted hover:bg-raised hover:text-ink"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
