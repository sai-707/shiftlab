"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icons";
import UserMenu, { type MenuLink } from "@/components/ui/UserMenu";

// The frame around every admin page, after the Dashboard 1 template (efferd.com/view/dashboard-1), but filling the whole window: a left
// sidebar (brand, one nav group), a 56px header with the account menu at its right end, and one full-width rule under the header.
// Admins get only these four pages, so the nav has four items. Below 1024px the sidebar becomes a row of tabs under the header.
// Who is signed in, Public site and Sign out live in the account menu (components/ui/UserMenu).

type Who = { name: string; email: string; avatar: string };

const NAV = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/analytics", label: "Analytics", icon: "analytics" },
  { href: "/admin/guests", label: "Guests", icon: "user" },
  { href: "/admin/feedback", label: "Feedback", icon: "feedback" },
] as const;

// The pages are already in the sidebar (tabs on a phone), so the menu only adds the way out to the public site.
const MENU: MenuLink[] = [{ label: "Public site", href: "/", icon: "home" }];

function Brand() {
  return (
    <>
      <svg viewBox="0 0 24 24" className="h-6 w-6 shrink-0 text-accent drop-shadow-[0_0_6px_rgb(34_211_238/0.6)]" aria-hidden="true">
        <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 3a9 9 0 0 0 0 18z" fill="currentColor" />
      </svg>
      <span className="text-lg font-semibold tracking-tight">ShiftLab</span>
    </>
  );
}

const item = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm";
const idle = "text-muted hover:bg-raised hover:text-ink";

export default function AdminShell({ who, children }: { who: Who; children: ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));
  const here = NAV.find((n) => isActive(n.href)) ?? NAV[0];

  return (
    <div className="relative flex min-h-svh w-full">
      {/* the one rule under the header, as wide as the screen and fixed in place while the page scrolls */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-14 z-[60] h-px bg-line" />

      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col self-start border-r border-line lg:flex">
        <Link href="/admin" className="flex h-14 shrink-0 items-center gap-2.5 px-5">
          <Brand />
        </Link>
        <nav aria-label="Admin" className="flex-1 overflow-y-auto p-2 pt-3">
          <p className="px-3 pb-1.5 text-xs text-muted">Admin</p>
          <ul className="space-y-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={isActive(n.href) ? "page" : undefined} className={`${item} ${isActive(n.href) ? "bg-raised font-medium text-ink" : idle}`}>
                  <Icon name={n.icon} />
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 bg-canvas px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Link href="/admin" className="flex items-center gap-2 lg:hidden">
              <Brand />
            </Link>
            <span className="hidden items-center gap-2 lg:flex">
              <Icon name={here.icon} />
              {here.label}
            </span>
          </div>
          <UserMenu who={who} links={MENU} />
        </header>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto border-b border-line px-4 py-2 md:px-6 lg:hidden">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? "page" : undefined} className={`${item} w-auto whitespace-nowrap ${isActive(n.href) ? "bg-raised font-medium text-ink" : idle}`}>
              <Icon name={n.icon} />
              {n.label}
            </Link>
          ))}
        </nav>
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
