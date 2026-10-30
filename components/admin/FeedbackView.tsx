import Link from "next/link";
import { markFeedbackRead } from "@/app/feedback-actions";
import { ago } from "@/lib/adminStats";
import type { FeedbackItem, Show } from "@/lib/feedbackData";
import { Empty, PageTitle, pill } from "./parts";

const ROLE = { student: "Student", l1: "Working L1", l2plus: "L2 or above", other: "Other" } as const;
const EVIDENCE = { yes: "Yes", mostly: "Mostly", no: "No" } as const;
const SHOWS: [Show, string][] = [
  ["all", "All"],
  ["unread", "Unread"],
  ["contact", "OK to contact"],
];

function Item({ f, now }: { f: FeedbackItem; now: number }) {
  const where = f.alert ? `${f.alert}${f.level ? ` · ${f.level}` : ""}` : (f.path ?? "Unknown page");
  return (
    <li className={`flex flex-col gap-2 p-4 md:p-5 ${f.read ? "opacity-60" : ""}`}>
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted">
        <span className={`h-2 w-2 rounded-full ${f.read ? "border border-muted" : "bg-accent"}`} aria-label={f.read ? "Read" : "Unread"} role="img" />
        <span className="font-mono">{where}</span>
        <span aria-hidden="true">·</span>
        <span>{f.role ? ROLE[f.role] : f.signed_in ? "Signed in" : "Guest"}</span>
        <span aria-hidden="true">·</span>
        <time dateTime={f.at}>{ago(f.at, now)}</time>
        {f.contact_ok && <span className="rounded-full bg-correct/10 px-2 py-0.5 font-semibold text-correct">OK to contact</span>}
        {!f.read && (
          <form action={markFeedbackRead.bind(null, f.id)} className="ml-auto">
            <button type="submit" className="rounded-md px-2 py-1 text-accent hover:underline">
              Mark read
            </button>
          </form>
        )}
      </div>
      {(f.rating || f.evidence) && (
        <div className="flex flex-wrap gap-x-4 text-sm">
          {f.rating && (
            <span>
              <strong className="text-medium">★ {f.rating}</strong> realistic
            </span>
          )}
          {f.evidence && (
            <span>
              Evidence enough: <strong>{EVIDENCE[f.evidence]}</strong>
            </span>
          )}
        </div>
      )}
      {f.confusing && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          <span className="text-muted">Confusing or missing: </span>
          {f.confusing}
        </p>
      )}
      {f.opinion && (
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          <span className="text-muted">Opinion: </span>
          {f.opinion}
        </p>
      )}
    </li>
  );
}

export default function FeedbackView({ items, unread, show, now }: { items: FeedbackItem[]; unread: number; show: Show; now: number }) {
  const rated = items.filter((f) => f.rating);
  const avg = rated.length ? (rated.reduce((n, f) => n + (f.rating ?? 0), 0) / rated.length).toFixed(1) : null;
  return (
    <>
      <PageTitle
        heading="Feedback"
        text={`${unread} unread${avg ? ` · average realism ${avg} of 5 (these ${rated.length} ratings)` : ""}`}
        action={
          unread > 0 ? (
            <form action={markFeedbackRead.bind(null, "all")} className="self-start">
              <button type="submit" className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted hover:text-ink">
                Mark all read
              </button>
            </form>
          ) : undefined
        }
      />
      <div role="group" aria-label="Filter" className="inline-flex shrink-0 self-start rounded-lg border border-line p-0.5">
        {SHOWS.map(([v, label]) => (
          <Link key={v} href={v === "all" ? "/admin/feedback" : `/admin/feedback?show=${v}`} aria-current={v === show ? "true" : undefined} className={pill(v === show)}>
            {label}
          </Link>
        ))}
      </div>
      {items.length === 0 ? (
        <Empty>{show === "all" ? "No feedback yet. It appears here when someone sends it from the Send feedback window." : "Nothing matches this filter."}</Empty>
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
          {items.map((f) => (
            <Item key={f.id} f={f} now={now} />
          ))}
        </ul>
      )}
    </>
  );
}
