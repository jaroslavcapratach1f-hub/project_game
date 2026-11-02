/**
 * OrderHexFlow — the hex-lock targeting state `OrderController` drives
 * (S71, the player's own spec): while dragging, the destination locks to
 * the nearest hex and shows a green (empty) or red (enemy-occupied) marker
 * (`HexTargetMarker`); after a plain tap-select instead of a drag, the same
 * classification shows a "GO"/"ATTACK" confirm button (`HexGoButton`) at
 * the tapped hex instead of acting immediately, so the player can see and
 * confirm the exact hex before committing. `OrderController` still owns
 * actually emitting ORDER_MOVE/ORDER_ATTACK — this class only owns the
 * hex math + the two visuals' state.
 */
import { hexCentreAt, classifyHex } from './HexTargeting.js';
import { HexTargetMarker } from '../ui/HexTargetMarker.js';
import { HexGoButton } from '../ui/HexGoButton.js';

export class OrderHexFlow {
  /**
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {import('../entities/EntityManager.js').EntityManager} em
   * @param {import('../world/WorldEntityRegistry.js').WorldEntityRegistry} worldEntities S74 — base-territory lookup, see HexTargeting.classifyHex
   * @param {number} hexSize world px, hexagon centre-to-corner
   */
  constructor(renderer, em, worldEntities, hexSize) {
    this._renderer = renderer;
    this._em = em;
    this._worldEntities = worldEntities;
    this._hexSize = hexSize;
    this._marker = new HexTargetMarker(renderer);
    this._go = new HexGoButton();
    /** @private pending tap-select target awaiting a GO/ATTACK confirm tap, or null */
    this._pending = null;
  }

  /** @returns {void} */
  enable() { this._marker.enable(); this._renderer.layer('WORLD_UI').addChild(this._go.view); }

  /** @returns {void} */
  disable() { this._marker.disable(); this._go.destroy(); this._pending = null; }

  /** @returns {boolean} a tap-select target is awaiting confirmation */
  hasPending() { return this._pending !== null; }

  /** @param {number} wx @param {number} wy world px @returns {{hex:{x:number,y:number},kind:string,entity:?object}} classify + show the drag-lock marker (at the base's own anchor when the hex is part of a locked base territory, S74) */
  dragMove(wx, wy) {
    const hex = hexCentreAt(wx, wy, this._hexSize);
    const c = classifyHex(this._em, this._worldEntities, hex, this._hexSize);
    this._marker.show(c.hex.x, c.hex.y, c.kind);
    return c;
  }

  /** @returns {void} drag ended — hide the lock marker (the caller already has the last classification from dragMove) */
  dragEnd() { this._marker.hide(); }

  /** @param {number} wx @param {number} wy world px @returns {void} plain tap-select on open ground — show the GO/ATTACK confirm button at the locked hex, don't act yet */
  targetHex(wx, wy) {
    const hex = hexCentreAt(wx, wy, this._hexSize);
    const c = classifyHex(this._em, this._worldEntities, hex, this._hexSize);
    this._go.show(c.hex.x, c.hex.y, c.kind);
    this._pending = c;
  }

  /** @param {number} wx @param {number} wy world px @returns {?{hex:object,kind:string,entity:?object}} the pending target if this point hits the GO button, consuming it; null otherwise */
  confirmIfHit(wx, wy) {
    if (!this._pending || !this._go.contains(wx, wy)) return null;
    const t = this._pending;
    this.clearPending();
    return t;
  }

  /** @returns {void} */
  clearPending() { this._go.hide(); this._pending = null; }
}
