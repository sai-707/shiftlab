import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import SetupForm from "@/components/profile/SetupForm";
import { getAccount } from "@/lib/account";

export const metadata: Metadata = { title: "Welcome", robots: { index: false, follow: false } };

// The welcome screen for a new account. Not signed in: log in first. Already set up: straight to the dashboard.
// It reads the session cookie, so it sits behind <Suspense> and the rest of the route can still be prerendered.
async function Welcome() {
  const account = await getAccount();
  if (!account) redirect("/login");
  if (account.role === "admin") redirect("/admin"); // the owner's account has no student setup
  if (!account.needsSetup) redirect("/dashboard");
  return <SetupForm email={account.email} initial={{ name: account.name, avatar: account.avatar }} />;
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-void" aria-hidden="true" />}>
      <Welcome />
    </Suspense>
  );
}
