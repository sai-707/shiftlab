"use client";

import Link from "next/link";
import { useProgress } from "@/lib/progress";
import { compareWith, sharedIndicator } from "@/lib/related";
import SeverityBadge from "@/components/ui/SeverityBadge";
import type { Alert, CaseRecord } from "@/lib/types";

const panel = "rounded-2xl border border-line bg-panel p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]";

function Row({ a, reason, done }: { a: Alert; reason: string; done?: CaseRecord }) {
  return (
    <li>
      <Link href={`/alerts/${a.id}`} className="group flex items-start justify-between gap-3 py-3 text-sm">
        <span className="min-w-0">
          <span className="font-mono text-xs text-muted">
            {a.id} · {done ? `closed, ${done.feedback.score}/100` : "open"}
          </span>
          <span className="block truncate font-medium group-hover:text-accent">{a.title}</span>
          <span className="block text-muted">{reason}</span>
        </span>
        <SeverityBadge severity={a.severity} />
      </Link>
    </li>
  );
}

/**
 * Pivoting, the way an analyst uses a SIEM: alerts that share an indicator may be one incident,
 * and similar-looking alerts with a different ending are worth comparing once this one is closed.
 */
export default function RelatedAlerts({ alert, closed }: { alert: Alert; closed: boolean }) {
  const progress = useProgress();
  const linked = sharedIndicator(alert);
  const similar = closed ? compareWith(alert) : [];
  if (linked.length === 0 && similar.length === 0) return null;

  return (
    <section className={panel}>
      {linked.length > 0 && (
        <>
          <h3 className="text-sm font-semibold">Possibly the same incident</h3>
          <p className="mt-1 text-xs text-muted">
            These alerts share an indicator with this one. Attackers reuse addresses, so a link can show how far an attack got.
          </p>
          <ul className="mt-2 divide-y divide-line">
            {linked.map((r) => (
              <Row key={r.alert.id} a={r.alert} reason={r.reason} done={progress.cases[r.alert.id]} />
            ))}
          </ul>
        </>
      )}
      {similar.length > 0 && (
        <>
          <h3 className={`text-sm font-semibold ${linked.length > 0 ? "mt-5" : ""}`}>Worth comparing</h3>
          <p className="mt-1 text-xs text-muted">Similar-looking alerts with a different ending. Comparing them builds instinct.</p>
          <ul className="mt-2 divide-y divide-line">
            {similar.map((r) => (
              <Row key={r.alert.id} a={r.alert} reason={r.reason} done={progress.cases[r.alert.id]} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
