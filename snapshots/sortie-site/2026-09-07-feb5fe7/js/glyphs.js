// ── Glyph codec ──────────────────────────────────────────────
// A part icon is 16x16 pixels at 2 bits each. Stored as 128 hex chars, eight
// per row.
//
// The four levels exist so the sprites can carry a light source. Cell shading
// with one consistent direction (top-left) is what `pixel-art-professional`
// prescribes at this size; it also rules out antialiasing, which that skill
// says not to use below 16x16.

export const GLYPH_SIZE = 16;
const ROW_CHARS = 8;
const LEGACY_SIZE = 12;
const CELLS = GLYPH_SIZE * GLYPH_SIZE;
export const LEVELS = 4;

// Two earlier formats, both on a 12x12 grid: 36 chars at one bit, 72 at two.
// Neither is rescaled on the way in. A 12 -> 16 resample is a 4:3 ratio, which
// duplicates every third pixel column and wrecks art drawn a pixel at a time;
// centring the old grid inside the new one keeps it exact.
const LEGACY_1BIT_CHARS = 36;
const LEGACY_2BIT_CHARS = 72;
const LEGACY_PAD = (GLYPH_SIZE - LEGACY_SIZE) / 2;

export const EMPTY_GLYPH = '0'.repeat(GLYPH_SIZE * ROW_CHARS);

/** Decode any supported glyph string into 144 level values. */
export function cellsFromHex(hex) {
  const src = String(hex || '');
  const out = new Uint8Array(CELLS);
  const put = (r, c, v) => { out[r * GLYPH_SIZE + c] = v; };

  if (src.length <= LEGACY_1BIT_CHARS) {
    const legacy = src.padEnd(LEGACY_1BIT_CHARS, '0');
    for (let r = 0; r < LEGACY_SIZE; r++) {
      const v = parseInt(legacy.slice(r * 3, r * 3 + 3), 16) || 0;
      for (let c = 0; c < LEGACY_SIZE; c++) {
        if (v & (1 << (LEGACY_SIZE - 1 - c))) put(r + LEGACY_PAD, c + LEGACY_PAD, 3);
      }
    }
    return out;
  }

  if (src.length <= LEGACY_2BIT_CHARS) {
    const legacy = src.padEnd(LEGACY_2BIT_CHARS, '0');
    for (let r = 0; r < LEGACY_SIZE; r++) {
      const v = parseInt(legacy.slice(r * 6, r * 6 + 6), 16) || 0;
      for (let c = 0; c < LEGACY_SIZE; c++) {
        put(r + LEGACY_PAD, c + LEGACY_PAD, (v >> (2 * (LEGACY_SIZE - 1 - c))) & 3);
      }
    }
    return out;
  }

  const full = src.padEnd(GLYPH_SIZE * ROW_CHARS, '0');
  for (let r = 0; r < GLYPH_SIZE; r++) {
    const row = full.slice(r * ROW_CHARS, r * ROW_CHARS + ROW_CHARS);
    for (let c = 0; c < GLYPH_SIZE; c++) {
      // Parsed a nibble at a time: 16 cells x 2 bits is 32 bits, and a single
      // parseInt of the row would overflow a JS bitwise operand.
      const nib = parseInt(row[c >> 1], 16) || 0;
      put(r, c, (nib >> (2 * (1 - (c & 1)))) & 3);
    }
  }
  return out;
}

export function hexFromCells(cells) {
  let out = '';
  for (let r = 0; r < GLYPH_SIZE; r++) {
    for (let c = 0; c < GLYPH_SIZE; c += 2) {
      const hi = cells[r * GLYPH_SIZE + c] & 3;
      const lo = cells[r * GLYPH_SIZE + c + 1] & 3;
      out += ((hi << 2) | lo).toString(16);
    }
  }
  return out;
}

/**
 * SVG path for one ink level, merging horizontal runs so a glyph draws as a
 * handful of subpaths rather than 144 rects.
 */
export function glyphPath(hex, level) {
  const cells = cellsFromHex(hex);
  let d = '';
  for (let r = 0; r < GLYPH_SIZE; r++) {
    let c = 0;
    while (c < GLYPH_SIZE) {
      if (cells[r * GLYPH_SIZE + c] !== level) { c++; continue; }
      let end = c;
      while (end + 1 < GLYPH_SIZE && cells[r * GLYPH_SIZE + end + 1] === level) end++;
      d += `M${c} ${r}h${end - c + 1}v1h-${end - c + 1}z`;
      c = end + 1;
    }
  }
  return d;
}

/*
 * The four inks, and what they mean.
 *
 *   0 transparent  the accent tile shows through
 *   1 key          dark: the contour, and every cut inside the shape
 *   2 shade        recessed or secondary surface
 *   3 light        primary armour surface
 *
 * Level 1 is a *colour*, not white at low opacity. That is the whole fix for
 * the sprites reading puffy: with only translucent white available, every
 * level moved toward the tile and nothing could ever be darker than it, so
 * shapes had no hard edge to sit against.
 */
export const LEVEL_CLASS = [null, 'g-key', 'g-mid', 'g-lit'];

export function mirrorGlyph(hex) {
  const cells = cellsFromHex(hex);
  const out = new Uint8Array(CELLS);
  for (let r = 0; r < GLYPH_SIZE; r++) {
    for (let c = 0; c < GLYPH_SIZE; c++) {
      out[r * GLYPH_SIZE + (GLYPH_SIZE - 1 - c)] = cells[r * GLYPH_SIZE + c];
    }
  }
  return hexFromCells(out);
}

/** Flatten every inked pixel to one level. */
export function flattenGlyph(hex, level = 3) {
  const cells = cellsFromHex(hex);
  for (let i = 0; i < cells.length; i++) if (cells[i]) cells[i] = level;
  return hexFromCells(cells);
}

export function invertGlyph(hex) {
  const cells = cellsFromHex(hex);
  for (let i = 0; i < cells.length; i++) cells[i] = cells[i] ? 0 : 3;
  return hexFromCells(cells);
}

/**
 * Wrap a silhouette in a dark contour, dilating outward by one pixel.
 *
 * Outward, so the authored shape survives intact and simply gains a hard edge
 * against the accent tile. The shader this replaces lit every top-left
 * boundary pixel and shadowed every bottom-right one, which bevels the whole
 * perimeter uniformly: on a typical part that was 48 of 70 inked pixels spent
 * on bevel, and a shape that is mostly bevel reads as puffy no matter how it
 * was drawn.
 *
 * Anything already inked keeps its level, so a hand-placed dark cut (a vent, a
 * visor) survives and composes with the contour.
 */
export function keyline(hex) {
  const cells = cellsFromHex(hex);
  const at = (r, c) =>
    (r >= 0 && c >= 0 && r < GLYPH_SIZE && c < GLYPH_SIZE) ? cells[r * GLYPH_SIZE + c] : 0;
  const out = Uint8Array.from(cells);
  for (let r = 0; r < GLYPH_SIZE; r++) {
    for (let c = 0; c < GLYPH_SIZE; c++) {
      if (at(r, c) !== 0) continue;
      if (at(r - 1, c) > 1 || at(r + 1, c) > 1 || at(r, c - 1) > 1 || at(r, c + 1) > 1) {
        out[r * GLYPH_SIZE + c] = 1;
      }
    }
  }
  return hexFromCells(out);
}

/**
 * Inner SVG markup for a glyph: one path per ink level, from shadow to
 * highlight. Level 0 is never emitted. Fill comes from `currentColor` so the
 * tile's own --glyph-ink drives it; the levels differ only by opacity, which
 * keeps a part legible against any accent.
 */
export function glyphSvgInner(hex) {
  let out = '';
  for (let level = 1; level < LEVELS; level++) {
    const d = glyphPath(hex, level);
    // crispEdges: every run is axis-aligned, so antialiasing only ever softens
    // a pixel boundary that should be hard.
    if (d) out += `<path class="${LEVEL_CLASS[level]}" d="${d}" shape-rendering="crispEdges"/>`;
  }
  return out;
}
