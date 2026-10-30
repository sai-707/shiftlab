import Link from "next/link";
import type { ReactNode } from "react";
import DottedWordmark from "./DottedWordmark";
import SiteShell from "./SiteShell";

// Shared frame for /login, /signup and /reset-password: the wordmark above a glass card (passed in as children).
export default function AuthPage({ children }: { children: ReactNode }) {
  return (
    <SiteShell>
      <main className="auth">
        <Link className="brand" href="/">
          <span className="mark" aria-hidden="true">
            <i />
          </span>
          ShiftLab
        </Link>
        <div className="stack">
          <DottedWordmark scale={0.8} gap={5} />
          {children}
        </div>
      </main>
    </SiteShell>
  );
}
