/**
 * InfantrySquadView — the render for ONE InfantrySquad, 2D placeholder or
 * live-3D per soldier depending on whether `UNIT_3D` has an entry for the
 * squad's `faction:cls` (S56, mirrors EntityView's own tank branch — see
 * `SquadBodies3D.js` for the per-soldier 3D body pool). 2D path: one small
 * circle + facing tick per soldier on GROUND_UNITS with a blob shadow each
 * on SHADOWS. Either way ONE aggregate HealthBar on WORLD_UI. Fixed soldier
 * count per squad, so every Graphics/body is created once in mount();
 * sync() only mutates transforms / alpha and never allocates. A soldier
 * that dies fades over SQUAD.soldier.deathFadeMs then hides.
 */
import { Graphics } from 'pixi.js';
import { ENTITY } from '../../config/EntityConfig.js';
import { SQUAD } from '../../config/InfantryConfig.js';
import { resolveUnit3D } from '../Unit3DLookup.js';
import { SquadBodies3D } from './SquadBodies3D.js';
import { HealthBar } from '../HealthBar.js';

const MS_PER_SECOND = 1000;
const HALF = 0.5;
const TICK_W = 2;
const TICK_COLOR = 0x2e2e2e;
const SHADOW = { color: 0x000000, alpha: 0.25, wScale: 1.15, hScale: 0.6 };

export class InfantrySquadView {
  /** @param {import('./InfantrySquad.js').InfantrySquad} squad */
  constructor(squad) {
    /** @private */ this._squad = squad;
    /** @private */ this._color = squad.team === 'enemy'
      ? SQUAD.soldier.enemyColor : SQUAD.soldier.color;
    /** @private @type {Graphics[]} */ this._circles = [];
    /** @private @type {Graphics[]} */ this._shadows = [];
    /** @private @type {?SquadBodies3D} */ this._bodies3D = null;
    /** @private ms since each soldier's death; -1 = still alive */ this._fade = [];
    /** @private */ this._bar = null;
    /** @private */ this._doneCount = 0;
    /** @private */ this._squadDead = false;
  }

  /**
   * @param {import('../../engine/Renderer.js').Renderer} renderer
   * @param {?import('../../engine/Unit3DLayer.js').Unit3DLayer} [unit3D] live-3D units layer (S56)
   * @returns {void}
   */
  mount(renderer, unit3D) {
    const cfg3D = resolveUnit3D(unit3D, this._squad);
    if (cfg3D) this._bodies3D = new SquadBodies3D(this._squad.soldiers.length, cfg3D, unit3D);
    else this._mount2D(renderer);
    for (let i = 0; i < this._squad.soldiers.length; i++) this._fade.push(-1);
    this._bar = new HealthBar(renderer.layer('WORLD_UI'));
  }

  /** @private @param {import('../../engine/Renderer.js').Renderer} renderer */
  _mount2D(renderer) {
    const groundLayer = renderer.layer('GROUND_UNITS');
    const shadowLayer = renderer.layer('SHADOWS');
    const r = SQUAD.soldier.radiusPx;
    for (let i = 0; i < this._squad.soldiers.length; i++) {
      const c = new Graphics()
        .circle(0, 0, r).fill(this._color)
        .rect(0, -TICK_W * HALF, SQUAD.soldier.facingTickPx, TICK_W).fill(TICK_COLOR);
      groundLayer.addChild(c);
      const sh = new Graphics()
        .ellipse(0, 0, r * SHADOW.wScale, r * SHADOW.hScale)
        .fill({ color: SHADOW.color, alpha: SHADOW.alpha });
      shadowLayer.addChild(sh);
      this._circles.push(c);
      this._shadows.push(sh);
    }
  }

  /**
   * @param {import('./InfantrySquad.js').InfantrySquad} squad
   * @param {number} dtSeconds
   * @returns {void}
   */
  sync(squad, dtSeconds) {
    this._squadDead = !squad.isAlive;
    const n = this._bodies3D?.count ?? this._circles.length;
    // each soldier's OWN eased facing (Soldier.rotation, S56), not the
    // squad's raw heading — that's what actually makes the per-soldier
    // turn-rate independence in InfantrySquad._faceStep visible on screen
    for (let i = 0; i < n; i++) this._syncSoldier(i, squad.soldiers[i], squad.soldiers[i].rotation, dtSeconds);
    this._bar.setPosition(squad.x, squad.y + ENTITY.healthBar.offsetY);
    this._bar.setSelected(squad.selected);
    this._bar.setFraction(squad.hp / squad.maxHp);
    this._bar.tick(dtSeconds);
  }

  /** @private position a live soldier (2D or 3D), or run its one-shot death fade */
  _syncSoldier(i, soldier, rotation, dt) {
    const justDied = !soldier.isAlive && this._fade[i] < 0;
    if (this._bodies3D) this._bodies3D.sync(i, soldier, rotation, justDied, dt);
    else this._syncSoldier2D(i, soldier, rotation);
    if (soldier.isAlive) return;
    let f = this._fade[i];
    if (f >= SQUAD.soldier.deathFadeMs) return;
    f = Math.max(f, 0) + dt * MS_PER_SECOND;
    this._fade[i] = f;
    const a = Math.max(0, 1 - f / SQUAD.soldier.deathFadeMs);
    this._applyFade(i, a);
    if (a <= 0) this._doneCount += 1;
  }

  /** @private @param {number} i @param {import('./Soldier.js').Soldier} soldier @param {number} rotation */
  _syncSoldier2D(i, soldier, rotation) {
    const c = this._circles[i], sh = this._shadows[i];
    c.position.set(soldier.x, soldier.y);
    c.rotation = rotation;
    sh.position.set(soldier.x, soldier.y);
  }

  /** @private @param {number} i @param {number} alpha */
  _applyFade(i, alpha) {
    if (this._bodies3D) { this._bodies3D.setWreckAlpha(i, alpha); return; }
    this._circles[i].alpha = alpha;
    this._shadows[i].alpha = SHADOW.alpha * alpha;
    if (alpha <= 0) this._circles[i].visible = this._shadows[i].visible = false;
  }

  /** @returns {boolean} squad dead AND every soldier's fade has finished */
  get wreckDone() {
    const total = this._bodies3D?.count ?? this._circles.length;
    return this._squadDead && this._doneCount >= total;
  }

  /** @returns {void} */
  unmount() {
    this._bar.destroy();
    if (this._bodies3D) { this._bodies3D.unmount(); this._bodies3D = null; }
    for (let i = 0; i < this._circles.length; i++) {
      this._circles[i].parent?.removeChild(this._circles[i]);
      this._circles[i].destroy();
      this._shadows[i].parent?.removeChild(this._shadows[i]);
      this._shadows[i].destroy();
    }
    this._circles.length = this._shadows.length = this._fade.length = 0;
  }
}
