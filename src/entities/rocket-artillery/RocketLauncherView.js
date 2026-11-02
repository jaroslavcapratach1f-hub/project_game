/**
 * RocketLauncherView — placeholder Graphics for ONE RocketLauncher: a low hull
 * with a rack of `salvoSize` small cells and a backblast flash behind it on
 * VEHICLES (scaled by bodyScale), plus a HealthBar + a ReloadCountdown on
 * WORLD_UI. Every Graphics is created in mount(); sync() only mutates
 * transforms / visibility — no allocation. Rack cells vanish one per launch
 * and refill when the reload ends. No blob shadow (S59) — GroundTrails
 * already leaves this class's own real wheel tracks.
 */
import { Container, Graphics } from 'pixi.js';
import { VEHICLE, ENTITY } from '../../config/EntityConfig.js';
import { ROCKET } from '../../config/ArtilleryConfig.js';
import { HealthBar } from '../HealthBar.js';
import { ReloadCountdown } from '../ReloadCountdown.js';

const HALF = 0.5;
const MS_PER_SECOND = 1000;
const LOW = 0.6; // hull height as a fraction of its width — reads low-profile

export class RocketLauncherView {
  /** @param {import('./RocketLauncher.js').RocketLauncher} entity */
  constructor(entity) {
    /** @private */ this._entity = entity;
    /** @private */ this._enemy = entity.team === 'enemy';
    /** @private */ this._body = null;
    /** @private */ this._hull = null;
    /** @private @type {Graphics[]} */ this._cells = [];
    /** @private */ this._backblast = null;
    /** @private */ this._bar = null;
    /** @private */ this._reload = null;
    /** @private */ this._wreckMs = -1;
  }

  /** @param {import('../../engine/Renderer.js').Renderer} renderer @returns {void} */
  mount(renderer) {
    const b = VEHICLE.body;
    const s = this._entity.bodyScale;
    this._body = new Container();
    this._body.scale.set(s);
    this._hull = new Graphics()
      .rect(-b.hullPx * HALF, -b.hullPx * LOW * HALF, b.hullPx, b.hullPx * LOW)
      .fill(this._enemy ? b.enemyHull : b.hull);
    this._body.addChild(this._hull);
    this._buildBackblast(b);
    this._buildRack();
    renderer.layer('VEHICLES').addChild(this._body);
    this._bar = new HealthBar(renderer.layer('WORLD_UI'));
    this._reload = new ReloadCountdown(renderer.layer('WORLD_UI'));
  }

  /** @private a short flame rect off the hull rear (behind local +X) */
  _buildBackblast(b) {
    const bb = ROCKET.backblast;
    this._backblast = new Graphics()
      .rect(-b.hullPx * HALF - bb.lenPx, -b.barrelWidPx, bb.lenPx, b.barrelWidPx * 2)
      .fill(bb.color);
    this._backblast.visible = false;
    this._body.addChild(this._backblast);
  }

  /** @private a row of salvoSize rack cells across the bed */
  _buildRack() {
    const rk = ROCKET.rack;
    const n = this._entity.salvoSize;
    const pitch = rk.cellPx + rk.gapPx;
    for (let i = 0; i < n; i++) {
      const x = (i - (n - 1) * HALF) * pitch;
      const g = new Graphics()
        .rect(x - rk.cellPx * HALF, rk.offsetY, rk.cellPx, rk.cellPx).fill(rk.color);
      this._body.addChild(g);
      this._cells.push(g);
    }
  }

  /**
   * @param {import('./RocketLauncher.js').RocketLauncher} e
   * @param {number} dtSeconds
   * @returns {void}
   */
  sync(e, dtSeconds) {
    if (!e.isAlive) return this._syncWreck(dtSeconds);
    this._body.position.set(e.x, e.y);
    this._body.rotation = e.rotation;
    this._backblast.visible = e.backblastRemaining > 0;
    this._syncRack(e);
    this._bar.setPosition(e.x, e.y + ENTITY.healthBar.offsetY);
    this._bar.setSelected(e.selected);
    this._bar.setFraction(e.hp / e.maxHp);
    this._bar.tick(dtSeconds);
    this._reload.setPosition(e.x, e.y);
    this._reload.update(e.reloadRemaining ?? 0, e.selected);
  }

  /** @private cells vanish one per launch; empty during reload; full when ready */
  _syncRack(e) {
    const loaded = e.salvoRemaining > 0 ? e.salvoRemaining
      : e.reloadRemaining > 0 ? 0 : this._cells.length;
    for (let i = 0; i < this._cells.length; i++) this._cells[i].visible = i < loaded;
  }

  /** @private freeze, recolour, fade body over ENTITY.wreck.fadeMs */
  _syncWreck(dt) {
    if (this._wreckMs < 0) {
      this._wreckMs = 0;
      this._hull.tint = ENTITY.wreck.color;
      this._backblast.visible = false;
      for (let i = 0; i < this._cells.length; i++) this._cells[i].visible = false;
      this._bar.setHidden(true);
      this._reload.setHidden(true);
    }
    this._wreckMs += dt * MS_PER_SECOND;
    const a = Math.max(0, 1 - this._wreckMs / ENTITY.wreck.fadeMs);
    this._body.alpha = a;
  }

  /** @returns {boolean} the wreck fade has finished */
  get wreckDone() { return this._wreckMs >= ENTITY.wreck.fadeMs; }

  /** @returns {void} */
  unmount() {
    this._bar.destroy();
    this._reload.destroy();
    this._body.parent?.removeChild(this._body);
    this._body.destroy({ children: true });
  }
}
