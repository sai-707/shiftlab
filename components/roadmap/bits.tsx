import type { ReactNode } from "react";

export type WhoKey = "Both" | "SOC" | "Engineer" | "B" | "S" | "E";
const WHO: Record<WhoKey, { key: "both" | "soc" | "eng"; label: string }> = {
  Both: { key: "both", label: "Both tracks" },
  B: { key: "both", label: "Both tracks" },
  SOC: { key: "soc", label: "SOC analyst" },
  S: { key: "soc", label: "SOC analyst" },
  Engineer: { key: "eng", label: "Engineer" },
  E: { key: "eng", label: "Engineer" },
};

// Which track a tool, project or certificate is for.
export function WhoTag({ who }: { who: WhoKey }) {
  const w = WHO[who];
  return (
    <span className="rm-who" data-who={w.key}>
      {w.label}
    </span>
  );
}

// An outside link: opens in a new tab and says so for screen readers.
export function ExtLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <a className={className} href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span aria-hidden="true">{" "}↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
