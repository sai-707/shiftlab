import { Suspense } from "react";
import { notFound } from "next/navigation";
import CaseWorkspace from "@/components/case/CaseWorkspace";
import { ALERTS } from "@/content/alerts";

// Known alert ids are prerendered, which the cacheComponents setting needs for dynamic routes.
export function generateStaticParams() {
  return ALERTS.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: ALERTS.find((a) => a.id === id)?.id ?? "Alert" };
}

async function AlertContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alert = ALERTS.find((a) => a.id === id);
  if (!alert) notFound();
  return <CaseWorkspace alert={alert} />;
}

// params is runtime data, so it is read inside Suspense to keep the route prerenderable
export default function AlertPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading alert…</p>}>
      <AlertContent params={params} />
    </Suspense>
  );
}
