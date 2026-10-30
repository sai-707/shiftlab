import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase client for Server Components, Server Actions and Route Handlers.
// Make a new one per request: it holds that visitor's cookies, so never keep it in a module-level variable.
// In a Server Component, call `await connection()` (from "next/server") before this: Supabase reads the clock, which Next.js
// only allows at request time. Server Actions and Route Handlers already run at request time and do not need it.
// Only the publishable key is used here, it is safe in the browser. The secret/service_role key never goes in this project.
export async function createClient() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll(list) {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Called from a Server Component, which cannot write cookies. Fine: proxy.ts refreshes the session on every request.
        }
      },
    },
  });
}
