import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { buildCompoundIcon } from '../ui/MarkerDraw.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { TerritoryRing } from './TerritoryRing.js';
import { BasePinIcon } from './BasePinIcon.js';
import { NeighbourCompound3D } from './NeighbourCompound3D.js';

const HALF = 0.5;
const NEIGHBOUR_RING_DIM = 0.6;

/**
 * PlotMarker — a neighbour base's world-map presence: name/level label + a
 * dimmed TerritoryRing, always at a fixed world position on GROUND_UNITS,
 * plus either the flat "fort" icon (buildCompoundIcon) or — when
 * `spec.use3D` (S58, PROTOTYPE scope: one neighbour at a time — see
 * NeighbourCompound3D.js) — a REAL 3D compound mirroring the player's own
 * layout. S57: below WORLDMAP.pin.zoomThreshold this hard-swaps to a small
 * tower icon (BasePinIcon) instead — hysteresis-guarded so it doesn't
 * flicker right at the cutoff, same pattern as BaseLodPin.js for the
 * player's own base. The tower icon is `neutral` (grey) for now — no real
 * alliance/threat system exists yet to drive `ally`/`enemy` (see
 * WORLDMAP.pin's own doc).
 */
export class PlotMarker {
  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {{x:number,y:number,name:string,level:number,use3D?:boolean}} spec
   * @param {import('../engine/Base3DLayer.js').Base3DLayer} base3D only used when `spec.use3D`
   */
  constructor(renderer, spec, base3D) {
    this._renderer = renderer;
    this._spec = spec;
    this._root = new Container();
    this._territory = new TerritoryRing(renderer);
    this._pin = new BasePinIcon(renderer);
    this._compound3D = spec.use3D ? new NeighbourCompound3D(base3D, `nb_${spec.name}_`) : null;
    /** @private pin-mode hysteresis state (S57) */ this._active = false;
  }

  /** @returns {void} (the 3D compound, when present, loads in the background — not awaited, same fire-and-forget convention Buildings3D's own async model loads already use) */
  enable() {
    const p = WORLDMAP.plot;
    if (!this._compound3D) {
      const g = new Graphics();
      buildCompoundIcon(g, p);
      this._root.addChild(g);
    }
    const label = new Text({ text: `${this._spec.name}\nLv ${this._spec.level}`, style: new TextStyle({ fontFamily: p.fontFamily, fontSize: p.labelPx, fill: p.labelColor, align: 'center', stroke: { color: 0x14140f, width: 4 } }) });
    label.anchor.set(HALF, 0);
    label.position.set(0, p.sizePx * p.isoSquash + p.labelGapPx);
    this._root.addChild(label);
    this._root.position.set(this._spec.x, this._spec.y);
    this._renderer.layer('GROUND_UNITS').addChild(this._root);
    this._territory.enable(this._spec.x, this._spec.y);
    this._territory.setBlend(WORLDMAP.territory.alpha * NEIGHBOUR_RING_DIM);
    // FORWARD: setColor('ally'|'enemy') once a real alliance/threat system exists.
    this._pin.enable(this._spec.x, this._spec.y, this._spec.name, 'neutral');
    this._compound3D?.enable(this._spec.x, this._spec.y);
  }

  /**
   * @param {number} zoom camera.zoom
   * @returns {void} hard-swap to the tower icon below WORLDMAP.pin.zoomThreshold (S57)
   */
  update(zoom) {
    const t = WORLDMAP.pin.zoomThreshold;
    const h = WORLDMAP.pin.hysteresis;
    this._active = this._active ? zoom < t + h : zoom < t - h;
    this._root.visible = !this._active;
    this._territory.setForceHidden(this._active);
    this._pin.setVisible(this._active);
    this._compound3D?.setVisible(!this._active);
  }

  disable() {
    this._territory.disable();
    this._pin.disable();
    this._compound3D?.disable();
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }
}
