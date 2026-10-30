"use client";

import { useEffect } from "react";
import CommandPalette from "@/components/layout/CommandPalette";
import Toaster from "@/components/ui/Toaster";

/** App-wide extras: the search palette, toasts, and the pointer light on any element with the "spot" class. */
export default function Interactions() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest<HTMLElement>(".spot");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <>
      <CommandPalette />
      <Toaster />
    </>
  );
}
