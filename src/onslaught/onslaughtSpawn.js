/**
 * onslaughtSpawn — the "resolve a wave -> mounted raider entities" step for
 * OnslaughtDirector, split out for the line cap. Raiders spawn CALM in a grid
 * `approachTiles` south of the base (the gate side), get the level's power
 * scalar, and march on the compound gate; the director's retarget loop then
 * hunts the defenders. The converge point is snapped through WorldField so the
 * blocked compound doesn't strand them.
 */
import { TILE_SIZE } from '../config/GameConfig.js';
import { ONSLAUGHT } from '../config/OnslaughtConfig.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { makeUnit } from '../worldmap/unitRoster.js';

const HALF = 0.5;
const SIGNED = 2; // Math.random() [0,1) -> [-1,1)

/**
 * Spawn every unit of `wave`, mount its view, register it, and send it at the
 * base. @param {import('./OnslaughtDirector.js').OnslaughtDirector} d
 * @param {{number:number, powerScalar:number, groups:{unitKey:string,count:number}[]}} wave
 * @returns {void}
 */
export function spawnWaveUnits(d, wave) {
  const sp = ONSLAUGHT.spawn;
  const centre = WORLDMAP.baseCentre;
  const edgeY = centre.y + TILE_SIZE * sp.approachTiles; // `approachTiles` south (gate side)
  const converge = d.field.nearestOpen(centre.x, centre.y + ONSLAUGHT.convergeInsetPx);
  let i = 0;
  for (const g of wave.groups) {
    for (let k = 0; k < g.count; k++, i++) {
      const col = i % sp.perRow;
      const rank = (i / sp.perRow) | 0;
      const { entity, view } = makeUnit(g.unitKey, {
        id: `on-w${wave.number}-${i + 1}`,
        team: 'enemy',
        x: centre.x + (col - (sp.perRow - 1) * HALF) * sp.colGapPx + jitter(sp.jitterPx),
        y: edgeY + rank * sp.rowGapPx + jitter(sp.jitterPx),
        events: d.events,
        battlefield: d.field,
      });
      entity.onslaughtRaider = true;
      applyPower(entity, wave.powerScalar);
      entity.moveTo(converge.x, converge.y);
      view.mount(d.renderer, d.unit3D);
      d.em.add(entity, view);
      d.state.addEnemy(entity.id);
    }
  }
}

/** @private multiply a raider's combat stats by the level's power scalar */
function applyPower(e, s) {
  if (s === 1) return;
  e.maxHp *= s;
  e.hp = e.maxHp;
  if (typeof e.dmg === 'number') e.dmg *= s;
  if (typeof e.pen === 'number') e.pen *= s;
  if (typeof e.soldierHp === 'number') e.soldierHp *= s;
  if (Array.isArray(e.armor)) e.armor = e.armor.map((d) => d * s);
}

/** @param {number} amt @returns {number} random offset in [-amt, amt) */
function jitter(amt) {
  return (Math.random() * SIGNED - 1) * amt;
}
