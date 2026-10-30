"use client";

import { useState, useTransition } from "react";
import { checkMail, type MailResult } from "@/app/practice-actions";
import { FLAGS, MAILS, type AuthResult, type Mail } from "@/content/mailbox";
import { mailProgress, saveBest } from "@/lib/practiceProgress";

const panel = "rounded-2xl border border-line bg-panel p-5";
const VERDICTS = [
  { id: "phishing", label: "Phishing", hint: "Tries to trick or harm" },
  { id: "spam", label: "Spam", hint: "Unwanted but not malicious" },
  { id: "legit", label: "Safe", hint: "A normal email" },
];
const flagLabel = (id: string) => FLAGS.find((f) => f.id === id)?.label ?? id;

function AuthChip({ name, result }: { name: string; result: AuthResult }) {
  const tone =
    result === "pass" ? "border-correct/40 text-correct" : result === "fail" ? "border-missed/40 text-missed" : "border-line text-muted";
  return (
    <span className={`rounded-md border px-2 py-0.5 font-mono text-xs ${tone}`}>
      {name} {result}
    </span>
  );
}

function MailDetail({ mail }: { mail: Mail }) {
  const [verdict, setVerdict] = useState<string>("");
  const [flags, setFlags] = useState<Set<string>>(new Set());
  const [result, setResult] = useState<MailResult | null>(null);
  const [pending, start] = useTransition();

  function toggle(id: string) {
    if (result) return;
    setFlags((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  function submit() {
    start(async () => {
      const r = await checkMail(mail.id, verdict, [...flags]);
      setResult(r);
      if (r.ok) saveBest(mailProgress, mail.id, r.score);
    });
  }

  const done = result?.ok ? result : null;

  return (
    <div className="space-y-4">
      <section className={panel}>
        <p className="text-xs text-muted">
          Reported by {mail.reportedBy} · received {mail.receivedAt}
        </p>
        <h2 className="mt-1 text-lg font-semibold">{mail.subject}</h2>

        <dl className="mt-4 grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-1.5 text-sm">
          <dt className="text-muted">From</dt>
          <dd className="min-w-0 break-words">
            {mail.fromName} <span className="font-mono text-xs text-muted">&lt;{mail.fromAddress}&gt;</span>
          </dd>
          {mail.replyTo && (
            <>
              <dt className="text-muted">Reply-To</dt>
              <dd className="min-w-0 break-words font-mono text-xs">{mail.replyTo}</dd>
            </>
          )}
          <dt className="text-muted">Return-Path</dt>
          <dd className="min-w-0 break-words font-mono text-xs">{mail.returnPath}</dd>
          <dt className="text-muted">Checks</dt>
          <dd className="flex flex-wrap gap-1.5">
            <AuthChip name="SPF" result={mail.auth.spf} />
            <AuthChip name="DKIM" result={mail.auth.dkim} />
            <AuthChip name="DMARC" result={mail.auth.dmarc} />
          </dd>
        </dl>

        <div className="mt-4 space-y-2 rounded-lg border border-line bg-canvas p-4 text-sm leading-relaxed">
          {mail.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        {mail.attachment && (
          <p className="mt-3 text-sm">
            <span className="text-muted">Attachment: </span>
            <span className="font-mono text-xs">{mail.attachment}</span>
          </p>
        )}

        {mail.links.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-96 text-left text-xs">
              <thead className="text-muted">
                <tr>
                  <th className="pb-1 pr-3 font-medium">Link shows</th>
                  <th className="pb-1 font-medium">Actually goes to</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {mail.links.map((l) => (
                  <tr key={l.goes} className="border-t border-line">
                    <td className="py-1.5 pr-3 align-top break-all">{l.shows}</td>
                    <td className="py-1.5 align-top break-all">{l.goes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-muted hover:text-ink">Mail path (Received lines)</summary>
          <ul className="mt-2 space-y-1 font-mono text-xs text-muted">
            {mail.received.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </details>
      </section>

      <section className={panel}>
        <h3 className="font-semibold">Your call</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Verdict">
          {VERDICTS.map((v) => (
            <label
              key={v.id}
              className={`cursor-pointer rounded-lg border p-3 text-sm has-checked:border-accent has-checked:bg-raised ${
                result ? "pointer-events-none opacity-80" : "border-line hover:border-muted"
              }`}
            >
              <input type="radio" name={`v-${mail.id}`} className="sr-only" checked={verdict === v.id} onChange={() => setVerdict(v.id)} />
              <span className="font-medium">{v.label}</span>
              <span className="block text-xs text-muted">{v.hint}</span>
            </label>
          ))}
        </div>

        <p className="mt-5 text-sm font-medium">Which red flags do you see? <span className="font-normal text-muted">(tick all that apply, or none)</span></p>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {FLAGS.map((f) => {
            const mark = done ? (done.hit.includes(f.id) ? "text-correct" : done.missed.includes(f.id) ? "text-medium" : done.wrong.includes(f.id) ? "text-missed" : "") : "";
            return (
              <label key={f.id} className={`flex cursor-pointer items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-raised ${mark}`}>
                <input type="checkbox" className="mt-0.5 accent-(--color-accent)" checked={flags.has(f.id)} disabled={!!result} onChange={() => toggle(f.id)} />
                <span>{f.label}</span>
              </label>
            );
          })}
        </div>

        {!result && (
          <button
            type="button"
            disabled={!verdict || pending}
            onClick={submit}
            className="mt-5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90 disabled:opacity-40"
          >
            {pending ? "Checking…" : "Check my answer"}
          </button>
        )}
        {result && !result.ok && <p className="mt-3 text-sm text-missed">{result.error}</p>}
      </section>

      {done && (
        <section className={`${panel} space-y-3`}>
          <div className="flex items-end justify-between">
            <h3 className="font-semibold">{done.verdictCorrect ? "Right call" : "Not quite"}</h3>
            <p className="text-2xl font-semibold">
              {done.score}
              <span className="text-sm text-muted">/100</span>
            </p>
          </div>
          <p className="text-sm text-muted">
            This email is <span className="text-ink">{VERDICTS.find((v) => v.id === done.correctVerdict)?.label.toLowerCase()}</span>.{" "}
            {done.explain}
          </p>
          {done.missed.length > 0 && (
            <p className="text-sm">
              <span className="text-medium">You missed: </span>
              {done.missed.map(flagLabel).join("; ")}.
            </p>
          )}
          {done.wrong.length > 0 && (
            <p className="text-sm">
              <span className="text-missed">Not present here: </span>
              {done.wrong.map(flagLabel).join("; ")}.
            </p>
          )}
          <div className="rounded-lg border border-line bg-canvas p-4 text-sm">
            <p className="text-xs uppercase tracking-wide text-muted">What an analyst would do</p>
            <p className="mt-1">{done.action}</p>
          </div>
        </section>
      )}
    </div>
  );
}

export default function MailboxView() {
  const [selected, setSelected] = useState(MAILS[0].id);
  const { scores } = mailProgress.useStore();
  const mail = MAILS.find((m) => m.id === selected) ?? MAILS[0];
  const solved = Object.keys(scores).length;

  return (
    <div className="grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)]">
      <div>
        <p className="mb-2 text-xs text-muted">
          {solved} of {MAILS.length} reviewed
        </p>
        <ul className="space-y-2">
          {MAILS.map((m, i) => {
            const best = scores[m.id];
            return (
              <li key={m.id} className="row-in" style={{ animationDelay: `${i * 40}ms` }}>
                <button
                  type="button"
                  onClick={() => setSelected(m.id)}
                  aria-current={m.id === selected ? "true" : undefined}
                  className={`press w-full rounded-xl border p-3 text-left text-sm ${
                    m.id === selected ? "border-accent bg-raised" : "border-line bg-panel hover:border-muted"
                  }`}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted">{m.id}</span>
                    {best !== undefined && <span className="text-xs text-correct">best {best}</span>}
                  </span>
                  <span className="mt-1 block font-medium leading-snug">{m.subject}</span>
                  <span className="mt-0.5 block truncate text-xs text-muted">{m.fromAddress}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div key={mail.id} className="fade-in min-w-0">
        <MailDetail mail={mail} />
      </div>
    </div>
  );
}
