"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updatePassword } from "@/app/auth-actions";
import { checkPassword } from "@/lib/authChecks";
import PasswordMeter from "./PasswordMeter";

// The page the reset-password email leads to. The visitor is already signed in with a short recovery session.
export default function ResetCard() {
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const report = checkPassword(pw, "", "");

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!pw) return setErr("Enter a new password.");
    if (report.block) return setErr(report.block);
    setErr("");
    start(async () => {
      const r = await updatePassword(pw);
      if ("error" in r) setErr(r.error);
    });
  };

  return (
    <div className="card">
      <h1 className="t">Choose a new password</h1>
      <form onSubmit={onSubmit} noValidate>
        <div className="field">
          <label htmlFor="reset-pw">New password</label>
          <div className="inp">
            <input
              id="reset-pw"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              aria-describedby="reset-pw-err"
              aria-invalid={err ? true : undefined}
              style={{ paddingRight: 64 }}
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setErr("");
              }}
            />
            <button type="button" className="eye" aria-label="Show password" aria-pressed={showPw} onClick={() => setShowPw((s) => !s)}>
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          <PasswordMeter report={report} hasValue={!!pw} />
          <p className="err" id="reset-pw-err" role="alert">
            {err}
          </p>
        </div>
        <button className="btn primary submit" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save password"}
        </button>
      </form>
    </div>
  );
}
