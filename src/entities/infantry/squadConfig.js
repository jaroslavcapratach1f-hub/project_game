/**
 * squadConfig — the shared "INFANTRY row → InfantrySquad cfg" resolver, the
 * parallel of tanks/tankConfig.js, so every thin faction squad subclass is a
 * one-liner. Pure: no PixiJS.
 *
 * Infantry rows carry `star` 4 / 4.5 / 5, so unlike the tank rows they are
 * resolved at the row's own tier — the 5★ StG 44 gets its STAR_MULTIPLIER.
 */
import { resolveStat } from '../../config/StatResolution.js';
import { TILE_SIZE } from '../../config/GameConfig.js';
import { SQUAD } from '../../config/InfantryConfig.js';

const SCALAR_KEYS = ['hp', 'dmg', 'def', 'rof', 'rng', 'spd'];

/**
 * Build the cfg object for `new InfantrySquad(cfg)` from an INFANTRY row.
 * @param {string} key row key (unused beyond docs; kept for the tank parallel)
 * @param {object} base the INFANTRY row
 * @param {{id:string,team:string,x:number,y:number,count?:number,
 *   events?:object,battlefield?:object}} spawn
 * @returns {object} InfantrySquad cfg
 */
export function squadConfigFromRow(key, base, spawn) {
  const ctx = { tier: base.star, level: 1 };
  const r = {};
  for (let i = 0; i < SCALAR_KEYS.length; i++) {
    const k = SCALAR_KEYS[i];
    r[k] = resolveStat(base[k], k, ctx);
  }
  return {
    id: spawn.id,
    team: spawn.team,
    faction: base.faction,
    cls: 'infantry',
    x: spawn.x,
    y: spawn.y,
    events: spawn.events,
    battlefield: spawn.battlefield,
    soldierHp: r.hp,
    def: r.def,
    dmg: r.dmg,
    rofShotsPerSec: r.rof,
    rangePx: r.rng * TILE_SIZE,
    speedPx: r.spd * TILE_SIZE,
    sightRangePx: SQUAD.sightRangeTiles * TILE_SIZE,
    count: spawn.count ?? SQUAD.defaultCount,
  };
}
