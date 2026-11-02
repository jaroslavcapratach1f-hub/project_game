/**
 * AIStates — the per-state behaviour bodies for AIController, split out to keep
 * the controller under the line cap. Each function takes the controller `c` and
 * reads/writes through it (c.entity, c.waypoints, c.goTo(), c.enter()). No
 * PixiJS, no allocation.
 */
import { degToRad } from '../utils/MathUtils.js';
import { AI } from '../config/AIConfig.js';
import { AI_STATE } from './aiState.js';
import { pickTarget, desiredPosition, aimScatter } from './Behaviors.js';

const MS_PER_SECOND = 1000;
const FULL_CIRCLE = Math.PI * 2;

/** @param {import('./AIController.js').AIController} c */
export function idle(c, dt, players) {
  sweepTurret(c, dt);
  if (scan(c, dt, players)) c.enter(AI_STATE.ALERT);
}

/** @param {import('./AIController.js').AIController} c */
export function patrol(c, dt, players) {
  const wps = c.waypoints;
  if (wps.length === 0) { c.enter(AI_STATE.IDLE); return; }
  const e = c.entity;
  const wp = wps[c.wpIndex % wps.length];
  if (e.getDistanceTo(wp) <= AI.PATROL.waypointArrivePx) c.wpIndex = (c.wpIndex + 1) % wps.length;
  const next = wps[c.wpIndex % wps.length];
  c.goTo(next.x, next.y);
  if (scan(c, dt, players)) c.enter(AI_STATE.ALERT);
}

/** @param {import('./AIController.js').AIController} c */
export function alert(c, dt) {
  c.alertAcc += dt * MS_PER_SECOND;
  if (c.alertAcc < AI.ALERT.recognitionDelayMs) return;
  c.cooldownAcc = AI.ALERT.recooldownMs;
  c.enter(c.waypoints.length ? AI_STATE.PATROL : AI_STATE.IDLE);
}

/**
 * Fury-gated: (re)acquire a target, hold at the class ideal range, feed the aim
 * scatter. Never pulls the trigger — the entity's own _tryFire does that.
 * @param {import('./AIController.js').AIController} c
 */
export function engage(c, players) {
  const e = c.entity;
  const cur = e.target;
  if (!cur || !cur.isAlive || cur.team === e.team) {
    const t = pickTarget(e, players, c.pick);
    if (!t) { e.clearTarget(); e.aimPoint = null; return; }
    e.setTarget(t);
  }
  const tgt = e.target;
  const p = desiredPosition(e, tgt, c.pos);
  // only reposition when the hold point is meaningfully off — otherwise stand and
  // shoot (so aimScatter's moving/stationary distinction stays real)
  if (e.getDistanceTo(p) > AI.PATROL.waypointArrivePx) c.goTo(p.x, p.y);
  else e.stop();
  e.aimPoint = aimScatter(e, tgt, c.aim);
}

/** @param {import('./AIController.js').AIController} c run home; stay until dead or arrived */
export function retreat(c) {
  const e = c.entity;
  const h = c.homePoint();
  if (e.getDistanceTo(h) > AI.PATROL.waypointArrivePx) c.goTo(h.x, h.y);
}

/** @private oscillate lookAngle +/- AI.IDLE.turretSweepDeg around the hull heading */
function sweepTurret(c, dt) {
  const e = c.entity;
  if (e.turretAngle === undefined) return; // plain Entity / no turret
  c.sweepAcc = (c.sweepAcc + dt * MS_PER_SECOND) % AI.IDLE.sweepPeriodMs;
  const phase = Math.sin((c.sweepAcc / AI.IDLE.sweepPeriodMs) * FULL_CIRCLE);
  e.lookAngle = e.rotation + phase * degToRad(AI.IDLE.turretSweepDeg);
}

/** @private @returns {boolean} a live enemy of `c` sits within sightRangePx (respects re-ALERT cooldown) */
function scan(c, dt, players) {
  c.scanAcc += dt * MS_PER_SECOND;
  if (c.scanAcc < AI.IDLE.scanIntervalMs) return false;
  c.scanAcc = 0;
  if (c.cooldownAcc > 0) return false;
  const e = c.entity;
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (p.isAlive && p.team !== e.team && e.getDistanceTo(p) <= e.sightRangePx) return true;
  }
  return false;
}
