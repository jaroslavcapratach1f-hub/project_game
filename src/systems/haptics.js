/**
 * haptics — a tiny gate around navigator.vibrate. Framework-free, module state.
 * `setHapticsEnabled(bool)` is driven by the `vibration` setting (SETTINGS_CHANGED
 * → Game); `vibrate(ms)` is the FORWARD hook that gameplay/UI feedback will call
 * once trigger points exist. No-ops safely where the API is missing.
 */

const DEFAULT_MS = 15;

let enabled = true;

/**
 * @param {boolean} on whether `vibrate()` is allowed to fire
 * @returns {void}
 */
export function setHapticsEnabled(on) {
  enabled = Boolean(on);
}

/** @returns {boolean} current gate state */
export function hapticsEnabled() {
  return enabled;
}

/**
 * Fire a short vibration if enabled and supported. FORWARD: nothing calls this
 * yet — hook it into hit reactions / button presses when those want haptics.
 * @param {number} [ms=DEFAULT_MS] pulse length
 * @returns {void}
 */
export function vibrate(ms = DEFAULT_MS) {
  if (!enabled) return;
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  try { navigator.vibrate(ms); } catch { /* not supported / blocked */ }
}
