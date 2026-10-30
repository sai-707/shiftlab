"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { visitorId } from "@/lib/visitor";

/** Reports one page view per page, to /api/e. Sends nothing for admin pages or when the browser says "Do Not Track". */
export default function Tracker() {
  const path = usePathname();
  useEffect(() => {
    if (navigator.doNotTrack === "1" || path.startsWith("/admin")) return;
    navigator.sendBeacon("/api/e", JSON.stringify({ p: path, v: visitorId() }));
  }, [path]);
  return null;
}
