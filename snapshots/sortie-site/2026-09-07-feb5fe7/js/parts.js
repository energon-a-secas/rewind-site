// ── Part model ───────────────────────────────────────────────
// Follows Armored Core 6's assembly: a frame (head, core, arms, legs and the
// plating around them), three internals (generator, FCS, booster), and four
// weapon hardpoints (left and right arm units, left and right back units).
//
// Two budgets come out of that and drive the whole console: total weight
// against the legs' load capacity, and total EN load against the generator's
// output. Both can be blown, which is the point.

export { GLYPH_SIZE, EMPTY_GLYPH, cellsFromHex, hexFromCells, glyphPath, mirrorGlyph,
         invertGlyph, flattenGlyph, keyline, glyphSvgInner, LEVEL_CLASS, LEVELS } from './glyphs.js';

/** Display stats, shown as bars. Weight and EN load are budgets, not bars. */
export const STATS = [
  { key: 'atk', label: 'ATTACK' },
  { key: 'imp', label: 'IMPACT' },
  { key: 'rng', label: 'RANGE' },
  { key: 'ap', label: 'ARMOR' },
];

// ── Slots ────────────────────────────────────────────────────
// `wave` splits the boot sequence: the frame powers up first, radiating out
// from the core, and the accessories attach afterwards. `order` is the radial
// distance used to sequence each wave.

export const SLOTS = [
  { id: 'genr', label: 'Generator', kind: 'internal', wave: 0, order: 1 },
  { id: 'fcs', label: 'FCS', kind: 'internal', wave: 0, order: 1 },
  { id: 'handL', label: 'Arm Unit L', kind: 'frame', wave: 0, order: 1 },
  { id: 'handR', label: 'Arm Unit R', kind: 'frame', wave: 0, order: 1 },
  { id: 'coreL', label: 'Core L', kind: 'frame', wave: 0, order: 2 },
  { id: 'coreR', label: 'Core R', kind: 'frame', wave: 0, order: 2 },
  { id: 'hipL', label: 'Hip L', kind: 'frame', wave: 0, order: 2 },
  { id: 'hipR', label: 'Hip R', kind: 'frame', wave: 0, order: 2 },
  { id: 'sensor', label: 'Sensor', kind: 'frame', wave: 0, order: 2 },
  { id: 'boost', label: 'Booster', kind: 'internal', wave: 0, order: 2 },
  { id: 'head', label: 'Head', kind: 'frame', wave: 0, order: 3 },

  { id: 'shldL', label: 'Shoulder L', kind: 'frame', wave: 1, order: 1 },
  { id: 'shldR', label: 'Shoulder R', kind: 'frame', wave: 1, order: 1 },
  { id: 'thighL', label: 'Thigh L', kind: 'frame', wave: 1, order: 1 },
  { id: 'thighR', label: 'Thigh R', kind: 'frame', wave: 1, order: 1 },
  { id: 'armL', label: 'L-Arm Unit', kind: 'hardpoint', wave: 1, order: 2 },
  { id: 'armR', label: 'R-Arm Unit', kind: 'hardpoint', wave: 1, order: 2 },
  { id: 'backL', label: 'L-Back Unit', kind: 'hardpoint', wave: 1, order: 2 },
  { id: 'backR', label: 'R-Back Unit', kind: 'hardpoint', wave: 1, order: 2 },
  { id: 'legL', label: 'Legs L', kind: 'frame', wave: 1, order: 3 },
  { id: 'legR', label: 'Legs R', kind: 'frame', wave: 1, order: 3 },
];

export const SLOT_LABEL = Object.fromEntries(SLOTS.map((s) => [s.id, s.label]));
export const SLOT_KIND = Object.fromEntries(SLOTS.map((s) => [s.id, s.kind]));

/** Boot order: wave, then radial distance, so the frame lights up outward. */
export const BOOT_ORDER = [...SLOTS].sort(
  (a, b) => a.wave - b.wave || a.order - b.order || a.id.localeCompare(b.id),
);

// ── Stock catalog ────────────────────────────────────────────

export const STOCK_PARTS = [
  { id: 'fr-head', name: 'VP-44S Sentry', cls: 'Head', slot: 'head', glyph: '050000501f4001f407d147d001f7df40017ffd4007ffffd007f55fd0075ff5d007ffffd001ffff4001d55740005ff50000055000000000000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 62, wgt: 480, en: 120 }, stock: true },
  { id: 'fr-head-l', name: 'HC-2000 Finder', cls: 'Head', slot: 'head', glyph: '0000000000000000050000501f4141f407d7d7d00157d54001ffff4001ffff4001d7d74001ffff40007ffd0000755d0000100400000000000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 44, wgt: 310, en: 90 }, stock: true },
  { id: 'fr-head-h', name: 'HD-011 Melander', cls: 'Head', slot: 'head', glyph: '00000000000140000057d50005ffff501ffffff4055555501ffffff41d5ff5741ffffff41ffffff407ffffd0075555d0017ffd40001554000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 78, wgt: 760, en: 180 }, stock: true },
  { id: 'fr-sensor', name: 'AS-5000 Lattice', cls: 'Sensor', slot: 'sensor', glyph: '001ff4000007d0000007d0000007d0000017d400005ff500007ffd00007ffd0001ffff40007ffd00007ffd00005ff50000155400000000000000000000000000', stats: { atk: 0, imp: 0, rng: 40, ap: 30, wgt: 260, en: 80 }, stock: true },
  { id: 'fr-coreL', name: 'BD-011 Bastion', cls: 'Core', slot: 'coreL', glyph: '0000000000000000055555501ffffff41ffffff47ff55ffd7ffffffd7d5ff57d7d5ff57d7d5eb57d1ffd7ff41ffd7ff41ffffff4055555500000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 88, wgt: 2400, en: 260 }, stock: true },
  { id: 'fr-coreR', name: 'BD-011 Bastion', cls: 'Core', slot: 'coreR', glyph: '0000000000000000055555501ffffff41ffffff47ff55ffd7ffffffd7d5ff57d7d5ff57d7d5eb57d1ffd7ff41ffd7ff41ffffff4055555500000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 88, wgt: 2400, en: 260 }, stock: true },
  { id: 'fr-coreL-l', name: 'CC-2000 Orbiter', cls: 'Core', slot: 'coreL', glyph: '0000000000000000000000000155554007ffffd007fd7fd01ffffff41f5ff5f41f5ff5f41f5ff5f407fd7fd007fd7fd001541540000000000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 58, wgt: 1500, en: 180 }, stock: true },
  { id: 'fr-coreR-l', name: 'CC-2000 Orbiter', cls: 'Core', slot: 'coreR', glyph: '0000000000000000000000000155554007ffffd007fd7fd01ffffff41f5ff5f41f5ff5f41f5ff5f407fd7fd007fd7fd001541540000000000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 58, wgt: 1500, en: 180 }, stock: true },
  { id: 'fr-handL', name: 'AA-J-123 Basho', cls: 'Arms', slot: 'handL', glyph: '000000000000000000051400055f7d501fff7df41fff7df41d7f7df41d7555501d7ffff41d7ffff41ff555501ff4000005500000000000000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 60, wgt: 1800, en: 210 }, stock: true },
  { id: 'fr-handR', name: 'AA-J-123 Basho', cls: 'Arms', slot: 'handR', glyph: '000000000000000000145000057df5501f7dfff41f7dfff41f7dfd7405555d741ffffd741ffffd7405555ff400001ff400000550000000000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 60, wgt: 1800, en: 210 }, stock: true },
  { id: 'fr-shldL', name: 'SB-9 Bulwark', cls: 'Shoulder', slot: 'shldL', glyph: '0000000000000000155550007ffff4007ffff5507d5556a47ffffea47ffffea47d555ea47fffff507fffff401ffffd0007fff400015550000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 74, wgt: 980, en: 100 }, stock: true },
  { id: 'fr-shldR', name: 'SB-9 Bulwark', cls: 'Shoulder', slot: 'shldR', glyph: '000000000000000000055554001ffffd055ffffd1a95557d1abffffd1abffffd1ab5557d05fffffd01fffffd007ffff4001fffd0000555400000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 74, wgt: 980, en: 100 }, stock: true },
  { id: 'fr-hipL', name: 'HG-004 Girdle', cls: 'Hip', slot: 'hipL', glyph: '0000000000000000000000000155554007ffffd007ffffd007f55fd01ffffff41ffffff41f5555f41ffffff407ffffd001fd7f40005415000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 66, wgt: 720, en: 90 }, stock: true },
  { id: 'fr-hipR', name: 'HG-004 Girdle', cls: 'Hip', slot: 'hipR', glyph: '0000000000000000000000000155554007ffffd007ffffd007f55fd01ffffff41ffffff41f5555f41ffffff407ffffd001fd7f40005415000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 66, wgt: 720, en: 90 }, stock: true },
  { id: 'fr-thighL', name: 'LG-012 Stride', cls: 'Thigh', slot: 'thighL', glyph: '000000000055550001afff5001affff401a55ff401affff401affff401affff401affff401a55ff401affff401afff5000555500000000000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 58, wgt: 900, en: 110 }, stock: true },
  { id: 'fr-thighR', name: 'LG-012 Stride', cls: 'Thigh', slot: 'thighR', glyph: '000000000055550005fffa401ffffa401ff55a401ffffa401ffffa401ffffa401ffffa401ff55a401ffffa4005fffa4000555500000000000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 58, wgt: 900, en: 110 }, stock: true },
  { id: 'fr-legL', name: 'LG-033 Bipedal', cls: 'Legs', slot: 'legL', glyph: '00155400006bfd00006bfd0000695d00006bfd00006bfd00006bfd0001fffd0001fffd0001fffd4007ffffd00755557407fffff4015555500000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 70, wgt: 2600, en: 300, cap: 19000 }, stock: true },
  { id: 'fr-legR', name: 'LG-033 Bipedal', cls: 'Legs', slot: 'legR', glyph: '00155400007fe900007fe90000756900007fe900007fe900007fe900007fff40007fff40017fff4007ffffd01d5555d01fffffd0055555400000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 70, wgt: 2600, en: 300, cap: 19000 }, stock: true },
  { id: 'fr-legL-rj', name: 'LG-07 Reverse', cls: 'Legs', slot: 'legL', glyph: '001ffd00001ffd00001d5d00001ffd000007fd000007fd000057fd0001ffd40001ffd00005ffd0001fffd0001d55d0001fffd000055540000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 52, wgt: 1900, en: 340, cap: 15000 }, stock: true },
  { id: 'fr-legR-rj', name: 'LG-07 Reverse', cls: 'Legs', slot: 'legR', glyph: '007ff400007ff40000757400007ff400007fd000007fd000007fd5000017ff400007ff400007ff500007fff4000755740007fff4000155500000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 52, wgt: 1900, en: 340, cap: 15000 }, stock: true },
  { id: 'fr-legL-tk', name: 'LG-21 Tank', cls: 'Legs', slot: 'legL', glyph: '000000000000000000000000055555501aaaaaa41d5555741ffffff41d5555741f5ff5f41ffffff41ffffff40555555000000000000000000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 96, wgt: 4800, en: 420, cap: 28000 }, stock: true },
  { id: 'fr-legR-tk', name: 'LG-21 Tank', cls: 'Legs', slot: 'legR', glyph: '000000000000000000000000055555501aaaaaa41d5555741ffffff41d5555741f5ff5f41ffffff41ffffff40555555000000000000000000000000000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 96, wgt: 4800, en: 420, cap: 28000 }, stock: true },
  { id: 'in-genr', name: 'DF-GN-02 Solace', cls: 'Generator', slot: 'genr', glyph: '000140000007d0000017d400007ffd0001d55740075ff5d007755dd00777ddd01ddff7740777ddd007755dd0075ff5d001d7d740007ffd000017d40000014000', stats: { atk: 0, imp: 0, rng: 0, ap: 40, wgt: 3200, en: 0, out: 4400 }, stock: true },
  { id: 'in-genr-h', name: 'VP-20D Overdraw', cls: 'Generator', slot: 'genr', glyph: '00000000000040000015d500007fff4001ff7fd007f5d7f417dffdf47fdffdfd7f7f7ffd17dffdf407dffdf407f5d7f401ff7fd0007fff400015d50000004000', stats: { atk: 0, imp: 0, rng: 0, ap: 34, wgt: 4100, en: 0, out: 5800 }, stock: true },
  { id: 'in-fcs', name: 'FCS-G2 Osprey', cls: 'FCS', slot: 'fcs', glyph: '0007d0000557d5501ffffff41d57d5741dffff741dd557745dd04775ffd1d7ffffd7f7ff5dd1d7751dd557741dffff741d57d5741ffffff40557d5500007d000', stats: { atk: 0, imp: 0, rng: 60, ap: 26, wgt: 180, en: 140 }, stock: true },
  { id: 'in-boost', name: 'BST-G2 Ember', cls: 'Booster', slot: 'boost', glyph: '0154154007fd7fd007fd7fd0075d75d0075d75d0075d75d0075d75d007fd7fd01ffffff41d5555741ffffff407fd7fd001f41f4001f41f400050050000000000', stats: { atk: 0, imp: 0, rng: 0, ap: 30, wgt: 740, en: 380 }, stock: true },
  { id: 'wa-rifle-l', name: 'RF-024 Turner', cls: 'Assault Rifle', slot: 'armL', glyph: '00000000000000000000000000000000155555507ffffff5755557ff7ffffff5157fff50007fff4000155500007f4000007f4000001500000000000000000000', stats: { atk: 62, imp: 44, rng: 78, ap: 0, wgt: 1080, en: 160 }, stock: true },
  { id: 'wa-mg-l', name: 'MG-014 Ludlow', cls: 'Machine Gun', slot: 'armL', glyph: '00000000000000000000000000000000155555007fffff5575555fff7fffffff7fffff5517ff550007ff40001fdfd00007ff400007ff40000175000000100000', stats: { atk: 48, imp: 38, rng: 52, ap: 0, wgt: 920, en: 140 }, stock: true },
  { id: 'wa-shotgun-l', name: 'SG-027 Zimmerman', cls: 'Shotgun', slot: 'armL', glyph: '000000000000000000000000155555407fffffd0755557d0755557d07fffffd07fffffd015ffff4001ffff4001ffd50000554000000000000000000000000000', stats: { atk: 88, imp: 82, rng: 24, ap: 0, wgt: 1640, en: 190 }, stock: true },
  { id: 'wa-handgun-l', name: 'HG-003 Coquillett', cls: 'Handgun', slot: 'armL', glyph: '0000000000000000000000000155550007ffff400755574007ffff40017f5500007f4000007f4000007f4000007f4000007f4000001500000000000000000000', stats: { atk: 54, imp: 58, rng: 44, ap: 0, wgt: 620, en: 110 }, stock: true },
  { id: 'wa-gatling-l', name: 'DF-GA-08 Chang', cls: 'Gatling', slot: 'armL', glyph: '000000000000000000000000055555001fffff545d5555fdfd5555fdfd5555fdfffffffd5ffffffd1fffff54057fd500007fd000007fd0000015400000000000', stats: { atk: 70, imp: 30, rng: 46, ap: 0, wgt: 2380, en: 240 }, stock: true },
  { id: 'wa-bazooka-l', name: 'MJ-BZ-B Little', cls: 'Bazooka', slot: 'armL', glyph: '0000000000000000000000155555556affffffeaffffffeaf555556af555556affffffeaffffffea557fd56a007fd015007fd000007fd0000015400000000000', stats: { atk: 92, imp: 90, rng: 40, ap: 0, wgt: 2140, en: 210 }, stock: true },
  { id: 'wa-grenade-l', name: 'DF-GR-07 Gundy', cls: 'Grenade Launcher', slot: 'armL', glyph: '0000000000000000155550007ffff55475557ffd7ffffffd7ffff55415ffd00007fff40007fff4001ff7fd0007fff40007fff40001ffd000005d400000040000', stats: { atk: 96, imp: 94, rng: 36, ap: 0, wgt: 2760, en: 260 }, stock: true },
  { id: 'wa-laser-l', name: 'VP-66LR Laser', cls: 'Laser Rifle', slot: 'armL', glyph: '0000000000000000150000007f4000007f4000147f55557d7ffffffd7d5555fd7ffffffd7ffffffd7f7f557d7f7f40147f7f4000157f40000015000000000000', stats: { atk: 74, imp: 40, rng: 88, ap: 0, wgt: 1320, en: 420 }, stock: true },
  { id: 'wa-plasma-l', name: 'VP-66EG Plasma', cls: 'Plasma Rifle', slot: 'armL', glyph: '000000000000000000000000000001000000175015557ff47ffffffd75557ffd7fffffff7ffffffd15fdfffd01fd7ff401fd175001fd01000054000000000000', stats: { atk: 80, imp: 56, rng: 62, ap: 0, wgt: 1580, en: 480 }, stock: true },
  { id: 'wa-pulse-l', name: 'VE-66LRA Pulse', cls: 'Pulse Gun', slot: 'armL', glyph: '000000000000000000000000155555547ffffffd1f7df7d41f7df7d01f7df7d01f7df7d01f7df7d47ffffffd157f5554007f4000007f40000015000000000000', stats: { atk: 44, imp: 76, rng: 50, ap: 0, wgt: 980, en: 350 }, stock: true },
  { id: 'wa-linear-l', name: 'LR-036 Curtis', cls: 'Linear Rifle', slot: 'armL', glyph: '0000000000000000000000000155400007ffd00047ffd005d555555fffffffff555fffd5001fffd0001fd540001fd000001fd000001fd0000005400000000000', stats: { atk: 84, imp: 62, rng: 96, ap: 0, wgt: 1720, en: 330 }, stock: true },
  { id: 'wa-blade-l', name: 'HI-32 Dizzy', cls: 'Laser Blade', slot: 'armL', glyph: '000000050000001f0000007d000001f4000007d000001f4000007d000001f4000007d000001f4000057d00001ff400001d7400001ff400000550000000000000', stats: { atk: 94, imp: 70, rng: 12, ap: 0, wgt: 1260, en: 400 }, stock: true },
  { id: 'wa-pile-l', name: 'DF-ET-09 Trueno', cls: 'Pile Bunker', slot: 'armL', glyph: '001ff400001ff400001d7400001d7400001d7400001d7400001d7400005ff50001ffff4001d5574001ffff4001ffff40007ffd00007ffd000015540000000000', stats: { atk: 100, imp: 98, rng: 10, ap: 0, wgt: 2480, en: 220 }, stock: true },
  { id: 'wa-chainsaw-l', name: 'WB-0000 Bad Cook', cls: 'Chainsaw', slot: 'armL', glyph: '00000000000000001111111077777774777777747ffffff4755555747ffffff47ffffff415ff555001ff400001ff400001ff4000005500000000000000000000', stats: { atk: 98, imp: 86, rng: 10, ap: 0, wgt: 3100, en: 180 }, stock: true },
  { id: 'wa-baton-l', name: 'VP-67S Stun', cls: 'Stun Baton', slot: 'armL', glyph: '000000140000007d000001f4000007d000001f4000007d000001f4000007d000001f4000017d000007fd0000075d0000075d000007fd00000154000000000000', stats: { atk: 36, imp: 92, rng: 14, ap: 0, wgt: 840, en: 260 }, stock: true },
  { id: 'wb-missile-l', name: 'BML-G1 Missile', cls: 'Missile Launcher', slot: 'backL', glyph: '0000000000000000155555547ffffffd7555555d77df7dfd7555555d77df7dfd7555555d77df7dfd77df7dfd77df7dfd7ffffffd155555540000000000000000', stats: { atk: 66, imp: 50, rng: 82, ap: 0, wgt: 1480, en: 200 }, stock: true },
  { id: 'wb-vmissile-l', name: 'BML-G2 Vertical', cls: 'Vertical Missile', slot: 'backL', glyph: '0141414007d7d7d007d7d7d017d7d7d47ffffffd77df7dfd77df7dfd77df7dfd77df7dfd77df7dfd77df7dfd77df7dfd7ffffffd155555540000000000000000', stats: { atk: 72, imp: 54, rng: 90, ap: 0, wgt: 1860, en: 240 }, stock: true },
  { id: 'wb-cluster-l', name: 'BML-G3 Cluster', cls: 'Cluster Missile', slot: 'backL', glyph: '00000000000000000040404001d1d1d007f7f7f41f7f7f7d07f7f7f407ffffd007ffffd001d5d5d007f7f7f41f7f7f7d07f7f7f401d1d1d00040404000000000', stats: { atk: 58, imp: 62, rng: 74, ap: 0, wgt: 1640, en: 220 }, stock: true },
  { id: 'wb-gcannon-l', name: 'SONGBIRDS', cls: 'Grenade Cannon', slot: 'backL', glyph: '000000000000000055555554fffffffdd555557dd555557dfffffffd55ffff5401ffff4001ffff4001ffff4001ffff4001ffff40005555000000000000000000', stats: { atk: 98, imp: 96, rng: 56, ap: 0, wgt: 3840, en: 300 }, stock: true },
  { id: 'wb-lcannon-l', name: 'VP-60LCS Laser', cls: 'Laser Cannon', slot: 'backL', glyph: '0000000054000000fd000000fd000000fd555550fffffff45d5555741d5555745ffffff4fd7ffd50fd7ffd00fd7ffd00fd7ffd00547ffd000015540000000000', stats: { atk: 90, imp: 48, rng: 94, ap: 0, wgt: 2960, en: 620 }, stock: true },
  { id: 'wb-pcannon-l', name: 'VE-60SNA Pulse', cls: 'Pulse Cannon', slot: 'backL', glyph: '0007d0000007d0000015d500007fff4001ff7fd007f5d7f407dffdf407dffdf41f7fff7d07dffdf407dffdf407f5d7f401ff7fd0007fff400017d5000007d000', stats: { atk: 52, imp: 88, rng: 68, ap: 0, wgt: 2240, en: 540 }, stock: true },
  { id: 'wb-napalm-l', name: 'IA-C01W3 Napalm', cls: 'Napalm Bomb', slot: 'backL', glyph: '00000000155555547ffffffd7555555d7ffffffd17d7d7d407d7d7d007d7d7d007f7f7f41ffffffd07f7f7f401d1d1d000404040000000000000000000000000', stats: { atk: 76, imp: 44, rng: 48, ap: 0, wgt: 2080, en: 260 }, stock: true },
  { id: 'wb-orbit-l', name: 'IB-C03W2 Orbit', cls: 'Orbit Drone', slot: 'backL', glyph: '00000000000000000000000055000055ff4041ffff45d5ff551ffd55001ffd00007f7f40551ffd55ff5ffdffff45d5ff55004055000000000000000000000000', stats: { atk: 50, imp: 34, rng: 70, ap: 0, wgt: 1720, en: 580 }, stock: true },
  { id: 'wb-shield-l', name: 'SI-24 Shield', cls: 'Shield', slot: 'backL', glyph: '055555501ffffff41ffffff41ffd7ff41ffd7ff41ffd7ff41ffd7ff41ffd7ff41ffd7ff41ffd7ff407fd7fd001fd7f40007ffd00001ff4000005500000000000', stats: { atk: 0, imp: 20, rng: 0, ap: 0, wgt: 2340, en: 180 }, stock: true },
  { id: 'wb-pshield-l', name: 'IA-C01W7 Pulse', cls: 'Pulse Shield', slot: 'backL', glyph: '00000000000000000040404001d5d5d0077f7f741df517dd1dd141dd1dd7d1dd7747d0771dd141dd1dd001dd1df517dd077f7f74011515100000000000000000', stats: { atk: 0, imp: 30, rng: 0, ap: 0, wgt: 1560, en: 460 }, stock: true },
  { id: 'wa-rifle-r', name: 'RF-024 Turner', cls: 'Assault Rifle', slot: 'armR', glyph: '00000000000000000000000000000000055555545ffffffdffd5555d5ffffffd05fffd5401fffd00005554000001fd000001fd00000054000000000000000000', stats: { atk: 62, imp: 44, rng: 78, ap: 0, wgt: 1080, en: 160 }, stock: true },
  { id: 'wa-mg-r', name: 'MG-014 Ludlow', cls: 'Machine Gun', slot: 'armR', glyph: '000000000000000000000000000000000055555455fffffdfff5555dfffffffd55fffffd0055ffd40001ffd00007f7f40001ffd00001ffd000005d4000000400', stats: { atk: 48, imp: 38, rng: 52, ap: 0, wgt: 920, en: 140 }, stock: true },
  { id: 'wa-shotgun-r', name: 'SG-027 Zimmerman', cls: 'Shotgun', slot: 'armR', glyph: '0000000000000000000000000155555407fffffd07d5555d07d5555d07fffffd07fffffd01ffff5401ffff400057ff4000015500000000000000000000000000', stats: { atk: 88, imp: 82, rng: 24, ap: 0, wgt: 1640, en: 190 }, stock: true },
  { id: 'wa-handgun-r', name: 'HG-003 Coquillett', cls: 'Handgun', slot: 'armR', glyph: '0000000000000000000000000055554001ffffd001d555d001ffffd00055fd400001fd000001fd000001fd000001fd000001fd00000054000000000000000000', stats: { atk: 54, imp: 58, rng: 44, ap: 0, wgt: 620, en: 110 }, stock: true },
  { id: 'wa-gatling-r', name: 'DF-GA-08 Chang', cls: 'Gatling', slot: 'armR', glyph: '0000000000000000000000000055555015fffff47f5555757f55557f7f55557f7fffffff7ffffff515fffff40057fd500007fd000007fd000001540000000000', stats: { atk: 70, imp: 30, rng: 46, ap: 0, wgt: 2380, en: 240 }, stock: true },
  { id: 'wa-bazooka-r', name: 'MJ-BZ-B Little', cls: 'Bazooka', slot: 'armR', glyph: '000000000000000054000000a9555555abffffffabffffffa955555fa955555fabffffffabffffffa957fd555407fd000007fd000007fd000001540000000000', stats: { atk: 92, imp: 90, rng: 40, ap: 0, wgt: 2140, en: 210 }, stock: true },
  { id: 'wa-grenade-r', name: 'DF-GR-07 Gundy', cls: 'Grenade Launcher', slot: 'armR', glyph: '000000000000000000055554155ffffd7ffd555d7ffffffd155ffffd0007ff54001fffd0001fffd0007fdff4001fffd0001fffd00007ff400001750000001000', stats: { atk: 96, imp: 94, rng: 36, ap: 0, wgt: 2760, en: 260 }, stock: true },
  { id: 'wa-laser-r', name: 'VP-66LR Laser', cls: 'Laser Rifle', slot: 'armR', glyph: '000000000000000000000054000001fd140001fd7d5555fd7ffffffd7f55557d7ffffffd7ffffffd7d55fdfd1401fdfd0001fdfd0001fd540000540000000000', stats: { atk: 74, imp: 40, rng: 88, ap: 0, wgt: 1320, en: 420 }, stock: true },
  { id: 'wa-plasma-r', name: 'VP-66EG Plasma', cls: 'Plasma Rifle', slot: 'armR', glyph: '0000000000000000000000000040000005d400001ffd55547ffffffd7ffd555dfffffffd7ffffffd7fff7f541ffd7f4005d47f4000407f400000150000000000', stats: { atk: 80, imp: 56, rng: 62, ap: 0, wgt: 1580, en: 480 }, stock: true },
  { id: 'wa-pulse-r', name: 'VE-66LRA Pulse', cls: 'Pulse Gun', slot: 'armR', glyph: '000000000000000000000000155555547ffffffd17df7df407df7df407df7df407df7df417df7df47ffffffd1555fd540001fd000001fd000000540000000000', stats: { atk: 44, imp: 76, rng: 50, ap: 0, wgt: 980, en: 350 }, stock: true },
  { id: 'wa-linear-r', name: 'LR-036 Curtis', cls: 'Linear Rifle', slot: 'armR', glyph: '000000000000000000000000000155400007ffd05007ffd1f5555557ffffffff57fff55507fff4000157f4000007f4000007f4000007f4000001500000000000', stats: { atk: 84, imp: 62, rng: 96, ap: 0, wgt: 1720, en: 330 }, stock: true },
  { id: 'wa-blade-r', name: 'HI-32 Dizzy', cls: 'Laser Blade', slot: 'armR', glyph: '50000000f40000007d0000001f40000007d0000001f40000007d0000001f40000007d0000001f40000007d5000001ff400001d7400001ff40000055000000000', stats: { atk: 94, imp: 70, rng: 12, ap: 0, wgt: 1260, en: 400 }, stock: true },
  { id: 'wa-pile-r', name: 'DF-ET-09 Trueno', cls: 'Pile Bunker', slot: 'armR', glyph: '001ff400001ff400001d7400001d7400001d7400001d7400001d7400005ff50001ffff4001d5574001ffff4001ffff40007ffd00007ffd000015540000000000', stats: { atk: 100, imp: 98, rng: 10, ap: 0, wgt: 2480, en: 220 }, stock: true },
  { id: 'wa-chainsaw-r', name: 'WB-0000 Bad Cook', cls: 'Chainsaw', slot: 'armR', glyph: '0000000000000000044444441ddddddd1ddddddd1ffffffd1d55555d1ffffffd1ffffffd0555ff540001ff400001ff400001ff40000055000000000000000000', stats: { atk: 98, imp: 86, rng: 10, ap: 0, wgt: 3100, en: 180 }, stock: true },
  { id: 'wa-baton-r', name: 'VP-67S Stun', cls: 'Stun Baton', slot: 'armR', glyph: '140000007d0000001f40000007d0000001f40000007d0000001f40000007d0000001f40000007d4000007fd0000075d0000075d000007fd00000154000000000', stats: { atk: 36, imp: 92, rng: 14, ap: 0, wgt: 840, en: 260 }, stock: true },
  { id: 'wb-missile-r', name: 'BML-G1 Missile', cls: 'Missile Launcher', slot: 'backR', glyph: '0000000000000000155555547ffffffd7555555d7f7df7dd7555555d7f7df7dd7555555d7f7df7dd7f7df7dd7f7df7dd7ffffffd155555540000000000000000', stats: { atk: 66, imp: 50, rng: 82, ap: 0, wgt: 1480, en: 200 }, stock: true },
  { id: 'wb-vmissile-r', name: 'BML-G2 Vertical', cls: 'Vertical Missile', slot: 'backR', glyph: '0141414007d7d7d007d7d7d017d7d7d47ffffffd7f7df7dd7f7df7dd7f7df7dd7f7df7dd7f7df7dd7f7df7dd7f7df7dd7ffffffd155555540000000000000000', stats: { atk: 72, imp: 54, rng: 90, ap: 0, wgt: 1860, en: 240 }, stock: true },
  { id: 'wb-cluster-r', name: 'BML-G3 Cluster', cls: 'Cluster Missile', slot: 'backR', glyph: '000000000000000001010100074747401fdfdfd07dfdfdf41fdfdfd007ffffd007ffffd0075757401fdfdfd07dfdfdf41fdfdfd0074747400101010000000000', stats: { atk: 58, imp: 62, rng: 74, ap: 0, wgt: 1640, en: 220 }, stock: true },
  { id: 'wb-gcannon-r', name: 'SONGBIRDS', cls: 'Grenade Cannon', slot: 'backR', glyph: '0000000000000000155555557fffffff7d5555577d5555577fffffff15ffff5501ffff4001ffff4001ffff4001ffff4001ffff40005555000000000000000000', stats: { atk: 98, imp: 96, rng: 56, ap: 0, wgt: 3840, en: 300 }, stock: true },
  { id: 'wb-lcannon-r', name: 'VP-60LCS Laser', cls: 'Laser Cannon', slot: 'backR', glyph: '00000000000000150000007f0000007f0555557f1fffffff1d5555751d5555741ffffff5057ffd7f007ffd7f007ffd7f007ffd7f007ffd150015540000000000', stats: { atk: 90, imp: 48, rng: 94, ap: 0, wgt: 2960, en: 620 }, stock: true },
  { id: 'wb-pcannon-r', name: 'VE-60SNA Pulse', cls: 'Pulse Cannon', slot: 'backR', glyph: '0007d0000007d0000057540001fffd0007fdff401fd75fd01f7ff7d01f7ff7d07dfffdf41f7ff7d01f7ff7d01fd75fd007fdff4001fffd000057d4000007d000', stats: { atk: 52, imp: 88, rng: 68, ap: 0, wgt: 2240, en: 540 }, stock: true },
  { id: 'wb-napalm-r', name: 'IA-C01W3 Napalm', cls: 'Napalm Bomb', slot: 'backR', glyph: '00000000155555547ffffffd7555555d7ffffffd17d7d7d407d7d7d007d7d7d01fdfdfd07ffffff41fdfdfd00747474001010100000000000000000000000000', stats: { atk: 76, imp: 44, rng: 48, ap: 0, wgt: 2080, en: 260 }, stock: true },
  { id: 'wb-orbit-r', name: 'IB-C03W2 Orbit', cls: 'Orbit Drone', slot: 'backR', glyph: '00000000000000000000000055000055ff4101ffff5751ff557ff455007ff40001fdfd00557ff455ff7ff5ffff5751ff55010055000000000000000000000000', stats: { atk: 50, imp: 34, rng: 70, ap: 0, wgt: 1720, en: 580 }, stock: true },
  { id: 'wb-shield-r', name: 'SI-24 Shield', cls: 'Shield', slot: 'backR', glyph: '055555501ffffff41ffffff41ffd7ff41ffd7ff41ffd7ff41ffd7ff41ffd7ff41ffd7ff41ffd7ff407fd7fd001fd7f40007ffd00001ff4000005500000000000', stats: { atk: 0, imp: 20, rng: 0, ap: 0, wgt: 2340, en: 180 }, stock: true },
  { id: 'wb-pshield-r', name: 'IA-C01W7 Pulse', cls: 'Pulse Shield', slot: 'backR', glyph: '000000000000000001010100075757401dfdfdd077d45f74774147747747d774dd07d1dd774147747740077477d45f741dfdfdd0045454400000000000000000', stats: { atk: 0, imp: 30, rng: 0, ap: 0, wgt: 1560, en: 460 }, stock: true },
];

/** Slot -> the part equipped on a fresh boot. */
export const DEFAULT_LOADOUT = {
  head: 'fr-head', sensor: 'fr-sensor',
  coreL: 'fr-coreL', coreR: 'fr-coreR',
  genr: 'in-genr', fcs: 'in-fcs', boost: 'in-boost',
  handL: 'fr-handL', handR: 'fr-handR',
  shldL: 'fr-shldL', shldR: 'fr-shldR',
  hipL: 'fr-hipL', hipR: 'fr-hipR',
  thighL: 'fr-thighL', thighR: 'fr-thighR',
  legL: 'fr-legL', legR: 'fr-legR',
  armL: 'wa-rifle-l', armR: 'wa-rifle-r',
  backL: 'wb-missile-l', backR: 'wb-missile-r',
};

// ── Stat maths ───────────────────────────────────────────────

const num = (v) => Number(v) || 0;

/**
 * Roll the equipped parts into the four display stats plus the two budgets.
 *
 * Attack, impact and range are averaged across the *weapons* only, because
 * averaging a rifle against a knee guard reports nothing. Armor sums across
 * the frame. Weight and EN are totals measured against the legs and the
 * generator respectively.
 */
export function frameStats(parts) {
  const weapons = parts.filter((p) => p.stats?.atk || p.stats?.imp);
  const avg = (key) => (weapons.length
    ? Math.round(weapons.reduce((n, p) => n + num(p.stats[key]), 0) / weapons.length)
    : 0);

  const armorParts = parts.filter((p) => num(p.stats?.ap) > 0);
  const ap = armorParts.length
    ? Math.round(armorParts.reduce((n, p) => n + num(p.stats.ap), 0) / armorParts.length)
    : 0;

  return {
    atk: avg('atk'),
    imp: avg('imp'),
    rng: avg('rng'),
    ap,
    weight: parts.reduce((n, p) => n + num(p.stats?.wgt), 0),
    enLoad: parts.reduce((n, p) => n + num(p.stats?.en), 0),
    capacity: parts.reduce((n, p) => n + num(p.stats?.cap), 0),
    output: parts.reduce((n, p) => n + num(p.stats?.out), 0),
  };
}

/** Apply a mode's per-stat multiplier, clamped to the 0-100 display range. */
export function applyMultiplier(stats, mult) {
  const out = { ...stats };
  if (!mult) return out;
  for (const { key } of STATS) {
    out[key] = Math.max(0, Math.min(100, Math.round(num(stats[key]) * (mult[key] ?? 1))));
  }
  return out;
}

/**
 * One headline number. Overshooting either budget costs rating rather than
 * being forbidden outright — an overweight build should still assemble, and
 * should still look wrong on the readout.
 */
export function frameRating(stats) {
  const base = STATS.reduce((n, { key }) => n + num(stats[key]), 0) * 10;
  // Proportional, not absolute. A flat divisor let a build 20% over capacity
  // still out-rate a legal one, because the heavy weapons it carried added
  // more than the overload subtracted, which made the budgets decorative.
  const overWeight = stats.capacity ? Math.max(0, stats.weight - stats.capacity) / stats.capacity : 0;
  const overEn = stats.output ? Math.max(0, stats.enLoad - stats.output) / stats.output : 0;
  const penalty = base * Math.min(0.9, overWeight * 1.5 + overEn * 1.2);
  return Math.max(0, Math.round(base - penalty));
}

export const isOverweight = (s) => s.weight > s.capacity;
export const isEnStarved = (s) => s.enLoad > s.output;
