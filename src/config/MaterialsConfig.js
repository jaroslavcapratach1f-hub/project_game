/**
 * MaterialsConfig — the six construction materials, the Engineering Center
 * queues that produce them, and which building levels demand which tier.
 *
 * Construction materials are spent ONLY on building upgrades (GDD 04 / 07).
 * DRAFT: tier gates, weights, and craft times are proposals. REVIEW.
 */

/**
 * Materials in ascending tier. A building upgrade to `level` consumes every
 * material whose `fromLevel <= level`, split by `weight`. Higher tiers unlock
 * as the base matures, so late upgrades need the full chain.
 */
export const MATERIALS = {
  // baseSeconds: 66 is the player's own confirmed capture ("1 minute 6
  // seconds") at Engineering Center Level 1 — no existing modifier
  // (craftTimeReductionPerLevel at level 1 is a no-op) explained the old
  // 40s DRAFT value, so this replaces it rather than layering on top.
  woodPlanks: { name: 'Wood Planks', tier: 1, fromLevel: 1,  weight: 1.0, baseSeconds: 66 },
  bricks:     { name: 'Bricks',      tier: 2, fromLevel: 6,  weight: 1.0, baseSeconds: 70 },
  cement:     { name: 'Cement',      tier: 3, fromLevel: 12, weight: 0.9, baseSeconds: 110 },
  metalBeams: { name: 'Metal Beams', tier: 4, fromLevel: 18, weight: 0.8, baseSeconds: 165 },
  asphalt:    { name: 'Asphalt',     tier: 5, fromLevel: 24, weight: 0.7, baseSeconds: 230 },
  concrete:   { name: 'Concrete',    tier: 6, fromLevel: 30, weight: 0.6, baseSeconds: 320 },
};

export const MATERIAL_TIERS = 6;
export const MATERIAL_COST_GROWTH = 1.26; // per building level

/** Original flavour text, own voice (never Warpath's own wording — CLAUDE.md). */
export const MATERIAL_DESCRIPTIONS = {
  woodPlanks: 'Rough-sawn timber, cut and planed on-site. The first material every base learns to produce.',
  bricks: 'Fired clay block, stacked and mortared for load-bearing walls.',
  cement: 'A binding powder that sets rock-hard once mixed — holds a structure together under real weight.',
  metalBeams: 'Rolled steel framing. Carries the load timber and brick alone can no longer bear.',
  asphalt: 'A bitumen blend for hard standing and heavy-vehicle surfaces.',
  concrete: 'Cured aggregate and cement — the final, fortified-tier building material.',
};

/** Shared per-tier swatch colour — the material icon palette every cost/production UI draws from. */
export const MATERIAL_TIER_COLOR = [0x8b6a4a, 0x9a9a95, 0xb8a88a, 0x7a7e84, 0x4a4a4a, 0x6f8f9a];

/**
 * Engineering Center ("Factory"): each unlocked WORKSHOP is its own
 * independent queue — one job crafts at a time per workshop (confirmed:
 * "Production Workshop: 1" at Level 1 means exactly one concurrent slot,
 * not "1 of several" — a 2nd/3rd/4th workshop is a wholly separate queue,
 * not more concurrency within one). `queueCapacityBase` (confirmed: Queue:
 * 10 at Level 1) applies to every workshop alike — no confirmed data says
 * later workshops differ, so none is invented.
 */
export const ENGINEERING = {
  queueCapacityBase: 10,
  queuesResearchMax: 4,
  craftTimeReductionPerLevel: 0.03, // -3% craft seconds per Engineering level
  outputPerBatch: 20, // DRAFT — no confirmed per-job yield exists yet
  tierUnlockNeedsEngineeringLevel: true, // Engineering level >= MATERIALS[t].fromLevel
};

/**
 * Factory level at which each workshop slot unlocks (max 4) — confirmed
 * directly by the player: Workshop 1 from Lv1, 2 from Lv4, 3 from Lv18, 4
 * from Lv22.
 */
export const WORKSHOP_UNLOCK_LEVELS = [1, 4, 18, 22];

/** @param {number} level Factory's own building level @returns {number} unlocked workshop slots, 0..4 */
export function workshopsUnlockedAt(level) {
  let n = 0;
  for (const lvl of WORKSHOP_UNLOCK_LEVELS) if (level >= lvl) n++;
  return n;
}

/**
 * Material demand for one building upgrade, spread across the tiers unlocked
 * at that level.
 * @param {number} level        the level being purchased
 * @param {number} baseBudget   material budget at level 1 for this building
 * @returns {Object<string, number>} material key -> amount
 */
export function materialCost(level, baseBudget) {
  const scaled = baseBudget * Math.pow(MATERIAL_COST_GROWTH, Math.max(0, level - 1));
  let weightSum = 0;
  for (const key in MATERIALS) {
    if (MATERIALS[key].fromLevel <= level) weightSum += MATERIALS[key].weight;
  }
  const out = {};
  for (const key in MATERIALS) {
    if (MATERIALS[key].fromLevel <= level) {
      out[key] = Math.max(1, Math.round((scaled * MATERIALS[key].weight) / weightSum));
    }
  }
  return out;
}

/**
 * Craft time for one batch of a material at a given Engineering Center level.
 * @param {string} materialKey
 * @param {number} engineeringLevel
 * @returns {number} seconds
 */
export function materialCraftSeconds(materialKey, engineeringLevel) {
  const m = MATERIALS[materialKey];
  if (!m) return 0;
  const reduction = 1 - ENGINEERING.craftTimeReductionPerLevel * Math.max(0, engineeringLevel - 1);
  return Math.round(m.baseSeconds * Math.max(0.25, reduction));
}
