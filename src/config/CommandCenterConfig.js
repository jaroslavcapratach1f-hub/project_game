/**
 * CommandCenterConfig — the Build Point thresholds that gate the next
 * headquarters ("Command Center") level. ONLY the thresholds the player has
 * actually confirmed exist here. Master-task section 6: "Do NOT extrapolate
 * future thresholds" — any level not listed has NO configured requirement,
 * so `commandCenterBpRequired` returns null and the Build-Point gate is
 * skipped for that transition (the existing resource/material cost gate
 * still applies) until a real number is supplied.
 */

/** @type {Object<number, number>} target headquarters level -> Build Points required to reach it */
export const CC_BP_THRESHOLDS = {
  3: 165,
  4: 540,
  5: 805,
};

/**
 * @param {number} targetLevel the headquarters level being advanced TO
 * @returns {?number} Build Points required, or null if unconfigured (no gate yet)
 */
export function commandCenterBpRequired(targetLevel) {
  return CC_BP_THRESHOLDS[targetLevel] ?? null;
}
