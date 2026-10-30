import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Lets you open the dev server from this computer's network address, not only localhost.
  // shortcut: hard-coded to one address, update it if your IP changes (only affects `npm run dev`)
  allowedDevOrigins: ["192.168.1.6"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
