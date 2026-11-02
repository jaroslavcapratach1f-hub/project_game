/**
 * DeployableView — placeholder Graphics for ONE DeployableWeapon: a low hull +
 * barrel on VEHICLES (scaled by bodyScale), a ring of decorative crew circles on
 * GROUND_UNITS (shown only once setting up), a deploy-progress bar + a HealthBar
 * + a ReloadCountdown on WORLD_UI. Every Graphics is created in mount(); sync()
 * only mutates transforms / visibility / one scale.x — no allocation. No blob
 * shadow (S59) — every class now leaves its own real ground tracks (GroundTrails).
 */
import { Container, Graphics } from 'pixi.js';
import { VEHICLE, ENTITY } from '../../config/EntityConfig.js';
import { DEPLOYABLE } from '../../config/ArtilleryConfig.js';
import { DEPLOY_STATE } from './DeployableWeapon.js';
import { HealthBar } from '../HealthBar.js';
import { ReloadCountdown } from '../ReloadCountdown.js';
import { resolveUnit3D } from '../Unit3DLookup.js';
import { Unit3DBody } from '../Unit3DBody.js';

const HALF = 0.5;
const TWO_PI = Math.PI * 2;
const MS_PER_SECOND = 1000;
const LOW = 0.55; // hull height as a fraction of its width — reads low-profile
const FLASH = { lenPx: 8, color: 0xffd37a };

export class DeployableView {
  /** @param {import('./DeployableWeapon.js').DeployableWeapon} entity */
  constructor(entity) {
    /** @private */ this._entity = entity;
    /** @private */ this._enemy = entity.team === 'enemy';
    /** @private */ this._body = null;
    /** @private */ this._hull = null;
    /** @private */ this._barrel = null;
    /** @private */ this._flash = null;
    /** @private @type {Graphics[]} */ this._crew = [];
    /** @private */ this._prog = null;
    /** @private */ this._progFill = null;
    /** @private */ this._bar = null;
    /** @private */ this._reload = null;
    /** @private */ this._wreckMs = -1;
    this._body3D = null;
  }

  /** @param {import('../../engine/Renderer.js').Renderer} renderer
   * @param {?import('../../engine/Unit3DLayer.js').Unit3DLayer} unit3D
   * @returns {void} */
  mount(renderer, unit3D) {
    const b = VEHICLE.body;
    const s = this._entity.bodyScale;
    this._body = new Container();
    this._body.scale.set(s);
    this._buildBody(b);
    const art = resolveUnit3D(unit3D, this._entity);
    if (art) {
      this._body3D = new Unit3DBody(art);
      this._body3D.mount(unit3D);
      this._hull.visible = this._barrel.visible = false;
    }
    renderer.layer('VEHICLES').addChild(this._body);
    this._buildCrew(renderer.layer('GROUND_UNITS'));
    this._buildProgress(renderer.layer('WORLD_UI'));
    this._bar = new HealthBar(renderer.layer('WORLD_UI'));
    this._reload = new ReloadCountdown(renderer.layer('WORLD_UI'));
  }

  /** @private hull + barrel + muzzle flash, barrel along local +X */
  _buildBody(b) {
    const len = DEPLOYABLE.barrelLenPx[this._entity.cls] ?? b.barrelLenPx;
    this._hull = new Graphics()
      .rect(-b.hullPx * HALF, -b.hullPx * LOW * HALF, b.hullPx, b.hullPx * LOW)
      .fill(this._enemy ? b.enemyHull : b.hull);
    this._barrel = new Graphics()
      .rect(0, -b.barrelWidPx * HALF, len, b.barrelWidPx).fill(b.barrel);
    this._flash = new Graphics()
      .rect(len, -b.barrelWidPx, FLASH.lenPx, b.barrelWidPx * 2).fill(FLASH.color);
    this._flash.visible = false;
    this._body.addChild(this._hull, this._barrel, this._flash);
  }

  /** @private DEPLOYABLE.crew.count circles, hidden until deploying */
  _buildCrew(layer) {
    const cc = DEPLOYABLE.crew;
    for (let i = 0; i < cc.count; i++) {
      const g = new Graphics().circle(0, 0, cc.radiusPx).fill(this._enemy ? cc.enemyColor : cc.color);
      g.visible = false;
      layer.addChild(g);
      this._crew.push(g);
    }
  }

  /** @private left-anchored bg + fill bar; fill scaled by deployProgress */
  _buildProgress(layer) {
    const pb = DEPLOYABLE.progressBar;
    this._prog = new Container();
    this._prog.visible = false;
    const bg = new Graphics().rect(0, 0, pb.widthPx, pb.heightPx).fill(pb.bg);
    this._progFill = new Graphics().rect(0, 0, pb.widthPx, pb.heightPx).fill(pb.fill);
    this._prog.addChild(bg, this._progFill);
    layer.addChild(this._prog);
  }

  /**
   * @param {import('./DeployableWeapon.js').DeployableWeapon} e
   * @param {number} dtSeconds
   * @returns {void}
   */
  sync(e, dtSeconds) {
    if (!e.isAlive) return this._syncWreck(dtSeconds);
    this._body.position.set(e.x, e.y);
    this._body.rotation = e.rotation;
    this._body3D?.sync(e);
    this._flash.visible = (e.muzzleFlashRemaining ?? 0) > 0;
    this._syncCrew(e);
    this._syncProgress(e);
    this._bar.setPosition(e.x, e.y + ENTITY.healthBar.offsetY);
    this._bar.setSelected(e.selected);
    this._bar.setFraction(e.hp / e.maxHp);
    this._bar.tick(dtSeconds);
    this._reload.setPosition(e.x, e.y);
    this._reload.update(e.reloadRemaining ?? 0, e.selected);
  }

  /** @private crew ring visible only while DEPLOYING / DEPLOYED */
  _syncCrew(e) {
    const show = e.deployState === DEPLOY_STATE.DEPLOYING || e.deployState === DEPLOY_STATE.DEPLOYED;
    const orbit = DEPLOYABLE.crew.orbitPx;
    for (let i = 0; i < this._crew.length; i++) {
      const g = this._crew[i];
      g.visible = show;
      if (!show) continue;
      const a = (i / this._crew.length) * TWO_PI;
      g.position.set(e.x + Math.cos(a) * orbit, e.y + Math.sin(a) * orbit);
    }
  }

  /** @private progress bar visible only while DEPLOYING / UNDEPLOYING */
  _syncProgress(e) {
    const active = e.deployState === DEPLOY_STATE.DEPLOYING || e.deployState === DEPLOY_STATE.UNDEPLOYING;
    this._prog.visible = active;
    if (!active) return;
    const pb = DEPLOYABLE.progressBar;
    this._prog.position.set(e.x - pb.widthPx * HALF, e.y + pb.offsetY);
    const p = e.deployProgress;
    this._progFill.scale.x = p < 0 ? 0 : p > 1 ? 1 : p;
  }

  /** @private freeze, recolour, fade body over ENTITY.wreck.fadeMs */
  _syncWreck(dt) {
    if (this._wreckMs < 0) {
      this._wreckMs = 0;
      this._hull.tint = this._barrel.tint = ENTITY.wreck.color;
      this._body3D?.markWreck();
      this._flash.visible = this._prog.visible = false;
      for (let i = 0; i < this._crew.length; i++) this._crew[i].visible = false;
      this._bar.setHidden(true);
      this._reload.setHidden(true);
    }
    this._wreckMs += dt * MS_PER_SECOND;
    const a = Math.max(0, 1 - this._wreckMs / ENTITY.wreck.fadeMs);
    this._body.alpha = a;
    this._body3D?.setWreckAlpha(a);
  }

  /** @returns {boolean} the wreck fade has finished */
  get wreckDone() { return this._wreckMs >= ENTITY.wreck.fadeMs; }

  /** @returns {void} */
  unmount() {
    this._body3D?.unmount();
    this._bar.destroy();
    this._reload.destroy();
    for (const g of [this._body, this._prog, ...this._crew]) {
      g.parent?.removeChild(g);
      g.destroy({ children: true });
    }
  }
}
