import Link from "next/link";
import UserMenu from "@/components/ui/UserMenu";
import { getAccount } from "@/lib/account";

// The top-right corner of the student pages: the account menu for someone signed in, a Sign in link for a guest.
// Reads the session cookie, so the layout wraps it in <Suspense>. (The file keeps its first name, from when it sat in the sidebar.)
export default async function SidebarAccount() {
  const account = await getAccount();
  if (!account) {
    return (
      <Link
        href="/login"
        className="block rounded-lg border border-line bg-raised px-3 py-1.5 text-sm font-medium text-muted shadow-lg shadow-black/40 hover:border-accent hover:text-accent"
      >
        Sign in
      </Link>
    );
  }
  return (
    <UserMenu
      who={{ name: account.name, email: account.email, avatar: account.avatar }}
      links={[
        { label: "My profile", href: "/profile", icon: "user" },
        { label: "Case reports", href: "/reports", icon: "reports" },
      ]}
    />
  );
}
