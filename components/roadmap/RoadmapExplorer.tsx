"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CHECKED, PHASES, type Kind, type Priority, type Topic } from "@/content/roadmap";

type Track = "soc" | "eng";
type Row = { topic: Topic; pi: number; section: string; code: string };

const KEY = "shiftlab.roadmap.v1";
// One colour per phase: the first five come from the site theme, the engineer track gets violet.
const COLOR = ["var(--color-low)", "var(--color-accent)", "var(--color-correct)", "var(--color-high)", "var(--color-medium)", "#a78bfa"];
const PRIORITY: Record<Priority, string> = { E: "Essential", R: "Recommended", O: "Optional", "-": "Not in this track" };
const TRACK_NAME: Record<Track, string> = { soc: "SOC analyst", eng: "Security engineer" };
const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");
const tint = (pi: number) => ({ "--pc": COLOR[pi] }) as CSSProperties;
const prio = (t: Topic, track: Track): Priority => (track === "soc" ? t.soc : t.eng);

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

// The roadmap as a course explorer: phases and topics on the left, one topic at a time on the right.
// Progress and the chosen track stay in this browser only (localStorage); nothing is sent anywhere.
export default function RoadmapExplorer() {
  const [track, setTrack] = useState<Track>("soc");
  const [sel, setSel] = useState(PHASES[0].sections[0].topics[0].slug);
  const [done, setDone] = useState<Record<string, true>>({});
  const [ticks, setTicks] = useState<Record<string, true>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({ [PHASES[0].id]: true });
  const [ready, setReady] = useState(false);
  const detail = useRef<HTMLElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const rows = useMemo(() => {
    const out: Row[] = [];
    PHASES.forEach((p, pi) => {
      let k = 0;
      for (const s of p.sections) for (const t of s.topics) if (prio(t, track) !== "-") out.push({ topic: t, pi, section: s.name, code: `${pi + 1}.${++k}` });
    });
    return out;
  }, [track]);

  /* eslint-disable react-hooks/set-state-in-effect -- saved progress can only be read in the browser, so it has to be applied after the first render */
  // Restore saved progress, then honour a #topic link. Runs once, after the first paint, so the server and first client render match.
  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
      if (raw.track === "eng") setTrack("eng");
      if (raw.done && typeof raw.done === "object") setDone(raw.done);
      if (raw.ticks && typeof raw.ticks === "object") setTicks(raw.ticks);
      if (typeof raw.sel === "string") setSel(raw.sel);
    } catch {
      // private mode or bad data: start fresh
    }
    const fromHash = () => {
      const slug = decodeURIComponent(location.hash.slice(1));
      const hit = PHASES.flatMap((p, pi) => p.sections.flatMap((s) => s.topics).map((x) => ({ x, pi }))).find((o) => o.x.slug === slug);
      if (!hit) return;
      if (hit.x.soc === "-") setTrack("eng");
      setSel(slug);
      setOpen((o) => ({ ...o, [PHASES[hit.pi].id]: true }));
    };
    fromHash();
    setReady(true);
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify({ track, sel, done, ticks }));
    } catch {
      // storage full or blocked: progress just will not persist
    }
  }, [ready, track, sel, done, ticks]);

  const at = Math.max(0, rows.findIndex((r) => r.topic.slug === sel));
  const cur = rows[at];
  const t = cur.topic;
  const phase = PHASES[cur.pi];
  const doneCount = rows.filter((r) => done[r.topic.slug]).length;
  const pct = Math.round((doneCount / rows.length) * 100);

  const go = (slug: string, pi: number) => {
    setSel(slug);
    setOpen((o) => ({ ...o, [PHASES[pi].id]: true }));
    history.replaceState(null, "", `#${slug}`);
    // On a phone the topic list is above the detail, so bring the detail into view.
    if (window.matchMedia("(max-width: 900px)").matches) {
      detail.current?.scrollIntoView({ block: "start" });
      heading.current?.focus({ preventScroll: true });
    }
  };

  const prev = rows[at - 1];
  const next = rows[at + 1];

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

        <ol className="rm-phases">
          {PHASES.map((p, pi) => {
            const mine = rows.filter((r) => r.pi === pi);
            if (mine.length === 0) return null;
            const isOpen = !!open[p.id];
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
      </aside>

      <article className="rm-detail" ref={detail} style={tint(cur.pi)} aria-label={`Topic: ${t.name}`}>
        <div className="rm-bar">
          <button type="button" className={done[t.slug] ? "rm-done on" : "rm-done"} aria-pressed={!!done[t.slug]} onClick={() => setDone((d) => { const x = { ...d }; if (x[t.slug]) delete x[t.slug]; else x[t.slug] = true; return x; })}>
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
                    <input type="checkbox" checked={!!ticks[k]} onChange={() => setTicks((o) => { const x = { ...o }; if (x[k]) delete x[k]; else x[k] = true; return x; })} />
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

        <p className="rm-credit">Links last checked {CHECKED}. Found a broken one? Tell us with Send feedback below.</p>
      </article>
    </div>
  );
}
