/**
 * SoldierBody3D — one soldier's live 3D presence: the S56 torso + two
 * independently-pivoting leg walk-cycle rig (`InfantryMeshFactory`), the
 * infantry counterpart to `Unit3DBody`. Mirrors its mount/sync/
 * reprojectPosition/unmount contract, but with a real per-leg swing
 * instead of a hull+turret pair — infantry has no turret concept at all.
 */
import { ENTITY } from '../../config/EntityConfig.js';
import { assembleInfantryMesh } from './InfantryMeshFactory.js';

export class SoldierBody3D {
  /** @param {object} cfg a `UNIT_3D` entry (torsoUrl/legLUrl/legRUrl/leg*PivotLocal/...) */
  constructor(cfg) {
    this._cfg = cfg;
    this._unit3D = null;
    this._root = null; // dynamic: position + facing, every frame
    this._legLPivot = null; // dynamic: swing angle, every frame
    this._legRPivot = null;
    this._torsoMats = [];
    this._legLMats = [];
    this._legRMats = [];
    this._hipMats = [];
    this._hipGeometry = null;
    this._entity = null; // last-synced pose proxy {x,y,rotation} — reprojectPosition() re-reads x/y every render frame
  }

  /** @param {import('../../engine/Unit3DLayer.js').Unit3DLayer} unit3D @returns {void} fire-and-forget, mirrors Unit3DBody.mount */
  mount(unit3D) {
    this._unit3D = unit3D;
    assembleInfantryMesh(this._cfg).then((m) => {
      if (!this._unit3D) return; // unmounted before the load finished
      this._root = m.root;
      this._legLPivot = m.legLPivot;
      this._legRPivot = m.legRPivot;
      this._torsoMats = m.torsoMats;
      this._legLMats = m.legLMats;
      this._legRMats = m.legRMats;
      this._hipMats = m.hipMats;
      this._hipGeometry = m.hipGeometry;
      this._unit3D.addObject(this._root);
      this._unit3D.registerBody(this);
    });
  }

  /**
   * Face + swing from a live pose; cache it for `reprojectPosition` (see
   * that method's own doc, and Unit3DBody's — the same sim-tick vs
   * render-tick cadence split applies here).
   * @param {{x:number,y:number,rotation:number}} pose
   * @param {number} swingRad this tick's forward/back leg-swing angle
   * @param {number} crossoverRad lateral inward hip angle; opposite per leg
   * @returns {void}
   */
  sync(pose, swingRad, crossoverRad) {
    this._entity = pose;
    if (!this._root) return; // GLB still loading
    this._root.rotation.y = this._unit3D.headingToSceneY(pose.rotation);
    // After source -Z becomes runtime +X, Z is the forward/back stride hinge.
    // X is reserved for the small inward crossover; using X for stride makes
    // the feet swing sideways and produces the reported wobble.
    this._legLPivot.rotation.z = swingRad;
    this._legRPivot.rotation.z = -swingRad;
    this._legLPivot.rotation.x = crossoverRad;
    this._legRPivot.rotation.x = -crossoverRad;
  }

  /** @returns {void} see Unit3DBody.reprojectPosition's own doc for why this is a separate, render-cadence call */
  reprojectPosition() {
    if (!this._root || !this._entity) return;
    const p = this._unit3D.worldToScene(this._entity.x, this._entity.y);
    this._root.position.set(p.x, 0, p.z);
  }

  /** @returns {void} freeze + recolour once, on death */
  markWreck() {
    for (const m of [...this._torsoMats, ...this._legLMats, ...this._legRMats, ...this._hipMats]) {
      m.color.setHex(ENTITY.wreck.color); m.transparent = true;
    }
  }

  /** @param {number} alpha 0..1 @returns {void} */
  setWreckAlpha(alpha) {
    for (const m of [...this._torsoMats, ...this._legLMats, ...this._legRMats, ...this._hipMats]) m.opacity = alpha;
  }

  /** @returns {void} */
  unmount() {
    if (this._root && this._unit3D) {
      this._unit3D.removeObject(this._root);
      this._unit3D.unregisterBody(this);
    }
    for (const m of [...this._torsoMats, ...this._legLMats, ...this._legRMats, ...this._hipMats]) m.dispose();
    this._hipGeometry?.dispose();
    this._root = null;
    this._unit3D = null;
  }
}
