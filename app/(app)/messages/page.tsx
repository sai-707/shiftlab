import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import MessageList from "@/components/messages/MessageList";
import ReplyForm from "@/components/messages/ReplyForm";
import PageHeader from "@/components/ui/PageHeader";
import { requestTime } from "@/lib/adminData";
import { ago } from "@/lib/adminStats";
import { getAccount } from "@/lib/account";
import { getMyThreads, markSeen } from "@/lib/messagesData";

export const metadata = { title: "Messages" };

// Reads the session cookie, so it streams in behind <Suspense>.
async function Threads() {
  const account = await getAccount();
  if (!account) redirect("/login");
  const res = await getMyThreads();
  if (!res.ok) {
    return (
      <p role="alert" className="rounded-xl border border-missed/40 bg-missed/5 p-4 text-sm">
        Your messages could not be loaded just now. Try again in a moment.
      </p>
    );
  }
  const now = requestTime();
  // shortcut: the "New" tags and the bell count in this same response still show the old numbers; they are right from the next page on.
  await markSeen();
  if (res.threads.length === 0) {
    return (
      <p className="rounded-xl border border-line bg-panel p-5 text-sm text-muted">
        Nothing here yet. When ShiftLab replies to feedback you sent while signed in with &quot;You may reply to me about this&quot; ticked, the conversation shows up here.
      </p>
    );
  }
  return (
    <ul className="space-y-6">
      {res.threads.map((t) => (
        <li key={t.id} className="rounded-2xl border border-line bg-panel p-5">
          <p className="text-xs text-muted">
            Your feedback{t.alert ? <> on <Link href={`/alerts/${t.alert}`} className="font-mono text-accent hover:underline">{t.alert}</Link></> : null} · {ago(t.at, now)}
          </p>
          {(t.confusing || t.opinion) && (
            <blockquote className="mt-2 whitespace-pre-wrap rounded-md border-l-2 border-line bg-canvas px-3 py-2 text-sm italic text-ink/80">{t.confusing || t.opinion}</blockquote>
          )}
          <div className="mt-4">
            <MessageList messages={t.messages} viewer="student" now={now} />
          </div>
          <ReplyForm fid={t.id} label="Write a reply" button="Send reply" />
        </li>
      ))}
    </ul>
  );
}

export default function MessagesPage() {
  return (
    <>
      <PageHeader title="Messages" description="Replies to the feedback you sent. Only you and the ShiftLab owner can see these." />
      <Suspense fallback={<div className="min-h-48" aria-hidden="true" />}>
        <Threads />
      </Suspense>
    </>
  );
}
