/**
 * BasePinIcon — one map marker: a small, always-legible watchtower icon
 * (S57, restyled S58 from a generic map-pin teardrop to fit the game's WWII
 * theme) that stands in for a base's full render once the camera zooms out
 * past WORLDMAP.pin.zoomThreshold. Two callers: BaseLodPin.js (the player's
 * own base, colour always `home`) and PlotMarker.js (a neighbour base,
 * colour from its alliance state — `neutral` until a real alliance system
 * exists). World-space, true size — sized generously (WORLDMAP.pin, see its
 * own doc) so it stays readable even at WORLDMAP.minZoom, the same "make it
 * bigger" fix already used for troops/selection rings this session, not a
 * screen-space counter-scale (no such mechanism exists elsewhere in the
 * renderer — Renderer.render() scales every world layer uniformly by
 * camera.zoom, so nothing on GROUND_UNITS holds a constant screen size).
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { buildTowerIcon } from '../ui/MarkerDraw.js';
import { WORLDMAP } from '../config/WorldMapConfig.js';

const HALF = 0.5;

export class BasePinIcon {
  /** @param {import('../engine/Renderer.js').Renderer} renderer */
  constructor(renderer) {
    /** @private */ this._renderer = renderer;
    /** @private */ this._root = new Container();
    /** @private */ this._g = new Graphics();
    this._root.addChild(this._g);
  }

  /**
   * @param {number} x @param {number} y world px, the base's true anchor point
   * @param {?string} name label text above the pin, or null for none (the player's own base — the camera is always centred there, a label would be redundant)
   * @param {'neutral'|'ally'|'enemy'|'home'} colorKey WORLDMAP.pin.colors key
   * @returns {void}
   */
  enable(x, y, name, colorKey) {
    const p = WORLDMAP.pin;
    this.setColor(colorKey);
    if (name) {
      const label = new Text({
        text: name,
        style: new TextStyle({
          fontFamily: p.fontFamily, fontSize: p.labelPx, fill: p.labelColor,
          align: 'center', stroke: { color: p.outlineColor, width: 4 },
        }),
      });
      label.anchor.set(HALF, 1);
      label.position.set(0, -(p.bodyHeightPx + p.deckThicknessPx + p.merlonHeightPx) - p.labelGapPx);
      this._root.addChild(label);
    }
    this._root.position.set(x, y);
    this._root.visible = false; // BaseLodPin/PlotMarker.update() sets the real state next frame
    this._renderer.layer('GROUND_UNITS').addChild(this._root);
  }

  /** @param {'neutral'|'ally'|'enemy'|'home'} colorKey @returns {void} */
  setColor(colorKey) {
    const p = WORLDMAP.pin;
    buildTowerIcon(this._g, { ...p, color: p.colors[colorKey] ?? p.colors.neutral });
  }

  /** @param {boolean} visible @returns {void} */
  setVisible(visible) { this._root.visible = visible; }

  /** @returns {void} */
  disable() {
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }
}
