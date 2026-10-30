"use client";

import Link from "next/link";

// Shown when a page crashes. Plain markup on purpose: if the shared site pieces were what broke, this must still draw.
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{ minHeight: "100svh", display: "grid", placeItems: "center", textAlign: "center", padding: 24, background: "var(--color-void)", color: "var(--color-ink)" }}>
      <div>
        <h1 style={{ fontSize: 28, margin: "0 0 8px" }}>Something went wrong</h1>
        <p style={{ color: "var(--color-muted)", margin: "0 0 20px" }}>Your saved progress is safe. Try again, or go back to the start.</p>
        <button onClick={reset} style={{ marginRight: 12, padding: "10px 18px", borderRadius: 10, border: "1px solid var(--color-line)", background: "var(--color-panel)", color: "inherit", cursor: "pointer" }}>
          Try again
        </button>
        <Link href="/" style={{ color: "var(--color-accent)" }}>
          Home
        </Link>
      </div>
    </main>
  );
}
