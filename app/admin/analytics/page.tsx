import { connection } from "next/server";
import { Suspense } from "react";
import AnalyticsView from "@/components/admin/AnalyticsView";
import { Unavailable } from "@/components/admin/parts";
import { getOverview } from "@/lib/adminData";
import { parseRange } from "@/lib/adminStats";

export const metadata = { title: "Admin · Analytics" };

type Search = Promise<Record<string, string | string[] | undefined>>;

async function Content({ searchParams }: { searchParams: Search }) {
  await connection(); // live numbers; see lib/supabase/server.ts
  const range = parseRange((await searchParams).range);
  const overview = await getOverview(range);
  if (!overview.ok) return <Unavailable code={overview.code} />;
  return <AnalyticsView data={overview.data} range={range} />;
}

// searchParams is runtime data, so it is read inside Suspense to keep the rest of the route prerenderable
export default function AnalyticsPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
