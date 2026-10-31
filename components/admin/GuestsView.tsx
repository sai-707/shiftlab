import { ALERTS } from "@/content/alerts";
import {
  ago, clockTime, num, pctDelta, ptsDelta, sectionLabel, shortDay,
  type Delta, type GuestLogRow, type Guests, type Range,
} from "@/lib/adminStats";
import { scoreColor } from "@/lib/stats";
import AreaChart from "./AreaChart";
import { Bar, cell, DeltaText, Empty, Grid, PageTitle, RangePicker, sub, td, th, title } from "./parts";

// The Guests page of the admin area: how many people try ShiftLab without an account, where they go, and a log of what they did.
// A guest is a browser with no signed-in account. The id is a random id from that browser (see lib/visitor.ts), never a name or an email.

const NONE: Delta = { dir: "none", text: "—" };

/** One line for the log: the page a guest opened, or the case they closed. */
function What({ row }: { row: GuestLogRow }) {
  if (row.kind === "case_closed") {
    const info = ALERTS.find((a) => a.id === row.alert);
    return (
      <>
        <span>Closed a case</span>{" "}
        <span className="font-mono text-xs text-muted">{row.alert}</span>
        {info && <span className="block text-xs text-muted">{info.title}</span>}
        <span className="block text-xs">
          {row.score !== null && <span className={`tabular-nums ${scoreColor(row.score)}`}>Score {row.score}</span>}
          <span className="text-muted">
            {" · "}verdict {row.verdict_ok ? "right" : "wrong"}
            {" · "}escalation {row.escalate_ok ? "right" : "wrong"}
          </span>
        </span>
      </>
    );
  }
  const seg = (row.path ?? "/").split("/")[1] ?? "";
  return (
    <>
      <span>{sectionLabel(seg)}</span>
      <span className="block font-mono text-xs text-muted">{row.path ?? "/"}</span>
    </>
  );
}

export default function GuestsView({ data, log, range, now }: { data: Guests; log: GuestLogRow[]; range: Range; now: number }) {
  const { cur, prev } = data;
  const sections = data.sections.slice(0, 8);
  const topViews = Math.max(1, ...sections.map((s) => s.views));
  const empty = data.tracking_since === null;

  const rate = (accounts: number, visitors: number) => (visitors ? Math.min(100, (100 * accounts) / visitors) : null);
  const rateNow = rate(cur.new_accounts, cur.visitors);

  const kpis: { label: string; value: string; delta: Delta; hint: string }[] = [
    { label: "Guest visitors", value: num(cur.visitors), delta: pctDelta(cur.visitors, prev.visitors), hint: `Browsers without an account, last ${range} days` },
    { label: "New accounts", value: num(cur.new_accounts), delta: pctDelta(cur.new_accounts, prev.new_accounts), hint: `Sign-ups in the last ${range} days` },
    {
      label: "Sign-up rate",
      value: rateNow === null ? "—" : `${rateNow.toFixed(1)}%`,
      delta: ptsDelta(rateNow, rate(prev.new_accounts, prev.visitors)),
      hint: "New accounts per guest visitor",
    },
    { label: "Opened an alert", value: num(cur.opened), delta: pctDelta(cur.opened, prev.opened), hint: "Guests who looked at an alert page" },
    { label: "Saw the sign-up page", value: num(cur.signup_page), delta: pctDelta(cur.signup_page, prev.signup_page), hint: "Guests who opened /signup" },
    { label: "Not confirmed", value: num(cur.unconfirmed), delta: NONE, hint: "Signed up but never clicked the email link" },
    {
      label: "Cases closed",
      value: num(cur.cases),
      delta: pctDelta(cur.cases, prev.cases),
      hint: cur.avg_score === null ? "By guests, scored out of 100" : `By guests, average score ${cur.avg_score}`,
    },
    { label: "Came back", value: num(cur.returned), delta: NONE, hint: "Guests who visited on 2 or more days" },
    { label: "Signed in later", value: num(cur.signed_in_later), delta: NONE, hint: "Same browser, now signed in to an account" },
  ];

  const confirmed = Math.max(0, cur.new_accounts - cur.unconfirmed);
  const funnel: [string, number][] = [
    ["Guest visitors", cur.visitors],
    ["Opened an alert", cur.opened],
    ["Saw the sign-up page", cur.signup_page],
    ["New accounts", cur.new_accounts],
    ["Confirmed their email", confirmed],
  ];

  return (
    <>
      <PageTitle
        heading="Guests"
        text="People trying ShiftLab without an account, and how many become one."
        action={<RangePicker current={range} hrefOf={(r) => `/admin/guests?range=${r}`} />}
      />

      {empty && (
        <p className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm">
          No guest has been recorded yet. Open the site in a private window and click around, and the numbers and the log will start to fill in.
        </p>
      )}

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

        <section className={`${cell} sm:col-span-2 lg:col-span-2`} aria-labelledby="gfunnel-h">
          <h2 id="gfunnel-h" className={title}>From visit to account</h2>
          <p className={sub}>
            Each step against guest visitors, last {range} days. New accounts count every sign-up in the period, so they can include people who
            first visited earlier.
          </p>
          {cur.visitors === 0 ? (
            <Empty>No guest visitors in this period yet.</Empty>
          ) : (
            <ol className="mt-4 space-y-3">
              {funnel.map(([label, count]) => (
                <li key={label}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
                    <span>{label}</span>
                    <span className="tabular-nums text-muted">
                      <span className="text-ink">{num(count)}</span> · {Math.round((100 * count) / cur.visitors)}%
                    </span>
                  </div>
                  <Bar pct={(100 * count) / cur.visitors} />
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className={`${cell} sm:col-span-2 lg:col-span-1`} aria-labelledby="gsect-h">
          <h2 id="gsect-h" className={title}>Where guests go</h2>
          <p className={sub}>Page views by section.</p>
          {sections.length === 0 ? (
            <Empty>No guest page views in this period.</Empty>
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

        <section className={`${cell} sm:col-span-2 lg:col-span-3`} aria-labelledby="gchart-h">
          <h2 id="gchart-h" className={title}>Visits and sign-ups, day by day</h2>
          <p className={sub}>
            {num(cur.visitors)} guest {cur.visitors === 1 ? "visitor" : "visitors"} and {num(cur.new_accounts)} new {cur.new_accounts === 1 ? "account" : "accounts"} in
            the last {range} days. {num(data.guests_total)} guest browsers so far.
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-2">
            <div className="min-w-0">
              <p className="mb-2 text-xs text-muted">Guest visitors</p>
              <AreaChart points={data.series.map((s) => ({ label: shortDay(s.day), value: s.visitors }))} unit="guests" label="Guest visitors" />
            </div>
            <div className="min-w-0">
              <p className="mb-2 text-xs text-muted">New accounts</p>
              <AreaChart points={data.series.map((s) => ({ label: shortDay(s.day), value: s.signups }))} unit="new accounts" label="New accounts" />
            </div>
          </div>
        </section>

        <section className={`${cell} sm:col-span-2 lg:col-span-3`} aria-labelledby="glog-h">
          <h2 id="glog-h" className={title}>Guest log</h2>
          <p className={sub}>The newest {log.length} guest events, newest first. Times are India time.</p>
          {log.length === 0 ? (
            <Empty>No guest events yet.</Empty>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Newest guest events</caption>
                <thead>
                  <tr>
                    <th scope="col" className={th}>When</th>
                    <th scope="col" className={`${th} hidden sm:table-cell`}>Guest</th>
                    <th scope="col" className={th}>What they did</th>
                  </tr>
                </thead>
                <tbody>
                  {log.map((r) => (
                    <tr key={r.id}>
                      <td className={`${td} whitespace-nowrap text-muted`}>
                        {ago(r.at, now)}
                        <span className="block text-xs">{clockTime(r.at)}</span>
                      </td>
                      <td className={`${td} hidden font-mono text-xs text-muted sm:table-cell`}>{r.guest ?? "—"}</td>
                      <td className={td}>
                        <What row={r} />
                        <span className="block font-mono text-xs text-muted sm:hidden">{r.guest ? `guest ${r.guest}` : ""}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </Grid>

      <p className="text-xs text-muted">
        {data.tracking_since ? `Counting guests since ${shortDay(data.tracking_since)}. ` : ""}
        A guest is a browser with no signed-in account, counted by a random id kept in that browser. Clearing site data, another browser or
        a private window counts as a new guest. Closed cases are saved without that id, so they show a dash. Browsers an admin has signed in from are left out.
      </p>
    </>
  );
}
