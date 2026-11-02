/**
 * BaseLodPin — the player's own base half of the S57 "battlefield lock":
 * below WORLDMAP.pin.zoomThreshold (a hard cutoff, hysteresis-guarded
 * against flicker — unlike BaseSite._syncLod's continuous bands) the full
 * compound (HQ included — it's normally the one thing that renders at
 * EVERY zoom, see Building3DView's own doc — plus wall, towers, territory
 * ring, garrison pip hint) hides and a single map-pin icon
 * (BasePinIcon.js) stands in for it, so the whole base reads at a glance
 * from a wide, zoomed-out view. See NeighbourBases.js / PlotMarker.js for
 * the same swap on every other base. Colour is always `home` (UI gold) —
 * it's always YOUR base, no alliance state to read.
 */
import { WORLDMAP } from '../config/WorldMapConfig.js';
import { BasePinIcon } from './BasePinIcon.js';

export class BaseLodPin {
  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {{buildings3D:import('./Buildings3D.js').Buildings3D,
   *   wall3D:import('./DefenceWall3D.js').DefenceWall3D,
   *   towers3D:import('./AttackTowers3D.js').AttackTowers3D,
   *   troops:import('./BaseTroops.js').BaseTroops,
   *   territory:import('./TerritoryRing.js').TerritoryRing}} parts every full-render owner this swap hides
   */
  constructor(renderer, parts) {
    /** @private */ this._parts = parts;
    /** @private */ this._icon = new BasePinIcon(renderer);
    /** @private */ this._active = false;
  }

  /** @param {number} x @param {number} y world px, WORLDMAP.baseCentre @returns {void} */
  enable(x, y) { this._icon.enable(x, y, null, 'home'); }

  /**
   * @param {number} zoom camera.zoom
   * @returns {boolean} true while the pin stands in for the full compound
   */
  update(zoom) {
    const t = WORLDMAP.pin.zoomThreshold;
    const h = WORLDMAP.pin.hysteresis;
    this._active = this._active ? zoom < t + h : zoom < t - h;
    this._icon.setVisible(this._active);
    const p = this._parts;
    p.buildings3D.setForceHidden(this._active);
    p.wall3D.setForceHidden(this._active);
    p.ground3D?.setForceHidden(this._active);
    p.towers3D.setForceHidden(this._active);
    p.troops.setForceHidden(this._active);
    p.territory.setForceHidden(this._active);
    return this._active;
  }

  /** @returns {void} */
  disable() { this._icon.disable(); }
}
