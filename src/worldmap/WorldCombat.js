/**
 * WorldCombat — Phase B combat on the world map (GDD 02). Owns EffectsSystem +
 * ProjectileSystem + VehicleDust + FuryManager + AIManager + DamageNumbers
 * and a placeholder Legion camp near the base. Shares BaseArmy's
 * EntityManager + WorldField (whose decal sink WorldScene wires). The
 * loop: a player ORDER_ATTACK makes a squad fire → the first CALM shot trips
 * Field Fury → all field units flip to auto-fire → the enemy AIControllers
 * ENGAGE and shoot back; a hit inside the base compound arms Base Fury.
 *
 * S80: unit-to-unit spacing is no longer a separate nudge pass here — it's
 * entityMotion.js/TankMotor's own per-step hard-stop + slide-around now
 * (see those files), which is hex-aware and coordinated with the actual
 * move order, unlike the old `Separation` pass this replaced (a raw-
 * distance nudge running independently every tick, uncoordinated with
 * entityMotion's own slide — two different systems correcting the same
 * position the same tick read as a bounce, the player's own report).
 */
import { EffectsSystem } from '../effects/EffectsSystem.js';
import { ProjectileSystem } from '../combat/ProjectileSystem.js';
import { DamageSmoke } from '../effects/DamageSmoke.js';
import { VehicleDust } from '../effects/VehicleDust.js';
import { FuryManager } from '../systems/FuryManager.js';
import { AIManager } from '../ai/AIManager.js';
import { DamageNumbers } from '../ui/DamageNumbers.js';
import { makeUnit } from './unitRoster.js';
import { BASE } from '../config/BaseConfig.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { axialToPixel } from '../utils/Hex.js';

const HALF = 0.5;
const TWO = 2;

export class WorldCombat {
  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {import('../engine/Camera.js').Camera} camera
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {{field:import('./WorldField.js').WorldField, em:import('../entities/EntityManager.js').EntityManager,
   *   unit3D:import('../engine/Unit3DLayer.js').Unit3DLayer}} shared BaseArmy's own field/em (S55 adds unit3D) —
   *   bundled to keep this constructor's own param count under the lint cap
   */
  constructor(renderer, camera, events, { field, em, unit3D }) {
    this._renderer = renderer;
    this._unit3D = unit3D;
    this._events = events;
    this._field = field;
    this._em = em;
    this._fx = new EffectsSystem(renderer, camera, field, events);
    this._fury = new FuryManager(em, field, events);
    this._ai = new AIManager(em, field);
    this._dmgNums = new DamageNumbers(renderer, events);
    /** @private built in enable() once fx.particles exists */ this._proj = null;
    /** @private built in enable() once fx.particles exists */ this._dust = null;
  }

  /** @returns {void} */
  enable() {
    this._fx.enable();
    this._proj = new ProjectileSystem(this._events, this._renderer, this._fx.particles, this._em, this._field);
    this._proj.enable();
    this._dust = new VehicleDust(this._em, this._fx.particles, this._field); // puffs + tread decals
    this._dust.enable();
    this._damageSmoke = new DamageSmoke(this._em, this._fx.particles);
    this._fury.enable();
    this._ai.enable(this._events);
    this._dmgNums.enable();
    this._spawnCamp();
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    this._ai.update(dt);
    this._fury.update(dt);
    this._proj.update(dt);
    this._dust.update(dt);
    this._damageSmoke.update(dt);
    this._fx.update(dt);
    this._dmgNums.update(dt);
  }

  /** @returns {void} */
  disable() {
    this._ai.disable(this._events);
    this._fury.disable();
    this._proj.disable();
    this._dust.disable();
    this._damageSmoke.clear();
    this._fx.disable();
    this._dmgNums.disable();
  }

  /** @private spawn the Legion camp a few hexes off the base and mark it home */
  _spawnCamp() {
    const en = BASE.enemy;
    const b = WORLDMAP.baseHex;
    const c = axialToPixel(b.q + en.campHexOffset.dq, b.r + en.campHexOffset.dr, WORLDMAP.hexSize);
    this._field.setSpawn('enemy', c.x, c.y);
    const perRow = Math.ceil(en.roster.length / TWO);
    for (let i = 0; i < en.roster.length; i++) {
      const col = i % perRow;
      const row = (i / perRow) | 0;
      const { entity, view } = makeUnit(en.roster[i], {
        id: `en-${i + 1}`, team: 'enemy',
        x: c.x + (col - (perRow - 1) * HALF) * en.spawnSpreadPx,
        y: c.y + row * en.spawnSpreadPx,
        events: this._events, battlefield: this._field,
      });
      view.mount(this._renderer, this._unit3D);
      this._em.add(entity, view);
    }
  }
}
