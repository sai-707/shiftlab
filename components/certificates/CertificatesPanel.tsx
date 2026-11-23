"use client";

import Link from "next/link";
import { useMemo, useState, type CSSProperties } from "react";
import SectionHead from "@/components/profile/SectionHead";
import { KIND_META, MIN_AVG, levelStatuses, linkedInUrl, masterReady, overall, type Cert, type CertKind } from "@/lib/certificates";
import { useProgress } from "@/lib/progress";
import { addCertificate, useCertificates } from "@/lib/useCertificates";
import CertDialog from "./CertDialog";

type Tile = { kind: CertKind; label: string; done: number; total: number; avg: number | null; ready: boolean; hint: string };

function Shield({ color, on }: { color: string; on: boolean }) {
  return (
    <svg viewBox="0 0 24 28" className="h-8 w-7 shrink-0" fill="none" aria-hidden="true">
      <path d="M12 1.5l9.5 3.4v8.1c0 6-4.1 10.4-9.5 13.5C6.6 23.4 2.5 19 2.5 13V4.9z" fill={on ? `${color}2e` : "none"} stroke={on ? color : "var(--color-line)"} strokeWidth="1.6" strokeLinejoin="round" />
      {on && <path d="M8 13.5l2.9 2.9L16.5 10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
    </svg>
  );
}

/**
 * How close each certificate is, and Claim or View once it is within reach. On the dashboard it is its own card; `embedded` is the profile page's
 * version: a section of the profile card, with glowing earned tiles and an "Add to LinkedIn" link (its pf- styles come from profile.css, which ProfileView imports).
 */
export default function CertificatesPanel({ embedded = false }: { embedded?: boolean }) {
  const progress = useProgress();
  const mine = useCertificates();
  const [open, setOpen] = useState<CertKind | null>(null);

  const tiles = useMemo<Tile[]>(() => {
    const certs = mine?.certs ?? [];
    const levels = levelStatuses(progress.cases).map<Tile>((l) => ({
      kind: l.level,
      label: l.level,
      done: l.done,
      total: l.total,
      avg: l.avg,
      ready: l.ready,
      hint:
        l.done < l.total
          ? `${l.done} of ${l.total} closed`
          : l.ready
            ? "Ready to claim"
            : `Average ${l.avg ?? 0}. It needs ${MIN_AVG}. Try some alerts again.`,
    }));
    const o = overall(progress.cases);
    const levelCerts = levels.filter((t) => certs.some((c) => c.kind === t.kind)).length;
    const master: Tile = {
      kind: "Master",
      label: "Master",
      done: o.done,
      total: o.total,
      avg: o.avg,
      ready: masterReady(progress.cases, certs),
      hint:
        levelCerts < 4
          ? `Claim the four level certificates first (${levelCerts} of 4)`
          : o.done < o.total
            ? `${o.done} of ${o.total} closed`
            : o.avg !== null && o.avg < MIN_AVG
              ? `Overall average ${o.avg}. It needs ${MIN_AVG}.`
              : "Ready to claim",
    };
    return [...levels, master];
  }, [progress.cases, mine]);

  const certOf = (k: CertKind): Cert | null => mine?.certs.find((c) => c.kind === k) ?? null;
  const active = open ? tiles.find((t) => t.kind === open) : null;

  const rule = <p className="text-xs text-muted">Close every alert of a level with an average of {MIN_AVG} or more. Your best try on each alert counts.</p>;

  return (
    <section
      className={embedded ? "border-t border-line p-5 md:p-6" : "spot rounded-2xl border border-line bg-panel p-5 shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]"}
      aria-labelledby="certs-h"
    >
      {embedded ? (
        <SectionHead eyebrow="Proof of work" title="Certificates" id="certs-h" aside={rule} />
      ) : (
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 id="certs-h" className="font-semibold">
            Your certificates
          </h2>
          {rule}
        </div>
      )}

      {mine === null && (
        <p className="mt-3 rounded-lg border border-line bg-canvas/50 px-4 py-3 text-sm">
          Certificates belong to an account, so they can be checked later.{" "}
          <Link href="/signup" className="font-medium text-accent hover:underline">
            Create a free account
          </Link>{" "}
          and your progress comes with you.
        </p>
      )}

      <ul className={`mt-4 grid gap-3 ${embedded ? "grid-cols-2" : "sm:grid-cols-2"} lg:grid-cols-5`}>
        {tiles.map((t) => {
          const c = certOf(t.kind);
          const color = KIND_META[t.kind].color;
          const pct = t.total ? Math.round((t.done / t.total) * 100) : 0;
          const canAct = Boolean(mine) && (c || t.ready);
          return (
            <li key={t.kind} className={`flex flex-col rounded-xl border border-line bg-canvas/50 p-3.5 transition-colors${embedded ? ` pf-cert${c ? " pf-cert-on" : ""}` : ""}`} style={{ "--c": color, borderColor: c ? `${color}66` : undefined } as CSSProperties}>
              <div className="flex items-center gap-2.5">
                <Shield color={color} on={Boolean(c)} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{t.label}</p>
                  <p className="text-xs text-muted">{c ? `Average ${c.avg}` : `${t.done} of ${t.total}`}</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`${t.label} progress`}>
                <div className={`h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none${embedded ? " pf-fill" : ""}`} style={{ width: `${pct}%`, background: color, "--pf-c": color } as CSSProperties} />
              </div>
              <p className="mt-2 min-h-8 text-xs leading-snug text-muted">{c ? (
                  embedded ? (
                    <>
                      Issued ·{" "}
                      <a href={linkedInUrl(c)} target="_blank" rel="noopener noreferrer" className="font-medium text-accent hover:underline">
                        Add to LinkedIn
                      </a>
                    </>
                  ) : (
                    "Issued"
                  )
                ) : (
                  t.hint
                )}
              </p>
              {canAct ? (
                <button
                  type="button"
                  onClick={() => setOpen(t.kind)}
                  className={`mt-auto min-h-10 rounded-lg px-3 text-sm font-semibold ${c ? "border border-line hover:border-accent hover:text-accent" : "text-canvas hover:opacity-90"}`}
                  style={c ? undefined : { background: color }}
                >
                  {c ? "View" : "Claim"}
                </button>
              ) : (
                <span className="mt-auto min-h-10" />
              )}
            </li>
          );
        })}
      </ul>

      {open && active && (
        <CertDialog
          kind={open}
          cert={certOf(open)}
          summary={{ avg: active.avg, alerts: active.total }}
          defaultName={mine?.name ?? ""}
          onClaimed={addCertificate}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
