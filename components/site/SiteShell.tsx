import type { ReactNode } from "react";
import Beams from "./Beams";
import SiteEffects from "./SiteEffects";
import "./site.css";

// Wrapper for the public pages (landing, login, signup). Lives outside the (app) layout on purpose,
// so none of the app chrome (sidebar, threat map) loads here.
export default function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="site">
      <Beams />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <SiteEffects />
      {children}
    </div>
  );
}
