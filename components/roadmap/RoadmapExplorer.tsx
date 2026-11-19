"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { CHECKED, PHASES, type Kind, type Priority, type Topic } from "@/content/roadmap";
import { roadmapProgress } from "@/lib/roadmapProgress";
import { prio, rowsFor, type Row, type Track } from "@/lib/roadmapRows";
import { BASE_HOURS, spanLabel, sumWeeks } from "@/lib/roadmapTime";

const PRIORITY: Record<Priority, string> = { E: "Essential", R: "Recommended", O: "Optional", "-": "Not in this track" };
const TRACK_NAME: Record<Track, string> = { soc: "SOC analyst", eng: "Security engineer" };
const STARTERS = ["linux-fundamentals", "networking-basics", "cia-triad-and-core-ideas", "security-tool-basics"];
const ICON: Record<string, string> = {
  foundation: "M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5",
  technical: "M8 8l-4 4 4 4M16 8l4 4-4 4",
  specialise: "M12 3a9 9 0 100 18 9 9 0 000-18zM12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z",
  advanced: "M13 3L5 14h6l-1 7 8-11h-6l1-7z",
  career: "M12 4a5 5 0 100 10 5 5 0 000-10zM8.5 13.5L7 21l5-3 5 3-1.5-7.5",
  engineer: "M8 6h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2zM9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3",
};

const flip = (o: Record<string, true>, k: string) => {
  const x = { ...o };
  if (x[k]) delete x[k];
  else x[k] = true;
  return x;
};
const host = (url: string) => new URL(url).hostname.replace(/^www\./, "");
const vars = (o: Record<string, number>) => o as CSSProperties;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Every topic of both tracks with its search text, for the search box. Built once: the roadmap is static.
const ALL = PHASES.flatMap((p, pi) => p.sections.flatMap((s) => s.topics.map((topic) => ({ topic, pi, section: s.name, hay: `${topic.name} ${topic.text} ${topic.sub.join(" ")} ${topic.tools.join(" ")}`.toLowerCase() }))));
const BY = new Map(ALL.map((o) => [o.topic.slug, o]));

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span aria-hidden="true">{" "}↗</span>
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

function PhaseIcon({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICON[id] ?? ICON.foundation} />
    </svg>
  );
}

/** A number that counts up to its value. With reduced motion it jumps straight there. */
function Count({ to, of }: { to: number; of?: number }) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const a = from.current;
    const ms = reduced() ? 0 : 600;
    const t0 = performance.now();
    let id = 0;
    const step = (now: number) => {
      const k = ms === 0 ? 1 : Math.min(1, (now - t0) / ms);
      from.current = a + (to - a) * (1 - Math.pow(1 - k, 3));
      setV(from.current);
      if (k < 1) id = requestAnimationFrame(step);
    };
    id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [to]);
  return (
    <>
      {Math.round(v)}
      {of !== undefined && `/${of}`}
    </>
  );
}

function Body({ t, related, ticks, go }: { t: Topic; related: { why: string; topic: Topic }[]; ticks: Record<string, true>; go: (slug: string) => void }) {
  const first = t.resources[0];
  return (
    <div className="rm-bdi">
      <p className="rm-lead">{t.text}</p>
      <section>
        <h4>Key concepts</h4>
        <ul className="rm-chips">
          {t.sub.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
      {related.length > 0 && (
        <section>
          <h4>Related topics</h4>
          <ul className="rm-rel">
            {related.map((r) => (
              <li key={r.topic.slug}>
                <button type="button" onClick={() => go(r.topic.slug)}>
                  <small>{r.why}</small>
                  {r.topic.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="rm-start">
        <span className="rm-sx">★ Start here</span>
        <a className="rm-startlink" href={first.url} target="_blank" rel="noopener noreferrer">
          <span className="row">
            <b>
              {first.name}
              <span aria-hidden="true">{" "}↗</span>
              <span className="sr-only"> (opens in a new tab)</span>
            </b>
            <KindTag kind={first.kind} />
          </span>
          <span className="note">{first.note}</span>
          <small>{host(first.url)}</small>
        </a>
      </section>
      {t.resources.length > 1 && (
        <section>
          <h4>More free resources ({t.resources.length - 1})</h4>
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
      {t.books.length > 0 && (
        <section>
          <h4>Books ({t.books.length})</h4>
          <ul className="rm-books">
            {t.books.map((b) => (
              <li key={b.title}>
                {b.url ? (
                  <>
                    <Ext href={b.url}>{b.title}</Ext> <span className="free">FREE</span>
                  </>
                ) : (
                  <span>{b.title}</span>
                )}
                <span className="by"> by {b.author}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h4>Practise ({t.exercises.length})</h4>
        <ul className="rm-ex">
          {t.exercises.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </section>
      <section>
        <h4>
          Check yourself · {t.milestones.filter((_, i) => ticks[`${t.slug}|${i}`]).length} of {t.milestones.length}
        </h4>
        <ul className="rm-checks">
          {t.milestones.map((m, i) => {
            const k = `${t.slug}|${i}`;
            return (
              <li key={m}>
                <label>
                  <input type="checkbox" checked={!!ticks[k]} onChange={() => roadmapProgress.set({ ticks: flip(roadmapProgress.get().ticks, k) })} />
                  <span>{m}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>
      {t.tools.length > 0 && (
        <section>
          <h4>Tools</h4>
          <ul className="rm-chips mono">
            {t.tools.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </section>
      )}
      {t.practice && (
        <Link className="rm-practice" href={t.practice.href}>
          <span>
            <b>On ShiftLab</b> {t.practice.label}
          </span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </div>
  );
}

// The roadmap as a timeline: one phase at a time, each topic a card that opens in place.
// Progress and the chosen track are kept in this browser and, for a signed-in student, saved to the account (lib/sync.ts).
export default function RoadmapExplorer() {
  const { track, done, ticks } = roadmapProgress.useStore();
  const [tab, setTab] = useState(-1);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [jump, setJump] = useState<{ slug: string; n: number } | null>(null);
  const [flash, setFlash] = useState("");
  const [stuck, setStuck] = useState(false);
  const [pace, setPace] = useState(BASE_HOURS);
  const indEl = useRef<HTMLSpanElement>(null);
  const tabsEl = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => rowsFor(track), [track]);
  const groups = useMemo(() => {
    const out: { pi: number; rows: Row[]; sections: { name: string; num: number; rows: Row[] }[] }[] = [];
    let num = 0;
    for (const r of rows) {
      let g = out[out.length - 1];
      if (!g || g.pi !== r.pi) out.push((g = { pi: r.pi, rows: [], sections: [] }));
      g.rows.push(r);
      let s = g.sections[g.sections.length - 1];
      if (!s || s.name !== r.section) g.sections.push((s = { name: r.section, num: ++num, rows: [] }));
      s.rows.push(r);
    }
    return out;
  }, [rows]);

  const cur = groups.find((g) => g.pi === tab) ?? groups[0];
  const gi = groups.indexOf(cur);
  const phase = PHASES[cur.pi];
  const next = rows.find((r) => !done[r.topic.slug])?.topic.slug;
  const doneCount = rows.filter((r) => done[r.topic.slug]).length;
  const practice = rows.filter((r) => r.topic.practice).length;
  const starters = STARTERS.filter((s) => BY.has(s));

  // Open a topic from anywhere: switch track if it is not in this one, show its phase, open the card and scroll to it.
  const go = useCallback((slug: string) => {
    const hit = BY.get(slug);
    if (!hit) return;
    if (prio(hit.topic, roadmapProgress.get().track) === "-") roadmapProgress.set({ track: "eng" });
    setTab(hit.pi);
    setOpen((o) => ({ ...o, [slug]: true }));
    setJump((j) => ({ slug, n: (j?.n ?? 0) + 1 }));
    history.replaceState(null, "", `#${slug}`);
  }, []);

  // A #topic link (dashboard, Ctrl+K search, bookmark) opens that topic; otherwise start on the phase of the next topic to do.
  useEffect(() => {
    // Deferred one tick: the saved progress is read from this browser, which the server render cannot see.
    const start = setTimeout(() => {
      const slug = decodeURIComponent(location.hash.slice(1));
      if (BY.has(slug)) go(slug);
      else {
        const s = roadmapProgress.get();
        const n = rowsFor(s.track).find((r) => !s.done[r.topic.slug]);
        if (n) setTab(n.pi);
      }
    }, 0);
    const onHash = () => go(decodeURIComponent(location.hash.slice(1)));
    window.addEventListener("hashchange", onHash);
    return () => {
      clearTimeout(start);
      window.removeEventListener("hashchange", onHash);
    };
  }, [go]);

  // After the card is on screen: bring it into view and flash it so the eye lands there.
  useEffect(() => {
    if (!jump) return;
    document.getElementById(`t-${jump.slug}`)?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
    const on = setTimeout(() => setFlash(jump.slug), 0);
    const off = setTimeout(() => setFlash(""), 1500);
    return () => {
      clearTimeout(on);
      clearTimeout(off);
    };
  }, [jump]);

  // The sliding underline under the active phase tab.
  const measure = useCallback(() => {
    const box = tabsEl.current;
    const a = box?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]');
    if (!box || !a || !indEl.current) return;
    indEl.current.style.transform = `translateX(${a.offsetLeft}px) scaleX(${a.offsetWidth / 100})`;
    box.scrollTo({ left: Math.max(0, a.offsetLeft - (box.clientWidth - a.offsetWidth) / 2), behavior: reduced() ? "auto" : "smooth" });
  }, []);
  useLayoutEffect(measure, [measure, cur.pi, track]);
  useEffect(() => {
    // Switch the slide transition on only after the first position is set, so the line does not fly in from the left.
    const id = requestAnimationFrame(() => indEl.current?.classList.add("on"));
    window.addEventListener("resize", measure);
    document.fonts?.ready.then(measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // A shadow under the tab bar once the page has scrolled past it.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const pick = (pi: number) => {
    if (pi === cur.pi) return;
    setTab(pi);
    const top = document.getElementById("rm-phase")?.getBoundingClientRect().top ?? 0;
    if (top < 0) document.getElementById("rm-phase")?.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  };
  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const to = groups[(gi + d + groups.length) % groups.length].pi;
    setTab(to);
    requestAnimationFrame(() => tabsEl.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus());
  };

  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const found = words.length ? ALL.filter((o) => words.every((w) => o.hay.includes(w))).slice(0, 8) : [];

  const relatedOf = (r: Row) => {
    const i = rows.indexOf(r);
    const out: { why: string; topic: Topic }[] = [];
    const add = (why: string, t?: Topic) => t && !out.some((x) => x.topic.slug === t.slug) && out.push({ why, topic: t });
    add("Before", rows[i - 1]?.topic);
    add("Next", rows[i + 1]?.topic);
    for (const x of rows) if (x !== r && x.pi === r.pi && x.section === r.section) add("Same section", x.topic);
    return out;
  };

  // Time is shown for the Essential topics (the core path) and for Essential plus Recommended. Optional topics are extras and left out.
  const span = (list: Row[]) => {
    const times = (min: Priority[]) => list.filter((r) => min.includes(prio(r.topic, track))).map((r) => r.topic.time);
    return { core: spanLabel(sumWeeks(times(["E"])), pace), more: spanLabel(sumWeeks(times(["E", "R"])), pace) };
  };
  const all = span(rows);
  const here = span(cur.rows);

  return (
    <div className="rm-flow">
      <header className="rm-top">
        <ul className="rm-tiles" aria-label="This track in numbers">
          <li>
            <b>
              <Count to={groups.length} />
            </b>
            <span>Phases</span>
          </li>
          <li>
            <b>
              <Count to={rows.length} />
            </b>
            <span>Topics</span>
          </li>
          <li>
            <b>
              <Count to={practice} />
            </b>
            <span>On ShiftLab</span>
          </li>
          <li>
            <b>
              <Count to={doneCount} of={rows.length} />
            </b>
            <span>Done</span>
          </li>
        </ul>
        <div className="rm-ovr" role="progressbar" aria-label="Topics done" aria-valuemin={0} aria-valuemax={rows.length} aria-valuenow={doneCount}>
          <i style={{ transform: `scaleX(${rows.length ? doneCount / rows.length : 0})` }} />
        </div>

        <div className="rm-switch" role="group" aria-label="Choose your track">
          {(["soc", "eng"] as const).map((k) => (
            <button key={k} type="button" aria-pressed={track === k} onClick={() => roadmapProgress.set({ track: k })}>
              {TRACK_NAME[k]}
            </button>
          ))}
        </div>
        <p className="rm-track-note">{track === "soc" ? "Alert triage and incident response. ShiftLab trains this track." : "Build, automate and secure. Adds Phase 6 and moves some topics up."}</p>
        <div className="rm-pace">
          <p>
            <b>Core path (Essential topics): {all.core}.</b> With the Recommended topics too: {all.more}. Optional topics are extras.
          </p>
          <div className="rm-hours" role="group" aria-label="Hours you can study each week">
            <span>If you study</span>
            {[5, 10, 20].map((h) => (
              <button key={h} type="button" aria-pressed={pace === h} onClick={() => setPace(h)}>
                {h} h
              </button>
            ))}
            <span>a week</span>
          </div>
        </div>

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
                <li key={r.topic.slug}>
                  <a
                    href={`#${r.topic.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      go(r.topic.slug);
                      setQuery("");
                    }}
                  >
                    <span className="t">
                      {r.topic.name}
                      {done[r.topic.slug] && <span className="sr-only"> (done)</span>}
                      <small>
                        Phase {r.pi + 1} · {r.section}
                      </small>
                    </span>
                    {done[r.topic.slug] && <span aria-hidden="true">✓</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {starters.some((s) => !done[s]) && (
        <section className="rm-begin" aria-labelledby="rm-begin-h">
          <h2 id="rm-begin-h">✦ Beginner? Start here</h2>
          <p>The first four topics, in order. Do them and you can read a log, follow traffic and open your first alert.</p>
          <ol className="rm-steps">
            {starters.map((s, i) => {
              const t = BY.get(s)!.topic;
              return (
                <li key={s}>
                  <button type="button" onClick={() => go(s)}>
                    <span className="n">
                      <span>
                        Step {i + 1} · {t.time}
                      </span>
                    </span>
                    <b>
                      {t.name}
                      {done[s] && <span className="sr-only"> (done)</span>}
                    </b>
                    <small>{t.resources[0].name}</small>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      <div ref={sentinel} className="rm-sentinel" aria-hidden="true" />
      <div className={`rm-tabsbar${stuck ? " stuck" : ""}`}>
        <div ref={tabsEl} className="rm-ptabs" role="tablist" aria-label="Phases" onKeyDown={onTabKey}>
          {groups.map((g) => (
            <button key={g.pi} type="button" role="tab" id={`rm-tab-${g.pi}`} aria-selected={g.pi === cur.pi} aria-controls="rm-phase" tabIndex={g.pi === cur.pi ? 0 : -1} onClick={() => pick(g.pi)}>
              <PhaseIcon id={PHASES[g.pi].id} />
              {PHASES[g.pi].name}
            </button>
          ))}
          <span ref={indEl} className="rm-ind" aria-hidden="true" />
        </div>
      </div>

      <section key={`${track}-${cur.pi}`} id="rm-phase" role="tabpanel" aria-labelledby={`rm-tab-${cur.pi}`} className="rm-phase">
        <div className="rm-phh rm-rise" style={vars({ "--i": 0 })}>
          <span className="meta">
            Phase {cur.pi + 1} · {here.core === "Ongoing" ? "Ongoing, no fixed end" : `Core ${here.core.replace("about ", "")} · with Recommended ${here.more.replace("about ", "")}`}
          </span>
          <h2>{phase.name}</h2>
          <p>{phase.goal}</p>
          <p className="out">You&apos;ll be able to {phase.outcome}</p>
        </div>

        {cur.sections.map((s, si) => {
          const dn = s.rows.filter((r) => done[r.topic.slug]).length;
          return (
            <div key={s.name}>
              <h3 className="rm-sh rm-rise" style={vars({ "--i": Math.min(si * 3 + 1, 8) })}>
                <span className="sn">{s.num}</span>
                {s.name}
              </h3>
              <div className="rm-tl" style={vars({ "--p": dn / s.rows.length })}>
                {s.rows.map((r, ri) => {
                  const t = r.topic;
                  const isOpen = !!open[t.slug];
                  const isDone = !!done[t.slug];
                  const isNext = t.slug === next;
                  const p = prio(t, track);
                  return (
                    <div key={t.slug} id={`t-${t.slug}`} className="rm-cardw rm-rise" style={vars({ "--i": Math.min(si * 3 + ri + 2, 8) })}>
                      <button type="button" role="checkbox" aria-checked={isDone} aria-label={`Mark ${t.name} done`} className={`rm-dot${isNext ? " next" : ""}`} onClick={() => roadmapProgress.set({ done: flip(roadmapProgress.get().done, t.slug) })}>
                        {isDone && (
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <div className={`rm-tc${isOpen ? " open" : ""}${isDone ? " done" : ""}${flash === t.slug ? " flash" : ""}`}>
                        <button type="button" className="rm-hd" aria-expanded={isOpen} aria-controls={`rm-b-${t.slug}`} onClick={() => setOpen((o) => ({ ...o, [t.slug]: !o[t.slug] }))}>
                          <span className="l1">
                            <span className="tag" data-p={p}>
                              {PRIORITY[p]}
                            </span>
                            {isNext && <span className="tag nx">Next up</span>}
                            {t.practice && <span className="tag ours">On ShiftLab</span>}
                            <span className="tm">{t.time}</span>
                          </span>
                          <span className="nm">
                            {t.name}
                            {isDone && <span className="sr-only"> (done)</span>}
                          </span>
                          <span className="st">★ {t.resources[0].name}</span>
                          <svg className="ch" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M5 8l5 5 5-5" />
                          </svg>
                        </button>
                        <div className="rm-bw" id={`rm-b-${t.slug}`} inert={!isOpen}>
                          <div className="rm-bd">
                            <Body t={t} related={relatedOf(r)} ticks={ticks} go={go} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="rm-pn rm-rise" style={vars({ "--i": 8 })}>
          <button type="button" disabled={gi === 0} onClick={() => pick(groups[gi - 1].pi)}>
            {gi > 0 && <>‹ {PHASES[groups[gi - 1].pi].name}</>}
          </button>
          <button type="button" disabled={gi === groups.length - 1} onClick={() => pick(groups[gi + 1].pi)}>
            {gi < groups.length - 1 && <>{PHASES[groups[gi + 1].pi].name} ›</>}
          </button>
        </div>
      </section>

      <p className="rm-credit">Links last checked {CHECKED}. Found a broken one? Tell us with Send feedback below.</p>
    </div>
  );
}
