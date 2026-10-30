"use client";

import type { ReactNode } from "react";
import { FEEDBACK_EVENT } from "@/lib/feedbackRules";

/** A "Send feedback" button that opens the window. Style it with className like a link. */
export default function FeedbackLink({ className, children = "Send feedback" }: { className?: string; children?: ReactNode }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(FEEDBACK_EVENT))}>
      {children}
    </button>
  );
}
