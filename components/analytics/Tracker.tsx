"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { visitorId } from "@/lib/visitor";

/** Reports one page view per page, to /api/e, with the ?ref= label if the address has one. Sends nothing for admin pages or when the browser says "Do Not Track". */
export default function Tracker() {
  const path = usePathname();
  useEffect(() => {
    if (navigator.doNotTrack === "1" || path.startsWith("/admin")) return;
    // A link like /?ref=linkedin-post2 says which post brought the visit. The server checks the label; it only ever sees that one value.
    const s = new URLSearchParams(window.location.search).get("ref")?.slice(0, 40);
    navigator.sendBeacon("/api/e", JSON.stringify({ p: path, v: visitorId(), ...(s ? { s } : {}) }));
  }, [path]);
  return null;
}
