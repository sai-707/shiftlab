import { connection } from "next/server";
import { Suspense } from "react";
import GuestsView from "@/components/admin/GuestsView";
import { getGuests, requestTime } from "@/lib/adminData";
import { parseRange } from "@/lib/adminStats";

export const metadata = { title: "Admin · Guests" };

type Search = Promise<Record<string, string | string[] | undefined>>;

async function Content({ searchParams }: { searchParams: Search }) {
  await connection(); // live numbers; see lib/supabase/server.ts
  const range = parseRange((await searchParams).range);
  const res = await getGuests(range);
  if (!res.ok) {
    return (
      <p role="alert" className="rounded-xl border border-missed/40 bg-missed/5 p-4 text-sm">
        The guest numbers could not be loaded (code {res.code}). Did you run <code className="font-mono text-xs">supabase/migrations/0007_admin_guests.sql</code> in the Supabase SQL Editor?
      </p>
    );
  }
  return <GuestsView data={res.data} log={res.log} range={range} now={requestTime()} />;
}

// searchParams is runtime data, so it is read inside Suspense to keep the rest of the route prerenderable
export default function GuestsPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
