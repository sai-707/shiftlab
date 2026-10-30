"use client";

import { useEffect } from "react";

// Page-level behaviour with no markup of its own: reveal-on-scroll and the sticky nav border.
// Sets data-js on <html> so the CSS only hides .rv elements when this script is going to reveal them.
export default function SiteEffects() {
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.js = "";

    const nav = document.querySelector(".site .nav");
    const onScroll = () => nav?.classList.toggle("stuck", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll(".site .rv").forEach((el) => io.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
      delete html.dataset.js;
    };
  }, []);

  return null;
}
