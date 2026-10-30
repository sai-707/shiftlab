"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, useTransition, type FormEvent } from "react";
import { checkLogAnswer } from "@/app/actions";
import { LOGS, LOG_QUESTIONS, LOG_SOURCES, type LogSource } from "@/content/logs";
import Segmented from "@/components/ui/Segmented";
import { logProgress } from "@/lib/logProgress";
import { searchLogs } from "@/lib/logsearch";

const panel = "rounded-2xl border border-line bg-panel p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]";
const LIMIT = 100;
const noSubscribe = () => () => {};

const EXAMPLES = [
  { label: "Everything one address did", q: "src:203.0.113.58" },
  { label: "Everything one person did", q: "user:d.okafor" },
  { label: "Blocked web requests", q: "source:waf event:blocked" },
  { label: "Firewall, without the allowed traffic", q: "source:firewall -event:allow" },
];

function Question({ q, solved, onTry }: { q: (typeof LOG_QUESTIONS)[number]; solved: boolean; onTry: (query: string) => void }) {
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<{ correct: boolean; explain: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const r = await checkLogAnswer(q.id, answer);
      setResult(r);
      if (r.correct) logProgress.set({ solved: [...new Set([...logProgress.get().solved, q.id])] });
    });
  }

  return (
    <li className={`rounded-xl border bg-canvas/50 p-4 ${solved ? "border-correct/50" : "border-line"}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{q.question}</p>
        <span className={`shrink-0 text-xs ${solved ? "text-correct" : "text-muted"}`}>{solved ? "Solved" : q.level}</span>
      </div>
      <button type="button" onClick={() => onTry(q.tryQuery)} className="mt-2 text-xs text-accent hover:underline">
        Try this search: <span className="font-mono">{q.tryQuery}</span>
      </button>
      <form onSubmit={submit} className="mt-3 flex gap-2">
        <input
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Your answer"
          aria-label={`Answer for: ${q.question}`}
          className="min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 py-1.5 text-sm outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg border border-line px-3 py-1.5 text-sm font-medium hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {pending ? "..." : "Check"}
        </button>
      </form>
      {result && (
        <p className={`mt-2 text-sm ${result.correct ? "text-correct" : "text-missed"}`}>
          {result.correct ? "Correct. " : ""}
          {result.explain}
        </p>
      )}
    </li>
  );
}

export default function LogsView() {
  // Read ?q= and ?from= from the address bar without a Suspense boundary: the server renders empty values.
  const search = useSyncExternalStore(noSubscribe, () => window.location.search, () => "");
  const params = new URLSearchParams(search);
  const [typed, setQuery] = useState<string | null>(null);
  const query = typed ?? (params.get("q") ?? "").slice(0, 200);
  const from = /^SL-\d{4}$/.test(params.get("from") ?? "") ? params.get("from") : null;
  const [source, setSource] = useState<LogSource | "all">("all");
  const progress = logProgress.useStore();

  const rows = searchLogs(LOGS, query, source);
  const shown = rows.slice(0, LIMIT);

  return (
    <div className="space-y-6">
      <section className={panel}>
        {from && (
          <p className="mb-3 text-sm">
            <Link href={`/alerts/${from}`} className="text-accent hover:underline">
              ← Back to alert {from}
            </Link>
          </p>
        )}
        <h2 className="font-semibold">Search the logs</h2>
        <p className="mt-1 text-sm text-muted">
          Type a name, an address or any word, like <span className="font-mono text-ink">d.okafor</span>. The matching
          events appear below. Or click an example.
        </p>
        <details className="mt-2 text-sm text-muted">
          <summary className="cursor-pointer hover:text-ink">More precise searches</summary>
          <p className="mt-2">
            Narrow with <span className="font-mono text-ink">field:value</span> using source, host, user, src, dst, event or
            time. Add a minus to exclude, like <span className="font-mono text-ink">-event:allow</span>. All terms must match.
          </p>
        </details>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='src:203.0.113.58 event:failed'
          aria-label="Log search query"
          className="mt-3 w-full rounded-lg border border-line bg-canvas px-3 py-2.5 font-mono text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        <div className="mt-3">
          <Segmented
            small
            label="Log source"
            value={source}
            onChange={setSource}
            options={[
              { value: "all" as const, label: "All sources", title: "Search every log source" },
              ...LOG_SOURCES.map((s) => ({ value: s.id, label: s.label, title: s.about })),
            ]}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
          <span>Try:</span>
          {EXAMPLES.map((x) => (
            <button key={x.q} type="button" onClick={() => setQuery(x.q)} className="text-accent hover:underline" title={x.q}>
              {x.label}
            </button>
          ))}
        </div>

        <p className="mt-4 text-sm" aria-live="polite">
          {rows.length} event{rows.length === 1 ? "" : "s"} found
          {rows.length > LIMIT ? `. Showing the first ${LIMIT}, so narrow your search.` : ""}
        </p>
        <div className="mt-2 max-h-136 overflow-auto rounded-lg border border-line">
          <table className="w-full min-w-208 text-left text-xs">
            <thead className="sticky top-0 bg-raised text-muted">
              <tr>
                {["Time", "Source", "Host", "User", "Source IP", "Destination", "Event", "Details"].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line font-mono">
              {shown.map((r, i) => (
                <tr key={i} className="align-top hover:bg-raised/40">
                  <td className="whitespace-nowrap px-3 py-1.5">{r.time}</td>
                  <td className="px-3 py-1.5 text-accent">{r.source}</td>
                  <td className="px-3 py-1.5">{r.host}</td>
                  <td className="px-3 py-1.5">{r.user}</td>
                  <td className="px-3 py-1.5">{r.src}</td>
                  <td className="px-3 py-1.5">{r.dst}</td>
                  <td className="px-3 py-1.5">{r.event}</td>
                  <td className="px-3 py-1.5 text-muted">{r.detail}</td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-6 text-center font-sans text-muted">
                    No events match. Try fewer terms.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={panel}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Practice questions</h2>
          <span className="text-xs text-muted">
            {progress.solved.length} of {LOG_QUESTIONS.length} solved
          </span>
        </div>
        <p className="mt-1 text-sm text-muted">
          Find the answer in the logs above. Use the suggested search if you are stuck. These are the same hosts and
          addresses you meet in the alerts.
        </p>
        <ul className="mt-4 grid gap-3 lg:grid-cols-2">
          {LOG_QUESTIONS.map((q) => (
            <Question
              key={q.id}
              q={q}
              solved={progress.solved.includes(q.id)}
              onTry={(t) => {
                setQuery(t);
                setSource("all");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          ))}
        </ul>
      </section>
    </div>
  );
}
