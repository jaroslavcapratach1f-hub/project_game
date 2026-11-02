/**
 * BuildingArtConfig — the visual manifest for base buildings (GDD 24). The
 * 12-tier ladder (a full visual remodel every 3 levels — GDD 24 "VISUAL TIER
 * SYSTEM", supersedes the old 4-band grammar), animation timing, the atlas
 * naming contract, and per-building art data: palette tint, footprint cells,
 * the signature animated element that makes the placeholder read as
 * "working", and the BuildingFx recipe.
 *
 * Shipping a real atlas is data-only — declare its tiers/states here and
 * BuildingSprite loads them; until then it renders the procedural placeholder.
 * A single static `sprite` (one idle frame, not yet tier-aware) is the first
 * step before a full atlas exists — see `headquarters` below and
 * assets/buildings/hq/README.md. DRAFT.
 */

export const BUILDING_STATE = Object.freeze({
  IDLE: 'idle', WORKING: 'working', UPGRADING: 'upgrading',
  OFFLINE: 'offline', DAMAGED: 'damaged',
});

/** levels per visual tier + the hard tier ceiling (GDD 24 "VISUAL TIER SYSTEM"). */
export const TIER_LEVELS = 3;
export const MAX_TIER = 12;

/** @param {number} level @returns {number} visual tier, 1..MAX_TIER (a full remodel every TIER_LEVELS levels) */
export function tierOf(level) {
  return Math.min(MAX_TIER, Math.max(1, Math.ceil(level / TIER_LEVELS)));
}

/** tier → narrative era name (GDD 24 table: 3 tiers per era). One sprite SET per tier; era is a label, not a render key. */
export const TIER_ERAS = [
  { upToTier: 3, name: 'improvised' },
  { upToTier: 6, name: 'established' },
  { upToTier: 9, name: 'reinforced' },
  { upToTier: MAX_TIER, name: 'fortified' },
];

/** @param {number} tier 1..MAX_TIER @returns {string} era name */
export function eraOf(tier) {
  for (const e of TIER_ERAS) if (tier <= e.upToTier) return e.name;
  return TIER_ERAS[TIER_ERAS.length - 1].name;
}

/** Placeholder-animation + reveal timing (real atlases carry their own fps). */
export const ANIM = {
  spinIdleDegPerSec: 22,   // signature element turn rate, idle
  spinWorkDegPerSec: 96,   // ...working
  pumpHz: 0.5, craneHz: 0.26, doorsHz: 0.18,
  glowIdleAlpha: 0.16, glowWorkAlpha: 0.5, glowPulseHz: 0.7,
  glowPulseFloor: 0.7, glowPulseRange: 0.3,
  puffRisePx: 26, puffLifeSec: 2.2, puffGapIdleSec: 0.9, puffGapWorkSec: 0.28,
  puffColor: 0x2a2a24, puffDriftHz: 3, puffScaleFrom: 0.5, puffScaleGrow: 1.6, puffAlphaPeak: 0.5,
  revealPopMs: 420, revealStaggerMs: 55, upgradePulseMs: 260,
};

/** Atlas key + path contract (GDD 24): bld_<id>__t<tier,2-digit>__<state>__####.png */
export const ATLAS = {
  basePath: 'assets/buildings/',
  keyFor: (id, tier, state) => `bld_${id}__t${String(tier).padStart(2, '0')}__${state}`,
};

/**
 * Placeholder-element geometry, px / fractions — internal to BuildingPlaceholder
 * and thrown away once real atlases ship. Lives here so that file stays free of
 * magic numbers.
 */
export const PLH = {
  barThickPx: 4, barHalfPx: 2, jointRPx: 3, cranePostWpx: 4, cranePostHpx: 9,
  pumpSwingRad: 0.45,
  doorMinScaleY: 0.12, doorRangeScaleY: 0.88, doorAlpha: 0.55,
  half: 0.5, elemLighten: 0.5,
  tierScaleMin: 0.55, tierScaleMax: 1.0, // placeholder height across the 12-tier ladder (GDD 24 "Scale growth")
};

/** @param {number} tier 1..MAX_TIER @returns {number} placeholder scale multiplier, lerped across the ladder */
export function tierScale(tier) {
  const t = Math.min(MAX_TIER, Math.max(1, tier));
  return PLH.tierScaleMin + (PLH.tierScaleMax - PLH.tierScaleMin) * ((t - 1) / (MAX_TIER - 1));
}

/**
 * Signature animated element per building — the placeholder spins / bobs /
 * pulses it so the block reads as active. `kind`:
 *   radar  a bar that sweeps      pump   a nodding arm
 *   crane  a beam on rails        doors  a shutter that cycles
 *   none
 * `at` = offset from the cell centre (compound-local px); `size` in px.
 */
export const BUILDING_ART = {
  headquarters: { tint: 0x556b2f, cells: [[0, 0]], element: { kind: 'radar', at: [0, -26], size: 16 },
    fx: { smoke: [], glow: { at: [4, -10], r: 10, color: 0xffd27f } }, defaultState: BUILDING_STATE.IDLE
    // Tier 1 (levels 1-3) locked design: a modular main command tent. Renders
    // as a LIVE 3D model now, not a sprite (Buildings3D.js loads timber_headquarters.glb
    // straight into Base3DLayer, see config/Building3DConfig.js) — no
    // `sprite` entry here on purpose; every building is moving to this same
    // live-3D path.
  },
  treasury: { tint: 0x6b5a2f, cells: [[0, 0]], element: { kind: 'doors', at: [0, 6], size: 15 },
    fx: { smoke: [], glow: { at: [0, -4], r: 7, color: 0xffe08a } }, defaultState: BUILDING_STATE.IDLE
    // Shared levels 1–6 timber treasury with an open printing/cashier bay.
    // See assets/buildings/treasury/levels01-06/.
    // LIVE 3D model, same as headquarters/barracks — no `sprite` entry.
  },
  steelworks: { tint: 0x7a4a3a, cells: [[0, 0]], element: { kind: 'crane', at: [0, -8], size: 20 },
    fx: { smoke: [[7, -18]], glow: { at: [-4, 2], r: 9, color: 0xff6b35 } }, defaultState: BUILDING_STATE.WORKING
    // Shared levels 1–6 timber workshop with masonry forge, anvil,
    // chimney and stock — see assets/buildings/steelworks/levels01-06/. LIVE 3D
    // model, same as headquarters/barracks/treasury — no `sprite` entry.
  },
  crude_oil: { tint: 0x4a4a3a, cells: [[0, 0]], element: { kind: 'pump', at: [-2, -4], size: 16 },
    fx: { smoke: [[11, -16]], glow: { at: [11, -16], r: 5, color: 0xffb347 } }, defaultState: BUILDING_STATE.WORKING
    // Levels 1–6 metal pumpjack, connected tanks and timber service hut.
    // assets/buildings/crude_oil/levels01-06/ supplies the live 3D model.
  },
  engineering: { tint: 0x8b5a2f, cells: [[0, 0]], element: { kind: 'crane', at: [0, -10], size: 22 },
    fx: { smoke: [[8, -16]], glow: { at: [-6, 2], r: 8, color: 0xff8a3d } }, defaultState: BUILDING_STATE.WORKING
    // Levels 1–6 construction-materials workshop: saw line, timber stock,
    // mould bench and brick kiln. Live GLB; no sprite entry.
  },
  barracks: { tint: 0x4a5d23, cells: [[0, 0]], element: { kind: 'doors', at: [0, 7], size: 16 },
    fx: { smoke: [[-8, -14]], glow: null }, defaultState: BUILDING_STATE.IDLE
    // Tier 1 locked design: a small tent + watch tower beside a training
    // field (see assets/buildings/barracks/levels01-06/). LIVE 3D model, same as
    // headquarters — no `sprite` entry here on purpose.
  },
  defence_wall: { tint: 0x6b6b6b, cells: [[0, 0]], element: { kind: 'radar', at: [0, -20], size: 12 },
    fx: { smoke: [], glow: { at: [0, -10], r: 6, color: 0xd4d4ff } }, defaultState: BUILDING_STATE.IDLE
    // Shared levels 1–6 timber modular perimeter, owned by DefenceWall3D.
    // No Building3DView footprint or sprite entry for the perimeter.
  },
  attack_towers: { tint: 0x585848, cells: [[0, 0]], element: { kind: 'radar', at: [0, -24], size: 14 },
    fx: { smoke: [], glow: null }, defaultState: BUILDING_STATE.IDLE
    // Shared levels 1–6 modular/watchtower.glb; two towers per chamfered
    // corner, owned by AttackTowers3D. No separate obsolete tower packet.
  },
};

/** @param {string} id @returns {object} art entry (generic fallback if unknown) */
export function buildingArt(id) {
  return BUILDING_ART[id] ?? {
    tint: 0x5a6b30, cells: [[0, 0]], element: { kind: 'none' },
    fx: { smoke: [], glow: null }, defaultState: BUILDING_STATE.IDLE,
  };
}
