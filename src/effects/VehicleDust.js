/**
 * VehicleDust — loop system for what a moving vehicle (anything not infantry)
 * leaves behind: a tan dust puff through the shared ParticleSystem, and a
 * pair of wheel-contact trails stamped onto LAYERS.DECALS via the field's decal sink.
 * Movement is measured from the entity's own frame-to-frame displacement, so it
 * needs no hook into the unit's internal move state. Per-entity throttles + the
 * last-position bookkeeping live in Maps, pruned as entities disappear.
 */
import { VEHICLE } from '../config/EntityConfig.js';
import { GroundTrails } from './GroundTrails.js';

const MS_PER_SECOND = 1000;
const INFANTRY = 'infantry';

export class VehicleDust {
  /**
   * @param {import('../entities/EntityManager.js').EntityManager} entityManager
   * @param {import('./ParticleSystem.js').ParticleSystem} particles
   * @param {?{addGroundMark:Function}} [field] world field — sink for tread decals
   */
  constructor(entityManager, particles, field = null) {
    /** @private */ this._em = entityManager;
    /** @private */ this._particles = particles;
    this._trails = new GroundTrails(field);
    /** @private @type {Map<string,number>} id -> ms since the last puff */ this._acc = new Map();
    /** @private @type {Map<string,{x:number,y:number}>} id -> last-tick position */ this._prev = new Map();
    /** @private reused per-tick "seen this frame" set for pruning */ this._seen = new Set();
    /** @private */ this._tick = (e) => this._perEntity(e);
  }

  /** @returns {void} */
  enable() {
    this._trails.clear();
    this._acc.clear();
    this._prev.clear();
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    this._dt = dt;
    this._seen.clear();
    this._trails.begin();
    this._em.forEach(this._tick);
    this._trails.end();
    this._prune();
  }

  /** @private @param {import('../entities/Entity.js').Entity} e */
  _perEntity(e) {
    this._trails.update(e);
    if (e.cls === INFANTRY || !e.isAlive) return;
    this._seen.add(e.id);
    const prev = this._prev.get(e.id);
    const moved = prev ? Math.hypot(e.x - prev.x, e.y - prev.y) : 0;
    if (prev) { prev.x = e.x; prev.y = e.y; } else this._prev.set(e.id, { x: e.x, y: e.y });
    const speed = moved / this._dt;
    this._emitDust(e, speed);
  }

  /** @private tan puff behind the hull through the shared ParticleSystem */
  _emitDust(e, speed) {
    const d = VEHICLE.dust;
    let acc = (this._acc.get(e.id) ?? d.emitIntervalMs) + this._dt * MS_PER_SECOND;
    if (speed >= d.minSpeedPxPerSec && acc >= d.emitIntervalMs) {
      const bx = e.x - Math.cos(e.rotation) * d.offsetPx;
      const by = e.y - Math.sin(e.rotation) * d.offsetPx;
      this._particles.emitBurst(d.particle, bx, by, 1, d.layer);
      acc = 0;
    }
    this._acc.set(e.id, acc);
  }

  /** @private drop bookkeeping for entities the manager no longer reports */
  _prune() {
    for (const id of this._acc.keys()) {
      if (this._seen.has(id)) continue;
      this._acc.delete(id);
      this._prev.delete(id);
    }
  }

  /** @returns {void} */
  disable() {
    this._trails.clear();
    this._acc.clear();
    this._prev.clear();
    this._seen.clear();
  }
}
