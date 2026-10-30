"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GROUPS } from "@/components/layout/Sidebar";
import { ALERTS } from "@/content/alerts";
import { LEARN, PRACTICE } from "@/content/practiceHub";

type Command = { label: string; hint: string; href: string; find: string };

const COMMANDS: Command[] = [
  ...GROUPS.flatMap((g) => g.items).map((i) => ({ label: i.label, hint: "Page", href: i.href, find: i.label.toLowerCase() })),
  ...[...LEARN, ...PRACTICE].map((i) => ({
    label: i.name,
    hint: LEARN.includes(i) ? "Learn" : "Practice",
    href: i.href,
    find: `${i.name} ${i.text}`.toLowerCase(),
  })),
  ...ALERTS.map((a) => ({
    label: `${a.id}  ${a.title}`,
    hint: `${a.severity} · ${a.topic}`,
    href: `/alerts/${a.id}`,
    find: `${a.id} ${a.title} ${a.topic} ${a.severity} ${a.difficulty}`.toLowerCase(),
  })),
];

/** Ctrl+K (or Cmd+K) opens a search that jumps to any page, practice module or alert. */
export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState(0);
  const opener = useRef<Element | null>(null);
  const list = useRef<HTMLUListElement>(null);

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const results = COMMANDS.filter((c) => words.every((w) => c.find.includes(w))).slice(0, 9);
  const active = Math.min(sel, results.length - 1);

  function show() {
    opener.current = document.activeElement;
    setQuery("");
    setSel(0);
    setOpen(true);
  }
  function hide() {
    setOpen(false);
    if (opener.current instanceof HTMLElement) opener.current.focus();
  }
  function go(c: Command | undefined) {
    if (!c) return;
    setOpen(false);
    router.push(c.href);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (open) hide();
        else show();
      } else if (e.key === "Escape" && open) hide();
    };
    const onOpen = () => show();
    window.addEventListener("keydown", onKey);
    window.addEventListener("shiftlab:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("shiftlab:palette", onOpen);
    };
  });

  useEffect(() => {
    list.current?.children[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="fade-in fixed inset-0 z-50 grid content-start justify-items-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && hide()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search pages and alerts"
        className="pal-in w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-panel shadow-2xl shadow-black/60"
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSel(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSel(Math.min(results.length - 1, active + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setSel(Math.max(0, active - 1));
            } else if (e.key === "Enter") {
              e.preventDefault();
              go(results[active]);
            }
          }}
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-activedescendant={results.length ? `palette-${active}` : undefined}
          placeholder="Go to a page or alert…"
          aria-label="Search pages and alerts"
          className="w-full border-b border-line bg-transparent px-5 py-4 text-[15px] outline-none placeholder:text-muted"
        />
        <ul ref={list} id="palette-list" role="listbox" className="max-h-80 overflow-y-auto p-1.5">
          {results.length === 0 && <li className="px-4 py-5 text-center text-sm text-muted">Nothing found.</li>}
          {results.map((c, i) => (
            <li
              key={c.href + c.label}
              id={`palette-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseMove={() => setSel(i)}
              onClick={() => go(c)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${
                i === active ? "bg-raised text-ink shadow-[inset_2px_0_0_0_var(--color-accent)]" : "text-muted"
              }`}
            >
              <span className="min-w-0 truncate">{c.label}</span>
              <span className="shrink-0 text-xs capitalize text-muted">{c.hint}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
