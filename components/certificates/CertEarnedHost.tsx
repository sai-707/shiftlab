"use client";

import { useEffect, useRef, useState } from "react";
import { CERT_EVENT, certSeen, levelStatuses, markCertSeen, masterReady, type Cert, type CertKind } from "@/lib/certificates";
import { useProgress } from "@/lib/progress";
import { addCertificate, loadCertificates } from "@/lib/useCertificates";
import { toast } from "@/lib/toast";
import CertDialog from "./CertDialog";

type Open = { kind: CertKind; name: string; summary: { avg: number | null; alerts: number } };

/** Listens for "a level was just finished" and opens the earned window, once per certificate. Mounted once in the app layout. */
export default function CertEarnedHost() {
  const progress = useProgress();
  const cases = useRef(progress.cases);
  const [open, setOpen] = useState<Open | null>(null);

  useEffect(() => {
    cases.current = progress.cases;
  }, [progress.cases]);

  useEffect(() => {
    const onEarned = async (e: Event) => {
      const kind = (e as CustomEvent<{ kind: CertKind }>).detail?.kind;
      if (!kind || kind === "Master" || certSeen(kind)) return;
      const mine = await loadCertificates(true);
      if (!mine || mine.certs.some((c) => c.kind === kind)) return; // a guest, or already issued
      const level = levelStatuses(cases.current).find((l) => l.level === kind);
      if (!level?.ready) return;
      markCertSeen(kind);
      setOpen({ kind, name: mine.name, summary: { avg: level.avg, alerts: level.total } });
    };
    window.addEventListener(CERT_EVENT, onEarned);
    return () => window.removeEventListener(CERT_EVENT, onEarned);
  }, []);

  if (!open) return null;
  const onClaimed = (c: Cert) => {
    addCertificate(c);
    // After the fourth level the Master certificate opens up on the dashboard.
    window.setTimeout(() => {
      void loadCertificates().then((m) => m && masterReady(cases.current, m.certs) && toast("Master certificate unlocked. Claim it on your dashboard."));
    }, 600);
  };
  return <CertDialog kind={open.kind} cert={null} summary={open.summary} defaultName={open.name} celebrate onClaimed={onClaimed} onClose={() => setOpen(null)} />;
}
