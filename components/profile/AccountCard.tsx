import Link from "next/link";
import { signOut } from "@/app/auth-actions";
import { getAccount } from "@/lib/account";

const btn = "rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-raised";
const row = "flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-line p-5 md:p-6";

// Who is signed in, or an invitation to create an account. One part of the profile card (the page draws the card).
// Reads the session cookie, so the page wraps it in <Suspense>.
export default async function AccountCard() {
  const account = await getAccount();

  if (!account) {
    return (
      <section className={row}>
        <div className="max-w-xl">
          <h2 className="font-semibold">Account</h2>
          <p className="mt-1 text-sm text-muted">
            You are using ShiftLab as a guest. Create a free account to sign in from any browser. Your name and photo are
            saved to your account; your cases and scores stay in this browser for now.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/signup" className={`${btn} border-accent/40 text-accent hover:bg-accent/10`}>
            Create account
          </Link>
          <Link href="/login" className={btn}>
            Sign in
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={row}>
      <div className="max-w-xl">
        <h2 className="font-semibold">Account</h2>
        <p className="mt-1 text-sm text-muted">
          Signed in as <span className="text-ink">{account.email}</span>
          {account.role === "admin" && <span className="ml-2 rounded-full border border-accent/40 px-2 py-0.5 text-xs text-accent">Admin</span>}
        </p>
        <p className="mt-1 text-sm text-muted">Your cases and scores are still saved in this browser only.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {account.role === "admin" && (
          <Link href="/admin" className={`${btn} border-accent/40 text-accent hover:bg-accent/10`}>
            Admin dashboard
          </Link>
        )}
        <form action={signOut}>
          <button type="submit" className={btn}>
            Sign out
          </button>
        </form>
      </div>
    </section>
  );
}
