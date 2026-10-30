import { ALERTS } from "@/content/alerts";
import { num, sectionLabel, type Overview, type Range } from "@/lib/adminStats";
import { scoreColor } from "@/lib/stats";
import { Bar, cell, Empty, Footnote, Grid, NoData, PageTitle, RangePicker, sub, td, th, title } from "./parts";

// The Analytics page of the admin area: how students move through ShiftLab, where they go, and which alerts are hardest.
// Same frame and card style as the Dashboard page.

export default function AnalyticsView({ data, range }: { data: Overview; range: Range }) {
  const f = data.funnel;
  const funnelSteps: [string, number][] = [
    ["Created an account", f.accounts],
    ["Opened an alert", f.opened],
    ["Closed a case", f.closed1],
    ["Closed 3 or more", f.closed3],
    ["Came back on another day", f.returned],
  ];
  const sections = data.sections.slice(0, 8);
  const topViews = Math.max(1, ...sections.map((s) => s.views));
  const hardest = data.alerts.slice(0, 8);
  const alertInfo = (id: string) => ALERTS.find((a) => a.id === id);

  return (
    <>
      <PageTitle
        heading="Analytics"
        text="How students move through ShiftLab, and where they struggle."
        action={<RangePicker current={range} hrefOf={(r) => `/admin/analytics?range=${r}`} />}
      />

      {data.tracking_since === null && <NoData />}

      <Grid>
        <section className={`${cell} sm:col-span-2 lg:col-span-2`} aria-labelledby="funnel-h">
          <h2 id="funnel-h" className={title}>Student journey</h2>
          <p className={sub}>Accounts created in the last {range} days, and how far they got.</p>
          {f.accounts === 0 ? (
            <Empty>No new accounts in this period yet.</Empty>
          ) : (
            <ol className="mt-4 space-y-3">
              {funnelSteps.map(([label, count]) => (
                <li key={label}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span>{label}</span>
                    <span className="tabular-nums text-muted">
                      <span className="text-ink">{num(count)}</span> · {Math.round((100 * count) / f.accounts)}%
                    </span>
                  </div>
                  <Bar pct={(100 * count) / f.accounts} />
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className={`${cell} sm:col-span-2 lg:col-span-1`} aria-labelledby="sect-h">
          <h2 id="sect-h" className={title}>Where people go</h2>
          <p className={sub}>Page views by section.</p>
          {sections.length === 0 ? (
            <Empty>No page views yet.</Empty>
          ) : (
            <ul className="mt-4 space-y-3">
              {sections.map((s) => (
                <li key={s.section}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span className="truncate">{sectionLabel(s.section)}</span>
                    <span className="shrink-0 tabular-nums text-muted">{num(s.views)}</span>
                  </div>
                  <Bar pct={(100 * s.views) / topViews} className="bg-low" />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={`${cell} sm:col-span-2 lg:col-span-3`} aria-labelledby="alerts-h">
          <h2 id="alerts-h" className={title}>Hardest alerts</h2>
          <p className={sub}>Lowest average score first, from cases closed in the last {range} days.</p>
          {hardest.length === 0 ? (
            <Empty>No closed cases in this period yet. Scores appear here as students submit reports.</Empty>
          ) : (
            <div className="mt-3">
              <table className="w-full text-sm">
                <caption className="sr-only">Alerts with the lowest average score</caption>
                <thead>
                  <tr>
                    <th scope="col" className={th}>Alert</th>
                    <th scope="col" className={`${th} hidden text-right sm:table-cell`}>Tries</th>
                    <th scope="col" className={`${th} pr-0 text-right sm:pr-4`}>Avg score</th>
                    <th scope="col" className={`${th} hidden text-right sm:table-cell`}>Verdict right</th>
                  </tr>
                </thead>
                <tbody>
                  {hardest.map((a) => {
                    const info = alertInfo(a.alert);
                    return (
                      <tr key={a.alert}>
                        <td className={td}>
                          <span className="font-mono text-xs text-muted">{a.alert}</span>{" "}
                          <span>{info?.title ?? "Unknown alert"}</span>
                          {info && <span className="block text-xs text-muted">{info.topic} · {info.difficulty}</span>}
                          <span className="block text-xs text-muted sm:hidden">{num(a.attempts)} {a.attempts === 1 ? "try" : "tries"} · verdict right {a.verdict_pct}%</span>
                        </td>
                        <td className={`${td} hidden text-right tabular-nums sm:table-cell`}>{num(a.attempts)}</td>
                        <td className={`${td} pr-0 text-right tabular-nums sm:pr-4 ${scoreColor(a.avg_score)}`}>{a.avg_score}</td>
                        <td className={`${td} hidden text-right tabular-nums sm:table-cell`}>{a.verdict_pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </Grid>

      <Footnote since={data.tracking_since} />
    </>
  );
}
