/**
 * Unit3DBody — one live 3D-bodied unit's Three.js presence (S55, first
 * live-3D troop). The unit counterpart to `Building3DView.js`: assembles
 * its hull+turret via `UnitMeshFactory` (shared with `UnitIconRenderer`,
 * so the SquadBar portrait and the in-game model are always the same
 * asset). `EntityView` constructs one of these instead of its usual
 * hull/turret Graphics when `UNIT_3D` has an entry for the entity's
 * `faction:cls`, and drives it exactly the same way (`mount`/`sync`/
 * `unmount`).
 */
import { ENTITY } from '../config/EntityConfig.js';
import { assembleUnitMesh } from './UnitMeshFactory.js';

export class Unit3DBody {
  /** @param {object} cfg a `UNIT_3D` entry (hullUrl/turretUrl/turretPivotLocal/rotationYDeg/hullLengthWorldPx) */
  constructor(cfg) {
    this._cfg = cfg;
    this._unit3D = null;
    this._root = null; // dynamic: position + hull heading, every frame
    this._turretPivot = null; // dynamic: turret-vs-hull angle delta, every frame
    this._hullMats = [];
    this._turretMats = [];
    this._wreckAlpha = null;
    this._entity = null; // last-synced entity — reprojectPosition() re-reads x/y from this every render frame
  }

  /** @param {import('../engine/Unit3DLayer.js').Unit3DLayer} unit3D @returns {void} fire-and-forget, mirrors Building3DView.enable */
  mount(unit3D) {
    this._unit3D = unit3D;
    assembleUnitMesh(this._cfg).then((m) => {
      if (!this._unit3D) return; // unmounted before the load finished
      this._root = m.root;
      this._turretPivot = m.turretPivot;
      this._hullMats = m.hullMats;
      this._turretMats = m.turretMats;
      if (this._wreckAlpha !== null) { this.markWreck(); this.setWreckAlpha(this._wreckAlpha); }
      this._unit3D.addObject(this._root);
      this._unit3D.registerBody(this); // -> reprojectPosition() every render frame, see Unit3DLayer.update()
    });
  }

  /**
   * Rotate without changing authored colors from a LIVE entity; cache it for `reprojectPosition`
   * (position itself is NOT set here — see that method's own doc for why
   * it needs a different, render-tied cadence than rotation does). Death/
   * wreck orchestration (when to freeze, the fade timer) lives in
   * `EntityView` (it already tracks that for the 2D path too) — this only
   * renders what it's told: `markWreck`/`setWreckAlpha` below are the
   * wreck half.
   * @param {import('../entities/Entity.js').Entity} e @returns {void}
   */
  sync(e) {
    this._entity = e;
    if (!this._root) return; // GLB still loading
    // e.rotation/turretAngle are WORLD-space headings; worldToScene isn't a
    // pure rotation (the base's diamond projection shears), so each needs
    // its own conversion — see Unit3DLayer.headingToSceneY's own doc for
    // why a constant angular offset (S55 bug: "slides sideways" while
    // moving) doesn't work. The two SCENE-space angles still compose by
    // plain subtraction below (real rotations in scene space, unlike the
    // world->scene mapping itself) — and unlike position, this is exact
    // regardless of when it runs, so sim-tick cadence is fine for it.
    const hullSceneY = this._unit3D.headingToSceneY(e.rotation);
    this._root.rotation.y = hullSceneY;
    this._turretPivot.rotation.y = e.noTurret ? 0
      : this._unit3D.headingToSceneY(e.turretAngle ?? e.rotation) - hullSceneY;
  }

  /**
   * Re-place at the CURRENT origin, from the last-synced entity's x/y —
   * called every RENDER frame by `Unit3DLayer.update()`, not from `sync()`
   * (sim-tick cadence, 20 Hz). Position is the one thing here that
   * actually depends on `_originPx`'s live value (`headingToSceneY`
   * cancels it out algebraically, color/wreck don't use it at
   * all) — so it's the one thing that goes stale if computed any less
   * often than the camera itself can change (S55: a raw pinch-zoom, or
   * even just continuous panning, changes `cam.x/y/zoom` faster, and on a
   * different schedule, than the 20 Hz sim tick `sync()` runs on — a
   * position computed once per sim tick and left alone was up to one
   * full tick stale against the CURRENT camera by the time it rendered,
   * reading as the unit visibly sliding away from its real spot).
   * @returns {void}
   */
  reprojectPosition() {
    if (!this._root || !this._entity) return;
    const p = this._unit3D.worldToScene(this._entity.x, this._entity.y);
    this._root.position.set(p.x, 0, p.z);
  }

  /** @returns {void} freeze + recolour once, on death (EntityView calls this exactly once) */
  markWreck() {
    this._wreckAlpha ??= 1;
    for (const m of [...this._hullMats, ...this._turretMats]) { m.color.setHex(ENTITY.wreck.color); m.transparent = true; }
  }

  /** @param {number} alpha 0..1, from EntityView's own wreck fade timer @returns {void} */
  setWreckAlpha(alpha) {
    this._wreckAlpha = alpha;
    for (const m of [...this._hullMats, ...this._turretMats]) m.opacity = alpha;
  }

  /** @returns {void} */
  unmount() {
    if (this._root && this._unit3D) {
      this._unit3D.removeObject(this._root);
      this._unit3D.unregisterBody(this);
    }
    for (const m of [...this._hullMats, ...this._turretMats]) m.dispose();
    this._root = null;
    this._unit3D = null;
  }
}
