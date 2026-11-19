import Link from "next/link";
import type { ReactNode } from "react";
import PageHeader from "@/components/ui/PageHeader";
import "./roadmap.css";

const TABS = [
  { href: "/roadmap", name: "Roadmap" },
  { href: "/roadmap/market", name: "Job market" },
  { href: "/roadmap/certificates", name: "Free certificates" },
  { href: "/roadmap/tools", name: "Tools to learn" },
  { href: "/roadmap/projects", name: "Projects to build" },
];

// Page heading and section tabs shared by the roadmap pages. They sit inside the student workspace, so the sidebar and account menu come from the app layout.
export default function RoadmapFrame({ active, title, description, children }: { active: string; title: string; description: string; children: ReactNode }) {
  return (
    <div className="rm-root">
      <PageHeader title={title} description={description} />
      <nav className="rm-tabs" aria-label="Roadmap sections">
        {TABS.map((t) => (
          <Link key={t.href} href={t.href} aria-current={t.href === active ? "page" : undefined}>
            {t.name}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
