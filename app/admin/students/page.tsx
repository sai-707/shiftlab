import { connection } from "next/server";
import { Suspense } from "react";
import StudentsView from "@/components/admin/StudentsView";
import { requestTime } from "@/lib/adminData";
import { getStudents } from "@/lib/adminStudentsData";
import { parsePage, parseQuery } from "@/lib/adminStudents";

export const metadata = { title: "Admin · Students" };

type Search = Promise<Record<string, string | string[] | undefined>>;

async function Content({ searchParams }: { searchParams: Search }) {
  await connection(); // live numbers; see lib/supabase/server.ts
  const sp = await searchParams;
  const page = parsePage(sp.page);
  const q = parseQuery(sp.q);
  const res = await getStudents(page, q);
  if (!res.ok) {
    return (
      <p role="alert" className="rounded-xl border border-missed/40 bg-missed/5 p-4 text-sm">
        The student list could not be loaded (code {res.code}). Did you run <code className="font-mono text-xs">supabase/migrations/0010_students.sql</code> in the Supabase SQL Editor?
      </p>
    );
  }
  return <StudentsView data={res.data} page={page} q={q} now={requestTime()} />;
}

// searchParams is runtime data, so it is read inside Suspense to keep the rest of the route prerenderable
export default function StudentsPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
