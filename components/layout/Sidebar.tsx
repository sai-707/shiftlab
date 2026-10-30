"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { HUB_PATHS } from "@/content/practiceHub";
import { uiStore } from "@/lib/ui";
import { FEEDBACK_HREF, FEEDBACK_URL } from "@/lib/site";

const ICONS: Record<string, ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  queue: <path d="M4 6h16M4 12h16M4 18h10" />,
  lookup: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  playbooks: (
    <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5v-15ZM5 19.5A1.5 1.5 0 0 0 6.5 21H19" />
  ),
  reports: (
    <>
      <path d="M7 3h7l5 5v13H7z" />
      <path d="M14 3v5h5M10 13h6M10 17h6" />
    </>
  ),
  start: <path d="M5 21V4m0 0h11l-2 4 2 4H5" />,
  logs: (
    <>
      <path d="m5 8 4 4-4 4" />
      <path d="M12 17h7" />
    </>
  ),
  glossary: <path d="M6 4h12v17l-6-4-6 4z" />,
  handover: (
    <>
      <rect x="6" y="5" width="12" height="16" rx="2" />
      <path d="M9 5V3.5h6V5M9 11h6M9 15h4" />
    </>
  ),
  mailbox: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  tools: <path d="M14.5 6.5a4 4 0 0 0-5 5L4 17l3 3 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z" />,
  sprint: <path d="M13 3 5 13.5h6L10 21l9-11.5h-6z" />,
  comms: <path d="M4 5h16v11H9l-5 4z" />,
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
    </>
  ),
};

export const GROUPS = [
  { label: "Start", items: [{ href: "/start", label: "Start here", icon: "start" }] },
  {
    label: "Work",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
      { href: "/queue", label: "Alert queue", icon: "queue" },
      { href: "/lookup", label: "Intel check", icon: "lookup" },
      { href: "/practice", label: "Practice and learn", icon: "playbooks" },
    ],
  },
  {
    label: "Review",
    items: [
      { href: "/reports", label: "Case reports", icon: "reports" },
      { href: "/handover", label: "Shift handover", icon: "handover" },
      { href: "/profile", label: "Profile", icon: "profile" },
    ],
  },
];

const isActive = (pathname: string, href: string) =>
  pathname.startsWith(href) ||
  (href === "/queue" && pathname.startsWith("/alerts")) ||
  (href === "/practice" && HUB_PATHS.some((h) => pathname.startsWith(h)));

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed } = uiStore.useStore();
  const nav = useRef<HTMLElement>(null);
  const glide = useRef<HTMLSpanElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const [tip, setTip] = useState<{ label: string; y: number } | null>(null);

  // page content makes room for the sidebar through this CSS variable (see .app-main in globals.css)
  useEffect(() => {
    document.documentElement.style.setProperty("--rail", collapsed ? "4.5rem" : "15rem");
  }, [collapsed]);

  // the cyan marker slides to the current page
  useEffect(() => {
    const on = nav.current?.querySelector<HTMLElement>('[aria-current="page"]');
    const m = marker.current;
    if (!m) return;
    m.style.opacity = on ? "1" : "0";
    if (on) {
      m.style.height = `${on.offsetHeight}px`;
      m.style.transform = `translateY(${on.offsetTop}px)`;
    }
  }, [pathname, collapsed]);

  function hover(el: HTMLElement, label: string) {
    const g = glide.current;
    if (g) {
      g.style.opacity = "1";
      g.style.height = `${el.offsetHeight}px`;
      g.style.transform = `translateY(${el.offsetTop}px)`;
    }
    if (collapsed) {
      const r = el.getBoundingClientRect();
      setTip({ label, y: r.top + r.height / 2 });
    }
  }
  function leave() {
    if (glide.current) glide.current.style.opacity = "0";
    setTip(null);
  }

  return (
    <aside
      className={`border-b border-line bg-panel md:fixed md:inset-y-0 md:left-0 md:flex md:flex-col md:overflow-hidden md:border-b-0 md:border-r md:transition-[width] md:duration-300 ${
        collapsed ? "md:w-18" : "md:w-60"
      }`}
    >
      <Link href="/dashboard" className={`flex items-center gap-2.5 px-5 py-4 md:py-6 ${collapsed ? "md:px-6" : ""}`}>
        <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-accent drop-shadow-[0_0_6px_rgb(34_211_238/0.6)]" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" />
        </svg>
        <span className={`text-lg font-semibold tracking-tight ${collapsed ? "md:hidden" : ""}`}>ShiftLab</span>
      </Link>

      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("shiftlab:palette"))}
        aria-label="Search pages and alerts"
        className={`press mx-3 mb-3 hidden items-center gap-2 rounded-lg border border-line bg-canvas/60 px-3 py-2 text-sm text-muted hover:border-accent hover:text-ink md:flex ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        {!collapsed && (
          <>
            <span className="flex-1 text-left">Search</span>
            <kbd className="rounded border border-line px-1.5 text-[10px]">Ctrl K</kbd>
          </>
        )}
      </button>

      <nav
        ref={nav}
        aria-label="Main"
        onMouseLeave={leave}
        className="relative flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:gap-0 md:overflow-y-auto md:overflow-x-hidden md:pb-0"
      >
        <span
          ref={glide}
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-3 top-0 hidden rounded-lg bg-raised opacity-0 transition-[transform,height,opacity] duration-200 ease-out motion-reduce:transition-none md:block"
        />
        <span
          ref={marker}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 hidden w-0.5 rounded-full bg-accent opacity-0 shadow-[0_0_10px_var(--color-accent)] transition-[transform,height] duration-300 ease-out motion-reduce:transition-none md:block"
        />
        {GROUPS.map((group) => (
          <div key={group.label} className="contents md:mt-5 md:flex md:flex-col md:gap-1 md:first:mt-0">
            <p
              className={`hidden px-3 pb-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted/70 ${
                collapsed ? "" : "md:block"
              }`}
            >
              {group.label}
            </p>
            {group.items.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onMouseEnter={(e) => hover(e.currentTarget, item.label)}
                  onFocus={(e) => hover(e.currentTarget, item.label)}
                  onBlur={leave}
                  className={`relative z-10 flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active ? "text-accent max-md:bg-raised max-md:shadow-[inset_2px_0_0_0_var(--color-accent)]" : "text-muted hover:text-ink"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {ICONS[item.icon]}
                  </svg>
                  <span className={`whitespace-nowrap ${collapsed ? "md:sr-only" : ""}`}>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={`hidden items-center gap-2 px-3 py-3 md:flex ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="px-2 text-xs text-muted">
            <p>Every alert in ShiftLab is fictional.</p>
            <a
              href={FEEDBACK_HREF}
              target={FEEDBACK_URL ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="mt-1 inline-block text-accent hover:underline"
            >
              Send feedback
            </a>
          </div>
        )}
        <button
          type="button"
          onClick={() => uiStore.set({ collapsed: !collapsed })}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="press grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-muted hover:border-accent hover:text-accent"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-4 w-4 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m14 7-5 5 5 5" />
          </svg>
        </button>
      </div>

      {tip && (
        <span
          role="tooltip"
          className="fade-in pointer-events-none fixed left-20 z-50 hidden -translate-y-1/2 rounded-md border border-line bg-black px-2 py-1 text-xs font-medium md:block"
          style={{ top: tip.y }}
        >
          {tip.label}
        </span>
      )}
    </aside>
  );
}
