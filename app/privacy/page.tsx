import type { Metadata } from "next";
import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";

export const metadata: Metadata = { title: "Privacy" };

const H = { fontSize: 18, margin: "28px 0 6px" } as const;
const P = { margin: "0 0 8px", color: "var(--color-muted)", lineHeight: 1.7 } as const;

// Plain-language summary of what the site stores. Keep it true: update it whenever a new thing is stored.
export default function PrivacyPage() {
  return (
    <SiteShell>
      <main className="wrap" style={{ maxWidth: 720, padding: "72px 20px 96px" }}>
        <Link className="brand" href="/">
          <span className="mark" aria-hidden="true">
            <i />
          </span>
          ShiftLab
        </Link>
        <h1 style={{ fontSize: 34, margin: "28px 0 4px", letterSpacing: "-.02em" }}>Privacy</h1>
        <p style={P}>ShiftLab is a free practice site. Every alert and company in it is fictional. This is what it keeps about you.</p>

        <h2 style={H}>Without an account</h2>
        <p style={P}>Your progress stays in your own browser. Clearing the browser&apos;s site data removes it.</p>

        <h2 style={H}>With an account</h2>
        <p style={P}>
          We store your email, a display name, a username and, if you add them, a photo and GitHub name. Your password is handled by our sign-in provider (Supabase) and we never see it.
          Your closed cases, including the report you wrote, your scores and your practice results are saved so they follow you to other devices. Only you can read them.
          Reset progress in your profile deletes them.
        </p>

        <h2 style={H}>Visit counts</h2>
        <p style={P}>
          Each page view is counted with a random number kept in your browser. It holds no name or email. Nothing is counted if your browser sends &quot;Do Not Track&quot;.
          When a case is closed we also count the alert, the score and whether the verdict was right, never your written report.
        </p>

        <h2 style={H}>What we do not do</h2>
        <p style={P}>No ads, no selling data, no third-party trackers.</p>

        <h2 style={H}>Questions or deleting your account</h2>
        <p style={P}>Email saidaswadkar14@gmail.com and your account and its data will be removed.</p>
      </main>
    </SiteShell>
  );
}
