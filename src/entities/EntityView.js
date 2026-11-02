/**
 * EntityView — owns the distributed placeholder Graphics for ONE entity and
 * syncs them each frame. Parts live on two layers: a body Container (hull +
 * turret + barrel + muzzle flash) on VEHICLES, and a HealthBar + a
 * ReloadCountdown on WORLD_UI. A `nonCombat` entity (the Gather Truck) gets
 * NO turret Container — just hull + bar. Every Graphics is created in
 * mount(); sync() only mutates transforms / tints. No blob shadow (S59) —
 * every vehicle class now leaves its own real ground tracks (GroundTrails),
 * which made the flat shadow ellipse redundant and visually wrong.
 *
 * S55: a class with a `UNIT_3D` entry (keyed `faction:cls`, see
 * `Unit3DConfig.js`) gets a real `Unit3DBody` instead of the 2D hull/turret
 * Graphics — the HealthBar is unchanged either way (still 2D, owned by
 * neither body path). The muzzle flash stays a 2D overlay in BOTH
 * paths, but a 3D-bodied unit has no 2D turret Container to inherit a
 * rotation from, so it's positioned/rotated directly from `e.turretAngle`.
 */
import { Container, Graphics } from 'pixi.js';
import { VEHICLE, ENTITY } from '../config/EntityConfig.js';
import { resolveUnit3D } from './Unit3DLookup.js';
import { Unit3DBody } from './Unit3DBody.js';
import { HealthBar } from './HealthBar.js';
import { ReloadCountdown } from './ReloadCountdown.js';

const HALF = 0.5;
const MS_PER_SECOND = 1000;
const FLASH = { color: 0xffd37a, lenPx: 10 };

export class EntityView {
  /** @param {import('./Entity.js').Entity} entity */
  constructor(entity) {
    /** @private */ this._entity = entity;
    /** @private */ this._enemy = entity.team === 'enemy';
    /** @private */ this._body = null;
    /** @private */ this._hull = null;
    /** @private */ this._turret = null;
    /** @private */ this._turretBox = null;
    /** @private */ this._barrel = null;
    /** @private */ this._flash = null;
    /** @private */ this._bar = null;
    /** @private */ this._reload = null;
    /** @private */ this._body3D = null;
    /** @private */ this._wreckMs = -1; // -1 = alive, >=0 = fading
  }

  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {?import('../engine/Unit3DLayer.js').Unit3DLayer} [unit3D] live-3D units layer (S55)
   * @returns {void}
   */
  mount(renderer, unit3D) {
    const cfg3D = resolveUnit3D(unit3D, this._entity);
    if (cfg3D) this._mount3D(renderer, unit3D, cfg3D);
    else this._mount2D(renderer);
    this._bar = new HealthBar(renderer.layer('WORLD_UI'));
    this._reload = new ReloadCountdown(renderer.layer('WORLD_UI'));
  }

  /** @private @param {import('../engine/Renderer.js').Renderer} renderer @param {import('../engine/Unit3DLayer.js').Unit3DLayer} unit3D @param {object} cfg3D */
  _mount3D(renderer, unit3D, cfg3D) {
    this._body3D = new Unit3DBody(cfg3D);
    this._body3D.mount(unit3D);
    if (this._entity.nonCombat) return;
    const b = VEHICLE.body;
    this._flash = new Graphics()
      .rect(b.barrelLenPx, -b.barrelWidPx, FLASH.lenPx, b.barrelWidPx * 2)
      .fill(FLASH.color);
    this._flash.visible = false;
    renderer.layer('VEHICLES').addChild(this._flash);
  }

  /** @private @param {import('../engine/Renderer.js').Renderer} renderer */
  _mount2D(renderer) {
    const b = VEHICLE.body;
    this._body = new Container();
    this._hull = new Graphics()
      .rect(-b.hullPx * HALF, -b.hullPx * HALF, b.hullPx, b.hullPx)
      .fill(this._enemy ? b.enemyHull : this._entity.hullTint ?? b.hull);
    this._body.addChild(this._hull);
    if (!this._entity.nonCombat) {
      this._turret = this._buildTurret(b);
      this._body.addChild(this._turret);
    }
    this._body.scale.set(this._entity.bodyScale);
    renderer.layer('VEHICLES').addChild(this._body);
  }

  /** @private @param {object} b VEHICLE.body @returns {Container} turret + barrel + flash */
  _buildTurret(b) {
    const turret = new Container();
    this._turretBox = new Graphics()
      .rect(-b.turretPx * HALF, -b.turretPx * HALF, b.turretPx, b.turretPx).fill(b.turret);
    this._barrel = new Graphics()
      .rect(0, -b.barrelWidPx * HALF, b.barrelLenPx, b.barrelWidPx).fill(b.barrel);
    this._flash = new Graphics()
      .rect(b.barrelLenPx, -b.barrelWidPx, FLASH.lenPx, b.barrelWidPx * 2)
      .fill(FLASH.color);
    this._flash.visible = false;
    turret.addChild(this._turretBox);
    turret.addChild(this._barrel);
    turret.addChild(this._flash);
    return turret;
  }

  /**
   * @param {import('./Entity.js').Entity} e
   * @param {number} dtSeconds elapsed sim time (drives the wreck fade)
   * @returns {void}
   */
  sync(e, dtSeconds) {
    if (!e.isAlive) { this._syncWreck(dtSeconds); return; }
    if (this._body3D) this._sync3D(e);
    else this._sync2D(e);
    this._bar.setPosition(e.x, e.y + ENTITY.healthBar.offsetY);
    this._bar.setSelected(e.selected);
    this._bar.setFraction(e.hp / e.maxHp);
    this._bar.tick(dtSeconds);
    this._reload.setPosition(e.x, e.y);
    this._reload.update(e.reloadRemaining ?? 0, e.selected);
  }

  /** @private @param {import('./Entity.js').Entity} e */
  _sync3D(e) {
    this._body3D.sync(e);
    if (!this._flash) return;
    const ang = e.noTurret ? e.rotation : (e.turretAngle ?? e.rotation);
    this._flash.position.set(e.x, e.y);
    this._flash.rotation = ang;
    this._flash.scale.set(e.bodyScale);
    this._flash.visible = (e.muzzleFlashRemaining ?? 0) > 0;
  }

  /** @private @param {import('./Entity.js').Entity} e */
  _sync2D(e) {
    this._body.position.set(e.x, e.y);
    this._body.rotation = e.rotation;
    if (this._turret) {
      // fixed-barrel units keep the barrel locked to the hull
      this._turret.rotation = e.noTurret ? 0 : (e.turretAngle ?? e.rotation) - e.rotation;
      this._barrel.x = -(e.recoilOffsetPx ?? 0);
      this._flash.visible = (e.muzzleFlashRemaining ?? 0) > 0;
    }
  }

  /** @private wreck: freeze, recolour, fade body to zero over fadeMs */
  _syncWreck(dt) {
    if (this._wreckMs < 0) {
      this._wreckMs = 0;
      if (this._body3D) this._body3D.markWreck();
      else this._markWreck2D();
      if (this._flash) this._flash.visible = false;
      this._bar.setHidden(true);
      this._reload.setHidden(true);
    }
    this._wreckMs += dt * MS_PER_SECOND;
    const a = Math.max(0, 1 - this._wreckMs / ENTITY.wreck.fadeMs);
    if (this._body3D) this._body3D.setWreckAlpha(a);
    else this._body.alpha = a;
  }

  /** @private one-time hull/turret recolour into the wreck tint (2D path) */
  _markWreck2D() {
    this._hull.tint = ENTITY.wreck.color;
    if (this._turret) { this._turretBox.tint = ENTITY.wreck.color; this._barrel.tint = ENTITY.wreck.color; }
  }

  /** @returns {boolean} the wreck fade has finished */
  get wreckDone() {
    return this._wreckMs >= ENTITY.wreck.fadeMs;
  }

  /** @returns {void} */
  unmount() {
    this._bar.destroy();
    this._reload.destroy();
    const was3D = Boolean(this._body3D);
    if (this._body3D) { this._body3D.unmount(); this._body3D = null; }
    const targets = was3D ? [this._flash] : [this._body];
    for (const g of targets.filter(Boolean)) {
      g.parent?.removeChild(g);
      g.destroy({ children: true });
    }
  }
}
