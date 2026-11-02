/** Glass-white move arrows anchored at the plot's real edge midpoints, flush against the building's own border. */
import { Container, Graphics } from 'pixi.js';
import gsap from 'gsap';
import { RELOCATE_ARROWS as C } from '../../config/BuildingMenuConfig.js';

const HALF = 0.5;
const MS_PER_SECOND = 1000;
const CORNER_COUNT = 4; // plotCorners N,E,S,W order

/** @private flat [x,y,...] translated by dx,dy @returns {number[]} */
function translated(pts, dx, dy) {
  const out = new Array(pts.length);
  for (let i = 0; i < pts.length; i += 2) { out[i] = pts[i] + dx; out[i + 1] = pts[i + 1] + dy; }
  return out;
}

export class RelocateArrows {
  /** @param {import('../../engine/Renderer.js').Renderer} renderer */
  constructor(renderer) {
    this._renderer = renderer;
    this._root = new Container();
    this._root.visible = false;
    /** @private @type {{view:Container,tween:?object}[]} */
    this._arrows = [];
    for (let i = 0; i < CORNER_COUNT; i++) {
      const view = this._buildArrow();
      this._root.addChild(view);
      this._arrows.push({ view, tween: null });
    }
  }

  /** @returns {void} */
  enable() { this._renderer.layer('WORLD_UI').addChild(this._root); }

  /** @returns {void} */
  disable() {
    this._stopTweens();
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /**
   * @param {number} wx @param {number} wy world px — the building's own footprint CENTRE
   * @param {{x:number,y:number}[]} corners the building's real [N,E,S,W] grid-footprint corners, relative to `wx,wy` (`SquareGrid.plotCorners`)
   * @returns {void}
   */
  show(wx, wy, corners) {
    this._stopTweens();
    for (let i = 0; i < this._arrows.length; i++) {
      // The N/E/S/W CORNERS themselves are a diagonal BLEND of both grid
      // axes (e.g. the E corner is +cx AND -cy at once) — an arrow there
      // points due screen-right, a direction the building can't actually
      // step in on a square grid. A single relocate step is +/-cx or
      // +/-cy alone, and that lands exactly on an EDGE MIDPOINT (provably
      // so for any w,h, not just square — see SquareGrid.plotCorners),
      // so midpoints are the only anchor whose outward direction is a
      // real, reachable move direction.
      const next = corners[(i + 1) % CORNER_COUNT];
      const corner = { x: (corners[i].x + next.x) * HALF, y: (corners[i].y + next.y) * HALF };
      const len = Math.hypot(corner.x, corner.y) || 1;
      const ux = corner.x / len, uy = corner.y / len; // outward unit direction, straight from centre through this edge's midpoint
      const restX = corner.x + ux * C.edgeGapPx, restY = corner.y + uy * C.edgeGapPx;
      const a = this._arrows[i];
      a.view.position.set(restX, restY);
      a.view.rotation = Math.atan2(ux, -uy); // canonical shape points "up" (0,-1); rotate to this edge's own outward direction
      a.tween = gsap.to(a.view.position, {
        x: restX + ux * C.pulsePx, y: restY + uy * C.pulsePx,
        duration: C.pulseMs / MS_PER_SECOND, ease: 'sine.inOut', yoyo: true, repeat: -1,
      });
    }
    this._root.position.set(wx, wy);
    this._root.visible = true;
  }

  /** @returns {void} */
  hide() {
    this._stopTweens();
    this._root.visible = false;
  }

  /** @private glass-white chevron (soft silver fill + bright rim) over a soft dark shadow @returns {Container} */
  _buildArrow() {
    const pts = C.shape.map((v) => v * C.sizePx);
    const shadow = new Graphics().poly(translated(pts, C.shadowOffsetPx * HALF, C.shadowOffsetPx))
      .fill({ color: C.shadowColor, alpha: C.shadowAlpha });
    const glass = new Graphics().poly(pts)
      .fill({ color: C.fill, alpha: C.fillAlpha })
      .stroke({ color: C.strokeColor, alpha: C.strokeAlpha, width: C.strokeWidthPx });
    const view = new Container();
    view.addChild(shadow, glass);
    return view;
  }

  /** @private */
  _stopTweens() {
    for (const a of this._arrows) { a.tween?.kill(); a.tween = null; }
  }
}
