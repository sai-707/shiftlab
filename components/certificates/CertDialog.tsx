"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { claimCertificate, renameCertificate } from "@/app/certificate-actions";
import { KIND_META, MIN_AVG, cleanHolder, linkedInUrl, verifyUrl, type Cert, type CertKind } from "@/lib/certificates";
import { downloadCertificate } from "@/lib/exportCert";
import { toast } from "@/lib/toast";
import Certificate from "./Certificate";
import PaperBlast from "./PaperBlast";

// Per-level paper colours: the level's own colour plus white and a softer tint, so each level feels like its own.
const PALETTE: Record<CertKind, string[]> = {
  Beginner: ["#34d399", "#6ee7b7", "#ecfdf5", "#10b981"],
  Intermediate: ["#60a5fa", "#93c5fd", "#eff6ff", "#3b82f6"],
  Hard: ["#fb923c", "#fdba74", "#fff7ed", "#f97316"],
  "AI Era": ["#a78bfa", "#c4b5fd", "#f5f3ff", "#8b5cf6"],
  Master: ["#c8d3e4", "#f1f5f9", "#34d399", "#60a5fa", "#fb923c", "#a78bfa"],
};

const primary = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-canvas hover:opacity-90 disabled:opacity-60";
const ghost = "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-line px-5 text-sm font-medium hover:border-accent hover:text-accent disabled:opacity-60";
const pop = "animate-[ob-pop_320ms_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:animate-none";

type Props = {
  kind: CertKind;
  /** The certificate if it has been claimed already (opens straight on the picture). */
  cert: Cert | null;
  /** The numbers shown before claiming. */
  summary?: { avg: number | null; alerts: number };
  defaultName: string;
  /** Paper blast when the window opens: used when it appears right after finishing a level. */
  celebrate?: boolean;
  onClaimed: (c: Cert) => void;
  onClose: () => void;
};

/** One window for a certificate: claim it (with the name to print) and then look at it, save it, share it. */
export default function CertDialog({ kind, cert: initial, summary, defaultName, celebrate = false, onClaimed, onClose }: Props) {
  const [cert, setCert] = useState<Cert | null>(initial);
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [blast, setBlast] = useState(celebrate ? 1 : 0);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const meta = KIND_META[kind];
  const colors = useMemo(() => PALETTE[kind], [kind]);
  const title = kind === "Master" ? "Master certificate" : `${kind} level certificate`;
  const shown = cert && !editing;

  useEffect(() => {
    (cert ? closeRef.current : inputRef.current)?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // Only on open: later changes (claiming) must not steal focus again.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const clean = cleanHolder(name);
      if (!clean) return setError("Enter your name as you want it printed (2 to 60 characters).");
      setBusy(true);
      setError("");
      const res = cert ? await renameCertificate(cert.id, clean) : await claimCertificate(kind, clean);
      setBusy(false);
      if ("error" in res) return setError(res.error);
      const wasNew = !cert;
      setCert(res.cert);
      setEditing(false);
      onClaimed(res.cert);
      if (wasNew && !celebrate) setBlast((n) => n + 1);
      toast(wasNew ? "Certificate issued." : "Name updated.");
    },
    [name, cert, kind, celebrate, onClaimed],
  );

  const save = async () => {
    const svg = document.querySelector<SVGSVGElement>("[data-cert-dialog] svg[data-certificate]");
    if (!svg || !cert) return;
    setBusy(true);
    try {
      await downloadCertificate(svg, cert.id);
    } catch {
      toast("Could not save the picture. Try again, or take a screenshot.");
    }
    setBusy(false);
  };

  const copy = async () => {
    if (!cert) return;
    try {
      await navigator.clipboard.writeText(verifyUrl(cert.id));
      toast("Link copied.");
    } catch {
      toast(verifyUrl(cert.id));
    }
  };

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto p-4 animate-[ob-fade_240ms_ease-out_both] motion-reduce:animate-none" role="presentation">
      <div className="fixed inset-0 bg-canvas/80 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      {blast > 0 && <PaperBlast key={blast} colors={colors} big={kind === "Master"} />}
      <div
        data-cert-dialog
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative z-10 my-auto w-full max-w-3xl rounded-2xl border border-line bg-raised p-5 sm:p-6 ${pop}`}
        style={{ boxShadow: `0 30px 90px -30px rgb(0 0 0 / 0.95), 0 0 0 1px ${meta.color}22, 0 0 70px -30px ${meta.color}` }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: meta.color }}>
              {shown ? "Your certificate" : cert ? "Change the name" : "You earned it"}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{title}</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-muted hover:border-accent hover:text-accent" aria-label="Close">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
            </svg>
          </button>
        </div>

        {shown ? (
          <div key="view" className="mt-4 animate-[ob-swap_320ms_ease-out_both] motion-reduce:animate-none">
            <div className="overflow-hidden rounded-xl border border-line">
              <Certificate cert={cert} className="block h-auto w-full" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button type="button" onClick={save} disabled={busy} className={primary}>
                Download PNG
              </button>
              <a href={linkedInUrl(cert)} target="_blank" rel="noopener noreferrer" className={ghost}>
                Add to LinkedIn
              </a>
              <button type="button" onClick={copy} className={ghost}>
                Copy verify link
              </button>
              <button type="button" onClick={() => setEditing(true)} className={ghost}>
                Change name
              </button>
            </div>
            <p className="mt-3 break-all text-xs text-muted">
              Anyone with this link can check it: <span className="font-mono">{verifyUrl(cert.id)}</span>
            </p>
          </div>
        ) : (
          <form key="claim" onSubmit={submit} className="mt-4 animate-[ob-swap_320ms_ease-out_both] motion-reduce:animate-none">
            {!cert && summary && (
              <div className="rounded-xl border border-line bg-canvas/50 px-4 py-3 text-sm">
                <p>
                  All <b>{summary.alerts}</b> alerts closed{summary.avg !== null && (
                    <>
                      , average <b style={{ color: meta.color }}>{summary.avg}</b> out of 100
                    </>
                  )}
                  .
                </p>
                <p className="mt-1 text-muted">
                  {kind === "Master" ? "The Master certificate needs the four level certificates and an overall average of at least" : "A level needs every alert closed and an average of at least"} {MIN_AVG}. Your best try on each alert counts.
                </p>
              </div>
            )}
            <label htmlFor="cert-name" className="mt-4 block text-sm font-medium">
              Name on the certificate
            </label>
            <input
              id="cert-name"
              ref={inputRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={60}
              autoComplete="name"
              className="mt-1.5 min-h-12 w-full rounded-xl border border-line bg-canvas px-4 text-[15px] outline-none focus:border-accent"
              aria-describedby="cert-name-help"
              aria-invalid={error ? true : undefined}
            />
            <p id="cert-name-help" className="mt-1.5 text-xs text-muted">
              Printed on the certificate and shown on its public verify page, which anyone with the link can open. Use the name you want employers to see.
            </p>
            {error && (
              <p role="alert" className="mt-2 text-sm text-critical">
                {error}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2.5">
              <button type="submit" disabled={busy} className={primary}>
                {busy ? "Saving…" : cert ? "Save name" : "Claim certificate"}
              </button>
              {cert && (
                <button type="button" onClick={() => (setEditing(false), setError(""))} className={ghost}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
