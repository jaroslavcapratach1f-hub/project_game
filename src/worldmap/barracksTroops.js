/**
 * barracksTroops — in-memory "how many troops does this barracks currently
 * have fielded" state, keyed by the barracks' own index in
 * `BaseManager.buildings`. Mirrors `troopLevels.js`: a plain Map, no save
 * system exists anywhere in this codebase yet (see ARCHITECTURE.md), so it
 * resets on reload.
 *
 * A barracks starts FULL (`trained === capacity`). A combat death frees a
 * slot (`loseTroop`), which is what makes `ArmyMenu`'s TRAIN button appear;
 * `trainTroop` fills it back up. There is no real production pipeline behind
 * this yet (GDD 04 — DynamicBarracks.js says the same), so training is
 * instant and only moves this counter.
 */
const trained = new Map();

/**
 * @param {number} index barracks index in `BaseManager.buildings`
 * @param {number} capacity `reserveCapacity(level)` — the full-strength count
 * @returns {number} troops currently fielded by this barracks
 */
export function troopsTrained(index, capacity) {
  const v = trained.get(index);
  return v === undefined ? capacity : Math.min(v, capacity);
}

/**
 * Field one more troop, up to capacity.
 * @param {number} index @param {number} capacity @returns {number} the new count
 */
export function trainTroop(index, capacity) {
  const next = Math.min(capacity, troopsTrained(index, capacity) + 1);
  trained.set(index, next);
  return next;
}

/**
 * One of this barracks' troops died — frees a slot for re-training.
 * @param {number} index @param {number} capacity @returns {number} the new count
 */
export function loseTroop(index, capacity) {
  const next = Math.max(0, troopsTrained(index, capacity) - 1);
  trained.set(index, next);
  return next;
}

/** @returns {void} drop every barracks back to full strength */
export function resetBarracksTroops() { trained.clear(); }
