import { ALERTS } from "@/content/alerts";
import { COMPARE } from "@/content/related";
import type { Alert } from "@/lib/types";

export type Related = { alert: Alert; reason: string };

/** Other alerts that share an indicator (IP, domain or hash): possibly one incident. */
export function sharedIndicator(alert: Alert): Related[] {
  const mine = new Set(alert.indicators.map((i) => i.toLowerCase()));
  return ALERTS.filter((o) => o.id !== alert.id)
    .map((o) => ({ alert: o, shared: o.indicators.filter((i) => mine.has(i.toLowerCase())) }))
    .filter((r) => r.shared.length > 0)
    .map((r) => ({ alert: r.alert, reason: `Also involves ${r.shared.join(", ")}.` }));
}

/** Similar-looking alerts with a different outcome, worth comparing after you close this one. */
export function compareWith(alert: Alert): Related[] {
  return (COMPARE[alert.id] ?? []).flatMap((c) => {
    const other = ALERTS.find((a) => a.id === c.id);
    return other ? [{ alert: other, reason: c.reason }] : [];
  });
}
