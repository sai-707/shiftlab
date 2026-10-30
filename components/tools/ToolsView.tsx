"use client";

import { useState, useTransition } from "react";
import Segmented from "@/components/ui/Segmented";
import { whoisLookup, type WhoisResult } from "@/app/practice-actions";
import { readHeaders, SAMPLE_HEADERS } from "@/lib/headers";
import { checkUrl } from "@/lib/urlcheck";

const panel = "rounded-2xl border border-line bg-panel p-5";
const input = "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm outline-none focus:border-accent";
const btn = "rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-canvas hover:opacity-90 disabled:opacity-40";
const TONE = { bad: "text-missed", warn: "text-medium", ok: "text-correct" } as const;
const MARK = { bad: "✗", warn: "!", ok: "✓" } as const;

const URL_EXAMPLES = [
  "https://harborpine-verify.test/login?u=s.nair",
  "http://203.0.113.77/track",
  "https://short.test/aB3xQ9",
  "https://portal.harborpine-logistics.test/hr/forms",
];
const DOMAIN_EXAMPLES = ["harborpine-helpdesk.test", "bluecrate-supplies.test", "parcel-track-now.test"];

function UrlScanner() {
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState("");
  const report = submitted ? checkUrl(submitted) : null;
  const riskTone = report && !("error" in report) ? { high: "text-missed", medium: "text-medium", low: "text-correct" }[report.risk] : "";

  return (
    <section className={panel}>
      <h2 className="font-semibold">URL checker</h2>
      <p className="mt-1 text-sm text-muted">
        Paste a link to see what a careful analyst would notice. It reads the link only and never visits it.
      </p>
      <form
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(value);
        }}
      >
        <input className={input} value={value} onChange={(e) => setValue(e.target.value)} placeholder="https://…" aria-label="Link to check" maxLength={500} />
        <button className={btn} type="submit">Check link</button>
      </form>
      <div className="mt-2 flex flex-wrap gap-2">
        {URL_EXAMPLES.map((u) => (
          <button key={u} type="button" onClick={() => { setValue(u); setSubmitted(u); }} className="rounded-md border border-line px-2 py-1 font-mono text-xs text-muted hover:border-accent hover:text-accent">
            {u.length > 36 ? `${u.slice(0, 36)}…` : u}
          </button>
        ))}
      </div>

      {report && "error" in report && <p className="mt-4 text-sm text-missed">{report.error}</p>}
      {report && !("error" in report) && (
        <div className="mt-5 space-y-3">
          <p className="text-sm">
            The real owner of this link is <span className="font-mono text-accent">{report.registrable}</span>. Risk from the link alone:{" "}
            <span className={`font-semibold uppercase ${riskTone}`}>{report.risk}</span>
          </p>
          <ul className="space-y-2 text-sm">
            {report.findings.map((f) => (
              <li key={f.title} className="flex gap-2">
                <span className={`${TONE[f.level]} font-mono`} aria-hidden="true">{MARK[f.level]}</span>
                <span>
                  <span className="font-medium">{f.title}.</span> <span className="text-muted">{f.why}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function HeaderViewer() {
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState("");
  const report = submitted ? readHeaders(submitted) : null;

  return (
    <section className={panel}>
      <h2 className="font-semibold">Email header viewer</h2>
      <p className="mt-1 text-sm text-muted">
        Paste the raw headers of an email (&quot;Show original&quot; in most mail apps). The viewer pulls out who really sent it.
      </p>
      <textarea className={`${input} mt-4 h-40 font-mono text-xs`} value={text} onChange={(e) => setText(e.target.value)} placeholder="From: …" aria-label="Raw email headers" maxLength={20000} />
      <div className="mt-2 flex gap-2">
        <button className={btn} type="button" onClick={() => setSubmitted(text)}>Read headers</button>
        <button className="rounded-lg border border-line px-4 py-2 text-sm hover:border-accent hover:text-accent" type="button" onClick={() => { setText(SAMPLE_HEADERS); setSubmitted(SAMPLE_HEADERS); }}>
          Load a sample
        </button>
      </div>

      {report && "error" in report && <p className="mt-4 text-sm text-missed">{report.error}</p>}
      {report && !("error" in report) && (
        <div className="mt-5 space-y-4 text-sm">
          <dl className="grid grid-cols-[6.5rem_1fr] gap-x-3 gap-y-1">
            {report.fields.map((f) => (
              <div key={f.label} className="contents">
                <dt className="text-muted">{f.label}</dt>
                <dd className="min-w-0 break-words font-mono text-xs">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap gap-2">
            {report.auth.map((a) => (
              <span key={a.name} className={`rounded-md border px-2 py-0.5 font-mono text-xs ${a.result === "pass" ? "border-correct/40 text-correct" : a.result === "fail" || a.result === "softfail" ? "border-missed/40 text-missed" : "border-line text-muted"}`}>
                {a.name} {a.result}
              </span>
            ))}
          </div>
          {report.flags.length > 0 ? (
            <ul className="space-y-1.5">
              {report.flags.map((f) => (
                <li key={f.text} className="flex gap-2">
                  <span className={`${f.level === "bad" ? "text-missed" : "text-medium"} font-mono`} aria-hidden="true">{f.level === "bad" ? "✗" : "!"}</span>
                  <span>{f.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-correct">No obvious problems in the headers.</p>
          )}
          {report.hops.length > 0 && (
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Path the email took, oldest first</p>
              <ol className="mt-1 list-decimal space-y-1 pl-5 font-mono text-xs text-muted">
                {report.hops.map((h) => (
                  <li key={h} className="break-words">{h}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Whois() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<WhoisResult | null>(null);
  const [pending, start] = useTransition();

  function run(domain: string) {
    start(async () => setResult(await whoisLookup(domain)));
  }

  return (
    <section className={panel}>
      <h2 className="font-semibold">WHOIS lookup</h2>
      <p className="mt-1 text-sm text-muted">
        Shows who registered a domain and how new it is. Very new domains are a common phishing sign. Practice data only.
      </p>
      <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); run(value); }}>
        <input className={input} value={value} onChange={(e) => setValue(e.target.value)} placeholder="example.test" aria-label="Domain" maxLength={253} />
        <button className={btn} type="submit" disabled={pending}>{pending ? "Looking…" : "Look up"}</button>
      </form>
      <div className="mt-2 flex flex-wrap gap-2">
        {DOMAIN_EXAMPLES.map((d) => (
          <button key={d} type="button" onClick={() => { setValue(d); run(d); }} className="rounded-md border border-line px-2 py-1 font-mono text-xs text-muted hover:border-accent hover:text-accent">
            {d}
          </button>
        ))}
      </div>

      {result && !result.ok && <p className="mt-4 text-sm text-missed">{result.error}</p>}
      {result?.ok && !result.found && (
        <p className="mt-4 text-sm text-muted">No record for <span className="font-mono">{result.domain}</span> in the practice database. Real WHOIS tools work the same way on real domains.</p>
      )}
      {result?.ok && result.found && (
        <div className="mt-5 space-y-3 text-sm">
          <dl className="grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1">
            <dt className="text-muted">Domain</dt><dd className="font-mono text-xs">{result.domain}</dd>
            <dt className="text-muted">Registered</dt>
            <dd className={result.ageDays < 30 ? "font-medium text-missed" : ""}>{result.registered} ({result.ageDays < 365 ? `${result.ageDays} ${result.ageDays === 1 ? "day" : "days"} old` : `${Math.floor(result.ageDays / 365)} years old`})</dd>
            <dt className="text-muted">Registrar</dt><dd>{result.registrar}</dd>
            <dt className="text-muted">Owner</dt><dd>{result.owner}</dd>
            <dt className="text-muted">Country</dt><dd>{result.country}</dd>
          </dl>
          <p className="rounded-lg border border-line bg-canvas p-3 text-muted">{result.note}</p>
        </div>
      )}
    </section>
  );
}

const TABS = [
  { id: "url", label: "URL checker" },
  { id: "headers", label: "Header viewer" },
  { id: "whois", label: "WHOIS" },
] as const;

export default function ToolsView() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("url");
  return (
    <div className="space-y-4">
      <Segmented label="Tools" value={tab} onChange={setTab} options={TABS.map((t) => ({ value: t.id, label: t.label }))} />
      <div key={tab} className="fade-in max-w-3xl">
        {tab === "url" && <UrlScanner />}
        {tab === "headers" && <HeaderViewer />}
        {tab === "whois" && <Whois />}
      </div>
    </div>
  );
}
