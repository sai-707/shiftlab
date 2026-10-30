"use client";

import { useToasts } from "@/lib/toast";

export default function Toaster() {
  const toasts = useToasts();
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 right-4 z-60 grid gap-2"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-center gap-2.5 rounded-xl border border-line border-l-[3px] border-l-accent bg-raised px-4 py-2.5 text-sm shadow-xl shadow-black/40"
          style={{ animation: `${t.leaving ? "toast-out 0.3s ease-in forwards" : "toast-in 0.45s cubic-bezier(0.22,1,0.36,1) both"}` }}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}
