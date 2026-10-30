import type { Severity } from "@/lib/types";

const STYLES: Record<Severity, string> = {
  critical: "border-critical/40 bg-critical/10 text-critical",
  high: "border-high/40 bg-high/10 text-high",
  medium: "border-medium/40 bg-medium/10 text-medium",
  low: "border-low/40 bg-low/10 text-low",
};

export default function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${STYLES[severity]}`}
    >
      {severity}
    </span>
  );
}
