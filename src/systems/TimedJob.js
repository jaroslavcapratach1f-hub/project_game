/**
 * TimedJob — a generic timestamp-based job: `{ startedAt, durationMs }`.
 * Every real-time system in this game (Engineering Center production,
 * troop training) creates jobs through this shape rather than inventing
 * its own frame-countdown, so "survives closing/reopening the app"
 * (master-task section 10/19) is answered once, here, by comparing
 * wall-clock timestamps instead of ticking a counter down by `dt` every
 * frame — which drifts, stalls while a tab is backgrounded, and resets to
 * nothing the instant the page reloads.
 *
 * Building upgrades stay instant (the player's own explicit, final call —
 * no timer, ever) — this file is for the two systems that DO need one.
 */
const MS_PER_SECOND = 1000;

/**
 * @param {number} durationSeconds @returns {{startedAt:number, durationMs:number}}
 */
export function startJob(durationSeconds) {
  return { startedAt: Date.now(), durationMs: Math.max(0, durationSeconds) * MS_PER_SECOND };
}

/** @param {{startedAt:number,durationMs:number}} job @returns {number} ms remaining, floored at 0 */
export function remainingMs(job) {
  return Math.max(0, job.startedAt + job.durationMs - Date.now());
}

/** @param {{startedAt:number,durationMs:number}} job @returns {boolean} */
export function isJobDone(job) {
  return remainingMs(job) <= 0;
}

/** @param {{startedAt:number,durationMs:number}} job @returns {number} 0..1 */
export function jobProgress(job) {
  if (job.durationMs <= 0) return 1;
  return Math.min(1, (Date.now() - job.startedAt) / job.durationMs);
}
