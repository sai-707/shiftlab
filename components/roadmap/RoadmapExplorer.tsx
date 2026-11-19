"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CHECKED, PHASES, type Kind, type Priority } from "@/content/roadmap";
import { roadmapProgress } from "@/lib/roadmapProgress";
import { prio, rowsFor, type Track } from "@/lib/roadmapRows";

// One colour per phase: the first five come from the site theme, the engineer track gets violet.
const COLOR = ["var(--color-low)", "var(--color-accent)", "var(--color-correct)", "var(--color-high)", "var(--color-medium)", "#a78bfa"];
const PRIORITY: Record<Priority, string> = { E: "Essential", R: "Recommended", O: "Optional", "-": "Not in this track" };
const TRACK_NAME: Record<Track, string> = { soc: "SOC analyst", eng: "Security engineer" };
const flip = (o: Record<string, true>, k: string) => {
  const x = { ...o };
  if (x[k]) delete x[k];
  else x[k] = true;
  return x;
};
const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");
const tint = (pi: number) => ({ "--pc": COLOR[pi] }) as CSSProperties;

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span aria-hidden="true">{" "}↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function KindTag({ kind }: { kind: Kind }) {
  return (
    <span className="rm-kind" data-kind={kind}>
      {kind}
    </span>
  );
}

// Every topic of both tracks with its search text, for the search box. Built once: the roadmap is static.
const ALL = PHASES.flatMap((p, pi) => p.sections.flatMap((s) => s.topics.map((topic) => ({ topic, pi, section: s.name, hay: `${topic.name} ${topic.text} ${topic.sub.join(" ")} ${topic.tools.join(" ")}`.toLowerCase() }))));

// The roadmap as a course explorer: phases and topics on the left, one topic at a time on the right.
// Progress and the chosen track are kept in this browser and, for a signed-in student, saved to the account (lib/sync.ts).
export default function RoadmapExplorer() {
  const { track, sel, done, ticks } = roadmapProgress.useStore();
  const setTrack = (k: Track) => roadmapProgress.set({ track: k });
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const detail = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const rows = useMemo(() => rowsFor(track), [track]);

  // A #topic link (from the dashboard, the Ctrl+K search or a bookmark) selects that topic. The address wins over the saved choice,
  // so it is applied again if the account's saved copy arrives after the page opened and replaces the selection.
  useEffect(() => {
    const hit = ALL.find((o) => o.topic.slug === decodeURIComponent(location.hash.slice(1)));
    if (hit && sel !== hit.topic.slug) roadmapProgress.set({ sel: hit.topic.slug, ...(prio(hit.topic, track) === "-" ? { track: "eng" as Track } : {}) });
  }, [sel, track]);
  useEffect(() => {
    const onHash = () => {
      const hit = ALL.find((o) => o.topic.slug === decodeURIComponent(location.hash.slice(1)));
      if (hit) roadmapProgress.set({ sel: hit.topic.slug, ...(prio(hit.topic, roadmapProgress.get().track) === "-" ? { track: "eng" as Track } : {}) });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const at = Math.max(0, rows.findIndex((r) => r.topic.slug === sel));
  const cur = rows[at];
  const t = cur.topic;
  const phase = PHASES[cur.pi];
  const doneCount = rows.filter((r) => done[r.topic.slug]).length;
  const pct = Math.round((doneCount / rows.length) * 100);

  const go = (slug: string, pi: number) => {
    const tp = ALL.find((o) => o.topic.slug === slug)!.topic;
    roadmapProgress.set({ sel: slug, ...(prio(tp, track) === "-" ? { track: "eng" as Track } : {}) });
    setOpen((o) => ({ ...o, [PHASES[pi].id]: true }));
    history.replaceState(null, "", `#${slug}`);
    // On a phone the topic list is above the detail, so bring the detail into view.
    if (window.matchMedia("(max-width: 900px)").matches) {
      detail.current?.scrollIntoView({ block: "start" });
      heading.current?.focus({ preventScroll: true });
    }
  };

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const found = words.length ? ALL.filter((o) => words.every((w) => o.hay.includes(w))).slice(0, 12) : [];

  const prev = rows[at - 1];
  const next = rows[at + 1];

  const bar = (cls: string) => (
    <div className={`rm-bar ${cls}`}>
      <button type="button" className={done[t.slug] ? "rm-done on" : "rm-done"} aria-pressed={!!done[t.slug]} onClick={() => roadmapProgress.set({ done: flip(done, t.slug) })}>
        {done[t.slug] ? "✓ Done" : "Mark as done"}
      </button>
      <span className="sp" />
      {prev && (
        <button type="button" className="rm-nav" onClick={() => go(prev.topic.slug, prev.pi)}>
          <span aria-hidden="true">← </span>
          {prev.topic.name}
        </button>
      )}
      {next && (
        <button type="button" className="rm-nav fwd" onClick={() => go(next.topic.slug, next.pi)}>
          Next: {next.topic.name}
          <span aria-hidden="true"> →</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="rm-app">
      <aside className="rm-side" aria-label="Roadmap topics">
        <div className="rm-switch" role="group" aria-label="Choose your track">
          {(["soc", "eng"] as const).map((k) => (
            <button key={k} type="button" aria-pressed={track === k} onClick={() => setTrack(k)}>
              {TRACK_NAME[k]}
            </button>
          ))}
        </div>
        <p className="rm-track-note">
          {track === "soc" ? "Alert triage and incident response. ShiftLab trains this track." : "Build, automate and secure. Adds Phase 6 and moves some topics up."}
        </p>

        <div className="rm-search">
          <label htmlFor="rm-q" className="sr-only">
            Search all topics
          </label>
          <input id="rm-q" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics, tools, subjects" autoComplete="off" />
        </div>

        {words.length > 0 && (
          <div className="rm-results" role="region" aria-label="Search results" aria-live="polite">
            <p className="meta">
              {found.length === 0 ? "No topic matches." : `${found.length} topic${found.length === 1 ? "" : "s"} found.`}
              {found.length > 0 && " Picking one that is not in your track moves you to the track that has it."}
            </p>
            <ul>
              {found.map((r) => (
                <li key={r.topic.slug} style={tint(r.pi)}>
                  <a
                    href={`#${r.topic.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(r.topic.slug, r.pi);
                      setQuery("");
                    }}
                  >
                    <span className={done[r.topic.slug] ? "box on" : "box"} aria-hidden="true">
                      {done[r.topic.slug] ? "✓" : ""}
                    </span>
                    <span className="t">
                      {r.topic.name}
                      {done[r.topic.slug] && <span className="sr-only"> (done)</span>}
                      <small>
                        Phase {r.pi + 1} · {r.section}
                      </small>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rm-progress">
          <div className="top">
            <b>Your progress</b>
            <span>
              {doneCount} of {rows.length} done
            </span>
          </div>
          <div className="bar" role="progressbar" aria-label="Topics done" aria-valuemin={0} aria-valuemax={rows.length} aria-valuenow={doneCount}>
            <i style={{ width: `${pct}%` }} />
          </div>
          <p className="key">
            <span data-p="E">Essential</span>
            <span data-p="R">Recommended</span>
            <span data-p="O">Optional</span>
            <span className="ours">Practise on ShiftLab</span>
          </p>
        </div>

        {words.length === 0 && (
          <ol className="rm-phases">
            {PHASES.map((p, pi) => {
              const mine = rows.filter((r) => r.pi === pi);
              if (mine.length === 0) return null;
              const isOpen = open[p.id] ?? pi === cur.pi;
              const n = mine.filter((r) => done[r.topic.slug]).length;
              return (
                <li key={p.id} style={tint(pi)}>
                  <button type="button" className="rm-phase-btn" aria-expanded={isOpen} aria-controls={`rm-ph-${p.id}`} onClick={() => setOpen((o) => ({ ...o, [p.id]: !isOpen }))}>
                    <span className="dot" aria-hidden="true">
                      {String(pi + 1).padStart(2, "0")}
                    </span>
                    <span className="name">{p.name}</span>
                    <span className="cnt">
                      {n}/{mine.length}
                    </span>
                    <span className="chev" aria-hidden="true">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div id={`rm-ph-${p.id}`} className="rm-phase-body">
                      <p className="meta">
                        {p.time} · You&apos;ll be able to {p.outcome}
                      </p>
                      {p.sections.map((s) => {
                        const list = mine.filter((r) => r.section === s.name);
                        if (list.length === 0) return null;
                        return (
                          <div key={s.name}>
                            <p className="sec">{s.name}</p>
                            <ul>
                              {list.map((r) => (
                                <li key={r.topic.slug}>
                                  <a
                                    href={`#${r.topic.slug}`}
                                    data-p={prio(r.topic, track)}
                                    aria-current={r.topic.slug === t.slug ? "true" : undefined}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      go(r.topic.slug, pi);
                                    }}
                                  >
                                    <span className={done[r.topic.slug] ? "box on" : "box"} aria-hidden="true">
                                      {done[r.topic.slug] ? "✓" : ""}
                                    </span>
                                    <span className="t">
                                      {r.topic.name}
                                      {done[r.topic.slug] && <span className="sr-only"> (done)</span>}
                                    </span>
                                    <span className="sr-only"> {PRIORITY[prio(r.topic, track)]}.</span>
                                    {r.topic.practice && <i className="ours" title="Practise on ShiftLab" aria-label="Practise on ShiftLab" />}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </aside>

      <article className="rm-detail" ref={detail} style={tint(cur.pi)} aria-label={`Topic: ${t.name}`}>
        {bar("")}

        <div className="rm-chips">
          <span className="rm-prio" data-p={prio(t, track)}>
            {PRIORITY[prio(t, track)].toUpperCase()}
          </span>
          {t.time && <span className="rm-time">{t.time}</span>}
          <span className="rm-crumb">
            Phase {cur.pi + 1} · {phase.name} › {cur.section}
          </span>
        </div>
        <div className="rm-title">
          <span className="code">{cur.code}</span>
          <h2 ref={heading} tabIndex={-1}>
            {t.name}
          </h2>
        </div>
        <p className="rm-text">{t.text}</p>
        <p className="rm-both">
          {(["soc", "eng"] as const).map((k) => (
            <span key={k}>
              {TRACK_NAME[k]}: <b data-p={prio(t, k)}>{PRIORITY[prio(t, k)]}</b>
            </span>
          ))}
        </p>

        <section className="rm-box start">
          <h3>
            <span className="n">1</span>Start here
          </h3>
          <a className="rm-startlink" href={t.resources[0].url} target="_blank" rel="noopener noreferrer">
            <span className="row">
              <b>
                {t.resources[0].name}
                <span aria-hidden="true">{" "}↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </b>
              <KindTag kind={t.resources[0].kind} />
            </span>
            <span className="note">{t.resources[0].note}</span>
            <small>{host(t.resources[0].url)}</small>
          </a>
        </section>

        <section className="rm-box">
          <h3>
            <span className="n">2</span>What to learn
          </h3>
          <ol className="rm-learn">
            {t.sub.map((s, i) => (
              <li key={s}>
                <span>{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </section>

        {t.resources.length > 1 && (
          <section className="rm-box">
            <h3>
              <span className="n">3</span>More free resources ({t.resources.length - 1})
            </h3>
            <ul className="rm-more">
              {t.resources.slice(1).map((r) => (
                <li key={r.url}>
                  <div>
                    <Ext href={r.url}>{r.name}</Ext>
                    <KindTag kind={r.kind} />
                  </div>
                  <p>{r.note}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="rm-box">
          <h3>
            <span className="n">4</span>Practise ({t.exercises.length})
          </h3>
          {t.practice && (
            <Link className="rm-practice" href={t.practice.href}>
              <span>
                <b>On ShiftLab</b> {t.practice.label}
              </span>
              <span aria-hidden="true">→</span>
            </Link>
          )}
          <ul className="rm-ex">
            {t.exercises.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </section>

        <section className="rm-box">
          <h3>
            <span className="n">5</span>Check yourself · {t.milestones.filter((_, i) => ticks[`${t.slug}|${i}`]).length} of {t.milestones.length}
          </h3>
          <ul className="rm-checks">
            {t.milestones.map((m, i) => {
              const k = `${t.slug}|${i}`;
              return (
                <li key={m}>
                  <label>
                    <input type="checkbox" checked={!!ticks[k]} onChange={() => roadmapProgress.set({ ticks: flip(ticks, k) })} />
                    <span>{m}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rm-box">
          <h3>
            <span className="n">6</span>Books and tools
          </h3>
          <p className="rm-sub-label">Books ({t.books.length})</p>
          {t.books.length === 0 ? (
            <p className="rm-empty">No standard book yet. The free guides above are the best source.</p>
          ) : (
            <ul className="rm-books">
              {t.books.map((b) => (
                <li key={b.title}>
                  {b.url ? (
                    <>
                      <Ext href={b.url}>{b.title}</Ext> <span className="free">FREE</span>
                    </>
                  ) : (
                    <span className="ttl">{b.title}</span>
                  )}
                  <span className="by"> by {b.author}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="rm-sub-label">Tools ({t.tools.length})</p>
          <ul className="rm-tools">
            {t.tools.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>

        {bar("end")}

        <p className="rm-credit">Links last checked {CHECKED}. Found a broken one? Tell us with Send feedback below.</p>
      </article>
    </div>
  );
}
