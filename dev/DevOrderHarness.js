/**
 * DevOrderHarness — dev-only, deletable probe for tactical-order input
 * (gated by RENDER.devHarness, mounted like DevHarness). Places static
 * placeholder rects — one own unit (olive), two enemies (rust), and a BASE
 * marker (earth) — around world centre on the GROUND_UNITS layer, and serves
 * as the OrderController unit source (unitAt / baseAnchor).
 */
import { Graphics } from 'pixi.js';
import { TILE_SIZE, WORLD } from '../config/GameConfig.js';

const RECT_PX = 40;
const RECT_HALF = 20;
const HIT_PX = 34;              // half-extent of the square hit test around a unit
const OWN_COLOR = 0x556b2f;     // olive — palette green (own unit)
const ENEMY_COLOR = 0x8b4a2f;   // rust — enemy units
const BASE_COLOR = 0x8b7355;    // earth — palette (BASE marker)
// Layout relative to world centre, in tiles. Kept small so all rects sit on
// a phone viewport at zoom 1 (safe range ~ +/-2.5 tiles wide, +/-6 tall).
const LAYOUT = [
  { id: 'own-1', tx: 0, ty: -1, isOwn: true, color: OWN_COLOR },
  { id: 'enemy-1', tx: 2, ty: -3, isOwn: false, color: ENEMY_COLOR },
  { id: 'enemy-2', tx: -2, ty: 2, isOwn: false, color: ENEMY_COLOR },
];
const BASE_TX = 2;
const BASE_TY = 3;

export class DevOrderHarness {
  /** @param {import('./Renderer.js').Renderer} renderer */
  constructor(renderer) {
    /** @private */ this._renderer = renderer;
    /** @private @type {Graphics[]} */ this._gfx = [];
    /** @private @type {{id:string,x:number,y:number,isOwn:boolean}[]} */ this._units = [];
    /** @private */ this._base = { x: 0, y: 0 };
  }

  /** Place the rects and build the unit records. @returns {void} */
  enable() {
    const cx = WORLD.widthTiles * TILE_SIZE / 2;
    const cy = WORLD.heightTiles * TILE_SIZE / 2;
    const layer = this._renderer.layer('GROUND_UNITS');
    for (let i = 0; i < LAYOUT.length; i++) {
      const d = LAYOUT[i];
      const x = cx + d.tx * TILE_SIZE;
      const y = cy + d.ty * TILE_SIZE;
      this._gfx.push(this._rect(layer, x, y, d.color));
      this._units.push({ id: d.id, x, y, isOwn: d.isOwn });
    }
    this._base.x = cx + BASE_TX * TILE_SIZE;
    this._base.y = cy + BASE_TY * TILE_SIZE;
    this._gfx.push(this._rect(layer, this._base.x, this._base.y, BASE_COLOR));
  }

  /** Destroy all Graphics and clear state. @returns {void} */
  disable() {
    for (let i = 0; i < this._gfx.length; i++) {
      this._gfx[i].parent?.removeChild(this._gfx[i]);
      this._gfx[i].destroy();
    }
    this._gfx.length = 0;
    this._units.length = 0;
  }

  /** @private @param {object} layer @param {number} x @param {number} y @param {number} color */
  _rect(layer, x, y, color) {
    const g = new Graphics().rect(-RECT_HALF, -RECT_HALF, RECT_PX, RECT_PX).fill(color);
    g.position.set(x, y);
    layer.addChild(g);
    return g;
  }

  /**
   * OrderController unit source: unit under a world point, or null.
   * @param {number} wx @param {number} wy @returns {?{id:string,x:number,y:number,isOwn:boolean}}
   */
  unitAt(wx, wy) {
    for (let i = 0; i < this._units.length; i++) {
      const u = this._units[i];
      if (Math.abs(wx - u.x) <= HIT_PX && Math.abs(wy - u.y) <= HIT_PX) return u;
    }
    return null;
  }

  /** @returns {{x:number,y:number}} world position of the BASE marker */
  baseAnchor() {
    return this._base;
  }
}
