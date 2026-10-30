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
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // First Google sign-in: the profile name is empty, so fill it from the Google name. Best effort; /welcome still asks if it fails.
      const googleName = data.user?.user_metadata?.full_name;
      if (data.user && typeof googleName === "string" && googleName.trim()) {
        await supabase.from("profiles").update({ display_name: Array.from(googleName.trim()).slice(0, 40).join("") }).eq("id", data.user.id).eq("display_name", "");
      }
      return NextResponse.redirect(new URL(target, origin));
    }
  }
  // Google sends ?error=... when the person cancels; email links just carry a bad or used code.
  const failed = searchParams.has("error") ? "#google-failed" : "#link-expired";
  return NextResponse.redirect(new URL(`/login${failed}`, origin));
}
