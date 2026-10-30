"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { submitCase } from "@/app/actions";
import { GUEST_LIMIT, assignAlert, closeCase, useGuestLimit, useProgress } from "@/lib/progress";
import { isUnlocked } from "@/lib/levels";
import { reportProblems } from "@/lib/reportRules";
import { INTEL_SOURCE, LOG_SOURCE, MIN_SOURCES, isGated, openedCount, sourceBlocks } from "@/lib/sourceRules";
import { markOpened, useOpened } from "@/lib/sources";
import { toast } from "@/lib/toast";
import LookupBox from "@/components/lookup/LookupBox";
import SeverityBadge from "@/components/ui/SeverityBadge";
import FeedbackPanel from "./FeedbackPanel";
import LogLinks from "./LogLinks";
import RelatedAlerts from "./RelatedAlerts";
import StepPanels, { StepTracker } from "./StepPanels";
import { LOG_LINKS } from "@/content/logLinks";
import { topicSlug } from "@/content/playbooks";
import { TOPIC_COLOR } from "@/lib/topics";
import type { Alert, Briefing as BriefingData, EvidenceBlock, ReportSections, Submission, Verdict } from "@/lib/types";

const panel = "rounded-2xl border border-line bg-panel p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]";

function EvidenceBody({ block }: { block: EvidenceBlock }) {
  return (
    <>
      {block.kind === "fields" && (
        <dl className="divide-y divide-line/60 text-sm">
          {block.rows.map((r) => (
            <div key={r.label} className="grid gap-1 py-2.5 first:pt-0 last:pb-0 sm:grid-cols-[10rem_1fr]">
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
    </>
  );
}


/** Inside a tab: evidence that stays closed until the student chooses to look at it. */
function LockedSource({ alertId, block }: { alertId: string; block: EvidenceBlock }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-line px-4 py-4">
      <p className="text-sm text-muted">Not opened yet. A real analyst chooses what to look at.</p>
      <button
        type="button"
        onClick={() => markOpened(alertId, block.title)}
        className="btn-glow press rounded-lg border px-3 py-1.5 text-sm font-medium hover:text-accent"
      >
        Open source
      </button>
    </div>
  );
}

const ASSET_STYLE: Record<BriefingData["assets"][number]["kind"], string> = {
  User: "border-accent/40 bg-accent/10 text-accent",
  Host: "border-low/40 bg-low/10 text-low",
  Account: "border-medium/40 bg-medium/10 text-medium",
  Service: "border-correct/40 bg-correct/10 text-correct",
  Address: "border-high/40 bg-high/10 text-high",
};

/** Plain-English context for the alert card: who raised it, what the rule looks for, who is involved, what to ask first. */
function BriefingBits({ b, topic }: { b: BriefingData; topic: Alert["topic"] }) {
  return (
    <div className="space-y-4 border-t border-line/60 pt-4 text-sm">
      <p>
        <span className="text-muted">What this rule looks for: </span>
        {b.looksFor}
      </p>
      <ul className="space-y-2">
        {b.assets.map((a) => (
          <li key={a.name} className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${ASSET_STYLE[a.kind]}`}>{a.kind}</span>
            <span className="font-mono text-[13px]">{a.name}</span>
            <span className="text-muted">{a.role}</span>
          </li>
        ))}
      </ul>
      <details open className="rounded-lg border border-line bg-canvas/60 px-4 py-3">
        <summary className="cursor-pointer font-medium marker:text-accent">Questions to ask first</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-muted">
          {b.askFirst.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ul>
      </details>
      <Link href={`/playbooks/${topicSlug(topic)}`} className="inline-block text-accent hover:underline">
        Read the {topic} playbook →
      </Link>
    </div>
  );
}

/** A numbered card on the one-page workspace. */
function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className={`${panel} !p-0`}>
      <h2 className="border-b border-line px-5 py-3.5 text-[15px] font-semibold">
        <span className="mr-2 font-mono text-accent">{n}</span>
        {title}
      </h2>
      <div className="p-5">{children}</div>
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
      <div className="space-y-3">
        <p className="text-sm text-muted">
          The report is locked. A real analyst looks at several sources before deciding. Open at least {need} sources in
          the evidence tabs above, such as logs, context records, the intel check or a log search.
        </p>
        <p className="font-mono text-sm text-accent">
          {have} / {need} sources opened
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">

      <fieldset className="grid gap-2 md:grid-cols-[13rem_1fr] md:items-center md:gap-4">
        <legend className="mb-2 text-sm font-semibold md:mb-0 md:float-left md:w-52">Is this a real attack?</legend>
        <div className="flex max-w-md gap-2 md:col-start-2">
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

      <div className="grid gap-3 md:grid-cols-[13rem_1fr] md:gap-4">
        <div>
          <p className="text-sm font-semibold">Write it up</p>
          <p className="mt-1 text-xs text-muted">Short plain sentences are fine. Use times, names and addresses from the evidence.</p>
        </div>
        <div className="space-y-4">
          {FIELDS.map((f) => (
            <label key={f.key} className="block">
              <span className="text-sm font-medium">
                {f.label} <span className="text-missed">*</span>
              </span>
              <span className="mb-1.5 block text-xs text-muted">{f.hint}</span>
              <textarea
                value={sections[f.key]}
                onChange={(e) => setSections({ ...sections, [f.key]: e.target.value })}
                rows={3}
                maxLength={2000}
                className="w-full resize-y rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
          ))}
        </div>
      </div>

      <fieldset className="grid gap-2 md:grid-cols-[13rem_1fr] md:items-center md:gap-4">
        <legend className="mb-2 text-sm font-semibold md:mb-0 md:float-left md:w-52">Does this need escalation?</legend>
        <div className="flex max-w-md gap-2 md:col-start-2">
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

      <div className="flex justify-end border-t border-line pt-5">
      <button
        type="submit"
        disabled={pending}
        className="btn-shine press rounded-lg bg-accent px-6 py-2.5 text-sm font-semibold text-canvas hover:shadow-[0_0_22px_-4px_rgb(34_211_238/0.7)] disabled:opacity-60"
      >
        {pending ? (
          <>
            <span className="spinner" aria-hidden="true" /> Scoring…
          </>
        ) : (
          "Submit and close alert"
        )}
      </button>
      </div>
    </form>
  );
}

/** The evidence as tabs: one tab per source, plus the log search and the intel check. */
function EvidenceTabs({ alert, opened, isActive, hideEvidence, alertBlock }: { alert: Alert; opened: string[]; isActive: boolean; hideEvidence: boolean; alertBlock?: EvidenceBlock }) {
  const gated = isGated(alert);
  const blocks = hideEvidence ? sourceBlocks(alert) : alert.evidence.filter((b) => b !== alertBlock);
  const hasLogs = Boolean(LOG_LINKS[alert.id]);
  const tabs: { id: string; label: string; done: boolean }[] = [
    ...blocks.map((b) => ({ id: b.title, label: b.title.replace(/\s*\(.*\)\s*$/, ""), done: gated && opened.includes(b.title) })),
    ...(hasLogs ? [{ id: "__logs", label: "Log search", done: gated && opened.includes(LOG_SOURCE) }] : []),
    ...(isActive ? [{ id: "__intel", label: "Intel check", done: gated && opened.includes(INTEL_SOURCE) }] : []),
  ];
  const [pick, setPick] = useState("");
  const current = tabs.find((t) => t.id === pick) ?? tabs[0];
  if (!current) return null;
  const block = blocks.find((b) => b.title === current.id);

  return (
    <div>
      <div role="tablist" aria-label="Evidence" className="-mx-1 flex gap-1 overflow-x-auto border-b border-line px-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={t.id === current.id}
            onClick={() => setPick(t.id)}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors ${t.id === current.id ? "border-accent text-ink" : "border-transparent text-muted hover:text-ink"}`}
          >
            {t.label}
            {t.done && <span className="ml-1.5 text-correct" aria-label="opened">✓</span>}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="pt-4">
        {block ? (
          hideEvidence && !opened.includes(block.title) ? (
            <LockedSource alertId={alert.id} block={block} />
          ) : (
            <EvidenceBody block={block} />
          )
        ) : current.id === "__logs" ? (
          <LogLinks alertId={alert.id} track={gated && isActive} bare />
        ) : (
          <>
            <p className="mb-3 text-sm text-muted">Find the IP, domain, link or hash in the evidence and the logs, then check it here.</p>
            <LookupBox onLookup={gated ? () => markOpened(alert.id, INTEL_SOURCE) : undefined} />
          </>
        )}
      </div>
      {hideEvidence && (
        <p className="mt-4 text-xs text-muted">
          You need at least {MIN_SOURCES[alert.difficulty]} sources before you can write your report ({openedCount(opened)} opened so far).
        </p>
      )}
    </div>
  );
}

export default function CaseWorkspace({ alert }: { alert: Alert }) {
  const progress = useProgress();
  const guestLimit = useGuestLimit();
  const record = progress.cases[alert.id];
  const isActive = progress.activeAlertId === alert.id;
  const otherActive = progress.activeAlertId !== null && !isActive;
  const locked = !record && !isActive && !isUnlocked(alert.difficulty, progress.cases);
  const gated = isGated(alert);
  const opened = useOpened(alert.id);
  const hideEvidence = gated && isActive && !record;
  // The alert's own details open the page as labelled rows. Gated alerts show only the block called "Alert details";
  // the others use their first fields block (for example "Email details").
  const alertBlock = gated
    ? alert.evidence.find((b) => b.title === "Alert details")
    : (alert.evidence.find((b) => b.title === "Alert details") ?? alert.evidence.find((b) => b.kind === "fields"));

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
        {alert.task && (
          <p className="mt-3 max-w-3xl rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm">
            <span className="font-semibold text-accent">Your task: </span>
            {alert.task}
          </p>
        )}
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
          ) : guestLimit ? (
            <>
              <p className="text-sm">You have closed {GUEST_LIMIT} alerts as a guest. Create a free account to keep going. Your progress comes with you.</p>
              <Link
                href="/signup"
                className="btn-shine press rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:shadow-[0_0_20px_-4px_rgb(34_211_238/0.7)]"
              >
                Create account
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

      {(record || isActive) && <StepTracker alert={alert} opened={opened} active={isActive} closed={Boolean(record)} />}

      {record && <FeedbackPanel record={record} />}

      {(record || isActive) && (
        <>
          <Section n={1} title="The alert">
            <div className="space-y-4">
              <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                <div className="grid grid-cols-[7rem_1fr] gap-2">
                  <dt className="text-muted">Raised by</dt>
                  <dd className="font-medium">{alert.briefing.source}</dd>
                </div>
                <div className="grid grid-cols-[7rem_1fr] gap-2">
                  <dt className="text-muted">Rule</dt>
                  <dd className="font-mono text-[13px]">{alert.briefing.rule}</dd>
                </div>
              </dl>
              {alertBlock && (
                <div className="border-t border-line/60 pt-4">
                  <EvidenceBody block={alertBlock} />
                </div>
              )}
              <BriefingBits b={alert.briefing} topic={alert.topic} />
            </div>
          </Section>

          <Section n={2} title="Look at the evidence">
            <EvidenceTabs alert={alert} opened={opened} isActive={isActive} hideEvidence={hideEvidence} alertBlock={alertBlock} />
          </Section>

          {isActive && <StepPanels alertId={alert.id} />}

          {isActive && (
            <Section n={3} title="Your report">
              <DecisionForm alert={alert} opened={opened} />
            </Section>
          )}

          <RelatedAlerts alert={alert} closed={Boolean(record)} />
        </>
      )}
    </div>
  );
}
