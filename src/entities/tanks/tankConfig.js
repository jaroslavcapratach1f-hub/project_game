/**
 * tankConfig — the shared "UnitStats row → BaseTank cfg" resolver, so every
 * thin faction tank subclass is a one-liner. Pure: no PixiJS.
 */
import { resolveStat } from '../../config/StatResolution.js';
import { TILE_SIZE } from '../../config/GameConfig.js';
import { TANKS_TUNING } from '../../config/EntityConfig.js';
import { CLASS_TRAITS } from '../../config/UnitStats.js';

const CTX = { tier: 4, level: 1 }; // rows are 4★ / L1 — resolve to the base row
const SCALAR_KEYS = ['hp', 'dmg', 'def', 'pen', 'rof', 'rng', 'spd'];

/**
 * Build the cfg object for `new BaseTank(cfg)` from a unit row.
 * @param {string} key row key, also the `TANKS_TUNING` key
 * @param {object} base the UnitStats row (from TANKS / UNIQUE / TANK_HUNTERS)
 * @param {{id:string,team:string,x:number,y:number,events?:object,battlefield?:object}} spawn
 * @returns {object} BaseTank cfg
 */
export function tankConfigFromRow(key, base, spawn) {
  const r = {};
  for (let i = 0; i < SCALAR_KEYS.length; i++) {
    const k = SCALAR_KEYS[i];
    r[k] = resolveStat(base[k], k, CTX);
  }
  const armor = base.armor.map((depth) => resolveStat(depth, 'armor', CTX));
  const tuning = TANKS_TUNING[key];
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
    armor,
    speedPx: r.spd * TILE_SIZE,
    sightRangePx: tuning.sightRangeTiles * TILE_SIZE,
    rofShotsPerSec: r.rof,
    rangePx: r.rng * TILE_SIZE,
    dmg: r.dmg,
    pen: r.pen,
    aoe: base.aoe,
    noTurret: base.noTurret ?? false,
    camoSightMult: tuning.camoSightMult,
    furyChargePerSec: CLASS_TRAITS[base.cls].furyChargePerSec,
    tuning,
  };
}
