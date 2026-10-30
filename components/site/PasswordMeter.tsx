import type { PwReport } from "@/lib/authChecks";

const CHECKS = [
  { k: "len", label: "8+ characters" },
  { k: "mixed", label: "Upper and lower case" },
  { k: "num", label: "A number" },
  { k: "sym", label: "A symbol" },
] as const;
const LEVELS = ["", "Weak", "Fair", "Good", "Strong"];

// Four-bar strength meter, one-line hint and a live checklist. Shared by the sign-up form and the reset-password form.
export default function PasswordMeter({ report, hasValue }: { report: PwReport; hasValue: boolean }) {
  return (
    <>
      <div className="meter" data-s={report.level} aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="mrow">
        <p className="hint" aria-live="polite">
          {hasValue ? report.hint : "Start typing to check your password."}
        </p>
        <span className="lvl" data-s={report.level}>
          {LEVELS[report.level]}
        </span>
      </div>
      <ul className="checks" aria-label="Password checklist">
        {CHECKS.map((c) => (
          <li key={c.k} className={report.checks[c.k] ? "ok" : undefined}>
            {c.label}
          </li>
        ))}
      </ul>
    </>
  );
}
