/**
 * onslaughtStep — the pure phase machine + raider retargeting for
 * OnslaughtDirector (GDD 16), split out for the 150-line cap (mirrors
 * src/ai/AIStates.js: free functions that work through the owner object). No
 * PixiJS. `stepPhase` advances the timer and calls back for spawn / clear / end;
 * `retargetRaiders` keeps raiders hunting the defenders (CALM model);
 * `composeText` builds the wave-composition string for the HUD banner.
 */
import { ALL_UNITS } from '../config/UnitStats.js';
import { unitLabel } from '../config/HudConfig.js';
import { ONSLAUGHT_PHASE } from './OnslaughtState.js';

const TIMES = '×';

/**
 * Advance the director's phase machine by `dtMs`.
 * @param {import('./OnslaughtDirector.js').OnslaughtDirector} d
 * @param {number} dtMs elapsed ms this tick @returns {void}
 */
export function stepPhase(d, dtMs) {
  const s = d.state;
  if (d.baseHp.depleted) return d.endRun(false); // GDD 16: base HP 0 ends the run
  if (s.phase === ONSLAUGHT_PHASE.INCOMING) {
    s.timerMs -= dtMs;
    if (s.timerMs <= 0) d.spawnWave();
  } else if (s.phase === ONSLAUGHT_PHASE.FIGHTING) {
    retargetRaiders(d);
    if (s.enemiesLeft === 0) d.clearWave();
  } else if (s.phase === ONSLAUGHT_PHASE.PAUSE) {
    s.timerMs -= dtMs;
    if (s.timerMs <= 0) d.advanceWave();
  }
}

/**
 * Every FIGHTING tick: give each targetless raider the nearest live defender,
 * and re-issue a march toward a target that has walked out of range. Real
 * entity classes fire on any assigned target in range — the first such shot
 * trips Field Fury and the exchange escalates normally.
 * @param {import('./OnslaughtDirector.js').OnslaughtDirector} d @returns {void}
 */
export function retargetRaiders(d) {
  const players = d.collectDefenders();
  if (players.length === 0) return;
  d.em.forEach((e) => {
    if (!e.onslaughtRaider || !e.isAlive) return;
    if (!e.target || !e.target.isAlive) e.setTarget(nearestOf(e, players));
    const t = e.target;
    if (t && !e.moveTarget && e.getDistanceTo(t) > (e.rangePx ?? 0)) e.moveTo(t.x, t.y);
  });
}

/** @private @param {object} e @param {object[]} list @returns {?object} nearest by centre distance */
function nearestOf(e, list) {
  let best = null;
  let bestD = Infinity;
  for (let i = 0; i < list.length; i++) {
    const d = e.getDistanceTo(list[i]);
    if (d < bestD) { bestD = d; best = list[i]; }
  }
  return best;
}

/**
 * "1× Tiger I, 3× Panzer IV, 2× Wehrmacht Squad" from a wave's groups.
 * @param {{unitKey:string,count:number}[]} groups @returns {string}
 */
export function composeText(groups) {
  let out = '';
  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const row = ALL_UNITS[g.unitKey];
    const label = row ? unitLabel(row.cls, row.faction) : g.unitKey;
    out += `${i ? ', ' : ''}${g.count}${TIMES} ${label}`;
  }
  return out;
}
