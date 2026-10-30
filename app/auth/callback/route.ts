import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Where the links in Supabase's emails land (confirm email, reset password). It swaps the one-time code for a session.
// shortcut: this uses the code (PKCE) flow, which only works when the link is opened in the same browser that asked for it.
// To make links work from a phone too, switch to Supabase's token_hash email templates and call verifyOtp here.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "";
  const target = /^\/(?![/\\])/.test(next) ? next : "/dashboard"; // same-site paths only, never another domain

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(target, origin));
  }
  return NextResponse.redirect(new URL("/login#link-expired", origin));
}
