import type { NextConfig } from "next";

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "form-action 'self' https://*.supabase.co https://accounts.google.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Lets you open the dev server from this computer's network address, not only localhost.
  // shortcut: hard-coded to one address, update it if your IP changes (only affects `npm run dev`)
  allowedDevOrigins: ["192.168.1.6"],
  // Safe-by-default browser rules, plus a Content-Security-Policy in REPORT-ONLY mode: the browser lists anything it would block in the
  // console (look for "Content-Security-Policy-Report-Only") but blocks nothing. After a clean browse of the whole site, change the header name below
  // to "Content-Security-Policy" to enforce it. 'unsafe-inline' stays for scripts and styles because Next.js writes inline ones; a nonce would remove it.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          { key: "Content-Security-Policy-Report-Only", value: CSP },
        ],
      },
    ];
  },
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
