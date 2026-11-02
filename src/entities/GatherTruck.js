/**
 * GatherTruck — the in-game "Armored Car": one non-combat resource hauler,
 * skinned per faction (cosmetic only, GDD 07). Extends Entity — NO turret, NO
 * target, NO fire; Entity's straight-line move toward moveTarget is the whole
 * behaviour. Its stat row is star 3 (not 4 like the tanks). On-map resource
 * gathering is a world-map economy system, NOT this unit's job.
 */
import { Entity } from './Entity.js';
import { GATHER_TRUCK } from '../config/UnitStats.js';
import { resolveStat } from '../config/StatResolution.js';
import { TILE_SIZE } from '../config/GameConfig.js';
import { TRUCK, TRUCK_SKINS } from '../config/EntityConfig.js';

const KEY = 'gather_truck';
const CTX = { tier: 3, level: 1 }; // the row is star 3, not 4 like the tanks

export class GatherTruck extends Entity {
  /** @param {object} spawn { id, team, faction, x, y, events?, battlefield? } */
  constructor(spawn) {
    const base = GATHER_TRUCK[KEY];
    super({
      id: spawn.id,
      team: spawn.team,
      faction: spawn.faction,
      cls: base.cls,
      x: spawn.x,
      y: spawn.y,
      events: spawn.events,
      battlefield: spawn.battlefield,
      hp: resolveStat(base.hp, 'hp', CTX),
      def: resolveStat(base.def, 'def', CTX),
      speedPx: resolveStat(base.spd, 'spd', CTX) * TILE_SIZE,
      sightRangePx: TRUCK.sightRangeTiles * TILE_SIZE,
      nonCombat: true,
    });
    const skin = TRUCK_SKINS[spawn.faction] ?? TRUCK_SKINS.germany;
    /** cosmetic faction skin name (GDD 07) */ this.skinName = skin.name;
    /** hull fill colour EntityView reads for a non-combat entity */ this.hullTint = skin.tint;
    // FORWARD(GDD 07): world-map economy — stored, not acted on this session.
    this.carryCapacity = base.carryCapacity;
    this.gatherPerSecond = base.gatherPerSecond;
  }
}
