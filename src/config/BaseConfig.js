/**
 * BaseConfig — the persistent home base as a SQUARE compound (GDD 18/24). The
 * world map stays a flat-top HEX grid end to end (utils/Hex.js) — the base's
 * own build grid (plot-size stages, per-building footprints) lives in
 * BaseGridConfig.js, split out for the 150-line cap. This file is the
 * compound's look (platform / wall / building styling), the garrison / army /
 * enemy rosters, and the starting building seed.
 *
 * Buildings themselves (caps, effects, cost) live in BuildingConfig.js; this
 * is only the grid look and the seed. DRAFT / REVIEW.
 */
import { CELL_PX, plotHalfExtentsAt, gateAnchorAt } from './BaseGridConfig.js';

export const BASE = {
  viewZoom: 0.45, // legacy (unused since the world-map LOD)

  grid: { cellPx: CELL_PX },

  // The walled rectangular compound the grid sits on. S54 (later): no cast
  // shadow (read as the whole compound hovering above the ground), no
  // corner nubs, no 2D wall stroke, and no packed-earth pad fill any more
  // (BaseDraw.js) — the wall is entirely the live-3D `DefenceWall3D`/
  // `AttackTowers3D` now, and the pad is entirely the live-3D
  // `BaseGround3D` floor, so the flat 2D fill colour and the 3D ground mesh
  // never both show at once. The interior grid lines stay (useful feedback
  // for where a dragged building will land — S54 BuildingDragController).
  platform: {
    bermColor: 0x373723,
    bermAlpha: 0.5,
    wallWidthPx: 15,        // no longer drawn as a 2D stroke — still the berm's own inset amount
    cellLineColor: 0xd8d8c0,
    cellLineAlpha: 0.45,
    cellLineWidthPx: 1,
  },

  // Faux-3D building blocks (rectangular — sized from BaseGridConfig.FOOTPRINT).
  building: {
    insetPx: 6,             // block sits this far inside its footprint, per side
    roofInsetPx: 10,        // the lit top face
    roofLighten: 0.34,      // blend of the body colour toward white
    roofDropPx: 6,          // top face raised this far (fake height)
    outlineColor: 0x14140f,
    outlineWidthPx: 2,
    shadowColor: 0x000000,
    shadowAlpha: 0.3,
    shadowDX: 8,
    shadowDY: 12,
    tint: 0x5a6b30,         // default body colour; barracks variants override
    popMs: 420,             // per-building scale-in on first reveal
    popStaggerMs: 55,
    pulseMs: 260,           // upgrade pop
  },

  // Troops parked INSIDE the compound (GDD 09 base defense) — real player-team
  // units on grass within the walls; they fight raiders that breach the base
  // and flip to BASE_FURY when it's hit. `slots` caps how many deploy; `compact`
  // is the zoomed-out pip blob (BaseTroops), its count driven by the real
  // garrison size. Personnel-costed like the platoon.
  garrison: {
    slots: 3,
    roster: [], // empty by request — no garrison units spawned; slots stays the real cap
    compact: { pips: 12, cols: 4, dotR: 5, gapPx: 13, dropPx: 18, color: 0x9a9a86, ring: 0x22221a },
  },

  // The player's marchable platoon on the world map. `roster` entries are
  // UnitStats row keys resolved through worldmap/unitRoster.js into the real
  // entity stack, each deployed via SquadManager (personnel-costed, freed on
  // death). `deploySlots` caps simultaneous units — FORWARD: HQ level + a
  // `mil_deploy_slot` research node raise it toward LIMITS.maxDeployedSquads.
  army: {
    deploySlots: 5,
    // S55: was 70 — the muster grid's own per-slot spread (squadGapPx,
    // fixed world-X/Y, not aligned to the wall's own diagonal outward
    // normal) meant some slots (the leftmost column, incl. the light tank)
    // landed barely clear of the wall's own thickness at that push
    // distance — reported as "sits right on the wall" / "stuck". S70: the
    // player's own further request — push the whole muster ground out a
    // bit more again, clear of the gate area.
    musterDropPx: 340,
    squadGapPx: 92,
    rowGapPx: 74,
    // First five field now: light tank, rifles, medium, heavy, artillery.
    // Springfield remains on the bench alongside the spare Sherman.
    roster: ['m24_chaffee', 'm1garand_squad', 'm4_sherman', 'm26_pershing', 'm12_gmc', 'springfield_squad', 'm4_sherman'],
  },

  // A placeholder Legion (GDD 20) camp near the base for Phase B: enemies that
  // patrol, and fight back when the player opens fire (Field Fury + AIManager).
  // `roster` entries are UnitStats keys (see worldmap/unitRoster.js). S61:
  // exactly ONE of each of the 6 established live-3D model classes (the
  // user's own explicit call) — infantry, lightTank, mediumTank, heavyTank,
  // tankHunter, and the howitzer mesh standing in for atGun (Germany has no
  // howitzer-class row of its own). `m24_chaffee` is USA's own roster key —
  // Germany/Legion has no light-tank stat row at all — borrowed the same way
  // the Legion already borrows Germany's stat rows generally (OnslaughtConfig's
  // own `legionFaction` doc); `enemy:lightTank` (Unit3DConfig.js) still keys
  // its 3D body off TEAM, so it renders with the Legion's blue paint, not USA green.
  enemy: {
    campHexOffset: { dq: 12, dr: 2 },   // camp centre = baseHex + this
    roster: ['kar98k_squad', 'm24_chaffee', 'panzer_iv', 'tiger_i', 'jagdpanther', 'pak40'],
    spawnSpreadPx: 96,
  },

  labels: {
    headquarters: 'Headquarters', treasury: 'Treasury', steelworks: 'Steel',
    crude_oil: 'Oil', engineering: 'Factory', research_center: 'Research',
    armory: 'Armory', parts_workshop: 'Parts', disassemble: 'Disassemble',
    assembly: 'Assembly', officer_barracks: 'Officers',
    reserves_barracks: 'Reserves', defence_wall: 'Wall', attack_towers: 'Towers',
  },

  // Press-hold-drag relocate (S54, BuildingDragController) — the translucent
  // "glass" silhouette shown while a building is lifted off the grid.
  dragGhost: {
    liftPx: 14,          // 2D box / 3D scene-unit hover offset while dragging
    validColor: 0x5cd65c,   // green — the hovered slot is free + grid-legal
    invalidColor: 0xe04040, // red — occupied, out of bounds, or (pre-snap) illegal
    alpha: 0.55,
    // eased glide between grid-snapped cells while dragging — an instant
    // position.set() on every drag-move read as a teleport/glitch, not a hover
    easeMs: 140,
  },
};

/**
 * The scene's starting base, in CELL-UNIT (cx, cy) centre offsets from the
 * plot centre. Headquarters first (it gates every other level); seeded
 * above L1 for headroom, which also seeds the starting PLOT_STAGES tier
 * (18x22). `defence_wall`/`attack_towers` have no real position —
 * BaseGridView never places either on the grid (the wall IS the perimeter,
 * the towers sit at its 4 corners — DefenceWall3D.js / AttackTowers3D.js);
 * their entries only carry their economy level.
 *
 * cx/cy PARITY (S54 fix): grid lines sit at whole integers (`plotCells`'
 * cols/rows are always even, so `cellCorners`'s half-extent is a whole
 * number). An EVEN footprint dimension must therefore centre on a whole
 * integer to span whole cells edge-to-edge; an ODD dimension must centre
 * on a half-integer (X.5) — same rule `DefenceWall3D`/`AttackTowers3D`
 * already get right by construction (their positions are computed from
 * `cellCorners`, never hand-typed). Every value below was hand-typed
 * against neither rule, so every building sat a half-cell off the grid on
 * whichever axis (cx and/or cy) had the wrong parity for its own
 * `BaseGridConfig.FOOTPRINT` — invisible for the wall/towers (analytically
 * correct by construction) but visible on every other building once
 * real 3D meshes replaced sprites/placeholders. Fixed by rounding each
 * mismatched axis to its nearest correct-parity value (toward the
 * compound centre where a tie-break was needed) — footprint size/shape
 * unchanged, only the seeded position.
 */
export const STARTING_LAYOUT = [
  { id: 'headquarters', cx: 0.5, cy: 0, level: 3 }, // footprint 7x8: w odd -> cx needs X.5 (was 0)
  { id: 'treasury', cx: -5, cy: -6, level: 2 }, // footprint 2x2: both even -> cx needs integer (was -5.5)
  { id: 'steelworks', cx: 0, cy: -7, level: 2 }, // clear workshop plot, user-requested relocation
  { id: 'crude_oil', cx: -5, cy: 6, level: 1 }, // footprint 2x2: same fix (was -5.5)
  { id: 'engineering', cx: -6.5, cy: 0, level: 1 }, // footprint 3x4 (user's own call, was 4x3): w odd -> cx needs X.5; h even -> cy integer
  { id: 'barracks', cx: 6, cy: 5, level: 1 }, // footprint 4x4: both even -> both need integer (was 6.5, 5.5)
  { id: 'research_center', cx: 6.5, cy: -1.5, level: 1 }, // footprint 3x3: both odd -> both need X.5 — free slot between HQ, steelworks and barracks
  { id: 'armory', cx: -7.5, cy: -3.5, level: 1 }, // footprint 3x3: both odd -> both need X.5 — free slot between engineering and treasury
  { id: 'parts_workshop', cx: -4.5, cy: 3.5, level: 1 }, // footprint 3x3: both odd -> both need X.5 — free slot between engineering, crude_oil and HQ
  { id: 'disassemble', cx: 2.5, cy: 6.5, level: 1 }, // footprint 3x3: both odd -> both need X.5 — free slot between HQ and barracks
  { id: 'assembly', cx: -1.5, cy: 8.5, level: 1 }, // footprint 3x3: both odd -> both need X.5 — free slot below HQ, between crude_oil and disassemble
  { id: 'officer_barracks', cx: 7.5, cy: -4.5, level: 1 }, // footprint 3x3: both odd -> both need X.5 — free slot between steelworks and research_center
  { id: 'reserves_barracks', cx: -7, cy: 8, level: 1 }, // footprint 2x2: both even -> both need integer — free slot below crude_oil
  { id: 'attack_towers', cx: 0, cy: 0, level: 1 },
  { id: 'defence_wall', cx: 0, cy: 0, level: 1 },
];

/** The seeded starting HQ level — sizes the boot-time plot before BaseManager runs (see BaseSite.enable ordering). */
export const STARTING_HQ_LEVEL = STARTING_LAYOUT.find((b) => b.id === 'headquarters').level;

/**
 * The starting plot's half-extents, world px — replaces the old hex
 * `platform.hexR` everywhere a world-space compound size is needed
 * (territory ring, obstacle blocking, muster ground, garrison ring). Static
 * at boot (see BaseGridConfig.js header — live re-growth isn't wired yet).
 */
export const STARTING_PLOT_HALF = plotHalfExtentsAt(STARTING_HQ_LEVEL);

/** The starting plot's gate anchor (compound-local px) — see BaseGridConfig.gateAnchorAt. */
export const STARTING_GATE_ANCHOR = gateAnchorAt(STARTING_HQ_LEVEL);
