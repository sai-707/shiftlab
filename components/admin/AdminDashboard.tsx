import Link from "next/link";
import {
  METRICS, ago, num, pctDelta, ptsDelta, shortDay,
  type Delta, type Kpis, type Metric, type Overview, type Range, type RecentUser,
} from "@/lib/adminStats";
import AreaChart from "./AreaChart";
import { cell, Chevron, DeltaText, Empty, Footnote, Grid, NoData, PageTitle, pill, RangePicker, sub, td, th, title } from "./parts";

// The Dashboard page of the admin area. The look follows the Dashboard 1 template (efferd.com/view/dashboard-1): a welcome heading,
// then one bordered grid whose cells are separated by 1px rules: small KPI cells with an up/down change, an area chart with a
// range picker, and a table card. Colours come from ShiftLab's own tokens. The frame around it (sidebar, header) is AdminShell.

const rate = (k: Kpis) => (k.visitors ? Math.min(100, (100 * k.signups) / k.visitors) : null);
const href = (range: Range, metric: Metric) => `/admin?range=${range}&metric=${metric}`;

export default function AdminDashboard({
  name, data, users, range, metric, now,
}: {
  name: string; data: Overview; users: RecentUser[]; range: Range; metric: Metric; now: number;
}) {
  const { cur, prev } = data;
  const m = METRICS[metric];
  const rateNow = rate(cur);
  const chartDelta = pctDelta(cur[metric], prev[metric]);

  const kpis: { label: string; value: string; delta: Delta; hint: string }[] = [
    {
      label: "Student accounts",
      value: num(data.accounts_total),
      delta: cur.signups ? { dir: "up", text: `${num(cur.signups)} new` } : { dir: "none", text: "none new" },
      hint: `Everyone signed up so far; ${range}-day change shown`,
    },
    { label: "Visitors", value: num(cur.visitors), delta: pctDelta(cur.visitors, prev.visitors), hint: `Unique browsers, last ${range} days` },
    { label: "Active students", value: num(cur.active), delta: pctDelta(cur.active, prev.active), hint: "Signed-in students who used the site" },
    {
      label: "Sign-up rate",
      value: rateNow === null ? "—" : `${rateNow.toFixed(1)}%`,
      delta: ptsDelta(rateNow, rate(prev)),
      hint: "New accounts per visitor",
    },
    { label: "Cases closed", value: num(cur.cases), delta: pctDelta(cur.cases, prev.cases), hint: "Reports scored, guests included" },
    { label: "Average score", value: cur.avg_score === null ? "—" : String(cur.avg_score), delta: ptsDelta(cur.avg_score, prev.avg_score), hint: "Out of 100, across closed cases" },
  ];

  return (
    <>
      <PageTitle heading={`Welcome back, ${name}!`} text="Here is how ShiftLab is doing." />

      {data.tracking_since === null && <NoData />}

      <Grid>
        {kpis.map((k) => (
          <div key={k.label} className={cell}>
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-normal tracking-wide text-muted">{k.label}</h2>
              <DeltaText d={k.delta} />
            </div>
            <p className="mt-2 text-xl font-medium tabular-nums">{k.value}</p>
            <p className="mt-1 text-xs text-muted">{k.hint}</p>
          </div>
        ))}

        <section className={`${cell} sm:col-span-2 lg:col-span-3`} aria-labelledby="chart-h">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 id="chart-h" className={title}>{m.label}</h2>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs tabular-nums ${chartDelta.dir === "up" ? "bg-correct/10 text-correct" : chartDelta.dir === "down" ? "bg-missed/10 text-missed" : "bg-raised text-muted"}`}>
                  {(chartDelta.dir === "up" || chartDelta.dir === "down") && <Chevron up={chartDelta.dir === "up"} />}
                  {chartDelta.text}
                </span>
              </div>
              <p className={sub}>{m.what}: {num(cur[metric])} in the last {range} days.</p>
            </div>
            <RangePicker current={range} hrefOf={(r) => href(r, metric)} />
          </div>
          <div role="group" aria-label="Chart metric" className="mt-4 flex flex-wrap gap-1">
            {(Object.keys(METRICS) as Metric[]).map((k) => (
              <Link key={k} href={href(range, k)} aria-current={k === metric ? "true" : undefined} className={pill(k === metric)}>
                {METRICS[k].label}
              </Link>
            ))}
          </div>
          <div className="mt-4">
            <AreaChart points={data.series.map((s) => ({ label: shortDay(s.day), value: s[metric] }))} unit={m.label.toLowerCase()} label={m.label} />
          </div>
        </section>

        <section className={`${cell} sm:col-span-2 lg:col-span-3`} aria-labelledby="users-h">
          <h2 id="users-h" className={title}>Newest accounts</h2>
          <p className={sub}>Emails are partly hidden, so a screenshot is safe to share.</p>
          {users.length === 0 ? (
            <Empty>No accounts yet.</Empty>
          ) : (
            <div className="mt-3">
              <table className="w-full text-sm">
                <caption className="sr-only">Newest accounts</caption>
                <thead>
                  <tr>
                    <th scope="col" className={th}>Student</th>
                    <th scope="col" className={`${th} hidden sm:table-cell`}>Email</th>
                    <th scope="col" className={th}>Joined</th>
                    <th scope="col" className={`${th} hidden md:table-cell`}>Last seen</th>
                    <th scope="col" className={`${th} pr-0 text-right sm:pr-4`}>Cases</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={`${u.joined}-${i}`}>
                      <td className={td}>
                        {u.name || <span className="text-muted">No name yet</span>}
                        {u.role === "admin" && <span className="ml-2 rounded-full border border-accent/40 px-2 py-0.5 text-xs text-accent">Admin</span>}
                        <span className="block font-mono text-xs text-muted sm:hidden">{u.email || "—"}</span>
                      </td>
                      <td className={`${td} hidden font-mono text-xs text-muted sm:table-cell`}>{u.email || "—"}</td>
                      <td className={`${td} text-muted`}>{ago(u.joined, now)}</td>
                      <td className={`${td} hidden text-muted md:table-cell`}>{ago(u.last_seen, now)}</td>
                      <td className={`${td} pr-0 text-right tabular-nums sm:pr-4`}>{u.cases}</td>
                    </tr>
                  ))}
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
