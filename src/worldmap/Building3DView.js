/**
 * Building3DView — one building's live-3D map presence: loads its GLB into
 * `Base3DLayer` at a grid slot, scales in/out with the camera-zoom LOD
 * reveal signal. Generalizes S54's original `HqView.js` (the first building
 * converted to live 3D) so every 3D-converted building shares one class
 * instead of a near-duplicate per building — see `Building3DConfig.js` for
 * the per-building data and `Buildings3D.js` for the owning registry.
 *
 * S54 (later): drag-relocate + HQ's far-zoom recentre. Only HQ has
 * `farScale > 1` (the oversized "stands in for the whole base" far-zoom
 * look, `WORLDMAP.lod.hqFarScale`) — for exactly that case, `setBlend` now
 * ALSO lerps POSITION between the plot centre (reveal=0, matching the
 * already-built far-zoom illusion regardless of where HQ has actually been
 * dragged to) and its own true `(cx,cy)` (reveal=1). Every other building
 * (`farScale:0`) keeps its fixed true position at every reveal, unchanged.
 */
import { BarracksYard } from './BarracksYard.js';
import { BASE } from '../config/BaseConfig.js';
import { clamp, lerp } from '../utils/MathUtils.js';

export class Building3DView {
  /**
   * @param {import('../engine/Base3DLayer.js').Base3DLayer} base3D
   * @param {string} id the `Base3DLayer` model key — UNIQUE per building
   *   INSTANCE (e.g. `` `barracks#3` `` for a multi-unique id), not the bare
   *   config id, so two instances sharing a config never collide in
   *   `Base3DLayer`'s own id-keyed Maps (`Buildings3D` owns the real
   *   instance identity; see its own doc)
   * @param {string} cfgId `BaseGridConfig`/`BUILDING_3D` config id — used
   *   only for identity checks against the BUILDING TYPE (e.g. the
   *   BarracksYard attachment below), never as a `Base3DLayer` key
   * @param {{url:string, footprint:{w:number,h:number}, rotationYDeg:number, farScale:number}} cfg
   */
  constructor(base3D, id, cfgId, cfg) {
    this._base3D = base3D;
    this._id = id;
    this._cfg = cfg;
    this._scale = cfg.farScale;
    this._cx = 0;
    this._cy = 0;
    this._reveal = 0;
    this._dragging = false;
    this._forceHidden = false;
    this._yard = cfgId === 'barracks' ? new BarracksYard() : null;
    this._loadVersion = 0;
  }

  /** @returns {number} current LOD scale (0 = invisible) */
  get scale() { return this._scale; }

  /**
   * @returns {{cx:number,cy:number}} the CURRENTLY RENDERED position — equal
   * to the true `(cx,cy)` for every building except HQ's far-zoom stand-in,
   * where it's the SAME centre-lerp `_applyBlend` renders with. Hit-testing
   * (`Buildings3D.buildingAt`) and the building menu's own anchor
   * (`BuildingContext._buildingAnchor`) must both use THIS, not the true
   * position — otherwise, whenever HQ isn't at full reveal (i.e. anywhere
   * but fully zoomed in), a tap lands where the player actually SEES HQ but
   * the hit-test/menu still target wherever it's been dragged to, missing
   * entirely (S54, reported as "in its new location, clicking does nothing").
   */
  get visualPosition() {
    const fromCentre = this._cfg.farScale > 1;
    return {
      cx: fromCentre ? lerp(0, this._cx, this._reveal) : this._cx,
      cy: fromCentre ? lerp(0, this._cy, this._reveal) : this._cy,
    };
  }

  /** @param {number} cx @param {number} cy grid-cell centre @returns {void} */
  enable(cx, cy) {
    this._cx = cx; this._cy = cy;
    const { url, footprint, rotationYDeg } = this._cfg;
    const version = ++this._loadVersion;
    this._base3D.setBuildingModel(this._id, url, cx, cy, { footprint, rotationYDeg }).then(() => {
      if (version === this._loadVersion) this._yard?.attach(this._base3D._models.get(this._id).root);
    });
  }

  /** @param {string} cls assigned troop class @returns {void} */
  setProduction(cls) { this._yard?.setProduction(cls); }

  /** @param {number} _dt seconds @returns {void} FORWARD: drive the model's own idle animation */
  update(_dt) {}

  /**
   * @param {number} reveal 0..1 across `WORLDMAP.lod.buildingBand` @returns {void}
   * Skipped (beyond just remembering `reveal` for when the drag ends) while
   * `_dragging` — `BaseSite` calls this every sim tick regardless, and it
   * would otherwise fight `updateDrag`'s position every ~50ms, snapping the
   * ghost back to its true rest position mid-drag (S54, reported as "moves
   * between grids way too fast / like a glitch").
   */
  setBlend(reveal) {
    this._reveal = clamp(reveal, 0, 1);
    if (this._dragging) return;
    this._applyBlend();
  }

  /**
   * @param {boolean} hidden @returns {void} force fully hidden regardless of
   * `reveal` (S57 pin-mode swap — HQ's `farScale > 1` never otherwise
   * reaches scale 0 on its own, so this is the only way to hide it).
   * Independent of call order against `setBlend` in the same frame —
   * `_applyBlend` re-checks `_forceHidden` every time either setter runs.
   */
  setForceHidden(hidden) {
    this._forceHidden = hidden;
    if (!this._dragging) this._applyBlend();
  }

  /**
   * Drag-relocated (S54) — update the true position and reposition the
   * already-loaded model WITHOUT reloading its GLB.
   * @param {number} cx @param {number} cy @returns {void}
   */
  reposition(cx, cy) {
    this._cx = cx; this._cy = cy;
    this._applyBlend();
  }

  /** @returns {void} begin the drag-ghost look — lifted + translucent, starts "valid" (the current position is always legal) */
  beginDrag() {
    this._dragging = true;
    this._base3D.setModelGhost(this._id, true);
    this._base3D.setModelGhostValid(this._id, true);
  }

  /** @param {number} cx @param {number} cy @param {boolean} valid @returns {void} live drag-move: eased glide + recolour */
  updateDrag(cx, cy, valid) {
    this._base3D.tweenModelPosition(this._id, cx, cy, BASE.dragGhost.liftPx);
    this._base3D.setModelGhostValid(this._id, valid);
  }

  /** @returns {void} drop — settle at the true (possibly reverted) position, restore the real material */
  endDrag() {
    this._dragging = false;
    this._base3D.setModelGhost(this._id, false);
    this._applyBlend();
  }

  /** @returns {void} */
  disable() {
    ++this._loadVersion; this._yard?.dispose();
    this._base3D.removeBuildingModel(this._id);
  }

  /** @private scale always lerps `farScale`->1; position only lerps from the plot centre for HQ's `farScale > 1` stand-in — every other building stays at its true `(cx,cy)` regardless of reveal */
  _applyBlend() {
    const s = lerp(this._cfg.farScale, 1, this._reveal);
    this._scale = this._forceHidden ? 0 : s;
    this._base3D.setModelScale(this._id, this._scale);
    const v = this.visualPosition;
    this._base3D.setModelPosition(this._id, v.cx, v.cy);
  }
}
