"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { submitCase } from "@/app/actions";
import { assignAlert, closeCase, useProgress } from "@/lib/progress";
import { isUnlocked } from "@/lib/levels";
import { reportProblems } from "@/lib/reportRules";
import { INTEL_SOURCE, MIN_SOURCES, isGated, openedCount, sourceBlocks } from "@/lib/sourceRules";
import { markOpened, useOpened } from "@/lib/sources";
import { toast } from "@/lib/toast";
import LookupBox from "@/components/lookup/LookupBox";
import SeverityBadge from "@/components/ui/SeverityBadge";
import FeedbackPanel from "./FeedbackPanel";
import LogLinks from "./LogLinks";
import RelatedAlerts from "./RelatedAlerts";
import { topicSlug } from "@/content/playbooks";
import { TOPIC_COLOR } from "@/lib/topics";
import type { Alert, Briefing as BriefingData, EvidenceBlock, ReportSections, Submission, Verdict } from "@/lib/types";

const panel = "rounded-2xl border border-line bg-panel p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]";

function Evidence({ block }: { block: EvidenceBlock }) {
  return (
    <section className={panel}>
      <h3 className="mb-3 text-sm font-semibold">{block.title}</h3>
      {block.kind === "fields" && (
        <dl className="space-y-2 text-sm">
          {block.rows.map((r) => (
            <div key={r.label} className="grid gap-1 sm:grid-cols-[9rem_1fr]">
              <dt className="text-muted">{r.label}</dt>
              <dd className="break-words font-mono text-[13px]">{r.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {block.kind === "logs" && (
        <pre className="overflow-x-auto rounded-lg bg-canvas p-3 font-mono text-xs leading-relaxed">
          {block.lines.join("\n")}
        </pre>
      )}
      {block.kind === "table" && (
        <div className="overflow-x-auto rounded-lg border border-line">
          <table className="w-full min-w-96 text-left text-xs">
            <thead className="bg-raised text-muted">
              <tr>
                {block.columns.map((c) => (
                  <th key={c} className="px-3 py-2 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-mono">
              {block.rows.map((row, i) => (
                <tr key={i} className="align-top hover:bg-raised/40">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3 py-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {block.kind === "timeline" && (
        <ol className="ml-2 space-y-3 border-l border-line pl-4">
          {block.events.map((e, i) => (
            <li key={i} className="relative text-sm">
              <span className="absolute -left-5.25 top-1.5 h-2 w-2 rounded-full bg-accent" />
              <span className="mr-3 font-mono text-xs text-muted">{e.time}</span>
              {e.text}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

/** A piece of evidence that stays closed until the student chooses to look at it. */
function SourceCard({ alertId, block, opened }: { alertId: string; block: EvidenceBlock; opened: boolean }) {
  if (opened) return <Evidence block={block} />;
  return (
    <section className={`${panel} flex flex-wrap items-center justify-between gap-3`}>
      <div>
        <h3 className="text-sm font-semibold">{block.title}</h3>
        <p className="text-xs text-muted">Not opened yet</p>
      </div>
      <button
        type="button"
        onClick={() => markOpened(alertId, block.title)}
        className="btn-glow press rounded-lg border px-3 py-1.5 text-sm font-medium hover:text-accent"
      >
        Open source
      </button>
    </section>
  );
}

const ASSET_STYLE: Record<BriefingData["assets"][number]["kind"], string> = {
  User: "border-accent/40 bg-accent/10 text-accent",
  Host: "border-low/40 bg-low/10 text-low",
  Account: "border-medium/40 bg-medium/10 text-medium",
  Service: "border-correct/40 bg-correct/10 text-correct",
  Address: "border-high/40 bg-high/10 text-high",
};

/** Plain-English context shown above the evidence so a beginner knows what they are looking at. */
function BriefingPanel({ b, topic }: { b: BriefingData; topic: Alert["topic"] }) {
  return (
    <section className={`${panel} border-l-4 border-l-accent`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">Alert briefing</p>
      <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-muted">Raised by</dt>
          <dd className="mt-0.5 font-medium">{b.source}</dd>
        </div>
        <div>
          <dt className="text-muted">Detection rule</dt>
          <dd className="mt-0.5 font-mono text-[13px]">{b.rule}</dd>
        </div>
      </dl>
      <p className="mt-4 text-sm">
        <span className="text-muted">What this rule looks for: </span>
        {b.looksFor}
      </p>

      <h4 className="mt-5 text-xs font-semibold uppercase tracking-wide text-muted">Who and what is involved</h4>
      <ul className="mt-2 space-y-2">
        {b.assets.map((a) => (
          <li key={a.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${ASSET_STYLE[a.kind]}`}>
              {a.kind}
            </span>
            <span className="font-mono text-[13px]">{a.name}</span>
            <span className="text-muted">{a.role}</span>
          </li>
        ))}
      </ul>

      <details open className="group mt-5 rounded-lg border border-line bg-canvas/60 px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium marker:text-accent">Questions to ask first</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
          {b.askFirst.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </details>
      <Link
        href={`/playbooks/${topicSlug(topic)}`}
        className="mt-4 inline-block text-sm text-accent hover:underline"
      >
        Read the {topic} playbook →
      </Link>
    </section>
  );
}

const choice =
  "flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm transition-colors has-[:checked]:border-accent has-[:checked]:text-accent";

const FIELDS: { key: keyof ReportSections; label: string; hint: string }[] = [
  { key: "happened", label: "What happened", hint: "The activity, in plain words, with times." },
  { key: "confirmed", label: "What is confirmed", hint: "Facts the evidence proves: IPs, accounts, hosts." },
  { key: "unknown", label: "What is still unknown", hint: "What you could not verify yet." },
  { key: "next", label: "Next action", hint: "What should happen now, and who should do it." },
];

function DecisionForm({ alert, opened }: { alert: Alert; opened: string[] }) {
  const need = MIN_SOURCES[alert.difficulty];
  const have = openedCount(opened);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [escalate, setEscalate] = useState<boolean | null>(null);
  const [sections, setSections] = useState<ReportSections>({
    happened: "",
    confirmed: "",
    unknown: "",
    next: "",
  });
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e: FormEvent) {
    e.preventDefault();
    if (verdict === null || escalate === null) {
      setError("Choose a verdict and whether to escalate.");
      return;
    }
    const problems = reportProblems(sections);
    if (problems.length) {
      setError(problems[0]);
      return;
    }
    setError("");
    const submission: Submission = { alertId: alert.id, verdict, escalate, sections, ...(need ? { opened } : {}) };
    startTransition(async () => {
      const result = await submitCase(submission);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      closeCase({ alertId: alert.id, submission, feedback: result.feedback, closedAt: Date.now() });
      toast(`${alert.id} closed: ${result.feedback.score}/100`);
    });
  }

  if (have < need) {
    return (
      <section className={`${panel} space-y-3 lg:sticky lg:top-6`}>
        <h2 className="font-semibold">Your decision</h2>
        <p className="text-sm text-muted">
          The report is locked. A real analyst looks at several sources before deciding. Open at least {need} sources on
          the left, such as logs, context records, intel lookups or log searches.
        </p>
        <p className="font-mono text-sm text-accent">
          {have} / {need} sources opened
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className={`${panel} space-y-5 lg:sticky lg:top-6`}>
      <h2 className="font-semibold">Your decision</h2>

      <fieldset>
        <legend className="mb-2 text-sm text-muted">Is this a real attack?</legend>
        <div className="flex gap-2">
          <label className={choice}>
            <input
              type="radio"
              name="verdict"
              className="accent-accent"
              checked={verdict === "tp"}
              onChange={() => setVerdict("tp")}
            />
            True positive
          </label>
          <label className={choice}>
            <input
              type="radio"
              name="verdict"
              className="accent-accent"
              checked={verdict === "fp"}
              onChange={() => setVerdict("fp")}
            />
            False positive
          </label>
        </div>
      </fieldset>

      {FIELDS.map((f) => (
        <label key={f.key} className="block">
          <span className="text-sm font-medium">
            {f.label} <span className="text-missed">*</span>
          </span>
          <span className="mb-2 block text-xs text-muted">{f.hint}</span>
          <textarea
            value={sections[f.key]}
            onChange={(e) => setSections({ ...sections, [f.key]: e.target.value })}
            rows={3}
            maxLength={2000}
            className="w-full resize-y rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
          />
        </label>
      ))}

      <fieldset>
        <legend className="mb-2 text-sm text-muted">Does this need escalation?</legend>
        <div className="flex gap-2">
          <label className={choice}>
            <input
              type="radio"
              name="escalate"
              className="accent-accent"
              checked={escalate === true}
              onChange={() => setEscalate(true)}
            />
            Yes
          </label>
          <label className={choice}>
            <input
              type="radio"
              name="escalate"
              className="accent-accent"
              checked={escalate === false}
              onChange={() => setEscalate(false)}
            />
            No
          </label>
        </div>
      </fieldset>

      <p className="text-xs text-muted">
        <span className="text-missed">*</span> Both decisions and all four report sections are compulsory.
      </p>

      {error && (
        <p role="alert" className="text-sm text-missed">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn-shine press w-full rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-canvas hover:shadow-[0_0_22px_-4px_rgb(34_211_238/0.7)] disabled:opacity-60"
      >
        {pending ? (
          <>
            <span className="spinner" aria-hidden="true" /> Scoring…
          </>
        ) : (
          "Submit and close alert"
        )}
      </button>
    </form>
  );
}

export default function CaseWorkspace({ alert }: { alert: Alert }) {
  const progress = useProgress();
  const record = progress.cases[alert.id];
  const isActive = progress.activeAlertId === alert.id;
  const otherActive = progress.activeAlertId !== null && !isActive;
  const locked = !record && !isActive && !isUnlocked(alert.difficulty, progress.cases);
  const gated = isGated(alert);
  const opened = useOpened(alert.id);
  const hideEvidence = gated && isActive && !record;
  const need = MIN_SOURCES[alert.difficulty];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/queue" className="text-sm text-muted hover:text-accent">
          ← Alert queue
        </Link>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="font-mono text-sm text-accent">{alert.id}</span>
          <SeverityBadge severity={alert.severity} />
          <span className="text-sm text-muted">
            <span
              className="mr-1.5 inline-block h-2 w-2 rounded-full align-middle"
              style={{ background: TOPIC_COLOR[alert.topic] }}
            />
            {alert.topic} · {alert.difficulty} · raised {alert.raisedAt}
          </span>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{alert.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted">{alert.summary}</p>
      </div>

      {!record && !isActive && (
        <div className={`${panel} flex flex-wrap items-center justify-between gap-3`}>
          {locked ? (
            <>
              <p className="text-sm">
                This is a {alert.difficulty} alert. It unlocks when you close every alert in the level before it.
              </p>
              <Link
                href="/queue"
                className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent"
              >
                See your levels
              </Link>
            </>
          ) : otherActive ? (
            <>
              <p className="text-sm">
                You already have an alert assigned. Finish it before taking another.
              </p>
              <Link
                href={`/alerts/${progress.activeAlertId}`}
                className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent"
              >
                Go to your alert
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm">Assign this alert to yourself to see the evidence and start investigating.</p>
              <button
                type="button"
                onClick={() => {
                  assignAlert(alert.id);
                  toast(`${alert.id} assigned to you`);
                }}
                className="btn-shine press rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:shadow-[0_0_20px_-4px_rgb(34_211_238/0.7)]"
              >
                Assign to me
              </button>
            </>
          )}
        </div>
      )}

      {record && <FeedbackPanel record={record} />}

      {(record || isActive) && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className={`min-w-0 space-y-4 ${record ? "lg:col-span-3" : "lg:col-span-2"}`}>
            <BriefingPanel b={alert.briefing} topic={alert.topic} />
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Evidence</h2>
            {hideEvidence ? (
              <>
                {alert.evidence.filter((b) => b.title === "Alert details").map((b) => (
                  <Evidence key={b.title} block={b} />
                ))}
                <p className="rounded-lg border border-dashed border-line px-4 py-3 text-sm text-muted">
                  Only the alert itself is shown. Open the sources below, use the lookup and search the logs. You need at
                  least {need} sources before you can write your report ({openedCount(opened)} opened so far).
                </p>
                {sourceBlocks(alert).map((b) => (
                  <SourceCard key={b.title} alertId={alert.id} block={b} opened={opened.includes(b.title)} />
                ))}
              </>
            ) : (
              alert.evidence.map((block) => <Evidence key={block.title} block={block} />)
            )}
            {isActive && (
              <section className={panel}>
                <h3 className="mb-1 text-sm font-semibold">Intel check</h3>
                <p className="mb-3 text-xs text-muted">Find the IP, domain, link or hash in the evidence and the logs, then check it here.</p>
                <LookupBox onLookup={gated ? () => markOpened(alert.id, INTEL_SOURCE) : undefined} />
              </section>
            )}
            <LogLinks alertId={alert.id} track={gated && isActive} />
            <RelatedAlerts alert={alert} closed={Boolean(record)} />
          </div>
          {isActive && <DecisionForm alert={alert} opened={opened} />}
        </div>
      )}
    </div>
  );
}
