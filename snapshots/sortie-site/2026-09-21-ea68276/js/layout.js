// ── Silhouette layout ────────────────────────────────────────
// Every preset returns slot positions in "core units": the core sits at (0,0)
// and one unit is one tile pitch. The matrix centers the bounding box of the
// result, so a preset never has to know the stage size.

import { SLOTS } from './parts.js';

export const PRESETS = [
  { id: 'frame', label: 'Frame', hint: 'Mech silhouette' },
  { id: 'arc', label: 'Arc', hint: 'Two rings around the core' },
  { id: 'grid', label: 'Grid', hint: 'Dense block' },
];

/*
 * Column/row offsets from the core.
 *
 * The core must be flanked on all four sides or the mech reads as two
 * disconnected columns with the mark floating between them, which is exactly
 * what the first version did: it left (0,-1), (-1,0) and (1,0) empty, cutting
 * a cross-shaped hole through the middle of the torso. The generator sits
 * directly above the core, the FCS directly below, and the arm units to either
 * side, so the body is one solid mass before anything hangs off it.
 */
const FRAME = {
  head: [0, -3],
  backL: [-1, -2], sensor: [0, -2], backR: [1, -2],
  shldL: [-2, -1], coreL: [-1, -1], genr: [0, -1], coreR: [1, -1], shldR: [2, -1],
  armL: [-2, 0], handL: [-1, 0], /* core at [0, 0] */ handR: [1, 0], armR: [2, 0],
  hipL: [-1, 1], fcs: [0, 1], hipR: [1, 1],
  thighL: [-1, 2], boost: [0, 2], thighR: [1, 2],
  legL: [-1, 3], legR: [1, 3],
};

function framePositions() {
  const out = {};
  for (const { id } of SLOTS) {
    const [x, y] = FRAME[id] || [0, 0];
    out[id] = { x, y };
  }
  return out;
}

// Inner ring takes the first third, outer ring the rest. Both start at 12
// o'clock and run clockwise so the boot order sweeps the dial.
function arcPositions() {
  const ids = SLOTS.map((s) => s.id);
  const innerCount = Math.round(ids.length / 3);
  const out = {};
  ids.forEach((id, i) => {
    const inner = i < innerCount;
    const n = inner ? innerCount : ids.length - innerCount;
    const k = inner ? i : i - innerCount;
    const angle = (k / n) * Math.PI * 2 - Math.PI / 2;
    const r = inner ? 1.75 : 3.15;
    out[id] = { x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  });
  return out;
}

// Square block with the core holding the middle cell.
function gridPositions() {
  const ids = SLOTS.map((s) => s.id);
  const cols = Math.ceil(Math.sqrt(ids.length + 1));
  const rows = Math.ceil((ids.length + 1) / cols);
  const midC = Math.floor(cols / 2);
  const midR = Math.floor(rows / 2);
  const out = {};
  let cell = 0;
  for (const id of ids) {
    let c = cell % cols;
    let r = Math.floor(cell / cols);
    if (c === midC && r === midR) { cell++; c = cell % cols; r = Math.floor(cell / cols); }
    out[id] = { x: c - midC, y: r - midR };
    cell++;
  }
  return out;
}

/*
 * Alternate forms. The frame keeps its 21 parts and rearranges them: the same
 * machine folding, not a different model swapped in. Both keep the core
 * flanked, for the same reason the frame does.
 */
const FLIGHT = {
  head: [0, -3],
  sensor: [-1, -2], genr: [0, -2],
  fcs: [0, -1],
  armL: [-3, 0], shldL: [-2, 0], handL: [-1, 0], handR: [1, 0], shldR: [2, 0], armR: [3, 0],
  backL: [-2, 1], hipL: [-1, 1], boost: [0, 1], hipR: [1, 1], backR: [2, 1],
  coreL: [-1, 2], coreR: [1, 2],
  thighL: [-1, 3], thighR: [1, 3],
  legL: [-1, 4], legR: [1, 4],
};

const SIEGE = {
  backL: [-2, -2], head: [0, -2], backR: [2, -2],
  sensor: [-1, -1], genr: [0, -1], fcs: [1, -1],
  armL: [-3, 0], handL: [-2, 0], coreL: [-1, 0], coreR: [1, 0], handR: [2, 0], armR: [3, 0],
  shldL: [-2, 1], hipL: [-1, 1], boost: [0, 1], hipR: [1, 1], shldR: [2, 1],
  thighL: [-2, 2], legL: [-1, 2], legR: [1, 2], thighR: [2, 2],
};

/** Transformation targets, each with its own palette and stat profile. */
export const FORMS = [
  { id: 'flight', label: 'Flight', banner: 'Flight form engaged',
    color: '#5eead4', rgb: '94, 234, 212',
    mult: { atk: 0.88, imp: 0.78, rng: 1.34, ap: 0.8 } },
  { id: 'siege', label: 'Siege', banner: 'Siege form engaged',
    color: '#fb923c', rgb: '251, 146, 60',
    mult: { atk: 1.24, imp: 1.32, rng: 1.06, ap: 1.4 } },
];

export const FORM_BY_ID = Object.fromEntries(FORMS.map((f) => [f.id, f]));

const fixed = (map) => () => {
  const out = {};
  for (const { id } of SLOTS) {
    const [x, y] = map[id] || [0, 0];
    out[id] = { x, y };
  }
  return out;
};

const BUILDERS = {
  frame: framePositions,
  arc: arcPositions,
  grid: gridPositions,
  flight: fixed(FLIGHT),
  siege: fixed(SIEGE),
};

/**
 * Slot positions plus the transform the matrix needs: the bounding box of
 * every tile *and* the core, so nothing clips and the composition is centered.
 */
export function layoutFor(preset) {
  const build = BUILDERS[preset] || BUILDERS.frame;
  const pos = build();
  const xs = [0], ys = [0];
  for (const p of Object.values(pos)) { xs.push(p.x); ys.push(p.y); }
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  return {
    pos,
    // half-extent in tile pitches, used to size one pitch against the stage
    spanX: maxX - minX + 1,
    spanY: maxY - minY + 1,
    // shift that recenters the bounding box on the stage center
    offsetX: -(minX + maxX) / 2,
    offsetY: -(minY + maxY) / 2,
  };
}
