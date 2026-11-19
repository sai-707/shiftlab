import { num } from "@/lib/adminStats";
import { stallPoints, type RoadmapStats, type TopicCount } from "@/lib/adminRoadmap";
import { Bar, Empty, PageTitle, th, td } from "./parts";

// The Roadmap page of the admin area: how many students have finished each topic. Counts only, so nobody's list is shown.

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-canvas p-4 md:p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function Short({ title, rows, base }: { title: string; rows: TopicCount[]; base: number }) {
  return (
    <section className="rounded-xl border border-line p-4 md:p-5">
      <h2 className="text-base font-medium">{title}</h2>
      {rows.length === 0 ? (
        <Empty>Nothing to show yet.</Empty>
      ) : (
        <ol className="mt-3 space-y-3">
          {rows.map((r) => (
            <li key={r.slug} className="text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span>{r.name}</span>
                <span className="shrink-0 tabular-nums text-muted">
                  {num(r.done)} of {num(base)}
                </span>
              </div>
              <div className="mt-1">
                <Bar pct={base ? (100 * r.done) / base : 0} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export default function RoadmapAdminView({ stats, rows }: { stats: RoadmapStats; rows: TopicCount[] }) {
  const { least, most } = stallPoints(rows);
  const base = stats.started; // students who finished at least one topic: the people who can stall
  return (
    <div className="flex flex-col gap-6">
      <PageTitle heading="Roadmap" text="How far students get through the roadmap. Totals only; no names or emails." />

      <div className="overflow-hidden rounded-xl border border-line">
        <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          <Stat label="Accounts that opened it" value={num(stats.saved)} />
          <Stat label="Finished a topic" value={num(stats.started)} />
          <Stat label="SOC analyst track" value={num(stats.tracks.soc ?? 0)} />
          <Stat label="Security engineer track" value={num(stats.tracks.eng ?? 0)} />
        </div>
      </div>

      {stats.saved === 0 ? (
        <Empty>No student has saved roadmap progress yet. It appears here once someone signed in opens the roadmap.</Empty>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <Short title="Where students stall (essential topics, fewest finished)" rows={least} base={base} />
            <Short title="Most finished" rows={most} base={base} />
          </div>

          <section className="rounded-xl border border-line p-4 md:p-5" aria-label="Every topic">
            <h2 className="text-base font-medium">Every topic, in learning order</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">Students who finished each roadmap topic</caption>
                <thead>
                  <tr>
                    <th scope="col" className={th}>Topic</th>
                    <th scope="col" className={`${th} hidden sm:table-cell`}>Phase</th>
                    <th scope="col" className={`${th} text-right`}>Finished</th>
                    <th scope="col" className={`${th} hidden w-40 md:table-cell`}><span className="sr-only">Share</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.slug}>
                      <td className={td}>{r.name}</td>
                      <td className={`${td} hidden text-muted sm:table-cell`}>{r.phase}</td>
                      <td className={`${td} text-right tabular-nums`}>{num(r.done)}</td>
                      <td className={`${td} hidden md:table-cell`}>
                        <Bar pct={base ? (100 * r.done) / base : 0} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
