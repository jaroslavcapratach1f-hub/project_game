/** Health-driven vehicle smoke, following live hull positions through the shared pool. */
import { DAMAGE_SMOKE as C } from '../config/DamageSmokeConfig.js';
import { PARTICLES } from '../config/EffectsConfig.js';
import { GROUND_TRAIL } from '../config/GroundTrailConfig.js';
import { contactOffset } from './TrailProjection.js';

export class DamageSmoke {
  /** @param {object} entities live EntityManager @param {object} particles shared ParticleSystem */
  constructor(entities, particles) {
    this._entities = entities; this._particles = particles;
    this._acc = new Map(); this._seen = new Set(); this._offset = { x: 0, y: 0 };
    this._tick = (e) => this._unit(e);
  }
  /** @param {number} dt seconds; healing/destruction stops new smoke immediately */
  update(dt) {
    this._dt = Math.min(dt, C.maxTickSeconds);
    this._seen.clear(); this._entities.forEach(this._tick);
    for (const id of this._acc.keys()) if (!this._seen.has(id)) this._acc.delete(id);
  }
  /** @private Infantry retain their paint but do not emit vehicle-engine smoke. */
  _unit(e) {
    if (!e.isAlive || e.hp <= 0 || e.cls === 'infantry') return;
    const fraction = e.hp / e.maxHp;
    let stage = null;
    for (const s of C.stages) if (fraction <= s.atFrac) stage = s;
    if (!stage) return;
    this._seen.add(e.id);
    const total = (this._acc.get(e.id) ?? 0) + this._dt * stage.rate;
    const due = Math.floor(total);
    this._acc.set(e.id, total - due);
    const available = Math.max(0, PARTICLES.poolSize - C.reserveParticles - (this._particles.activeCount ?? 0));
    const count = Math.min(due, available);
    if (!count) return;
    const p = GROUND_TRAIL.models[`${e.faction}:${e.cls}`] ?? GROUND_TRAIL.classes[e.cls];
    contactOffset(e.rotation, -(p?.rear ?? 0) * C.rearFraction, 0, p?.projected, this._offset);
    this._particles.emitBurst(stage.particle, e.x + this._offset.x,
      e.y + this._offset.y - C.heightPx * (e.bodyScale ?? 1), count, C.layer);
  }
  /** Clear emission history when the world combat system is disabled. */
  clear() { this._acc.clear(); this._seen.clear(); }
}
