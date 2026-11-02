/**
 * EffectsSystem — loop system that owns the ParticleSystem and turns combat
 * events into explosions: PROJECTILE_IMPACT → an explosion keyed by weapon
 * (`bullet` → none), ENTITY_DIED → a death blast. S59: ordinary weapon-hit
 * impacts no longer shake the camera — with dozens of shots landing per
 * second across a battle, a shake on every one read as constant screen
 * jitter, not impact (the user's own explicit call: "makes no sense").
 * ENTITY_DIED still shakes — a unit's own death is a rare, one-off beat.
 * Also owns the OVERLAY full-screen flash used by massive blasts. Dev
 * keybinds 5/6/7/8 fire the four presets at camera centre.
 */
import { Graphics } from 'pixi.js';
import { EVENTS } from '../engine/GameEvents.js';
import { RENDER } from '../config/GameConfig.js';
import { EXPLOSION, IMPACT_EXPLOSION, DEATH_EXPLOSION, DEATH_SHAKE } from '../config/EffectsConfig.js';
import { ParticleSystem } from './ParticleSystem.js';
import {
  spawnExplosion, explosionSmall, explosionMedium, explosionLarge, explosionMassive,
} from './Explosion.js';

const MS_PER_SECOND = 1000;
const DEV_KEYS = {
  '5': explosionSmall, '6': explosionMedium, '7': explosionLarge, '8': explosionMassive,
};

export class EffectsSystem {
  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {import('../engine/Camera.js').Camera} camera
   * @param {?import('../worldmap/WorldField.js').WorldField} battlefield
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   */
  constructor(renderer, camera, battlefield, events) {
    /** @private */ this._renderer = renderer;
    this.camera = camera;
    this.battlefield = battlefield;
    /** @private */ this._events = events;
    /** @type {?ParticleSystem} */ this.particles = null;
    /** @private */ this._flash = null;
    /** @private */ this._flashMs = 0;
    /** @private */ this._flashDur = 1;
    /** @private */ this._onImpact = (p) => this._impact(p);
    /** @private */ this._onDeath = (p) => this._death(p);
    /** @private */ this._onKey = (e) => this._key(e);
  }

  /** @returns {void} */
  enable() {
    this.particles = new ParticleSystem(this._renderer);
    this.particles.enable();
    this._flash = new Graphics();
    this._flash.visible = false;
    this._renderer.layer('OVERLAY').addChild(this._flash);
    this._events.on(EVENTS.PROJECTILE_IMPACT, this._onImpact);
    this._events.on(EVENTS.ENTITY_DIED, this._onDeath);
    if (RENDER.devEffects && typeof window !== 'undefined') {
      window.addEventListener('keydown', this._onKey);
      window.fx = this;
    }
  }

  /**
   * Throw a brief full-screen white flash on the OVERLAY layer.
   * @param {number} ms fade-out duration @returns {void}
   */
  screenFlash(ms) {
    const sf = EXPLOSION.screenFlash;
    const scr = this._renderer.app.screen;
    this._flash.clear().rect(0, 0, scr.width, scr.height).fill(sf.color);
    this._flash.alpha = sf.fromAlpha;
    this._flash.visible = true;
    this._flashMs = 0;
    this._flashDur = ms;
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    this.particles.update(dt);
    if (!this._flash.visible) return;
    this._flashMs += dt * MS_PER_SECOND;
    const k = this._flashMs / this._flashDur;
    if (k >= 1) { this._flash.visible = false; return; }
    this._flash.alpha = EXPLOSION.screenFlash.fromAlpha * (1 - k);
  }

  /** @private PROJECTILE_IMPACT → weapon-keyed explosion, no shake (`bullet` → none) */
  _impact(p) {
    const key = IMPACT_EXPLOSION[p.weapon];
    if (key) spawnExplosion(this, p.x, p.y, key, false);
  }

  /** @private ENTITY_DIED → death blast + shake */
  _death(p) {
    if (typeof p.x !== 'number') return;
    spawnExplosion(this, p.x, p.y, DEATH_EXPLOSION, false);
    this.camera.shake(DEATH_SHAKE.intensity, DEATH_SHAKE.durationMs, DEATH_SHAKE.type);
  }

  /** @private @param {KeyboardEvent} e */
  _key(e) {
    const fn = DEV_KEYS[e.key];
    if (fn) fn(this, this.camera.x, this.camera.y);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.PROJECTILE_IMPACT, this._onImpact);
    this._events.off(EVENTS.ENTITY_DIED, this._onDeath);
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this._onKey);
      if (window.fx === this) delete window.fx;
    }
    this.particles.destroy();
    this._flash.parent?.removeChild(this._flash);
    this._flash.destroy();
    this._flash = null;
    this.particles = null;
  }
}
