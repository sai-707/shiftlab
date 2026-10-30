import { connection } from "next/server";
import { Suspense } from "react";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { Unavailable } from "@/components/admin/parts";
import { getAccount } from "@/lib/account";
import { getOverview, getRecentUsers, requestTime } from "@/lib/adminData";
import { parseMetric, parseRange } from "@/lib/adminStats";

type Search = Promise<Record<string, string | string[] | undefined>>;

async function Content({ searchParams }: { searchParams: Search }) {
  await connection(); // the numbers are live, and Supabase reads the clock (see lib/supabase/server.ts)
  const sp = await searchParams;
  const range = parseRange(sp.range);
  const metric = parseMetric(sp.metric);
  const [account, overview, users] = await Promise.all([getAccount(), getOverview(range), getRecentUsers(10)]);

  if (!overview.ok) return <Unavailable code={overview.code} />;
  const name = account?.name || account?.email.split("@")[0] || "there";
  return <AdminDashboard name={name} data={overview.data} users={users} range={range} metric={metric} now={requestTime()} />;
}

// searchParams is runtime data, so it is read inside Suspense to keep the rest of the route prerenderable
export default function AdminPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
