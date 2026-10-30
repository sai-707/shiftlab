import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Only the public pages. The student workspace needs no sign-in, but it is not a page to find through a search engine.
export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/guide", "/login", "/signup", "/privacy"].map((p) => ({ url: `${SITE_URL}${p}` }));
}
