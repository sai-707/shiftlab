import { Suspense } from "react";
import PageHeader from "@/components/ui/PageHeader";
import AccountCard from "@/components/profile/AccountCard";
import ProfileView from "@/components/profile/ProfileView";
import ResetProgress from "@/components/profile/ResetProgress";
import ExportSummary from "@/components/profile/ExportSummary";
import { getAccount } from "@/lib/account";

export const metadata = { title: "Profile" };

// Reads the session cookie to find the account's saved details, so it streams in behind <Suspense>.
async function ProfileData() {
  const account = await getAccount();
  return (
    <ProfileView
      account={account && { name: account.name, avatar: account.avatar, email: account.email, username: account.username, github: account.github }}
    />
  );
}

// The whole profile is one card. Its parts (ProfileView, AccountCard and the two below) each start with a hairline instead of drawing their own box.
export default function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Profile"
        description="Your progress, strengths and badges."
      />
      <article className="rise overflow-hidden rounded-2xl border border-line bg-panel shadow-[inset_0_1px_0_0_rgb(255_255_255/0.03)]">
        <Suspense fallback={<div className="min-h-64" />}>
          <ProfileData />
        </Suspense>
        {/* reads the session cookie too; getAccount() shares one lookup with the block above */}
        <Suspense fallback={<div className="min-h-24 border-t border-line" />}>
          <AccountCard />
        </Suspense>
        {/* grid-cols-1 (not the implicit auto column) so the wide summary text cannot stretch the card past the screen */}
        <div className="grid grid-cols-1 border-t border-line lg:grid-cols-2 lg:divide-x lg:divide-line">
          <section className="p-5 md:p-6">
            <h2 className="font-semibold">Progress summary</h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              A plain-text summary of your practice. Download it or paste it into your portfolio or interview notes.
            </p>
            <ExportSummary />
          </section>
          <section className="border-t border-line p-5 md:p-6 lg:border-t-0">
            <h2 className="font-semibold">Practice progress</h2>
            <p className="mt-1 mb-4 text-sm text-muted">
              Your cases and scores are stored in this browser only. Reset them to start the
              shift again. Your display name is kept.
            </p>
            <ResetProgress />
          </section>
        </div>
      </article>
    </>
  );
}
