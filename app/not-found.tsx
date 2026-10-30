import Link from "next/link";
import SiteShell from "@/components/site/SiteShell";

export default function NotFound() {
  return (
    <SiteShell>
      <main className="auth">
        <Link className="brand" href="/">
          <span className="mark" aria-hidden="true">
            <i />
          </span>
          ShiftLab
        </Link>
        <div className="stack" style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 56, margin: 0, letterSpacing: "-.03em" }}>404</h1>
          <p style={{ color: "var(--color-muted)" }}>This page is not in the queue.</p>
          <Link className="btn primary" href="/">
            Back to ShiftLab
          </Link>
        </div>
      </main>
    </SiteShell>
  );
}
