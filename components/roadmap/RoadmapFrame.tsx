import Link from "next/link";
import type { ReactNode } from "react";
import FeedbackLink from "@/components/feedback/FeedbackLink";
import SiteShell from "@/components/site/SiteShell";
import { START_HREF } from "@/components/site/links";
import { BrandMark } from "@/components/ui/BrandMark";

const TABS = [
  { href: "/roadmap", name: "Roadmap" },
  { href: "/roadmap/market", name: "Job market" },
  { href: "/roadmap/certificates", name: "Free certificates" },
  { href: "/roadmap/tools", name: "Tools" },
  { href: "/roadmap/projects", name: "Projects" },
];

// Shared top bar, page heading, section tabs and footer for /roadmap and its pages.
export default function RoadmapFrame({ active, label, title, lead, children }: { active: string; label: string; title: string; lead: string; children: ReactNode }) {
  return (
    <SiteShell>
      <header className="nav">
        <div className="wrap">
          <Link className="brand" href="/">
            <BrandMark className="h-[26px] w-[26px]" />
            ShiftLab
          </Link>
          <div className="right">
            <Link className="signin" href="/login">
              Sign in
            </Link>
            <Link className="btn primary sm" href={START_HREF}>
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="g">
        <section className="g-sec g-first rm-head">
          <div className="wrap rm-wide">
            <p className="label">{label}</p>
            <h1>{title}</h1>
            <p className="g-lead">{lead}</p>
            <nav className="rm-tabs" aria-label="Roadmap sections">
              {TABS.map((t) => (
                <Link key={t.href} href={t.href} aria-current={t.href === active ? "page" : undefined}>
                  {t.name}
                </Link>
              ))}
            </nav>
          </div>
        </section>
        {children}
      </main>

      <footer className="foot">
        <div className="wrap">
          <p>Free resources belong to their owners. ShiftLab is not affiliated with them.</p>
          <p>
            <Link href="/">Home</Link> · <Link href="/guide">About</Link> · <Link href="/privacy">Privacy</Link> · <FeedbackLink className="foot-link" /> · ShiftLab
          </p>
        </div>
      </footer>
    </SiteShell>
  );
}
