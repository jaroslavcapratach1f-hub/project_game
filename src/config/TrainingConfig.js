/**
 * TrainingConfig — the real-time cost + duration of training one more
 * troop at a barracks (master-task section 12), layered ON TOP OF the
 * existing personnel-pool cost (PersonnelConfig.ENTITY_COST) rather than
 * replacing it — personnel is a real, already-working mechanic unrelated
 * to this.
 *
 * Confirmed data exists for exactly one class so far: the player's
 * "Springfield Squad" reference (a USA infantry unit) shows a training
 * transaction of 750 Military Funds + 3 of an UNNAMED secondary resource.
 * That secondary resource's real identity is NOT confirmed against
 * anything that already exists in this codebase — PersonnelConfig's own
 * ENTITY_COST.infantry is 2, not 3, so it is NOT simply "personnel" in
 * disguise. Master-task section 12: "Do not rename or reinterpret the
 * second resource until its authoritative type is confirmed." It is
 * therefore left OUT of `TRAINING_COST` entirely rather than guessed —
 * only the confirmed Military Funds figure is wired in.
 *
 * No training DURATION is confirmed for any class — every class defaults
 * to 0 (instant), preserving today's behaviour until real numbers arrive.
 */

/** @type {Object<string, {money:number}>} combat class -> confirmed EXTRA training cost, on top of personnel */
export const TRAINING_COST = {
  infantry: { money: 750 },
};

/** @type {Object<string, number>} combat class -> training duration, seconds (none confirmed yet) */
export const TRAINING_DURATION_SECONDS = {};

/** @param {string} cls @returns {{money:number}} the confirmed extra cost, or none */
export function trainingCost(cls) {
  return TRAINING_COST[cls] ?? { money: 0 };
}

/** @param {string} cls @returns {number} seconds — 0 (instant) until a real duration is confirmed */
export function trainingDuration(cls) {
  return TRAINING_DURATION_SECONDS[cls] ?? 0;
}
