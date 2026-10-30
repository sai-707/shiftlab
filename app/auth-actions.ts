"use server";

// Account actions: sign up, sign in, sign out, password reset. Every input is checked again here with the same
// rules as the form, because the browser cannot be trusted. Success redirects; failure returns a plain-English message.

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkEmail, checkPassword } from "@/lib/authChecks";
import { createClient } from "@/lib/supabase/server";

type Result = { error: string } | { notice: string };

// Plain-English text for the Supabase error codes a student can hit. Anything else gets the generic line.
function friendly(error: { code?: string; status?: number }): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Email or password is wrong.";
    case "email_not_confirmed":
      return "Confirm your email first. Check your inbox for the link.";
    case "user_already_exists":
    case "email_exists":
      return "That email already has an account. Sign in instead.";
    case "weak_password":
      return "Pick a stronger password.";
    case "same_password":
      return "That is your current password. Pick a new one.";
    case "email_address_invalid":
      return "That email address is not accepted.";
    case "signup_disabled":
      return "Sign-ups are closed right now.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many tries. Wait a few minutes and try again.";
    default:
      console.error("[auth]", error.code, error.status); // code and status only, never the email
      return "Something went wrong. Try again in a moment.";
  }
}

// Passing the address as "kept" turns off the misspelled-provider hint, which is a browser nicety. The shape check still runs.
const emailProblem = (email: string) => {
  const r = checkEmail(email, email);
  return r?.t === "invalid" ? r.m : "";
};

export async function signUp(input: { name: string; email: string; password: string }): Promise<Result> {
  const email = input.email.trim();
  const name = input.name.trim().slice(0, 40);
  const problem = emailProblem(email) || checkPassword(input.password, email, name).block;
  if (problem) return { error: problem };

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: { data: { display_name: name }, emailRedirectTo: origin ? `${origin}/auth/callback` : undefined },
  });
  if (error) return { error: friendly(error) };
  if (data.session) redirect("/dashboard"); // email confirmation is off: signed in straight away
  // Same answer if the address already has an account, so this form cannot be used to find who is registered.
  return { notice: "Check your email for a confirmation link, then sign in." };
}

export async function signIn(input: { email: string; password: string }): Promise<Result> {
  const email = input.email.trim();
  const problem = emailProblem(email) || (input.password ? "" : "Enter your password.");
  if (problem) return { error: problem };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: input.password });
  if (error) return { error: friendly(error) };
  // An admin goes straight to the admin dashboard. The (app) layout sends admins there anyway, so this only saves a hop;
  // if the role cannot be read, fall back to /dashboard and let that gate decide.
  const { data: row } = data.user ? await supabase.from("profiles").select("role").eq("id", data.user.id).maybeSingle() : { data: null };
  redirect(row?.role === "admin" ? "/admin" : "/dashboard");
}

// "Continue with Google": one button for new and returning people. Supabase makes the account on the first sign-in.
// The return trip lands on /auth/callback, which swaps the code for a session (same page the email links use).
export async function signInWithGoogle(): Promise<{ error: string }> {
  const origin = (await headers()).get("origin");
  if (!origin) return { error: "Something went wrong. Try again in a moment." };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${origin}/auth/callback` } });
  if (error || !data.url) {
    console.error("[auth] google", error?.code, error?.status); // code and status only
    return { error: "Google sign-in is not available right now. Use email instead." };
  }
  redirect(data.url); // only returns an error; success leaves the page
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordReset(emailInput: string): Promise<Result> {
  const email = emailInput.trim();
  const problem = emailProblem(email);
  if (problem) return { error: problem };

  const origin = (await headers()).get("origin");
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: origin ? `${origin}/auth/callback?next=/reset-password` : undefined,
  });
  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") return { error: friendly(error) };
  if (error) console.error("[auth] reset", error.code, error.status);
  // Same answer whether or not the address has an account.
  return { notice: "If that email has an account, a reset link is on its way." };
}

// Used on /reset-password, after the email link has signed the visitor in with a short recovery session.
export async function updatePassword(password: string): Promise<Result> {
  const block = checkPassword(password, "", "").block;
  if (block) return { error: block };

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return { error: "This reset link has expired. Request a new one from the sign-in page." };
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: friendly(error) };
  redirect("/dashboard");
}
