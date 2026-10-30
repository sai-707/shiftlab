"use client";

import Link from "next/link";
import { useRef, useState, useSyncExternalStore, useTransition, type FormEvent } from "react";
import { requestPasswordReset, signIn, signInWithGoogle, signUp } from "@/app/auth-actions";
import { checkEmail, checkPassword, type EmailResult } from "@/lib/authChecks";
import PasswordMeter from "./PasswordMeter";

type Mode = "in" | "up";

// The hash is never sent to a server, so it is read with useSyncExternalStore: empty during server render, real value after.
const noop = () => () => {};
const linkExpired = () => location.hash === "#link-expired";
const googleFailed = () => location.hash === "#google-failed";

export default function AuthCard({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [kept, setKept] = useState(""); // an address the user chose to keep despite a suggested fix
  const [emailRes, setEmailRes] = useState<EmailResult>(null);
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwErr, setPwErr] = useState("");
  const [formErr, setFormErr] = useState(""); // an error that came back from the server
  const [note, setNote] = useState("");
  const [pending, start] = useTransition();
  const expired = useSyncExternalStore(noop, linkExpired, () => false);
  const gFailed = useSyncExternalStore(noop, googleFailed, () => false);
  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);

  const up = mode === "up";
  const report = checkPassword(pw, email, name);
  const shownNote = note || (expired ? "That link expired or was already used. Sign in, or ask for a new reset link." : gFailed ? "Google sign-in did not finish. Try again, or use email." : "");

  const switchMode = (m: Mode) => {
    setMode(m);
    setEmailRes(null);
    setPwErr("");
    setFormErr("");
    setNote("");
    window.history.replaceState(null, "", m === "up" ? "/signup" : "/login"); // keep the address bar honest, no navigation
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const res = checkEmail(email, kept);
    const err = !pw ? "Enter your password." : up ? report.block : pw.length < 8 ? "Use at least 8 characters." : "";
    setEmailRes(res);
    setPwErr(err);
    setFormErr("");
    setNote("");
    if (res || err) {
      (res ? emailRef : pwRef).current?.focus();
      return;
    }
    // A misspelled-but-kept address is fine to send; the server only checks its shape.
    start(async () => {
      const r = up ? await signUp({ name, email, password: pw }) : await signIn({ email, password: pw });
      if ("error" in r) setFormErr(r.error);
      else setNote(r.notice);
    });
  };

  const google = () => {
    setFormErr("");
    setNote("");
    start(async () => {
      const r = await signInWithGoogle(); // on success the page navigates away, so only an error comes back
      if (r?.error) setFormErr(r.error);
    });
  };

  const forgot = () => {
    const res = checkEmail(email, kept);
    setFormErr("");
    setNote("");
    if (res) {
      setEmailRes(res);
      emailRef.current?.focus();
      return;
    }
    start(async () => {
      const r = await requestPasswordReset(email);
      if ("error" in r) setFormErr(r.error);
      else setNote(r.notice);
    });
  };

  return (
    <div className="card">
      <h1 className="t">{up ? "Create your account" : "Welcome back"}</h1>

      <div className="seg" data-mode={mode} role="group" aria-label="Sign in or create account">
        <span className="thumb" aria-hidden="true" />
        <button type="button" aria-pressed={!up} onClick={() => switchMode("in")}>
          Sign in
        </button>
        <button type="button" aria-pressed={up} onClick={() => switchMode("up")}>
          Create account
        </button>
      </div>

      <button type="button" className="btn guest google" onClick={google} disabled={pending}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
          <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.5 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9z" />
        </svg>
        Continue with Google
      </button>
      <div className="or">or use email</div>

      <form onSubmit={onSubmit} noValidate>
        <div className={up ? "collapse open" : "collapse"} inert={!up}>
          <div>
            <div className="field">
              <label htmlFor="auth-name">Display name</label>
              <div className="inp">
                <input id="auth-name" type="text" autoComplete="nickname" placeholder="What should we call you?" maxLength={40} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <div className="field">
          <label htmlFor="auth-email">Email</label>
          <div className="inp">
            <input
              ref={emailRef}
              id="auth-email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              aria-describedby="auth-email-err"
              aria-invalid={emailRes ? true : undefined}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailRes(null);
              }}
              onBlur={() => email.trim() && setEmailRes(checkEmail(email, kept))}
            />
          </div>
          <p className="err" id="auth-email-err" role="alert">
            {emailRes?.t === "invalid" && emailRes.m}
            {emailRes?.t === "typo" && (
              <>
                That email provider looks misspelled. Did you mean{" "}
                <button
                  type="button"
                  onClick={() => {
                    setEmail(emailRes.fix);
                    setEmailRes(null);
                    emailRef.current?.focus();
                  }}
                >
                  {emailRes.fix}
                </button>
                ? <span className="sep">or</span>{" "}
                <button
                  type="button"
                  onClick={() => {
                    setKept(email.trim());
                    setEmailRes(null);
                  }}
                >
                  Keep as typed
                </button>
              </>
            )}
          </p>
        </div>

        <div className="field">
          <label htmlFor="auth-pw">Password</label>
          <div className="inp">
            <input
              ref={pwRef}
              id="auth-pw"
              type={showPw ? "text" : "password"}
              autoComplete={up ? "new-password" : "current-password"}
              placeholder="At least 8 characters"
              aria-describedby="auth-pw-err"
              aria-invalid={pwErr ? true : undefined}
              style={{ paddingRight: 64 }}
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setPwErr("");
              }}
            />
            <button type="button" className="eye" aria-label="Show password" aria-pressed={showPw} onClick={() => setShowPw((s) => !s)}>
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          <div className={up ? "collapse open" : "collapse"} inert={!up}>
            <div>
              <PasswordMeter report={report} hasValue={!!pw} />
            </div>
          </div>
          <p className="err" id="auth-pw-err" role="alert">
            {pwErr}
          </p>
        </div>

        <p className="err" role="alert">
          {formErr}
        </p>
        <button className="btn primary submit" type="submit" disabled={pending}>
          {pending ? (up ? "Creating account…" : "Signing in…") : up ? "Create account" : "Sign in"}
        </button>
        {!up && (
          <p className="small">
            <button type="button" onClick={forgot} disabled={pending}>
              Forgot your password?
            </button>
          </p>
        )}
        {shownNote && (
          <p className="small" role="status">
            {shownNote}
          </p>
        )}
      </form>

      <div className="or">or</div>
      <Link className="btn guest" href="/dashboard">
        Continue as guest
      </Link>
    </div>
  );
}
