/**
 * ResearchModel — the shared cost / time / gating math for every research node.
 *
 * A node is a small descriptor (see the *Tree.js files). Each node has 1..maxRank
 * ranks; cost and time scale with both the node's tier and the rank being
 * bought. Tiers unlock at headquarters-level gates. Research Center level and
 * `parallelResearch` govern speed and concurrent slots (BuildingConfig).
 *
 * DRAFT: every constant here is a proposal. REVIEW.
 *
 * Two node "shapes" coexist:
 * - The ORIGINAL shape (every pre-existing node, every other track): a
 *   single `effect.perRank` + `baseCost`/`baseSeconds`, scaled by the
 *   tier/rank-growth exponents below, gated by `tier` -> `TIER_HQ_GATE`
 *   (headquarters level).
 * - The `powerPerRank` shape (the Industry track's own real tree, the
 *   player's own exact numbers): each rank's own % / flat value
 *   (`effect.perRankValues[rank-1]`) and Power gain
 *   (`powerPerRank[rank-1]`) are given directly, non-linearly, per rank —
 *   `nodeCost`/`nodeSeconds` below derive straight from that rank's own
 *   Power instead of the tier/rank-growth formula (the player's own
 *   explicit instruction: "time required for research... depends on the
 *   power the research provides... structure it properly according to
 *   first given research time" — `SECONDS_PER_POWER` is calibrated
 *   EXACTLY off that first research: 15 min / 29 Power, 29 being the
 *   smallest Power value given anywhere in the tree, for the very next
 *   research after it — see `DevelopmentTree.js`'s own header). Every
 *   `powerPerRank` node also carries its own `minCenterLevel` (Research
 *   Center building level, NOT the HQ-level `tier` gate below) and
 *   `requires` entries may be `{id, rank}` (a SPECIFIC rank, not
 *   necessarily maxed — `reqId`/`reqRank` below normalize both the plain
 *   id-string shape every other track still uses and this richer shape).
 */

/** The five research tracks (GDD 04, "Modern Warfare" -> doctrine). */
export const TRACKS = ['development', 'military', 'doctrine', 'defense', 'support'];

/** Headquarters level required to open each research tier (nodes with their own `minCenterLevel` skip this entirely). */
export const TIER_HQ_GATE = { 1: 1, 2: 6, 3: 11, 4: 16, 5: 21, 6: 26, 7: 31 };

export const COST_MODEL = {
  tierGrowth: 1.9,   // cost multiplier per tier
  rankGrowth: 1.5,   // cost multiplier per rank within a node
  timeTierGrowth: 1.8,
  timeRankGrowth: 1.45,
};

// Industry tree calibration (the player's own explicit instruction): real
// seconds-per-Power-point, derived from the tree's own first research
// (900s / 29 Power) — see the file header above and `DevelopmentTree.js`.
export const SECONDS_PER_POWER = 900 / 29;
// Resource cost per Power point for any `powerPerRank` node — no cost was
// specified by the player, so this derives cost the SAME way as time
// (straight off each rank's own real Power) instead of an unrelated
// tier-depth exponential. Close together on purpose (the player's own
// correction — an earlier, more money-heavy ratio "require[d] most of the
// money only"): every node costs comparable amounts of all 3, money only
// nominally ahead since it's the most commonly produced resource. Raised
// ~25% across the board from that first balance pass (the player's own
// follow-up: "increase slightly required resources for research").
export const COST_PER_POWER = { money: 75, steel: 70, oil: 65 };

/** @param {string|{id:string,rank?:number}} r one `node.requires` entry @returns {string} the referenced node's own id */
export function reqId(r) { return typeof r === 'string' ? r : r.id; }

/**
 * Resource cost to buy `rank` of a node (rank is 1-indexed).
 * @param {object} node  { tier, baseCost:{money?,steel?,oil?}, powerPerRank? }
 * @param {number} rank
 * @returns {object} { money?, steel?, oil? }
 */
export function nodeCost(node, rank) {
  if (node.powerPerRank) {
    const p = node.powerPerRank[rank - 1], out = {};
    for (const k in COST_PER_POWER) out[k] = Math.round(p * COST_PER_POWER[k]);
    return out;
  }
  const f = Math.pow(COST_MODEL.tierGrowth, node.tier - 1) *
            Math.pow(COST_MODEL.rankGrowth, Math.max(0, rank - 1));
  const out = {};
  for (const k in node.baseCost) out[k] = Math.round(node.baseCost[k] * f);
  return out;
}

/**
 * Real-time seconds to complete `rank` of a node, before Research Center speed.
 * @param {object} node  { tier, baseSeconds, powerPerRank? }
 * @param {number} rank
 * @returns {number}
 */
export function nodeSeconds(node, rank) {
  if (node.powerPerRank) return Math.round(SECONDS_PER_POWER * node.powerPerRank[rank - 1]);
  const f = Math.pow(COST_MODEL.timeTierGrowth, node.tier - 1) *
            Math.pow(COST_MODEL.timeRankGrowth, Math.max(0, rank - 1));
  return Math.round(node.baseSeconds * f);
}

/**
 * @param {number} tier
 * @param {number} hqLevel
 * @returns {boolean} whether this tier is open at the given HQ level
 */
export function tierUnlocked(tier, hqLevel) {
  return hqLevel >= (TIER_HQ_GATE[tier] ?? Infinity);
}

/**
 * Total value of a fully-bought node effect (sum of all ranks).
 * @param {object} node  { maxRank, effect:{ perRank, perRankValues? } }
 * @returns {number}
 */
export function nodeMaxEffect(node) {
  if (node.effect.perRankValues) return node.effect.perRankValues.reduce((a, b) => a + b, 0);
  return node.effect.perRank * node.maxRank;
}
