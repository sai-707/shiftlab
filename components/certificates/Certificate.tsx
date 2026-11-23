"use client";

import { useId, useMemo } from "react";
import { KIND_META, issuedLabel, statement, topicsIn, verifyUrl, type Cert } from "@/lib/certificates";
import { qrModules, qrPath } from "@/lib/qr";
import { SITE_URL } from "@/lib/site";
import type { Difficulty } from "@/lib/types";

// The certificate, drawn as one SVG (1200 by 850) so the same picture can be shown on screen, saved as a PNG and shared.
// Two looks: a dark shield in the level's colour, and a platinum shield with four stacked chevrons for Master.
// Text is laid out by hand (SVG does not wrap), so every line break below is a decision made here, not by the browser.

const W = 1200;
const H = 850;

// Fonts. On screen the page's own fonts are used; the PNG export swaps them for system fonts, because an SVG saved as an image
// cannot reach the page's web fonts. Elements carry data-f so the export knows which one to swap.
const FONT_SCREEN = {
  sans: "var(--font-inter), Inter, system-ui, 'Segoe UI', Arial, sans-serif",
  mono: "var(--font-jetbrains-mono), 'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace",
  serif: "Georgia, 'Times New Roman', serif",
};
export const FONT_EXPORT = {
  sans: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  mono: "Menlo, Consolas, 'DejaVu Sans Mono', monospace",
  serif: "Georgia, 'Times New Roman', serif",
};
type F = keyof typeof FONT_SCREEN;
const font = (f: F) => ({ "data-f": f, style: { fontFamily: FONT_SCREEN[f] } }) as const;

const INK = "#e6eaf0";
const MUTED = "#8b96a5";
const SOFT = "#a3aebd";
const LINE = "#2a3340";
const LEVEL_ORDER: Difficulty[] = ["Beginner", "Intermediate", "Hard", "AI Era"];

type Word = { t: string; b?: boolean; hl?: boolean };

/** Greedy line breaking by character count. Georgia at 20 px runs about 9.3 px a character, so 76 characters fit in 780 px. */
function wrap(words: Word[], max: number): Word[][] {
  const pieces: Word[] = [];
  for (const w of words) for (const p of w.t.split(/(?<= )/)) pieces.push({ ...w, t: p });
  const lines: Word[][] = [[]];
  let n = 0;
  for (const p of pieces) {
    if (n + p.t.trim().length > max && n > 0) {
      lines.push([]);
      n = 0;
    }
    lines[lines.length - 1].push(p);
    n += p.t.length;
  }
  return lines.map((l) => {
    const copy = [...l];
    if (copy.length) copy[copy.length - 1] = { ...copy[copy.length - 1], t: copy[copy.length - 1].t.replace(/ $/, "") };
    return copy;
  });
}

function Statement({ words, y, size, color, accent, max }: { words: Word[]; y: number; size: number; color: string; accent: string; max: number }) {
  const lines = wrap(words, max);
  return (
    <g>
      {lines.map((line, i) => (
        <text key={i} x={W / 2} y={y + i * size * 1.6} textAnchor="middle" fontSize={size} fontWeight={500} fill={color} {...font("serif")}>
          {line.map((w, j) => (
            <tspan key={j} fontWeight={w.b ? 700 : 500} fill={w.hl ? accent : w.b ? "#f2f5fa" : color}>
              {w.t}
            </tspan>
          ))}
        </text>
      ))}
    </g>
  );
}

function Rule({ y, color }: { y: number; color: string }) {
  const id = useId();
  return (
    <g>
      <defs>
        <linearGradient id={`${id}l`} x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="1" stopColor={color} />
        </linearGradient>
        <linearGradient id={`${id}r`} x1="1" x2="0">
          <stop offset="0" stopColor={color} stopOpacity="0" />
          <stop offset="1" stopColor={color} />
        </linearGradient>
      </defs>
      <rect x={346} y={y - 4} width={64} height={1.5} fill={`url(#${id}l)`} />
      <text x={W / 2} y={y} textAnchor="middle" fontSize={12} fontWeight={500} letterSpacing="3.8" fill={MUTED} {...font("mono")}>
        THIS CERTIFIES THAT
      </text>
      <rect x={790} y={y - 4} width={64} height={1.5} fill={`url(#${id}r)`} />
    </g>
  );
}

function Brand({ y }: { y: number }) {
  return (
    <g>
      <rect x={528} y={y} width={40} height={40} rx={11} fill="#151a22" stroke={LINE} />
      <text x={548} y={y + 26} textAnchor="middle" fontSize={17} fontWeight={600} fill="#22d3ee" {...font("mono")}>
        {">_"}
      </text>
      <text x={580} y={y + 28} fontSize={22} fontWeight={600} fill={INK} {...font("sans")}>
        ShiftLab
      </text>
    </g>
  );
}

function Foot({ cert, top, accent, sample }: { cert: Cert; top: number; accent: string; sample: boolean }) {
  const url = sample ? SITE_URL : verifyUrl(cert.id);
  const mods = useMemo(() => qrModules(url), [url]);
  const quiet = 3;
  const n = mods.length + quiet * 2;
  const size = 84;
  const host = SITE_URL.replace("https://", "");
  return (
    <g>
      {/* dark modules on a light tile: scanners read this reliably, an inverted code often fails */}
      <g transform={`translate(74 ${top})`}>
        <rect width={size} height={size} rx={8} fill={INK} />
        <g transform={`translate(${(size / n) * quiet} ${(size / n) * quiet}) scale(${size / n})`}>
          <path d={qrPath(mods)} fill="#0b0e13" />
        </g>
      </g>
      <text x={176} y={top + 30} fontSize={12} fontWeight={500} letterSpacing="1.7" fill={MUTED} {...font("sans")}>
        SCAN TO VERIFY
      </text>
      <text x={176} y={top + 54} fontSize={13} fill={INK} {...font("mono")}>
        {host}
      </text>
      <text x={176} y={top + 72} fontSize={13} fill={MUTED} {...font("mono")}>
        {sample ? "/verify/your-certificate-id" : `/verify/${cert.id.slice(0, 7)}…`}
      </text>

      <text x={720} y={top + 30} textAnchor="middle" fontSize={12} fontWeight={500} letterSpacing="1.7" fill={MUTED} {...font("sans")}>
        CERTIFICATE ID
      </text>
      <text x={720} y={top + 58} textAnchor="middle" fontSize={18} fontWeight={500} fill={accent} {...font("mono")}>
        {cert.id}
      </text>

      <text x={1126} y={top + 30} textAnchor="end" fontSize={12} fontWeight={500} letterSpacing="1.7" fill={MUTED} {...font("sans")}>
        ISSUED
      </text>
      <text x={1126} y={top + 58} textAnchor="end" fontSize={18} fontWeight={500} fill={INK} {...font("sans")}>
        {issuedLabel(cert.issuedAt)}
      </text>
    </g>
  );
}

const Disclaimer = ({ y }: { y: number }) => (
  <text x={W / 2} y={y} textAnchor="middle" fontSize={12} fill="#6b7686" {...font("sans")}>
    Awarded for completing ShiftLab practice scenarios. This is not an accredited qualification.
  </text>
);

function Frame({ stroke, strokeSoft, glow, dots }: { stroke: string; strokeSoft: string; glow: string; dots?: boolean }) {
  const id = useId();
  return (
    <g>
      <defs>
        <radialGradient id={`${id}g`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={glow} stopOpacity="0.2" />
          <stop offset="1" stopColor={glow} stopOpacity="0" />
        </radialGradient>
        {dots && (
          <pattern id={`${id}d`} width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#c8d3e4" fillOpacity="0.1" />
          </pattern>
        )}
      </defs>
      <rect width={W} height={H} fill="#0b0e13" />
      <ellipse cx={W / 2} cy={dots ? 160 : 520} rx={dots ? 470 : 400} ry={dots ? 340 : 380} fill={`url(#${id}g)`} />
      {dots && <rect width={W} height={H} fill={`url(#${id}d)`} />}
      <rect x={30} y={30} width={W - 60} height={H - 60} rx={22} fill="none" stroke={LINE} />
      <rect x={44} y={44} width={W - 88} height={H - 88} rx={16} fill="none" stroke={stroke} strokeOpacity={dots ? 0.45 : 0.35} />
      {dots && <rect x={56} y={56} width={W - 112} height={H - 112} rx={11} fill="none" stroke={strokeSoft} strokeOpacity={0.18} />}
    </g>
  );
}

function fit(name: string, base: number) {
  // A long name shrinks so it never runs into the frame (about 0.55 of the font size per character).
  return Math.max(30, Math.min(base, Math.floor(980 / (name.length * 0.56))));
}

function Stat({ x, value, unit, label, color }: { x: number; value: string; unit?: string; label: string; color: string }) {
  return (
    <g>
      <text x={x} y={0} textAnchor="middle" fontSize={44} fontWeight={600} fill={color} {...font("mono")}>
        {value}
        {unit && (
          <tspan fontSize={22} fill={MUTED}>
            {unit}
          </tspan>
        )}
      </text>
      <text x={x} y={26} textAnchor="middle" fontSize={12} fontWeight={500} letterSpacing="1.7" fill={MUTED} {...font("sans")}>
        {label}
      </text>
    </g>
  );
}

function LevelCertificate({ cert, sample }: { cert: Cert; sample: boolean }) {
  const color = KIND_META[cert.kind].color;
  const nameSize = fit(cert.holder, 68);
  const topics = cert.kind === "Master" ? null : topicsIn(cert.kind as Difficulty);
  return (
    <g>
      <Frame stroke={color} strokeSoft={color} glow={color} />
      <Brand y={64} />
      <g transform="translate(548 130)">
        <svg width="104" height="121" viewBox="0 0 120 140" fill="none" overflow="visible">
          <path d="M60 6 L108 24 V68 C108 100 86 122 60 134 C34 122 12 100 12 68 V24 Z" fill={color} fillOpacity="0.1" stroke={color} strokeWidth="4" strokeLinejoin="round" />
          <path d="M60 20 L96 33 V68 C96 93 80 110 60 120 C40 110 24 93 24 68 V33 Z" stroke={color} strokeOpacity="0.45" strokeWidth="2" />
          <path d="M42 70 L55 83 L80 54" stroke={color} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </g>
      <text x={W / 2} y={292} textAnchor="middle" fontSize={13} fontWeight={500} letterSpacing="3.9" fill={color} {...font("mono")}>
        {cert.kind.toUpperCase()} LEVEL COMPLETE
      </text>
      <Rule y={332} color={color} />
      <text x={W / 2} y={332 + 14 + nameSize * 0.78} textAnchor="middle" fontSize={nameSize} fontWeight={600} letterSpacing={-nameSize * 0.025} fill={INK} {...font("sans")}>
        {cert.holder}
      </text>
      <Statement words={statement(cert)} y={332 + 14 + nameSize * 0.78 + 46} size={20} color={SOFT} accent={color} max={76} />
      <g transform="translate(0 618)">
        <Stat x={W / 2 - 240} value={String(cert.alerts)} unit={` / ${cert.alerts}`} label="ALERTS CLOSED" color={INK} />
        <rect x={W / 2 - 120} y={-34} width={1} height={64} fill={LINE} />
        <Stat x={W / 2} value={String(cert.avg)} unit=" / 100" label="AVERAGE SCORE" color={color} />
        <rect x={W / 2 + 120} y={-34} width={1} height={64} fill={LINE} />
        <Stat x={W / 2 + 240} value={String(topics ?? "")} label="SKILLS PRACTISED" color={INK} />
      </g>
      <Foot cert={cert} top={684} accent={color} sample={sample} />
      <Disclaimer y={790} />
    </g>
  );
}

function MasterCertificate({ cert, sample }: { cert: Cert; sample: boolean }) {
  const id = useId();
  const nameSize = fit(cert.holder, 76);
  const cardW = 238;
  const gap = 14;
  const x0 = (W - (cardW * 4 + gap * 3)) / 2;
  return (
    <g>
      <Frame stroke="#c8d3e4" strokeSoft="#c8d3e4" glow="#c8d3e4" dots />
      <Brand y={62} />
      <g transform="translate(552 124)">
        <svg width="96" height="112" viewBox="0 0 120 140" fill="none" overflow="visible">
          <defs>
            <linearGradient id={`${id}p`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" />
              <stop offset="0.5" stopColor="#c8d3e4" />
              <stop offset="1" stopColor="#8394ad" />
            </linearGradient>
          </defs>
          <path d="M60 6 L108 24 V68 C108 100 86 122 60 134 C34 122 12 100 12 68 V24 Z" fill="#c8d3e4" fillOpacity="0.08" stroke={`url(#${id}p)`} strokeWidth="4" strokeLinejoin="round" />
          <path d="M60 20 L96 33 V68 C96 93 80 110 60 120 C40 110 24 93 24 68 V33 Z" stroke="#c8d3e4" strokeOpacity="0.4" strokeWidth="2" />
          {(
            [
              ["36,92 60,76 84,92", "#34d399"],
              ["36,77 60,61 84,77", "#60a5fa"],
              ["36,62 60,46 84,62", "#fb923c"],
              ["36,47 60,31 84,47", "#a78bfa"],
            ] as const
          ).map(([pts, c]) => (
            <polyline key={c} points={pts} stroke={c} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          ))}
        </svg>
      </g>
      <defs>
        <linearGradient id={`${id}t`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#c8d3e4" />
          <stop offset="1" stopColor="#8394ad" />
        </linearGradient>
      </defs>
      <text x={W / 2} y={266} textAnchor="middle" fontSize={13} fontWeight={500} letterSpacing="4.4" fill={`url(#${id}t)`} {...font("mono")}>
        MASTER · SOC LEVEL 1 ANALYST
      </text>
      <Rule y={304} color="#c8d3e4" />
      <text x={W / 2} y={304 + 12 + nameSize * 0.8} textAnchor="middle" fontSize={nameSize} fontWeight={600} letterSpacing={-nameSize * 0.02} fill="#f2f5fa" {...font("serif")}>
        {cert.holder}
      </text>
      <Statement words={statement(cert)} y={304 + 12 + nameSize * 0.8 + 42} size={20} color={SOFT} accent="#f2f5fa" max={78} />
      <g transform={`translate(${x0} 548)`}>
        {LEVEL_ORDER.map((lv, i) => {
          const m = KIND_META[lv];
          const total = cert.levels?.[lv];
          return (
            <g key={lv} transform={`translate(${i * (cardW + gap)} 0)`}>
              <rect width={cardW} height={110} rx={14} fill="#151a22" fillOpacity="0.9" stroke={LINE} />
              <rect x={16} y={14} width={cardW - 32} height={4} rx={2} fill={m.color} />
              <text x={16} y={46} fontSize={14} fontWeight={600} fill={INK} {...font("sans")}>
                {lv}
              </text>
              <text x={16} y={80} fontSize={26} fontWeight={600} fill={m.color} {...font("mono")}>
                {total ?? "–"}
                <tspan fontSize={13} fill={MUTED}>
                  {" / 100"}
                </tspan>
              </text>
              <text x={16} y={99} fontSize={12} fill={MUTED} {...font("sans")}>
                average score
              </text>
            </g>
          );
        })}
      </g>
      <rect x={74} y={668} width={W - 148} height={1} fill="#c8d3e4" fillOpacity="0.22" />
      <Foot cert={cert} top={684} accent="#c8d3e4" sample={sample} />
      <Disclaimer y={789} />
    </g>
  );
}

/** The certificate picture. `sample` marks a made-up example (no real id, the code points at the home page). */
export default function Certificate({ cert, sample = false, className }: { cert: Cert; sample?: boolean; className?: string }) {
  const label = `${cert.kind === "Master" ? "Master" : `${cert.kind} level`} certificate for ${cert.holder}, average score ${cert.avg} out of 100`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} className={className} xmlns="http://www.w3.org/2000/svg" data-certificate>
      {cert.kind === "Master" ? <MasterCertificate cert={cert} sample={sample} /> : <LevelCertificate cert={cert} sample={sample} />}
      {sample && (
        <g transform="translate(1040 74) rotate(8)">
          <rect x={-58} y={-18} width={116} height={32} rx={8} fill="#0b0e13" fillOpacity="0.85" stroke={MUTED} strokeDasharray="4 4" />
          <text x={0} y={4} textAnchor="middle" fontSize={13} fontWeight={600} letterSpacing="3" fill={MUTED} {...font("mono")}>
            SAMPLE
          </text>
        </g>
      )}
    </svg>
  );
}

export { W as CERT_W, H as CERT_H };
