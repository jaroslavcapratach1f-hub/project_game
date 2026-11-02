/**
 * DamageNumbers — pooled world-space floating damage text on the WORLD_UI
 * layer. Loop system (mirrors OrderIndicator): every Text is pre-allocated in
 * enable() and reused via ObjectPool — no `new Text()` afterwards, no
 * allocation in update(dt). One shared TextStyle; per-number colour via .tint.
 */
import { Text, TextStyle } from 'pixi.js';
import { ObjectPool } from '../utils/ObjectPool.js';
import { EVENTS } from '../engine/GameEvents.js';
import { DAMAGE_NUMBERS } from '../config/FeedbackConfig.js';
import { clamp, lerp, randomRange } from '../utils/MathUtils.js';

const HALF = 0.5;
const MS_PER_SECOND = 1000;
const WHITE = 0xffffff;

export class DamageNumbers {
  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   */
  constructor(renderer, events) {
    /** @private */ this._renderer = renderer;
    /** @private */ this._events = events;
    /** @private @type {Text[]} */ this._all = [];
    /** @private @type {object[]} live animation items */ this._active = [];
    /** @private @type {?ObjectPool} */ this._pool = null;
    /** @private @type {?TextStyle} */ this._style = null;
    /** @private shown while the `damageNumbers` setting is on */ this._shown = true;
    /** @private */ this._onDamaged = (p) => this._spawn(p);
    /** @private */ this._onSetting = (p) => this._applySetting(p);
  }

  /** @returns {number} live numbers */ get activeCount() { return this._active.length; }
  /** @returns {number} Text objects ever created (never > poolSize in steady state) */
  get poolTotal() { return this._pool ? this._pool.getTotalCount() : 0; }

  /** Build the shared style, pre-allocate the Text pool, subscribe. @returns {void} */
  enable() {
    const s = DAMAGE_NUMBERS.style;
    this._style = new TextStyle({
      fontFamily: s.fontFamily, fontSize: s.fontSize, fontWeight: s.fontWeight,
      fill: WHITE, stroke: { color: s.stroke, width: s.strokeThickness },
    });
    const layer = this._renderer.layer('WORLD_UI');
    const mk = () => {
      const t = new Text({ text: '', style: this._style });
      t.anchor.set(HALF);
      t.visible = false;
      layer.addChild(t);
      this._all.push(t);
      return t;
    };
    this._pool = new ObjectPool(mk, resetText, DAMAGE_NUMBERS.poolSize);
    this._events.on(EVENTS.ENTITY_DAMAGED, this._onDamaged);
    this._events.on(EVENTS.SETTINGS_CHANGED, this._onSetting);
  }

  /** Unsubscribe, release live numbers, destroy every Text + the style. @returns {void} */
  disable() {
    this._events.off(EVENTS.ENTITY_DAMAGED, this._onDamaged);
    this._events.off(EVENTS.SETTINGS_CHANGED, this._onSetting);
    for (let i = 0; i < this._active.length; i++) this._pool.release(this._active[i].t);
    this._active.length = 0;
    for (let i = 0; i < this._all.length; i++) {
      this._all[i].parent?.removeChild(this._all[i]);
      this._all[i].destroy();
    }
    this._all.length = 0;
    this._style?.destroy();
    this._style = null;
  }

  /** @private @param {{key:string,value:*}} p SETTINGS_CHANGED — react to `damageNumbers` */
  _applySetting(p) {
    if (p.key !== 'damageNumbers') return;
    this._shown = Boolean(p.value);
    if (this._shown) return;
    for (let i = 0; i < this._active.length; i++) this._pool.release(this._active[i].t);
    this._active.length = 0;
  }

  /** @private @param {object} p ENTITY_DAMAGED payload */
  _spawn(p) {
    if (!this._shown) return;
    const cfg = DAMAGE_NUMBERS;
    if (this._active.length >= cfg.poolSize) this._pool.release(this._active.shift().t);
    const t = this._pool.acquire();
    t.text = (p.crit ? cfg.critPrefix : '') + Math.round(p.amount);
    t.tint = p.crit ? cfg.colors.crit : p.team === 'player' ? cfg.colors.playerHit : cfg.colors.normal;
    const startY = p.y + cfg.spawnOffsetY;
    t.position.set(p.x + randomRange(-cfg.jitterXPx, cfg.jitterXPx), startY);
    t.scale.set(0);
    t.alpha = 1;
    t.visible = true;
    this._active.push({
      t, startY, ageMs: 0,
      vy: p.team === 'player' ? cfg.fallSpeedPx : -cfg.riseSpeedPx,
      fadeMs: randomRange(cfg.fadeMs.min, cfg.fadeMs.max),
    });
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    const ms = dt * MS_PER_SECOND;
    let write = 0;
    for (let i = 0; i < this._active.length; i++) {
      const it = this._active[i];
      if (this._step(it, dt, ms)) this._pool.release(it.t);
      else this._active[write++] = it;
    }
    this._active.length = write;
  }

  /** @private advance one number; @returns {boolean} true once it should retire */
  _step(it, dt, ms) {
    const cfg = DAMAGE_NUMBERS;
    it.ageMs += ms;
    it.t.y += it.vy * dt;
    const sk = it.ageMs / cfg.scaleIn.ms;
    if (sk >= 1) it.t.scale.set(cfg.scaleIn.settle);
    else if (sk >= HALF) it.t.scale.set(lerp(cfg.scaleIn.to, cfg.scaleIn.settle, (sk - HALF) * 2));
    else it.t.scale.set(lerp(0, cfg.scaleIn.to, sk * 2));
    const fade = it.ageMs - cfg.scaleIn.ms;
    if (fade > 0) it.t.alpha = clamp(1 - fade / it.fadeMs, 0, 1);
    return Math.abs(it.t.y - it.startY) >= cfg.travelPx || it.t.alpha <= 0;
  }
}

/** @param {Text} t */
function resetText(t) {
  t.visible = false;
  t.alpha = 1;
  t.scale.set(1);
  t.tint = WHITE;
}
