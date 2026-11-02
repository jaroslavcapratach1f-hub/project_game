/**
 * OrderIndicator — draws all tactical-order feedback (camera-transformed,
 * so stored coords are WORLD px). Loop system: Game registers it and calls
 * update(dt). Every Graphics is pre-allocated in enable() and reused via
 * ObjectPool — no `new Graphics()` afterwards, no allocation in update(dt).
 * The selection/range rings + aim cone live in `SelectionRing.js`, split
 * out to keep this file under the 150-line cap.
 *
 * Everything here lives on SHADOWS, not WORLD_UI (S57 — this file's LAYERS
 * comment already names SHADOWS "shadows and selection indicators"):
 * WorldScene fades WORLD_UI out at low zoom to declutter a zoomed-out view
 * of health bars/damage numbers, but a move-order line is exactly the
 * feedback a player most wants zoomed OUT, watching a battle unfold across
 * the whole field — it read as "my order didn't go through" instead of
 * "you're just zoomed out," a real bug, not a style choice.
 */
import { Graphics } from 'pixi.js';
import { ObjectPool } from '../utils/ObjectPool.js';
import { ORDERS } from '../config/OrdersConfig.js';
import { buildArrow, buildAttackLine, buildDashedLine, buildDragLine } from './orders/OrderDraw.js';
import { SelectionRing } from './orders/SelectionRing.js';

const MS_PER_SECOND = 1000;

export class OrderIndicator {
  /** @param {import('../engine/Renderer.js').Renderer} renderer */
  constructor(renderer) {
    /** @private */ this._renderer = renderer;
    /** @private @type {Graphics[]} */ this._all = [];
    /** @private @type {{g:Graphics,elapsed:number,fadeMs:number}[]} */ this._fades = [];
    /** @private @type {?SelectionRing} */ this._selRing = null;
  }

  /** Pre-allocate pools + the drag-preview Graphics. @returns {void} */
  enable() {
    const layer = this._renderer.layer('SHADOWS');
    const mk = () => { const g = new Graphics(); g.visible = false; layer.addChild(g); this._all.push(g); return g; };
    const reset = (g) => { g.clear(); g.visible = false; g.alpha = 1; };
    /** @private */ this._gfx = new ObjectPool(mk, reset, ORDERS.pool.transient);
    /** @private */ this._rings = new ObjectPool(mk, reset, ORDERS.pool.rings);
    /** @private */ this._fadeEntries = new ObjectPool(
      () => ({ g: null, elapsed: 0, fadeMs: 0 }),
      (e) => { e.g = null; e.elapsed = 0; e.fadeMs = 0; }, ORDERS.pool.transient);
    /** @private */ this._preview = mk();
    this._selRing = new SelectionRing(this._rings);
  }

  /** Destroy every Graphics and reset state. @returns {void} */
  disable() {
    for (let i = 0; i < this._all.length; i++) {
      this._all[i].parent?.removeChild(this._all[i]);
      this._all[i].destroy();
    }
    this._all.length = 0;
    this._fades.length = 0;
    this._selRing = null;
  }

  /**
   * Show / move the pulsing selection ring under a unit (one flat size for
   * every unit), a static ring at `unit.rangePx` when the unit can fight,
   * and a fixed aim cone ahead of it when the unit has no independent
   * turret (`unit.noTurret`) — see SelectionRing.js.
   * @param {{x:number,y:number,rotation?:number,noTurret?:boolean,
   *   rangePx?:?number,stance?:string}} unit live unit
   * @returns {void}
   */
  showSelection(unit) { this._selRing.show(unit); }

  /** Hide the selection ring + aim cone + range ring. @returns {void} */
  clearSelection() { this._selRing.clear(); }

  /** @param {{x:number,y:number}} from @param {{x:number,y:number}} to @returns {void} */
  showMove(from, to) {
    this._orderLine(buildArrow, from, to, ORDERS.moveArrow);
  }

  /** @param {{x:number,y:number}} from @param {{x:number,y:number}} to @returns {void} */
  showAttack(from, to) {
    this._orderLine(buildAttackLine, from, to, ORDERS.attackLine);
  }

  /** @param {{x:number,y:number}} from @param {{x:number,y:number}} base @returns {void} */
  showRecall(from, base) {
    this._orderLine(buildDashedLine, from, base, ORDERS.recallLine);
  }

  /**
   * Live drag-preview line following the finger.
   * @param {{x:number,y:number}} from @param {{x:number,y:number}} to @returns {void}
   */
  showDragPreview(from, to) {
    buildDragLine(this._preview, from, to, ORDERS.dragPreview);
    this._preview.alpha = ORDERS.dragPreview.alpha;
    this._preview.visible = true;
  }

  /** Hide the drag-preview line. @returns {void} */
  hideDragPreview() {
    this._preview.visible = false;
    this._preview.clear();
  }

  /**
   * Advance the ring pulse and every active fade.
   * @param {number} dt seconds @returns {void}
   */
  update(dt) {
    const ms = dt * MS_PER_SECOND;
    this._selRing.update(ms);
    for (let i = this._fades.length - 1; i >= 0; i--) {
      const e = this._fades[i];
      e.elapsed += ms;
      const k = e.elapsed / e.fadeMs;
      if (k >= 1) this._endFade(i);
      else e.g.alpha = 1 - k;
    }
  }

  /** @private @param {Function} builder @param {object} a @param {object} b @param {object} cfg */
  _orderLine(builder, a, b, cfg) {
    const g = this._acquireGfx();
    builder(g, a, b, cfg);
    const e = this._fadeEntries.acquire();
    e.g = g;
    e.elapsed = 0;
    e.fadeMs = cfg.fadeMs;
    this._fades.push(e);
  }

  /** @private @returns {Graphics} a visible transient, evicting the oldest if the pool is full */
  _acquireGfx() {
    if (this._gfx.getActiveCount() >= ORDERS.pool.transient && this._fades.length > 0) this._endFade(0);
    const g = this._gfx.acquire();
    g.visible = true;
    g.alpha = 1;
    return g;
  }

  /** @private swap-pop removal so update(dt) stays allocation-free @param {number} i */
  _endFade(i) {
    const e = this._fades[i];
    this._gfx.release(e.g);
    this._fades[i] = this._fades[this._fades.length - 1];
    this._fades.pop();
    this._fadeEntries.release(e);
  }
}
