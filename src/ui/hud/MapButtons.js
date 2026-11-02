/**
 * MapButtons — the Home / World camera shortcuts (GDD 23), screen-space on
 * LAYERS.HUD, flush to the bottom-left corner (S58 — the user's own icon
 * design): World is a globe circle CENTRED exactly at the screen corner, so
 * only its top-right quadrant (~25%) actually shows, reading as the globe
 * "peeking in" from outside the viewport; Home is a house-shaped card
 * stacked directly above it, fully on-screen. Home snaps the camera to the
 * player base at base-view zoom; World pulls out to strategic zoom. Both
 * are camera-only (no state), animated by the Camera's own easing.
 */
import { Container, Graphics } from 'pixi.js';
import { WORLD_HUD, navEdgePad } from '../../config/HudConfig.js';
import { WORLDMAP } from '../../config/WorldMapConfig.js';
import { drawHomeIcon, drawGlobeIcon } from './MapIconDraw.js';

const HALF = 0.5;
const HOME_ICON_FRAC = 0.7; // icon size, as a fraction of the card's own size

export class MapButtons {
  /**
   * @param {import('../../engine/Renderer.js').Renderer} renderer
   * @param {import('../../engine/Camera.js').Camera} camera
   */
  constructor(renderer, camera) {
    this._renderer = renderer;
    this._camera = camera;
    this._root = new Container();
    this._world = new Graphics();
    this._home = new Graphics();
    this._icon = new Graphics();
    /** @private world-button hit circle */ this._worldC = { x: 0, y: 0 };
    /** @private home-button hit rect */ this._homeR = { x: 0, y: 0, w: 0, h: 0 };
  }

  /** @returns {void} */
  enable() {
    this._root.addChild(this._world, this._home, this._icon);
    this._renderer.layer('HUD').addChild(this._root);
  }

  /** @returns {void} */
  disable() {
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /** @param {number} screenWidth @param {number} screenHeight @returns {void} */
  layout(screenWidth, screenHeight) {
    const m = WORLD_HUD.mapButtons;
    // Landscape only (the player's own report) — flush-left sat Home/World
    // right at the physical screen edge, partly clipped on a real device.
    const edgePad = navEdgePad(screenWidth, screenHeight);
    this._worldC.x = edgePad;
    this._worldC.y = screenHeight;
    this._world.clear();
    drawGlobeIcon(this._world, m.worldRadiusPx, {
      fill: m.bg, fillAlpha: m.bgAlpha, stroke: m.stroke, strokeWidthPx: m.strokeWidthPx,
      line: m.globeLineColor, lineAlpha: m.globeLineAlpha, lineWidthPx: m.globeLineWidthPx,
    });
    this._world.position.set(this._worldC.x, this._worldC.y);

    const hw = m.homeSizePx;
    this._homeR.x = edgePad;
    this._homeR.y = screenHeight - m.worldRadiusPx - m.gapPx - hw;
    this._homeR.w = hw;
    this._homeR.h = hw;
    this._home.clear()
      .roundRect(this._homeR.x, this._homeR.y, hw, hw, m.homeRadiusPx)
      .fill({ color: m.bg, alpha: m.bgAlpha })
      .stroke({ color: m.stroke, width: m.strokeWidthPx });
    this._icon.clear();
    drawHomeIcon(this._icon, hw * HOME_ICON_FRAC, m.iconColor, m.doorColor);
    this._icon.position.set(this._homeR.x + hw * HALF, this._homeR.y + hw * HALF);
  }

  /** @param {number} sx @param {number} sy @returns {boolean} */
  hitTest(sx, sy) {
    return this._idAt(sx, sy) !== null;
  }

  /**
   * Act on a tap. @param {number} sx @param {number} sy @returns {boolean} handled
   */
  handleTap(sx, sy) {
    const id = this._idAt(sx, sy);
    if (!id) return false;
    const m = WORLD_HUD.mapButtons;
    const c = WORLDMAP.baseCentre;
    if (id === 'home') {
      this._camera.moveTo(c.x, c.y, m.flyMs);
      this._camera.setZoom(WORLDMAP.nearZoom, m.flyMs); // stand in the compound
    } else {
      this._camera.setZoom(WORLDMAP.farZoom, m.flyMs);  // pull to the strategic map
    }
    return true;
  }

  /** @private @returns {?string} 'home'|'world'|null under the point */
  _idAt(sx, sy) {
    const r = this._homeR;
    if (sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h) return 'home';
    const dx = sx - this._worldC.x, dy = sy - this._worldC.y;
    const radius = WORLD_HUD.mapButtons.worldRadiusPx;
    return dx * dx + dy * dy <= radius * radius ? 'world' : null;
  }
}
