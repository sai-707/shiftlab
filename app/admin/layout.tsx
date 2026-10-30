import { notFound, redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { getAccount } from "@/lib/account";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

// Only admins get past this. A guest is sent to log in; a signed-in student sees a plain 404, so the page does not advertise itself.
// The database functions behind the numbers check the role again, so this gate is not the only lock.
async function Gate({ children }: { children: ReactNode }) {
  const account = await getAccount();
  if (!account) redirect("/login");
  if (account.role !== "admin") notFound();
  return <AdminShell who={{ name: account.name, email: account.email, avatar: account.avatar }}>{children}</AdminShell>;
}

// The gate reads the session cookie, so everything waits inside Suspense; the page behind it shows only the dark background until then.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-svh" aria-hidden="true" />}>
      <Gate>{children}</Gate>
    </Suspense>
  );
}
