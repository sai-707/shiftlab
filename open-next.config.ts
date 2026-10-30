import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// Pages Next prepares at build time are served from the free static-assets store (no R2, no card needed).
// shortcut: that store is read-only, so nothing is revalidated at runtime; add R2 if pages ever need to refresh themselves.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
});
