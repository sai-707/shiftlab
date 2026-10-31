/** The ShiftLab mark: a terminal prompt in a rounded tile. Same drawing as app/icon.svg and docs/banner.png; here the cursor blinks and the chevron breathes (app/globals.css). */
export function BrandMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`shrink-0 ${className}`} aria-hidden="true">
      <rect x="4" y="4" width="56" height="56" rx="15" fill="#141b24" stroke="#2a3441" strokeWidth="2" />
      <path className="brand-chevron" d="M20 22l12 10-12 10" fill="none" stroke="#22d3ee" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
      <path className="brand-cursor" d="M36 44h10" fill="none" stroke="#e6edf5" strokeWidth="4.5" strokeLinecap="round" />
    </svg>
  );
}
