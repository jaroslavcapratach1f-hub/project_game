/**
 * WorldEntityDebug — dev-only visualization for WorldEntityRegistry (S72):
 * highlights every registered entity's occupied CORE hexes (translucent
 * fill + stroke, an anchor marker, an entityId label) so a multi-hex
 * placement can be visually verified against the real world hex grid —
 * "exactly 7 cells, not approximate" (WorldHexGrid already draws every
 * tile's own outline underneath, so toggling this on top shows both at
 * once). S77 also outlines each entity's BUFFER ring (thin dashed-feel
 * stroke, no fill — distinct from the solid core highlight) so the
 * minimum-spacing rule is inspectable too. OFF by default; `WorldScene.
 * enable()` exposes the live instance as `window.debugHex` — call
 * `window.debugHex.enable()` / `.disable()`.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { hexPolygon } from '../utils/Hex.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';

const HEX_POLY_LEN = 12;
const FILL = 0xff6b35;
const FILL_ALPHA = 0.22;
const STROKE = 0xffd700;
const BUFFER_STROKE = 0x4a90d9;
const BUFFER_STROKE_ALPHA = 0.5;
const ANCHOR_COLOR = 0xffffff;
const ANCHOR_RADIUS_PX = 10;
const LABEL_GAP_PX = 40;
const HALF = 0.5;

export class WorldEntityDebug {
  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {import('./WorldField.js').WorldField} field
   */
  constructor(renderer, field) {
    /** @private */ this._renderer = renderer;
    /** @private */ this._field = field;
    /** @private */ this._root = new Container();
    /** @private */ this._active = false;
  }

  /** @returns {boolean} whether the overlay is currently showing */
  get isActive() { return this._active; }

  /** Show the overlay, rebuilt from the registry's current state. @returns {void} */
  enable() {
    this._active = true;
    this._renderer.layer('WORLD_UI').addChild(this._root);
    this.refresh();
  }

  /** Rebuild from the registry's current state (call after placing/removing an entity). @returns {void} */
  refresh() {
    if (!this._active) return;
    this._clearChildren();
    for (const entity of this._field.worldEntities.all()) this._drawEntity(entity);
  }

  /** @private destroy + detach every drawn child (Graphics/Text hold GPU resources — removeChildren alone would leak them) */
  _clearChildren() {
    const kids = this._root.removeChildren();
    for (let i = 0; i < kids.length; i++) kids[i].destroy();
  }

  /** @private @param {{id:string,anchor:{q:number,r:number},cells:{q:number,r:number}[],buffer:{q:number,r:number}[]}} entity */
  _drawEntity(entity) {
    const g = new Graphics();
    for (let i = 0; i < entity.buffer.length; i++) {
      const c = entity.buffer[i];
      const p = this._field.grid.axialToPixel(c.q, c.r);
      g.poly(hexPolygon(p.x, p.y, WORLDMAP.hexSize, new Array(HEX_POLY_LEN)));
      g.stroke({ color: BUFFER_STROKE, width: 2, alpha: BUFFER_STROKE_ALPHA });
    }
    for (let i = 0; i < entity.cells.length; i++) {
      const c = entity.cells[i];
      const p = this._field.grid.axialToPixel(c.q, c.r);
      g.poly(hexPolygon(p.x, p.y, WORLDMAP.hexSize, new Array(HEX_POLY_LEN)));
      g.fill({ color: FILL, alpha: FILL_ALPHA });
      g.stroke({ color: STROKE, width: 3, alpha: 0.9 });
    }
    const ac = this._field.grid.axialToPixel(entity.anchor.q, entity.anchor.r);
    g.circle(ac.x, ac.y, ANCHOR_RADIUS_PX).fill({ color: ANCHOR_COLOR, alpha: 0.95 });
    const label = new Text({
      text: entity.id,
      style: new TextStyle({ fontFamily: 'monospace', fontSize: 22, fill: 0xffffff, stroke: { color: 0x000000, width: 4 } }),
    });
    label.anchor.set(HALF, HALF);
    label.position.set(ac.x, ac.y - LABEL_GAP_PX);
    this._root.addChild(g, label);
  }

  /** Hide and tear down the overlay. @returns {void} */
  disable() {
    this._active = false;
    this._clearChildren();
    this._root.parent?.removeChild(this._root);
  }
}
