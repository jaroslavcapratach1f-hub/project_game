/**
 * ProjectileImpact — resolves what happens when a Projectile reaches something:
 * direct damage (DamageResolver), optional splash over aoePx, the additive
 * impact flash, and the PROJECTILE_IMPACT event. Split out of ProjectileSystem
 * to keep both files under the line cap. Camera shake on impact is EffectsSystem's
 * job (one shake path, driven off PROJECTILE_IMPACT). All scratch objects are
 * reused — no allocation per impact beyond the two event payloads (matching the
 * codebase's event convention).
 *
 * S71 extension: indirect fire (`proj.hexSplash`) resolves against the exact
 * hex it landed in — every live unit whose CURRENT position is in that same
 * hex takes a full, un-falloff hit; everyone else takes none. Checked fresh
 * off each entity's live x/y at this instant (not HexOccupancy, which only
 * tracks units at rest) — that's what lets a tank that has since driven out
 * dodge the hit, and a squad straddling two hexes mid-move take damage on
 * only the half still standing in the one that got hit.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { SPLASH } from '../config/CombatConfig.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { pixelToAxial } from '../utils/Hex.js';
import { resolveDamage } from './DamageResolver.js';

export class ProjectileImpact {
  /**
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../entities/EntityManager.js').EntityManager} entityManager
   * @param {import('./ProjectileView.js').ProjectileView} view
   */
  constructor(events, entityManager, view) {
    /** @private */ this._events = events;
    /** @private */ this._em = entityManager;
    /** @private */ this._view = view;
    /** @private */ this._dmg = { final: 0, facing: 'front' };
    /** @private */ this._origin = { x: 0, y: 0 };
    /** @private */ this._msg = { x: 0, y: 0, weapon: 'shell', targetId: null, killed: false };
    /** @private */ this._splash = { proj: null, hitId: null, hexQ: 0, hexR: 0 };
    /** @private */ this._applySplash = (e) => this._splashOne(e);
    /** @private */ this._applyHexSplash = (e) => this._hexSplashOne(e);
    /** @private reused px->axial scratch — impact hex */ this._hexA = { q: 0, r: 0 };
    /** @private reused px->axial scratch — candidate entity's hex */ this._hexB = { q: 0, r: 0 };
  }

  /**
   * @param {import('./Projectile.js').Projectile} proj
   * @param {?import('../entities/Entity.js').Entity} hitEntity nearest entity hit, or null
   * @returns {void}
   */
  resolve(proj, hitEntity) {
    let killed = false;
    if (hitEntity) {
      resolveDamage(proj, hitEntity, 1, this._dmg);
      hitEntity.lastAttackerId = proj.shooterId; // ENTITY_DIED.killerId / kill feed
      hitEntity.takeDamage(this._dmg.final, proj.weapon, this._originAt(proj));
      killed = !hitEntity.isAlive;
      if (proj.hexSplash) this._splashHex(proj, hitEntity.id);
      else if (proj.aoePx > 0) this._splashAround(proj, hitEntity.id);
    } else if (proj.hexSplash) {
      this._splashHex(proj, null);
    } else if (proj.aoePx > 0) {
      this._splashAround(proj, null);
    }
    this._view.flashAt(proj.x, proj.y);
    this._emit(proj, hitEntity ? hitEntity.id : null, killed);
  }

  /** @private splash every OTHER live entity within aoePx */
  _splashAround(proj, hitId) {
    this._splash.proj = proj;
    this._splash.hitId = hitId;
    this._em.forEachWithin(proj.x, proj.y, proj.aoePx, this._applySplash);
  }

  /** @private @param {import('../entities/Entity.js').Entity} e */
  _splashOne(e) {
    const p = this._splash.proj;
    if (!e.isAlive || e.id === this._splash.hitId || e.id === p.shooterId) return;
    const dx = e.x - p.x;
    const dy = e.y - p.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const factor = 1 - (1 - SPLASH.edgeFalloff) * (dist / p.aoePx);
    resolveDamage(p, e, factor, this._dmg);
    e.lastAttackerId = p.shooterId;
    e.takeDamage(this._dmg.final, p.weapon, this._originAt(p));
  }

  /** @private hex-exact splash: every OTHER live entity in the impact hex,
   *  checked by CURRENT live position (not HexOccupancy — a unit mid-march
   *  holds no claim, this must still answer "is it standing there right now") */
  _splashHex(proj, hitId) {
    const a = pixelToAxial(proj.x, proj.y, WORLDMAP.hexSize, this._hexA);
    this._splash.proj = proj;
    this._splash.hitId = hitId;
    this._splash.hexQ = a.q;
    this._splash.hexR = a.r;
    this._em.forEach(this._applyHexSplash);
  }

  /** @private @param {import('../entities/Entity.js').Entity} e */
  _hexSplashOne(e) {
    const s = this._splash;
    const p = s.proj;
    if (!e.isAlive || e.id === s.hitId || e.id === p.shooterId) return;
    const ea = pixelToAxial(e.x, e.y, WORLDMAP.hexSize, this._hexB);
    if (ea.q !== s.hexQ || ea.r !== s.hexR) return;
    resolveDamage(p, e, 1, this._dmg); // binary — full damage inside the hex, none outside
    e.lastAttackerId = p.shooterId;
    e.takeDamage(this._dmg.final, p.weapon, this._originAt(p));
  }

  /** @private reused shot-origin point for Entity.facingOf */
  _originAt(proj) {
    this._origin.x = proj.originX;
    this._origin.y = proj.originY;
    return this._origin;
  }

  /** @private @param {import('./Projectile.js').Projectile} proj */
  _emit(proj, targetId, killed) {
    const m = this._msg;
    m.x = proj.x;
    m.y = proj.y;
    m.weapon = proj.weapon;
    m.targetId = targetId;
    m.killed = killed;
    this._events.emit(EVENTS.PROJECTILE_IMPACT, m);
  }
}
