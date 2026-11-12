import Link from "next/link";
import { ALERTS } from "@/content/alerts";
import { ago, clockTime, sectionLabel } from "@/lib/adminStats";
import { took, type Activity, type StudentDetail } from "@/lib/adminStudents";
import { scoreColor } from "@/lib/stats";
import { Empty, sub, td, th, title } from "./parts";

// One student: who they are, every case with how long it took, and the latest things their browser did, including before they signed up.

const REASON: Record<string, string> = {
  decision: "no verdict or escalation chosen",
  empty: "a section was empty",
  quality: "text a check did not accept",
};

const alertTitle = (id: string | null) => (id ? ALERTS.find((a) => a.id === id)?.title : undefined);

function What({ a }: { a: Activity }) {
  if (a.kind === "case_closed") {
    return (
      <>
        Closed <span className="font-mono text-xs">{a.alert}</span>
        {a.score !== null && <span className={`ml-2 tabular-nums ${scoreColor(a.score)}`}>Score {a.score}</span>}
      </>
    );
  }
  if (a.kind === "report_started") return <>Started writing the report on <span className="font-mono text-xs">{a.alert}</span></>;
  if (a.kind === "report_blocked") {
    return (
      <>
        Submit was stopped on <span className="font-mono text-xs">{a.alert}</span>
        <span className="block text-xs text-muted">{REASON[a.reason ?? ""] ?? a.reason}</span>
      </>
    );
  }
  const seg = (a.path ?? "/").split("/")[1] ?? "";
  return (
    <>
      {sectionLabel(seg)}
      <span className="block font-mono text-xs text-muted">{a.path ?? "/"}{a.ref ? `  ·  ref=${a.ref}` : ""}</span>
    </>
  );
}

export default function StudentView({ data, now }: { data: StudentDetail; now: number }) {
  const { student: s, cases, activity } = data;
  const closed = cases.filter((c) => c.status === "closed");
  const facts: [string, string][] = [
    ["Joined", `${clockTime(s.joined)} (${ago(s.joined, now)})`],
    ["Last sign-in", s.last_sign_in ? `${clockTime(s.last_sign_in)} (${ago(s.last_sign_in, now)})` : "never"],
    ["Signs in with", s.method],
    ["Email confirmed", s.confirmed ? "yes" : "no"],
    ["Came from", s.source ?? "not recorded"],
    ["Role", s.role],
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/students" className="text-sm text-muted hover:text-ink">← All students</Link>
        <h1 className="mt-2 text-xl font-semibold leading-tight">{s.name || "(no name yet)"}</h1>
        <p className="text-base text-muted">{s.email || "no email"}</p>
      </div>

      <section className="rounded-xl border border-line p-4 md:p-5" aria-label="About this student">
        <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs uppercase tracking-wide text-muted">{k}</dt>
              <dd className="mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-line p-4 md:p-5" aria-labelledby="cases-h">
        <h2 id="cases-h" className={title}>Cases</h2>
        <p className={sub}>{closed.length} closed{cases.length > closed.length ? `, ${cases.length - closed.length} open now` : ""}. “Time taken” is from opening the alert to closing it.</p>
        {cases.length === 0 ? (
          <Empty>This student has not opened an alert yet.</Empty>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Cases</caption>
              <thead>
                <tr>
                  <th scope="col" className={th}>Alert</th>
                  <th scope="col" className={`${th} text-right`}>Score</th>
                  <th scope="col" className={`${th} text-right`}>Time taken</th>
                  <th scope="col" className={`${th} hidden sm:table-cell`}>Opened</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => (
                  <tr key={c.alert_id}>
                    <td className={td}>
                      <span className="font-mono text-xs text-muted">{c.alert_id}</span> {alertTitle(c.alert_id)}
                      {c.status === "active" && <span className="ml-2 rounded border border-accent/40 px-1.5 text-[11px] text-accent">open now</span>}
                    </td>
                    <td className={`${td} text-right tabular-nums ${c.score === null ? "text-muted" : scoreColor(c.score)}`}>{c.score ?? "—"}</td>
                    <td className={`${td} whitespace-nowrap text-right tabular-nums`}>{took(c.started_at, c.closed_at)}</td>
                    <td className={`${td} hidden whitespace-nowrap text-muted sm:table-cell`}>{ago(c.started_at, now)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-line p-4 md:p-5" aria-labelledby="act-h">
        <h2 id="act-h" className={title}>Latest activity</h2>
        <p className={sub}>The last {activity.length === 100 ? "100" : activity.length} things this student&apos;s browser did, newest first. “Before sign-up” rows happened as a guest, from the same browser. Times are India time.</p>
        {activity.length === 0 ? (
          <Empty>No activity recorded for this student yet.</Empty>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Latest activity</caption>
              <thead>
                <tr>
                  <th scope="col" className={th}>When</th>
                  <th scope="col" className={th}>What</th>
                </tr>
              </thead>
              <tbody>
                {activity.map((a) => (
                  <tr key={a.id}>
                    <td className={`${td} whitespace-nowrap text-muted`}>
                      {clockTime(a.at)}
                      {a.guest && <span className="block text-[11px] text-medium">Before sign-up</span>}
                    </td>
                    <td className={td}><What a={a} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
