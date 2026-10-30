"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// A random id kept in this browser so the admin dashboard can count visitors. It holds no name or email and is
// never joined to a person unless they are signed in. A browser that blocks storage simply is not counted.
function visitorId(): string | undefined {
  try {
    let id = localStorage.getItem("shiftlab.vid.v1");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("shiftlab.vid.v1", id);
    }
    return id;
  } catch {
    return undefined;
  }
}

/** Reports one page view per page, to /api/e. Sends nothing for admin pages or when the browser says "Do Not Track". */
export default function Tracker() {
  const path = usePathname();
  useEffect(() => {
    if (navigator.doNotTrack === "1" || path.startsWith("/admin")) return;
    navigator.sendBeacon("/api/e", JSON.stringify({ p: path, v: visitorId() }));
  }, [path]);
  return null;
}
