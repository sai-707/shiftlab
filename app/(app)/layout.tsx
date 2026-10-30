import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { ThreatMap } from "@/components/backgrounds/Background";
import FeedbackLink from "@/components/feedback/FeedbackLink";
import Interactions from "@/components/layout/Interactions";
import ProgressSync from "@/components/layout/ProgressSync";
import Sidebar from "@/components/layout/Sidebar";
import SidebarAccount from "@/components/layout/SidebarAccount";
import { getAccount } from "@/lib/account";

// Two redirects, both for signed-in people; guests pass straight through. Renders nothing.
// An admin never sees the student workspace: every page here sends them to /admin. A student who has not finished the welcome screen goes there first.
// shortcut: it redirects after the page has started to stream, so the person may see the workspace shell for a blink.
// Fine for a redirect that happens once; wrapping {children} in the gate would make every page wait for the session instead.
async function SetupGate() {
  const account = await getAccount();
  if (account?.role === "admin") redirect("/admin");
  if (account?.needsSetup) redirect("/welcome");
  return null;
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <ThreatMap />
      <Interactions />
      <Suspense fallback={null}>
        <SetupGate />
      </Suspense>
      <Suspense fallback={null}>
        <ProgressSync />
      </Suspense>
      {/* Sidebar reads the current path at request time, so it must sit inside Suspense */}
      <Suspense
        fallback={
          <aside className="border-b border-line bg-panel md:fixed md:inset-y-0 md:left-0 md:w-60 md:border-b-0 md:border-r" />
        }
      >
        <Sidebar />
      </Suspense>
      {/* Top-right corner: inside the logo strip on a phone, fixed to the screen from md up. It needs the session cookie, so it waits in its own Suspense. */}
      <div className="absolute right-3 top-2.5 z-40 md:fixed md:right-6 md:top-3">
        <Suspense fallback={null}>
          <SidebarAccount />
        </Suspense>
      </div>
      <main className="app-main">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:pt-14">
          {children}
          <p className="mt-12 border-t border-line pt-4 text-center text-xs text-muted">
            Found something confusing or unrealistic? <FeedbackLink className="text-accent hover:underline">Send feedback</FeedbackLink>
          </p>
        </div>
      </main>
    </div>
  );
}
