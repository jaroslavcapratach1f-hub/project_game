/**
 * NeighbourBases — every neighbour PlotMarker (WORLDMAP.neighbourHexes):
 * builds them (checking each one's territory doesn't overlap another's, GDD
 * 24), and drives their per-frame zoom so each one swaps to a tower icon
 * below WORLDMAP.pin.zoomThreshold (S57) the same way the player's own base
 * does (see BaseLodPin.js / PlotMarker.js). S58: every neighbour gets a real
 * 3D compound (buildings + wall + towers, mirroring the player's own
 * layout, per the user's own call — see NeighbourCompound3D.js) instead of
 * the flat placeholder icon — widened from a 1-base prototype once it
 * measured a clean 60fps with 2 full compounds loaded together. Split out
 * of WorldScene.js to keep it under the 150-line cap.
 */
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { axialToPixel } from '../utils/Hex.js';
import { PlotMarker } from './PlotMarker.js';
import { findTerritoryConflict } from './territory.js';

export class NeighbourBases {
  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {import('../engine/Base3DLayer.js').Base3DLayer} base3D for the S58 3D-compound prototype
   */
  constructor(renderer, base3D) {
    /** @private */ this._renderer = renderer;
    /** @private */ this._base3D = base3D;
    /** @private @type {PlotMarker[]} */ this._plots = [];
  }

  /**
   * @param {{q:number,r:number}} base baseHex axial
   * @param {{x:number,y:number}} centre player base compound centre, world px
   * @returns {void}
   */
  enable(base, centre) {
    const claimed = [{ x: centre.x, y: centre.y, r: WORLDMAP.territoryRadiusPx, name: 'you' }];
    for (const n of WORLDMAP.neighbourHexes) {
      const p = axialToPixel(base.q + n.dq, base.r + n.dr, WORLDMAP.hexSize);
      const claim = { x: p.x, y: p.y, r: WORLDMAP.territoryRadiusPx, name: n.name };
      const conflict = findTerritoryConflict(claim, claimed);
      if (conflict) console.warn(`NeighbourBases: "${n.name}" territory overlaps "${conflict.name}" — move it in WORLDMAP.neighbourHexes`);
      claimed.push(claim);
      const m = new PlotMarker(this._renderer, { x: p.x, y: p.y, name: n.name, level: n.level, use3D: true }, this._base3D);
      m.enable();
      this._plots.push(m);
    }
  }

  /** @param {number} zoom camera.zoom @returns {void} */
  update(zoom) {
    for (let i = 0; i < this._plots.length; i++) this._plots[i].update(zoom);
  }

  /** @returns {void} */
  disable() {
    for (let i = 0; i < this._plots.length; i++) this._plots[i].disable();
    this._plots.length = 0;
  }
}
