/** Distance-sampled pairs of track/tire bands and alternating soldier footprints. */
import { GROUND_TRAIL as C } from '../config/GroundTrailConfig.js';
import { contactOffset } from './TrailProjection.js';
import { wrapAngle } from '../utils/MathUtils.js';

const HALF = 0.5;
const QUAD_SIZE = 8, CORNER_C = 4, CORNER_D = 6;
export class GroundTrails {
  /** @param {object} field world decal sink */
  constructor(field) {
    this._field = field; this._states = new Map(); this._seen = new Set();
    this._quad = new Float32Array(QUAD_SIZE); this._offset = { x: 0, y: 0 };
    this._next = { x: 0, y: 0, rotation: 0 };
  }
  /** Start a simulation tick. */
  begin() { this._seen.clear(); }
  /** @param {object} e live entity; infantry contacts are per soldier */
  update(e) {
    if (!e.isAlive || !this._field) return;
    if (e.soldiers) {
      for (const s of e.soldiers) if (s.isAlive) this._step(s, null);
      return;
    }
    const profile = C.models[`${e.faction}:${e.cls}`] ?? C.classes[e.cls];
    if (profile) this._step(e, profile);
  }
  /** @private sample spatially, including turns; reset on teleport. */
  _step(e, profile) {
    this._seen.add(e.id);
    const prev = this._states.get(e.id);
    if (!prev) {
      this._states.set(e.id, { x: e.x, y: e.y, rotation: e.rotation, foot: 1 });
      return;
    }
    const dx = e.x - prev.x, dy = e.y - prev.y, distance = Math.hypot(dx, dy);
    const angle = wrapAngle(e.rotation - prev.rotation);
    if (distance > C.maxStepPx) { Object.assign(prev, { x: e.x, y: e.y, rotation: e.rotation }); return; }
    if (!profile) {
      if (distance >= C.footprintStepPx) this._foot(e, prev);
      return;
    }
    if (distance < C.stepPx && Math.abs(angle) < C.turnStepRad) return;
    const steps = Math.max(1, Math.ceil(distance / C.stepPx), Math.ceil(Math.abs(angle) / C.turnStepRad));
    const sx = prev.x, sy = prev.y, sr = prev.rotation;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps, x = sx + dx * t, y = sy + dy * t, rotation = sr + angle * t;
      this._next.x = x; this._next.y = y; this._next.rotation = rotation;
      this._band(prev, this._next, profile, -1);
      this._band(prev, this._next, profile, 1);
      prev.x = x; prev.y = y; prev.rotation = rotation;
    }
  }
  /** @private draw a continuous swept contact band, preserving turns. */
  _band(prev, next, p, side) {
    const centre = side * p.gauge * HALF, half = p.width * HALF;
    this._corner(0, prev, -p.rear, centre - half, p.projected);
    this._corner(2, next, -p.rear, centre - half, p.projected);
    this._corner(CORNER_C, next, -p.rear, centre + half, p.projected);
    this._corner(CORNER_D, prev, -p.rear, centre + half, p.projected);
    this._field.addGroundMark(p.type, this._quad);
  }
  /** @private one footprint per individual soldier step. */
  _foot(e, prev) {
    const side = prev.foot * C.footprintWidthPx, half = C.footprintWidthPx * HALF;
    this._corner(0, e, 0, side - half, false);
    this._corner(2, e, C.footprintLengthPx, side - half, false);
    this._corner(CORNER_C, e, C.footprintLengthPx, side + half, false);
    this._corner(CORNER_D, e, 0, side + half, false);
    this._field.addGroundMark('foot', this._quad);
    prev.x = e.x; prev.y = e.y; prev.rotation = e.rotation; prev.foot *= -1;
  }
  /** @private write one preallocated quad corner. */
  _corner(i, pose, forward, side, projected) {
    contactOffset(pose.rotation, forward, side, projected, this._offset);
    this._quad[i] = pose.x + this._offset.x; this._quad[i + 1] = pose.y + this._offset.y;
  }
  /** Remove expired entity/soldier histories. */
  end() { for (const id of this._states.keys()) if (!this._seen.has(id)) this._states.delete(id); }
  /** Reset histories when the scene is disabled. */
  clear() { this._states.clear(); this._seen.clear(); }
}
