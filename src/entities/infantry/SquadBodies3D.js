/**
 * SquadBodies3D — one `SoldierBody3D` per living soldier slot in an
 * InfantrySquad, plus the lightweight pose proxy each `SoldierBody3D.sync()`
 * needs (a `Soldier` struct carries x/y but no heading of its own — the
 * squad's own rotation IS every soldier's facing). Split out of
 * `InfantrySquadView` to keep that file under the 150-line cap.
 */
import { SoldierBody3D } from './SoldierBody3D.js';
import { degToRad } from '../../utils/MathUtils.js';
import { SQUAD } from '../../config/InfantryConfig.js';

export class SquadBodies3D {
  /**
   * @param {number} count soldier slots @param {object} cfg3D a `UNIT_3D` entry
   * @param {import('../../engine/Unit3DLayer.js').Unit3DLayer} unit3D
   */
  constructor(count, cfg3D, unit3D) {
    /** @private @type {SoldierBody3D[]} */ this._bodies = [];
    /** @private @type {{x:number,y:number,rotation:number}[]} */ this._poses = [];
    for (let i = 0; i < count; i++) {
      const body = new SoldierBody3D(cfg3D);
      body.mount(unit3D);
      this._bodies.push(body);
      this._poses.push({ x: 0, y: 0, rotation: 0 });
    }
  }

  /** @returns {number} */
  get count() { return this._bodies.length; }

  /**
   * @param {number} i @param {import('./Soldier.js').Soldier} soldier
   * @param {number} rotation this soldier's own eased facing, radians @param {boolean} justDied
   *   this is the soldier's first dead frame — freeze + recolour once
   * @returns {void}
   */
  sync(i, soldier, rotation, justDied) {
    const p = this._poses[i];
    p.x = soldier.x; p.y = soldier.y; p.rotation = rotation;
    const phase = soldier.walkPhase;
    const swing = this._stepSwing(soldier, phase);
    const crossover = soldier.isWalking
      ? degToRad(SQUAD.walkCycle.crossoverDeg) * Math.sin(phase)
      : 0;
    this._bodies[i].sync(p, swing, crossover);
    if (justDied) this._bodies[i].markWreck();
  }

  /** @private leg swing follows each soldier's distance travelled, so feet do not slide when speed changes */
  _stepSwing(soldier, phase) {
    if (!soldier.isWalking) return 0;
    return degToRad(SQUAD.walkCycle.swingDeg) * Math.sin(phase);
  }

  /** @param {number} i @param {number} alpha 0..1 @returns {void} */
  setWreckAlpha(i, alpha) { this._bodies[i].setWreckAlpha(alpha); }

  /** @returns {void} */
  unmount() {
    for (const b of this._bodies) b.unmount();
    this._bodies.length = 0;
    this._poses.length = 0;
  }
}
