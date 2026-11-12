import Link from "next/link";
import { ago, num } from "@/lib/adminStats";
import { listHref, PAGE_SIZE, type StudentRow, type StudentsPage } from "@/lib/adminStudents";
import { scoreColor } from "@/lib/stats";
import { Empty, PageTitle, th, td } from "./parts";

// The Students page of the admin area: every account that has signed up, newest first, 50 to a page, with a search box.
// Emails arrive already masked from the database. Click a name for that student's own page.

function Tags({ s }: { s: StudentRow }) {
  return (
    <span className="mt-1 flex flex-wrap gap-1.5 text-[11px]">
      {s.role === "admin" && <span className="rounded border border-accent/40 px-1.5 text-accent">Admin</span>}
      {!s.confirmed && <span className="rounded border border-medium/50 px-1.5 text-medium">Email not confirmed</span>}
      {s.method !== "email" && <span className="rounded border border-line px-1.5 text-muted">{s.method}</span>}
    </span>
  );
}

export default function StudentsView({ data, page, q, now }: { data: StudentsPage; page: number; q: string; now: number }) {
  const { total, rows } = data;
  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = (page - 1) * PAGE_SIZE + rows.length;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <PageTitle heading="Students" text="Everyone who has signed up, newest first. Click a name to see what that person did." />

      <form action="/admin/students" role="search" className="flex flex-wrap items-center gap-2">
        <label htmlFor="q" className="sr-only">Search by name or email</label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          maxLength={60}
          placeholder="Search by name or email"
          className="w-full max-w-sm rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
        />
        <button type="submit" className="rounded-lg border border-line px-3 py-2 text-sm hover:border-accent hover:text-accent">Search</button>
        {q && <Link href="/admin/students" className="text-sm text-muted hover:text-ink">Clear</Link>}
      </form>

      <section className="rounded-xl border border-line p-4 md:p-5" aria-label="Accounts">
        <p className="text-sm text-muted" aria-live="polite">
          {total === 0 ? "No accounts match." : `Showing ${first}–${last} of ${num(total)} account${total === 1 ? "" : "s"}${q ? ` matching “${q}”` : ""}.`}
          {" "}Emails are partly hidden, so a screenshot is safe to share.
        </p>

        {rows.length === 0 ? (
          <Empty>{q ? "Nothing matches that search. Try part of a name or an email." : "No one has signed up yet."}</Empty>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Accounts, newest first</caption>
              <thead>
                <tr>
                  <th scope="col" className={th}>Student</th>
                  <th scope="col" className={th}>Joined</th>
                  <th scope="col" className={`${th} hidden sm:table-cell`}>Last sign-in</th>
                  <th scope="col" className={`${th} hidden lg:table-cell`}>Last active</th>
                  <th scope="col" className={`${th} text-right`}>Closed</th>
                  <th scope="col" className={`${th} text-right`}>Avg score</th>
                  <th scope="col" className={`${th} hidden md:table-cell`}>Working on</th>
                  <th scope="col" className={`${th} hidden lg:table-cell`}>Came from</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr key={s.id}>
                    <td className={td}>
                      <Link href={`/admin/students/${s.id}`} className="font-medium hover:text-accent">
                        {s.name || <span className="text-muted">(no name yet)</span>}
                      </Link>
                      <span className="block text-xs text-muted">{s.email || "no email"}</span>
                      <Tags s={s} />
                    </td>
                    <td className={`${td} whitespace-nowrap text-muted`}>{ago(s.joined, now)}</td>
                    <td className={`${td} hidden whitespace-nowrap text-muted sm:table-cell`}>{ago(s.last_sign_in, now)}</td>
                    <td className={`${td} hidden whitespace-nowrap text-muted lg:table-cell`}>{ago(s.last_seen, now)}</td>
                    <td className={`${td} text-right tabular-nums`}>{s.closed}</td>
                    <td className={`${td} text-right tabular-nums ${s.avg_score === null ? "text-muted" : scoreColor(s.avg_score)}`}>{s.avg_score ?? "—"}</td>
                    <td className={`${td} hidden whitespace-nowrap md:table-cell`}>
                      {s.active_alert ? (
                        <>
                          <span className="font-mono text-xs">{s.active_alert}</span>
                          <span className="block text-xs text-muted">since {ago(s.active_since, now)}</span>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className={`${td} hidden font-mono text-xs text-muted lg:table-cell`}>{s.source ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <nav aria-label="Pages" className="mt-4 flex items-center justify-between text-sm">
            {page > 1 ? (
              <Link href={listHref(page - 1, q)} rel="prev" className="rounded-lg border border-line px-3 py-1.5 hover:border-accent hover:text-accent">← Newer</Link>
            ) : (
              <span />
            )}
            <span className="text-muted">Page {page} of {pages}</span>
            {page < pages ? (
              <Link href={listHref(page + 1, q)} rel="next" className="rounded-lg border border-line px-3 py-1.5 hover:border-accent hover:text-accent">Older →</Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </section>

      <p className="text-xs text-muted">
        “Working on” is the alert a student has open right now (one at a time). “Came from” is the first ?ref= label seen from their browser, and is blank for anyone who
        arrived before source tracking started. Admin accounts are listed here too.
      </p>
    </div>
  );
}
