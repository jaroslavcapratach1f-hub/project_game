/**
 * SelectionRing — the pulsing selection ring (one flat radius for every
 * unit, see OrdersConfig's own doc), its static weapon-range ring, and
 * its fixed-barrel aim cone. Split out of OrderIndicator.js to keep that
 * file under the 150-line cap.
 */
import { buildRing, buildAimCone } from './OrderDraw.js';
import { ORDERS } from '../../config/OrdersConfig.js';

const TWO_PI = Math.PI * 2;
const HALF = 0.5;
const FURY_STANCES = new Set(['FIELD_FURY', 'BASE_FURY']); // Entity.STANCE values, not imported directly to avoid a sim<-UI dependency for one string compare

export class SelectionRing {
  /** @param {import('../../utils/ObjectPool.js').ObjectPool} rings the shared ring-graphics pool */
  constructor(rings) {
    /** @private */ this._rings = rings;
    /** @private @type {?{g:import('pixi.js').Graphics, unit:object, cone:?import('pixi.js').Graphics,
     *   range:?import('pixi.js').Graphics, lastColor:number}} */ this._sel = null;
    /** @private */ this._pulse = 0;
  }

  /**
   * @param {{x:number,y:number,rotation?:number,noTurret?:boolean,
   *   rangePx?:?number,stance?:string}} unit live unit
   * @returns {void}
   */
  show(unit) {
    this.clear();
    const g = this._rings.acquire();
    const color = this._color(unit);
    buildRing(g, { ...ORDERS.selectionRing, color });
    g.visible = true;
    g.position.set(unit.x, unit.y);
    let cone = null;
    if (unit.noTurret) {
      cone = this._rings.acquire();
      buildAimCone(cone, 0, ORDERS.aimCone);
      cone.visible = true;
      cone.position.set(unit.x, unit.y);
      cone.rotation = unit.rotation ?? 0;
    }
    let range = null;
    if (unit.rangePx) {
      range = this._rings.acquire();
      buildRing(range, { ...ORDERS.rangeRing, radiusPx: unit.rangePx });
      range.visible = true;
      range.alpha = ORDERS.rangeRing.alpha;
      range.position.set(unit.x, unit.y);
    }
    this._sel = { g, unit, cone, range, lastColor: color };
    this._pulse = 0;
  }

  /** @returns {void} */
  clear() {
    if (!this._sel) return;
    this._rings.release(this._sel.g);
    if (this._sel.cone) this._rings.release(this._sel.cone);
    if (this._sel.range) this._rings.release(this._sel.range);
    this._sel = null;
  }

  /** @param {number} ms elapsed milliseconds this tick @returns {void} */
  update(ms) {
    const sel = this._sel;
    if (!sel) return;
    this._pulse += ms;
    const cfg = ORDERS.selectionRing;
    const phase = (this._pulse % cfg.pulsePeriodMs) / cfg.pulsePeriodMs;
    const wave = HALF - HALF * Math.cos(phase * TWO_PI);
    // re-check every tick (cheap — one circle stroke, only redrawn on an
    // actual change) so the ring flips colour the instant Fury trips, not
    // just at selection time
    const color = this._color(sel.unit);
    if (color !== sel.lastColor) {
      buildRing(sel.g, { ...cfg, color });
      sel.lastColor = color;
    }
    sel.g.alpha = cfg.pulseMinAlpha + (cfg.pulseMaxAlpha - cfg.pulseMinAlpha) * wave;
    sel.g.position.set(sel.unit.x, sel.unit.y);
    if (sel.cone) {
      sel.cone.position.set(sel.unit.x, sel.unit.y);
      sel.cone.rotation = sel.unit.rotation ?? 0;
    }
    if (sel.range) sel.range.position.set(sel.unit.x, sel.unit.y);
  }

  /** @private green while CALM, red once the unit's own stance flips to Fury @param {{stance?:string}} unit @returns {number} */
  _color(unit) {
    const cfg = ORDERS.selectionRing;
    return FURY_STANCES.has(unit.stance) ? cfg.furyColor : cfg.color;
  }
}
