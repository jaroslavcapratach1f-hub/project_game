/**
 * rocketConfig — the "UNIQUE row → RocketLauncher cfg" resolver, parallel to
 * artilleryConfig.js. Pure: no PixiJS. The launcher row carries no `armor`, no
 * `pen`, and no `minRng`; it uses `salvo` + `reloadSeconds` instead of `rof`.
 */
import { resolveStat } from '../../config/StatResolution.js';
import { TILE_SIZE } from '../../config/GameConfig.js';
import { ROCKET } from '../../config/ArtilleryConfig.js';

const CTX = { tier: 4, level: 1 }; // the launcher row is 4★ / L1
const SCALAR_KEYS = ['hp', 'def', 'dmg', 'rng', 'spd'];

/**
 * Build the cfg object for `new RocketLauncher(cfg)` from a UNIQUE row.
 * @param {string} key row key (unused; kept for the artillery/tank parallel)
 * @param {object} base the UnitStats UNIQUE row (bm13_katyusha)
 * @param {{id:string,team:string,x:number,y:number,events?:object,battlefield?:object}} spawn
 * @returns {object} RocketLauncher cfg
 */
export function rocketConfigFromRow(key, base, spawn) {
  const r = {};
  for (let i = 0; i < SCALAR_KEYS.length; i++) {
    const k = SCALAR_KEYS[i];
    r[k] = resolveStat(base[k], k, CTX);
  }
  return {
    id: spawn.id,
    team: spawn.team,
    faction: base.faction,
    cls: base.cls,
    x: spawn.x,
    y: spawn.y,
    events: spawn.events,
    battlefield: spawn.battlefield,
    hp: r.hp,
    def: r.def,
    dmg: r.dmg,
    speedPx: r.spd * TILE_SIZE,
    rangePx: r.rng * TILE_SIZE,
    sightRangePx: ROCKET.sightRangeTiles * TILE_SIZE,
    salvoSize: base.salvo,
    reloadSeconds: base.reloadSeconds,
    aoe: base.aoe ?? 0,
  };
}
