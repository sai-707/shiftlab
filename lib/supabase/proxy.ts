import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Runs on every request (see proxy.ts at the project root). Two jobs:
// 1. keep a signed-in visitor's session fresh (Supabase tokens expire after about an hour),
// 2. send an already signed-in visitor from /login and /signup to the dashboard.
// Guests are never blocked: the app works without an account.
export async function updateSession(request: NextRequest) {
  // No Supabase cookie means a guest. Nothing to refresh, so skip the network call.
  if (!request.cookies.getAll().some((c) => c.name.startsWith("sb-"))) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  let cacheHeaders: Record<string, string> = {};
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(list, headers) {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
        // Supabase asks for no-store on responses that carry session cookies, so a CDN never serves one person's session to another.
        cacheHeaders = headers;
        for (const [k, v] of Object.entries(headers)) response.headers.set(k, v);
      },
    },
  });

  // Nothing may run between createServerClient and getClaims, or visitors get signed out at random.
  const { data } = await supabase.auth.getClaims();

  const { pathname } = request.nextUrl;
  if (data?.claims && (pathname === "/login" || pathname === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    for (const c of response.cookies.getAll()) redirect.cookies.set(c); // keep any refreshed session on the redirect
    for (const [k, v] of Object.entries(cacheHeaders)) redirect.headers.set(k, v);
    return redirect;
  }
  return response;
}
