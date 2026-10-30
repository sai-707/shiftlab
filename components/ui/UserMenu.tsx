"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { signOut } from "@/app/auth-actions";
import { Icon, type IconName } from "@/components/ui/icons";
import { initialsOf, validAvatar } from "@/lib/profileRules";
import { wipeOnSignOut } from "@/lib/sync";

// The account menu: an avatar in the top-right corner that opens a small menu with who is signed in, a few links and a red Sign out.
// The look follows the "dropdown-menu-01" idea from 21st.dev, in ShiftLab's colours, without a UI library: it is a
// plain menu-button pattern (arrow keys, Home/End, Escape, click outside). The menu is drawn in a portal at the
// page level, so nothing around the avatar can cut it off. Put it where the avatar should sit; the menu opens below it, right edges lined up.

export type MenuLink = { label: string; href: string; icon: IconName };
type Who = { name: string; email: string; avatar: string };

const W = 288; // menu width in px (w-72): wide enough for a full email address
const GAP = 8;

function Avatar({ who, className }: { who: Who; className: string }) {
  const photo = validAvatar(who.avatar) ? who.avatar : "";
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full border border-accent/60 bg-raised bg-cover bg-center font-semibold text-accent ${className}`}
      style={photo ? { backgroundImage: `url(${photo})` } : undefined}
    >
      {photo ? "" : initialsOf(who.name || who.email.split("@")[0])}
    </span>
  );
}

const row = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium outline-none";

export default function UserMenu({ who, links }: { who: Who; links: MenuLink[] }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  // Right edge of the menu lines up with the avatar; clamped so a narrow phone never pushes it off the screen.
  function show() {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ left: Math.min(Math.max(GAP, r.right - W), window.innerWidth - W - GAP), top: r.bottom + GAP });
    setOpen(true);
  }

  const items = () => Array.from(menu.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);

  useEffect(() => {
    if (open) items()[0]?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menu.current?.contains(t) && !btn.current?.contains(t)) setOpen(false);
    };
    const quit = () => setOpen(false);
    document.addEventListener("pointerdown", away);
    window.addEventListener("resize", quit);
    window.addEventListener("scroll", quit, true);
    return () => {
      document.removeEventListener("pointerdown", away);
      window.removeEventListener("resize", quit);
      window.removeEventListener("scroll", quit, true);
    };
  }, [open]);

  function onMenuKey(e: KeyboardEvent) {
    const list = items();
    const i = list.indexOf(document.activeElement as HTMLElement);
    const go = (n: number) => {
      e.preventDefault();
      list[(n + list.length) % list.length]?.focus();
    };
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      btn.current?.focus();
    } else if (e.key === "ArrowDown") go(i + 1);
    else if (e.key === "ArrowUp") go(i - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(list.length - 1);
    else if (e.key === "Tab") setOpen(false);
  }

  const name = who.name || who.email.split("@")[0] || "Account";
  const itemLook = "text-ink hover:bg-canvas focus:bg-canvas";

  return (
    <>
      <button
        ref={btn}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && !open) {
            e.preventDefault();
            show();
          }
        }}
        className="block rounded-full shadow-lg shadow-black/40 outline-none transition-shadow hover:ring-2 hover:ring-accent/50 focus-visible:ring-2 focus-visible:ring-accent aria-expanded:ring-2 aria-expanded:ring-accent"
      >
        <Avatar who={who} className="h-9 w-9 text-xs" />
      </button>

      {open &&
        createPortal(
          <div
            ref={menu}
            role="menu"
            aria-label="Account"
            onKeyDown={onMenuKey}
            style={{ left: pos.left, top: pos.top, width: W }}
            className="pal-in fixed z-[100] rounded-2xl border border-line bg-raised p-1 shadow-2xl shadow-black/50"
          >
            <div className="flex items-center gap-3 px-3 py-3">
              <Avatar who={who} className="h-10 w-10 text-sm" />
              <div className="min-w-0 text-sm">
                <p className="truncate font-medium">{name}</p>
                <p className="truncate text-muted">{who.email}</p>
              </div>
            </div>
            <div role="separator" className="-mx-1 my-1 h-px bg-line" />
            {links.map((l) => (
              <Link key={l.href} href={l.href} role="menuitem" tabIndex={-1} onClick={() => setOpen(false)} className={`${row} ${itemLook}`}>
                <Icon name={l.icon} className="h-5 w-5" />
                {l.label}
              </Link>
            ))}
            <div role="separator" className="-mx-1 my-1 h-px bg-line" />
            <form action={signOut} onSubmit={() => wipeOnSignOut()}>
              <button type="submit" role="menuitem" tabIndex={-1} className={`${row} text-missed hover:bg-missed/10 focus:bg-missed/10`}>
                <Icon name="logout" className="h-5 w-5" />
                Sign out
              </button>
            </form>
          </div>,
          document.body,
        )}
    </>
  );
}
