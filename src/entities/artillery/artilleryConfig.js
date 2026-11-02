/**
 * artilleryConfig — the shared "UNIQUE row → DeployableWeapon cfg" resolver, so
 * every thin deployable subclass is a one-liner. Pure: no PixiJS. Parallel to
 * tanks/tankConfig.js, but the rows carry no `armor` array and the howitzers no
 * `pen` — both are guarded here.
 */
import { resolveStat } from '../../config/StatResolution.js';
import { TILE_SIZE } from '../../config/GameConfig.js';
import { ARTILLERY_TUNING, AT_GUN } from '../../config/ArtilleryConfig.js';

const CTX = { tier: 4, level: 1 }; // the artillery rows are 4★ / L1
const SCALAR_KEYS = ['hp', 'dmg', 'def', 'rof', 'rng', 'spd'];

/**
 * Build the cfg object for `new DeployableWeapon(cfg)` from a UNIQUE row.
 * @param {string} key row key, also the `ARTILLERY_TUNING` key
 * @param {object} base the UnitStats UNIQUE row (pak40 / m12_gmc / isu152)
 * @param {{id:string,team:string,x:number,y:number,events?:object,battlefield?:object}} spawn
 * @returns {object} DeployableWeapon cfg
 */
export function artilleryConfigFromRow(key, base, spawn) {
  const r = {};
  for (let i = 0; i < SCALAR_KEYS.length; i++) {
    const k = SCALAR_KEYS[i];
    r[k] = resolveStat(base[k], k, CTX);
  }
  const pen = base.pen === undefined ? 0 : resolveStat(base.pen, 'pen', CTX);
  const armor = base.armor ? base.armor.map((d) => resolveStat(d, 'armor', CTX)) : [0, 0, 0];
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
    pen,
    speedPx: r.spd * TILE_SIZE, // limbered crawl (row spd is already tiny)
    sightRangePx: ARTILLERY_TUNING[key].sightRangeTiles * TILE_SIZE,
    rofShotsPerSec: r.rof,
    rangePx: r.rng * TILE_SIZE,
    minRngPx: (base.minRng ?? 0) * TILE_SIZE,
    dmg: r.dmg,
    aoe: base.aoe ?? 0,
    indirect: base.indirect ?? false,
    shieldFrontMult: base.cls === 'atGun' ? AT_GUN.shieldFrontMult : 1,
  };
}
