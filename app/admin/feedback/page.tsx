import { connection } from "next/server";
import { Suspense } from "react";
import FeedbackView from "@/components/admin/FeedbackView";
import { requestTime } from "@/lib/adminData";
import { getFeedback, parseShow } from "@/lib/feedbackData";

export const metadata = { title: "Admin · Feedback" };

type Search = Promise<Record<string, string | string[] | undefined>>;

async function Content({ searchParams }: { searchParams: Search }) {
  await connection(); // live data; see lib/supabase/server.ts
  const show = parseShow((await searchParams).show);
  const res = await getFeedback(show);
  if (!res.ok) {
    return (
      <p role="alert" className="rounded-xl border border-missed/40 bg-missed/5 p-4 text-sm">
        Feedback could not be loaded (code {res.code}). Did you run <code className="font-mono text-xs">supabase/migrations/0006_feedback.sql</code> in the Supabase SQL Editor?
      </p>
    );
  }
  return <FeedbackView items={res.items} unread={res.unread} show={show} now={requestTime()} />;
}

// searchParams is runtime data, so it is read inside Suspense to keep the rest of the route prerenderable
export default function FeedbackPage({ searchParams }: { searchParams: Search }) {
  return (
    <Suspense fallback={<div className="h-96" aria-hidden="true" />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
