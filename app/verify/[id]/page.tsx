import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import Certificate from "@/components/certificates/Certificate";
import SiteShell from "@/components/site/SiteShell";
import { BrandMark } from "@/components/ui/BrandMark";
import { CERT_ID, KIND_META, asCert, issuedLabel } from "@/lib/certificates";
import { createClient } from "@/lib/supabase/server";
import { LEVELS } from "@/lib/levels";

// Public page: anyone with the link can check a certificate. It shows the name, the level, the date and the scores, nothing else.
// Search engines are told to leave it out, because it carries a person's name.
export const metadata = { title: "Verify certificate", robots: { index: false, follow: false } };

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <SiteShell>
      <main className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col gap-8 px-5 py-8 sm:py-12">
        <Link href="/" className="flex w-fit items-center gap-2 text-sm font-semibold text-ink">
          <BrandMark className="h-[26px] w-[26px]" />
          ShiftLab
        </Link>
        <Suspense fallback={<div className="h-72 animate-pulse rounded-2xl border border-line bg-panel" aria-label="Checking certificate" />}>
          <Verified params={params} />
        </Suspense>
      </main>
    </SiteShell>
  );
}

async function Verified({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const id = decodeURIComponent(raw).trim().toUpperCase();
  if (!CERT_ID.test(id)) notFound();
  await connection(); // Supabase reads the clock, so this page is built per request.
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("verify_certificate", { p_id: id });
  if (error) console.error("[verify] rpc:", error.code);
  const cert = asCert(data);
  if (!cert) notFound();
  const color = KIND_META[cert.kind].color;
  const title = cert.kind === "Master" ? "Master certificate" : `${cert.kind} level certificate`;

  const facts: [string, string][] = [
    ["Issued to", cert.holder],
    ["Certificate", title],
    ["Issued on", issuedLabel(cert.issuedAt)],
    ["Alerts completed", `${cert.alerts} of ${cert.alerts}`],
    ["Final average", `${cert.avg} out of 100`],
    ["First-try average", `${cert.firstAvg} out of 100`],
  ];
  if (cert.kind === "Master" && cert.levels) {
    for (const l of LEVELS) if (cert.levels[l] !== undefined) facts.push([`${l} average`, `${cert.levels[l]} out of 100`]);
  }
  facts.push(["Certificate ID", cert.id]);

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-full border text-lg" style={{ borderColor: color, color, background: `${color}1f` }} aria-hidden="true">
          ✓
        </span>
        <div>
          <h1 className="text-xl font-semibold leading-tight">This certificate is genuine</h1>
          <p className="text-sm text-muted">It was issued by ShiftLab to the person named below.</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-panel shadow-[0_30px_80px_-40px_rgb(0_0_0/0.9)]">
        <Certificate cert={cert} className="block h-auto w-full" />
      </div>

      <dl className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
        {facts.map(([k, v]) => (
          <div key={k} className="bg-panel px-5 py-3.5">
            <dt className="text-xs uppercase tracking-wider text-muted">{k}</dt>
            <dd className="mt-0.5 break-words text-[15px] font-medium">{v}</dd>
          </div>
        ))}
      </dl>

      <p className="max-w-3xl text-sm leading-relaxed text-muted">
        The final average counts the best score on each alert (an alert can be tried up to three times). The first-try average counts only the first try on each alert, so both are shown.
        ShiftLab is a free practice simulator for SOC Level 1 skills. This certificate shows completed practice on ShiftLab, not an exam or an accredited qualification.
      </p>

      <div>
        <Link href="/" className="inline-flex min-h-11 items-center rounded-lg border border-line px-5 text-sm font-medium hover:border-accent hover:text-accent">
          Try ShiftLab yourself
        </Link>
      </div>
    </>
  );
}
