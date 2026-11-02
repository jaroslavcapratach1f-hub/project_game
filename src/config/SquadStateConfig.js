/**
 * SquadStateConfig — the DeployedSquad member-lifecycle enum + its tuneables.
 * A DeployedSquad (GDD 06) is a named group of individually-rendered entities
 * that all share ONE UnitStats key — distinct from the `InfantrySquad` soldier
 * composite, which is what "squad" means elsewhere in the entity code.
 *
 * DRAFT: values are proposals. REVIEW.
 */

/**
 * Lifecycle state of one unit inside a DeployedSquad (GDD 06 troop lifecycle):
 *   ACTIVE    — deployed and under squad orders
 *   RECALLED  — walking home under ORDER_RECALL (catchable back into combat)
 *   HEALING   — arrived at base; awaiting the Hospital system (FORWARD)
 *   DESTROYED — killed in combat; personnel deducted, slot freed
 * @enum {string}
 */
export const UNIT_STATE = Object.freeze({
  ACTIVE: 'ACTIVE',
  RECALLED: 'RECALLED',
  HEALING: 'HEALING',
  DESTROYED: 'DESTROYED',
});

/** Tuneables for the RECALLED -> HEALING handoff (and, FORWARD, HEALING -> ACTIVE). */
export const SQUAD_LIFECYCLE = {
  // World-px radius around the base anchor that counts as "home" for a RECALLED
  // unit whose move order has completed.
  arriveRadiusPx: 48,
  // FORWARD: seconds a unit sits in HEALING before the Hospital system returns
  // it to ACTIVE. null until that system exists — a HEALING unit just waits.
  hospitalHandoffSeconds: null,
};
