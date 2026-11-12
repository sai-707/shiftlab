import Link from "next/link";
import { getAccount } from "@/lib/account";
import { getInbox } from "@/lib/messagesData";

// A speech-bubble button in the top-right corner, shown only to a signed-in student who has a thread. A number appears for unopened replies.
// Reads the session cookie, so the layout wraps it in <Suspense>.
export default async function MessagesBell() {
  const account = await getAccount();
  if (!account || account.role !== "student") return null;
  const inbox = await getInbox();
  if (!inbox || inbox.threads === 0) return null;
  return (
    <Link
      href="/messages"
      aria-label={inbox.unread ? `Messages, ${inbox.unread} new` : "Messages"}
      className="relative grid h-9 w-9 place-items-center rounded-lg border border-line bg-raised text-muted shadow-lg shadow-black/40 hover:border-accent hover:text-accent"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 5h16v11H9l-5 4z" />
      </svg>
      {inbox.unread > 0 && (
        <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold leading-5 text-void">{inbox.unread > 9 ? "9+" : inbox.unread}</span>
      )}
    </Link>
  );
}
