// A small QR code encoder, so the certificate can carry a scannable link without a package.
// Byte mode, error correction level M, versions 1 to 9 (up to 180 characters), the mask picked by the standard penalty rules.
// Used only for short public links such as the certificate verify address.

// Per version at level M: [error-correction codewords per block, [[block count, data codewords per block], ...]].
const BLOCKS: [number, [number, number][]][] = [
  [10, [[1, 16]]],
  [16, [[1, 28]]],
  [26, [[1, 44]]],
  [18, [[2, 32]]],
  [24, [[2, 43]]],
  [16, [[4, 27]]],
  [18, [[4, 31]]],
  [22, [[2, 38], [2, 39]]],
  [22, [[3, 36], [2, 37]]],
];
const ALIGN: number[][] = [[], [6, 18], [6, 22], [6, 26], [6, 30], [6, 34], [6, 22, 38], [6, 24, 42], [6, 26, 46]];

// Arithmetic in GF(256), polynomial 0x11D.
const EXP = new Array<number>(512);
const LOG = new Array<number>(256);
for (let i = 0, x = 1; i < 255; i++) {
  EXP[i] = x;
  LOG[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
const mul = (a: number, b: number) => (a && b ? EXP[LOG[a] + LOG[b]] : 0);

function ecBytes(data: number[], count: number): number[] {
  let gen = [1];
  for (let i = 0; i < count; i++) {
    const next = new Array<number>(gen.length + 1).fill(0);
    gen.forEach((g, j) => {
      next[j] ^= g;
      next[j + 1] ^= mul(g, EXP[i]);
    });
    gen = next;
  }
  const rem = new Array<number>(count).fill(0);
  for (const d of data) {
    const factor = d ^ rem[0];
    rem.shift();
    rem.push(0);
    for (let i = 0; i < count; i++) rem[i] ^= mul(gen[i + 1], factor);
  }
  return rem;
}

const dataCapacity = (v: number) => BLOCKS[v - 1][1].reduce((n, [c, d]) => n + c * d, 0);

function codewords(bytes: number[], version: number): number[] {
  const bits: number[] = [];
  const push = (value: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) bits.push((value >> i) & 1);
  };
  push(0b0100, 4);
  push(bytes.length, 8);
  bytes.forEach((b) => push(b, 8));
  const capacityBits = dataCapacity(version) * 8;
  push(0, Math.min(4, capacityBits - bits.length));
  while (bits.length % 8) bits.push(0);
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) data.push(parseInt(bits.slice(i, i + 8).join(""), 2));
  for (let pad = 0xec; data.length < dataCapacity(version); pad ^= 0xec ^ 0x11) data.push(pad);

  const [ecLen, groups] = BLOCKS[version - 1];
  const blocks: { data: number[]; ec: number[] }[] = [];
  let at = 0;
  for (const [count, size] of groups)
    for (let i = 0; i < count; i++) {
      const chunk = data.slice(at, at + size);
      at += size;
      blocks.push({ data: chunk, ec: ecBytes(chunk, ecLen) });
    }
  const out: number[] = [];
  const longest = Math.max(...blocks.map((b) => b.data.length));
  for (let i = 0; i < longest; i++) blocks.forEach((b) => i < b.data.length && out.push(b.data[i]));
  for (let i = 0; i < ecLen; i++) blocks.forEach((b) => out.push(b.ec[i]));
  return out;
}

const bch = (value: number, poly: number, bitsOfPoly: number) => {
  let v = value << (bitsOfPoly - 1);
  for (let i = 31; i >= bitsOfPoly - 1; i--) if ((v >> i) & 1) v ^= poly << (i - (bitsOfPoly - 1));
  return v;
};

type Grid = { size: number; dark: boolean[][]; fixed: boolean[][] };

function frame(version: number): Grid {
  const size = 17 + 4 * version;
  const dark = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const fixed = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  const set = (r: number, c: number, on: boolean) => {
    if (r < 0 || c < 0 || r >= size || c >= size) return;
    dark[r][c] = on;
    fixed[r][c] = true;
  };
  const finder = (r0: number, c0: number) => {
    for (let r = -1; r <= 7; r++)
      for (let c = -1; c <= 7; c++) {
        const inside = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const on = inside && (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4));
        set(r0 + r, c0 + c, on);
      }
  };
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);
  for (let i = 8; i < size - 8; i++) {
    set(6, i, i % 2 === 0);
    set(i, 6, i % 2 === 0);
  }
  const centres = ALIGN[version - 1];
  for (const r of centres)
    for (const c of centres) {
      if ((r === 6 && c === 6) || (r === 6 && c === centres[centres.length - 1]) || (c === 6 && r === centres[centres.length - 1])) continue;
      for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
    }
  // Reserve the format areas; they are filled once the mask is chosen.
  for (let i = 0; i < 9; i++) {
    if (i === 6) continue; // the timing pattern runs through here
    set(8, i, false);
    set(i, 8, false);
  }
  for (let i = 0; i < 8; i++) {
    set(8, size - 1 - i, false);
    set(size - 1 - i, 8, false);
  }
  set(size - 8, 8, true); // the always-dark module
  if (version >= 7) {
    // Version information, written twice: 6 by 3 modules beside the top-right and the bottom-left finder.
    const bits = (version << 12) | bch(version, 0x1f25, 13);
    for (let i = 0; i < 18; i++) {
      const on = ((bits >> i) & 1) === 1;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      set(b, a, on);
      set(a, b, on);
    }
  }
  return { size, dark, fixed };
}

function place(grid: Grid, words: number[]) {
  const { size, dark, fixed } = grid;
  const bits: boolean[] = [];
  words.forEach((w) => {
    for (let i = 7; i >= 0; i--) bits.push(((w >> i) & 1) === 1);
  });
  let k = 0;
  let up = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) col--;
    for (let n = 0; n < size; n++) {
      const r = up ? size - 1 - n : n;
      for (const c of [col, col - 1]) {
        if (fixed[r][c]) continue;
        dark[r][c] = k < bits.length ? bits[k] : false;
        k++;
      }
    }
    up = !up;
  }
}

const MASKS: ((r: number, c: number) => boolean)[] = [
  (r, c) => (r + c) % 2 === 0,
  (r) => r % 2 === 0,
  (_r, c) => c % 3 === 0,
  (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
  (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
  (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];

function withMask(grid: Grid, mask: number, version: number): boolean[][] {
  const { size } = grid;
  const m = grid.dark.map((row) => row.slice());
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!grid.fixed[r][c] && MASKS[mask](r, c)) m[r][c] = !m[r][c];
  // Format bits: level M is 00, then the mask number, with a 10-bit error code, xor 0x5412.
  const format = ((mask << 10) | bch(mask, 0x537, 11)) ^ 0x5412;
  const bit = (i: number) => ((format >> i) & 1) === 1;
  for (let i = 0; i <= 5; i++) m[i][8] = bit(i);
  m[7][8] = bit(6);
  m[8][8] = bit(7);
  m[8][7] = bit(8);
  for (let i = 9; i < 15; i++) m[8][14 - i] = bit(i);
  for (let i = 0; i < 8; i++) m[8][size - 1 - i] = bit(i);
  for (let i = 8; i < 15; i++) m[size - 15 + i][8] = bit(i);
  m[size - 8][8] = true;
  void version;
  return m;
}

function penalty(m: boolean[][]): number {
  const n = m.length;
  let score = 0;
  for (let pass = 0; pass < 2; pass++) {
    const at = (i: number, j: number) => (pass ? m[j][i] : m[i][j]);
    for (let i = 0; i < n; i++) {
      let run = 1;
      for (let j = 1; j < n; j++) {
        if (at(i, j) === at(i, j - 1)) run++;
        else {
          if (run >= 5) score += run - 2;
          run = 1;
        }
      }
      if (run >= 5) score += run - 2;
      for (let j = 0; j + 10 < n; j++) {
        const pattern = [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0];
        const mirror = [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1];
        if (pattern.every((v, k) => (at(i, j + k) ? 1 : 0) === v) || mirror.every((v, k) => (at(i, j + k) ? 1 : 0) === v)) score += 40;
      }
    }
  }
  for (let r = 0; r + 1 < n; r++) for (let c = 0; c + 1 < n; c++) if (m[r][c] === m[r][c + 1] && m[r][c] === m[r + 1][c] && m[r][c] === m[r + 1][c + 1]) score += 3;
  const darkCount = m.flat().filter(Boolean).length;
  score += Math.floor(Math.abs((darkCount * 100) / (n * n) - 50) / 5) * 10;
  return score;
}

/** The modules of a QR code for `text` (true = dark), without the quiet zone. Throws if the text is longer than 180 characters. */
export function qrModules(text: string): boolean[][] {
  const bytes = [...new TextEncoder().encode(text)];
  let version = 1;
  while (version <= BLOCKS.length && dataCapacity(version) < bytes.length + 2) version++;
  if (version > BLOCKS.length) throw new Error("QR text too long");
  const grid = frame(version);
  place(grid, codewords(bytes, version));
  let best: boolean[][] | null = null;
  let bestScore = Infinity;
  for (let mask = 0; mask < 8; mask++) {
    const candidate = withMask(grid, mask, version);
    const s = penalty(candidate);
    if (s < bestScore) {
      bestScore = s;
      best = candidate;
    }
  }
  return best!;
}

/** SVG path data for the dark modules, one unit square each, so it scales cleanly. Width and height are modules.length. */
export function qrPath(modules: boolean[][]): string {
  let d = "";
  modules.forEach((row, r) => {
    let c = 0;
    while (c < row.length) {
      if (!row[c]) {
        c++;
        continue;
      }
      let end = c;
      while (end < row.length && row[end]) end++;
      d += `M${c} ${r}h${end - c}v1h-${end - c}z`;
      c = end;
    }
  });
  return d;
}
