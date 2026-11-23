"use client";

import Link from "next/link";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { reviewCase, type ReviewResult } from "@/app/review-actions";
import AfterAction from "@/components/case/AfterAction";
import AttackTags from "@/components/case/AttackTags";
import RealWorld from "@/components/case/RealWorld";
import { ALERTS } from "@/content/alerts";
import { fixHeading, tone } from "@/lib/complete";
import { useProgress } from "@/lib/progress";
import { FIELD_NAME, SECTION_MAX, sectionMarks } from "@/lib/reportRules";
import type { Status } from "@/lib/review";
import type { CaseRecord, ReportSections } from "@/lib/types";

const CHIP: Record<Status, { label: string; cls: string }> = {
  strong: { label: "Correct", cls: "border-correct/40 text-correct" },
  detail: { label: "Needs detail", cls: "border-medium/40 text-medium" },
  vague: { label: "Too vague", cls: "border-missed/40 text-missed" },
  missing: { label: "Missing", cls: "border-missed/40 text-missed" },
  unreadable: { label: "Not readable", cls: "border-missed/40 text-missed" },
  wrong: { label: "Not correct", cls: "border-missed/40 text-missed" },
};
const ORDER = ["happened", "confirmed", "unknown", "next"] as const;
const TABS = [
  ["score", "Score and what to change"],
  ["report", "Your report"],
  ["model", "Model answer"],
] as const;
type Tab = (typeof TABS)[number][0];

/** Renders text where [[double brackets]] mark key facts. */
function Marked({ text }: { text: string }) {
  return (
    <>
      {text.split(/\[\[|\]\]/).map((part, i) =>
        i % 2 ? (
          <mark key={i} className="rounded bg-accent/20 px-0.5 text-ink">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}

const Marks = ({ points, max }: { points: number; max: number }) => (
  <span className="font-mono text-sm font-semibold">
    {points}
    <span className="text-xs font-normal text-muted">/{max}</span>
  </span>
);

const Chip = ({ cls, children }: { cls: string; children: ReactNode }) => (
  <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{children}</span>
);

/** One closed case, opened from "View report" or from the Case reports list. Reads the review but never changes the score. */
export default function ReportDetail({ alertId }: { alertId: string }) {
  const record = useProgress().cases[alertId];
  const alert = ALERTS.find((a) => a.id === alertId);
  if (!record || !alert) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-panel p-8 text-sm text-muted">
        There is no report for {alertId} yet.{" "}
        <Link href={`/alerts/${alertId}`} className="text-accent hover:underline">
          Open the alert
        </Link>{" "}
        to write one.
      </div>
    );
  }
  return <Report record={record} title={alert.title} topic={alert.topic} level={alert.difficulty} />;
}

function Report({ record, title, topic, level }: { record: CaseRecord; title: string; topic: string; level: string }) {
  const { feedback: fb, submission: sub } = record;
  const [tab, setTab] = useState<Tab>("score");
  const [r, setR] = useState<ReviewResult | null>(null);
  // Revising is practice: the edited text is reviewed again, never saved, and the score is frozen at submit.
  const [sections, setSections] = useState<ReportSections>(sub.sections);
  const [first, setFirst] = useState<Record<string, Status>>({});
  const [editing, setEditing] = useState<keyof ReportSections | null>(null);
  const [draft, setDraft] = useState("");
  const sig = JSON.stringify(sections);

  useEffect(() => {
    let live = true;
    reviewCase(record.alertId, JSON.parse(sig) as ReportSections).then((x) => {
      if (!live) return;
      setR(x);
      if (x.ok) setFirst((f) => (Object.keys(f).length ? f : Object.fromEntries(x.sections.map((s) => [s.section, s.status]))));
    });
    return () => {
      live = false;
    };
  }, [record.alertId, sig]);

  const t = tone(fb.score);
  const marks = sectionMarks(sub.sections);
  const correctNow = r?.ok ? r.sections.filter((s) => s.status === "strong").length : 0;
  const correctFirst = Object.values(first).filter((x) => x === "strong").length;
  const reportItem = fb.items.find((i) => i.label === "Report written");

  // Everything that cost marks, biggest first: the scored decisions, then the report sections that read weakly.
  const todo = [
    ...fb.items.filter((i) => i !== reportItem && i.points < i.max).map((i) => ({ key: i.label, title: i.label, text: i.note, gain: i.max - i.points })),
    ...(r?.ok
      ? r.sections
          .filter((s) => s.status !== "strong")
          .map((s) => ({
            key: s.section,
            title: FIELD_NAME[s.section],
            text: s.fix[0] ?? (s.text ? "Add more detail here." : "Left empty. Add a line here."),
            gain: SECTION_MAX[s.section] - marks[s.section],
          }))
      : []),
  ].sort((a, b) => b.gain - a.gain);
  // A report section that reads weakly still earns its marks for being written, so it is a wording tip, not a loss.
  const lost = todo.filter((x) => x.gain > 0).length;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1 basis-80">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono text-sm text-accent">{record.alertId}</span>
            <span className="rounded-full border border-line px-2.5 py-0.5 text-muted">{level}</span>
            <span className="rounded-full border border-line px-2.5 py-0.5 text-muted">{topic}</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>
          <AttackTags alertId={record.alertId} />
        </div>
        <div className="text-right">
          <p className="text-4xl font-semibold tracking-tight">
            {fb.score}
            <span className="text-lg text-muted">/100</span>
          </p>
          <p className="mt-1 text-sm font-medium" style={{ color: t.color }}>
            {t.head}
          </p>
        </div>
      </header>

      <div role="tablist" aria-label="Report" className="flex flex-wrap border-b border-line">
        {TABS.map(([id, label]) => (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            onClick={() => setTab(id)}
            className={`-mb-px min-h-11 border-b-2 px-4 text-sm font-semibold ${tab === id ? "border-accent text-accent" : "border-transparent text-muted hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "score" && (
        <div role="tabpanel" id="panel-score" aria-labelledby="tab-score" className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            {fb.items.map((i) => {
              const full = i.points === i.max;
              const none = i.points === 0;
              const isReport = i === reportItem;
              const written = ORDER.filter((k) => marks[k] > 0).length;
              return (
                <div key={i.label} className="rounded-xl border border-line bg-panel p-4">
                  <p className="text-xs uppercase tracking-wide text-muted">{i.label}</p>
                  <p className="mt-2 font-mono text-3xl font-semibold">
                    {i.points}
                    <span className="text-sm font-normal text-muted">/{i.max}</span>
                  </p>
                  <div className="mt-2">
                    <Chip cls={full ? "border-correct/40 text-correct" : none ? "border-missed/40 text-missed" : "border-medium/40 text-medium"}>
                      {isReport ? `${written} of 4 written` : full ? "Correct" : none ? "Wrong" : "Partly"}
                    </Chip>
                  </div>
                </div>
              );
            })}
          </div>

          <section className={`rounded-2xl border bg-panel p-5 ${lost ? "border-medium/40" : "border-correct/40"}`}>
            <p className={`text-xs uppercase tracking-wide ${lost ? "text-medium" : "text-correct"}`}>What to change</p>
            {!r ? (
              <p className="mt-2 text-sm text-muted">Preparing your review…</p>
            ) : todo.length ? (
              <>
                <h2 className="mt-1 text-lg font-semibold">{fixHeading(lost, todo.length - lost)}</h2>
                <ol className="mt-3 space-y-3">
                  {todo.map((x, n) => (
                    <li key={x.key} className="flex gap-3 text-sm leading-relaxed">
                      <span className="font-mono font-semibold text-medium">{n + 1}</span>
                      <span>
                        <b>{x.title}.</b> <span className="text-muted">{x.text}</span>
                        {x.gain > 0 ? <span className="ml-2 font-mono text-xs text-missed">+{x.gain} marks</span> : <span className="ml-2 text-xs text-muted">wording tip</span>}
                      </span>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className="mt-1 text-sm">No marks lost and no wording tips. Compare your wording with the model answer.</p>
            )}
          </section>

          <p className="text-xs leading-relaxed text-muted">
            {reportItem?.note} Report marks are for writing each section (10 + 5 + 5 + 5). Your wording is never marked down, and unreadable text earns nothing. Hints do not change your score.
          </p>

          <section className="rounded-xl border border-line bg-panel p-5">
            <p className="text-xs uppercase tracking-wide text-muted">What actually happened</p>
            <p className="mt-2 text-sm leading-relaxed">{fb.explanation}</p>
          </section>
        </div>
      )}

      {tab === "report" && (
        <div role="tabpanel" id="panel-report" aria-labelledby="tab-report" className="space-y-3">
          <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/40 bg-panel p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-accent">Revise and check again</p>
              <p className="mt-1 text-sm text-muted">Edit any section, then check it. The review updates; your score does not change, and a refresh brings your original back.</p>
            </div>
            {r?.ok && (
              <Chip cls={correctNow > correctFirst ? "border-correct/40 text-correct" : "border-line text-muted"}>
                {correctFirst} of 4 Correct{correctNow !== correctFirst ? ` → ${correctNow} of 4` : ""}
              </Chip>
            )}
          </section>
          <p className="text-xs leading-relaxed text-muted">
            For marking, your seven headings are grouped into four sections: What happened = Time of activity + Reason for classifying. What is confirmed = Affected entities + Attack indicators. What is still unknown. Next action = Reason for escalating + Remediation actions.
          </p>
          {!r ? (
            <p className="text-sm text-muted">Preparing your review…</p>
          ) : !r.ok ? (
            <p className="text-sm text-muted">{r.error}</p>
          ) : (
            r.sections.map((s) => (
              <section key={s.section} className="rounded-xl border border-line bg-panel p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold">{FIELD_NAME[s.section]}</h2>
                  <div className="flex flex-wrap items-center gap-3">
                    <Chip cls={CHIP[s.status].cls}>{CHIP[s.status].label}</Chip>
                    {first[s.section] && first[s.section] !== s.status && (
                      <span className="text-xs text-muted">
                        was <span className={CHIP[first[s.section]].cls.split(" ")[1]}>{CHIP[first[s.section]].label}</span>
                      </span>
                    )}
                    <Marks points={marks[s.section]} max={SECTION_MAX[s.section]} />
                    {editing !== s.section && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(s.section);
                          setDraft(sections[s.section]);
                        }}
                        className="min-h-9 rounded-lg border border-line px-3 text-xs font-medium hover:border-accent hover:text-accent"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                {editing === s.section ? (
                  <form
                    className="mt-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSections({ ...sections, [s.section]: draft });
                      setEditing(null);
                    }}
                  >
                    <textarea
                      aria-label={FIELD_NAME[s.section]}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={4}
                      maxLength={2000}
                      className="w-full rounded-lg border border-accent bg-canvas px-3 py-2 text-sm leading-relaxed text-ink"
                    />
                    <div className="mt-2 flex gap-2">
                      <button type="submit" className="min-h-9 rounded-lg bg-accent px-3 text-xs font-semibold text-canvas hover:opacity-90">
                        Check this section
                      </button>
                      <button type="button" onClick={() => setEditing(null)} className="min-h-9 rounded-lg border border-line px-3 text-xs font-medium hover:border-accent hover:text-accent">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <blockquote className="mt-3 whitespace-pre-wrap rounded-md border-l-2 border-line bg-canvas px-3 py-2 text-sm text-ink/80">
                    {s.text || <span className="text-muted">(left empty)</span>}
                  </blockquote>
                )}
                {(s.good.length > 0 || s.fix.length > 0) && (
                  <ul className="mt-3 space-y-1 text-sm leading-relaxed">
                    {s.good.map((g) => (
                      <li key={g} className="flex gap-2">
                        <span className="text-correct" aria-label="right">✓</span>
                        <span>{g}</span>
                      </li>
                    ))}
                    {s.fix.map((f) => (
                      <li key={f} className="flex gap-2">
                        <span className="text-missed" aria-label="to fix">✗</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {s.tryThis && (
                  <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 px-3 py-2.5 text-sm">
                    <p className="text-xs uppercase tracking-wide text-accent">Write something like this</p>
                    <p className="mt-1 leading-relaxed">
                      <Marked text={s.tryThis} />
                    </p>
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      )}

      {tab === "model" && (
        <div role="tabpanel" id="panel-model" aria-labelledby="tab-model" className="space-y-4">
          {!r ? (
            <p className="text-sm text-muted">Preparing the model answer…</p>
          ) : !r.ok ? (
            <p className="text-sm text-muted">{r.error}</p>
          ) : (
            <>
              <section className="rounded-xl border border-line bg-panel p-5">
                <p className="text-xs uppercase tracking-wide text-muted">Model report</p>
                <h2 className="mt-1 text-lg font-semibold">One strong way to write it</h2>
                <p className="mt-1 text-sm text-muted">Yours can be different if it covers the same facts.</p>
                <div className="mt-3 space-y-2.5 text-sm leading-relaxed">
                  {ORDER.map((k) => (
                    <p key={k}>
                      <b>{FIELD_NAME[k]}.</b> <Marked text={r.model[k]} />
                    </p>
                  ))}
                </div>
              </section>
              <section className="rounded-xl border border-missed/30 bg-panel p-5">
                <h2 className="text-sm font-semibold">Mistakes to avoid on this kind of alert</h2>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {r.mistakes.map((m) => (
                    <li key={m} className="flex gap-2">
                      <span className="text-missed" aria-hidden>✗</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-xl border border-correct/30 bg-panel p-5">
                <p className="text-xs uppercase tracking-wide text-correct">One thing to practise next time</p>
                <p className="mt-1 text-sm">{r.tip}</p>
              </section>
            </>
          )}
          <RealWorld alertId={record.alertId} />
          <AfterAction alertId={record.alertId} verdict={fb.correctVerdict} />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/queue" className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90">
          Next alert
        </Link>
        <Link href="/reports" className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent">
          All case reports
        </Link>
      </div>
    </div>
  );
}
