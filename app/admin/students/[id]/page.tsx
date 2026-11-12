import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import StudentView from "@/components/admin/StudentView";
import { requestTime } from "@/lib/adminData";
import { getStudent } from "@/lib/adminStudentsData";
import { UUID } from "@/lib/adminStudents";

export const metadata = { title: "Admin · Student" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  await connection(); // live numbers; see lib/supabase/server.ts
  const { id } = await params;
  if (!UUID.test(id)) notFound(); // never send a made-up id to the database
  const res = await getStudent(id);
  if (!res.ok) {
    return (
      <p role="alert" className="rounded-xl border border-missed/40 bg-missed/5 p-4 text-sm">
        This student could not be loaded (code {res.code}). Did you run <code className="font-mono text-xs">supabase/migrations/0010_students.sql</code> in the Supabase SQL Editor?
      </p>
    );
  }
  if (!res.data) notFound();
  return <StudentView data={res.data} now={requestTime()} />;
}

export default function StudentPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
      <Content params={params} />
    </Suspense>
  );
}
