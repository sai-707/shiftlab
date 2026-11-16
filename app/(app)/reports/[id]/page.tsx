import { Suspense } from "react";
import { notFound } from "next/navigation";
import ReportDetail from "@/components/reports/ReportDetail";
import { ALERTS } from "@/content/alerts";

// Known alert ids are prerendered, which the cacheComponents setting needs for dynamic routes.
export function generateStaticParams() {
  return ALERTS.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Report ${ALERTS.find((a) => a.id === id)?.id ?? ""}`.trim() };
}

async function ReportContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!ALERTS.some((a) => a.id === id)) notFound();
  return <ReportDetail alertId={id} />;
}

// params is runtime data, so it is read inside Suspense to keep the route prerenderable
export default function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading report…</p>}>
      <ReportContent params={params} />
    </Suspense>
  );
}
