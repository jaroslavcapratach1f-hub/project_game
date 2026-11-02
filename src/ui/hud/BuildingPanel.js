/**
 * BuildingPanel — the GDD-23 "context panel" for a tapped base building: a
 * bar docked above the bottom nav showing its name/level and the next-level
 * cost, with an Upgrade button (instant, GDD 04 — no timer). Screen-space,
 * LAYERS.HUD. Slides up/down like NavPanel; BuildingContext drives open/
 * close/refresh and arbitrates taps against everything else via `hitTest`.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { Button } from '../controls/Button.js';

const HALF = 0.5;
const MS = 1000;

/** @param {{money?:number,steel?:number,oil?:number,materials?:object}} cost @returns {string} */
function formatCost(cost) {
  const P = WORLD_HUD.buildingPanel;
  const parts = [];
  for (const k of ['money', 'steel', 'oil']) if (cost[k]) parts.push(`${P.costLabels[k]} ${cost[k]}`);
  const matTotal = Object.values(cost.materials ?? {}).reduce((a, b) => a + b, 0);
  if (matTotal > 0) parts.push(`${matTotal} materials`);
  return parts.join(P.costSep);
}

export class BuildingPanel {
  /** @param {import('../../engine/Renderer.js').Renderer} renderer @param {import('../../utils/EventEmitter.js').EventEmitter} events */
  constructor(renderer, events) {
    this._renderer = renderer;
    // _root (bg + text) slides; the Button is a SEPARATE sibling fixed at its
    // absolute resting position — Button hit-tests in raw SCREEN coords with
    // no awareness of a parent's animated transform, so it can't live inside
    // a container that moves (see setPosition below).
    this._root = new Container();
    this._bg = new Graphics();
    this._title = new Text({ text: '', style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: WORLD_HUD.buildingPanel.titlePx, fill: WORLD_HUD.buildingPanel.titleColor }) });
    this._cost = new Text({ text: '', style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: WORLD_HUD.buildingPanel.costPx, fill: WORLD_HUD.buildingPanel.costColor } ) });
    this._btn = new Button(events, WORLD_HUD.buildingPanel.upgradeLabel, () => this._onUpgrade?.());
    this._root.addChild(this._bg, this._title, this._cost);
    this._open = false;
    this._w = 0; this._h = WORLD_HUD.buildingPanel.heightPx; this._y = 0;
    this._onUpgrade = null;
  }

  /** @returns {Container} */ get view() { return this._root; }
  /** @returns {boolean} */ get isOpen() { return this._open; }

  /** @returns {void} */
  enable() {
    this._btn.enable();
    const layer = this._renderer.layer('HUD');
    layer.addChild(this._root, this._btn.view);
    this._root.visible = false;
    this._btn.view.visible = false;
  }

  /** @returns {void} */
  disable() {
    this._btn.disable();
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /** @param {number} screenW @param {number} screenH @returns {void} */
  layout(screenW, screenH) {
    const P = WORLD_HUD.buildingPanel;
    this._w = screenW;
    this._y = screenH - WORLD_HUD.navBar.heightPx - this._h;
    this._bg.clear().rect(0, 0, this._w, this._h).fill({ color: P.bg, alpha: P.bgAlpha })
      .stroke({ color: P.stroke, width: P.strokeWidthPx });
    this._title.position.set(P.padPx, P.padPx);
    this._cost.position.set(P.padPx, P.padPx + P.titlePx + P.titleCostGapPx);
    this._btn.setPosition((this._w - this._btn.view.width) * HALF, this._y + this._h - P.padPx - this._btn.view.height);
    this._root.position.set(0, this._open ? this._y : screenH);
  }

  /**
   * @param {{name:string,level:number,nextLevel:number,cost:?object,maxed:boolean,afford:boolean}} info
   * @param {Function} onUpgrade @param {?string} [actionLabel] optional building action instead of upgrade
   * @returns {void}
   */
  open(info, onUpgrade, actionLabel = null) {
    this._onUpgrade = onUpgrade;
    this._title.text = `${info.name}  L${info.level}`;
    const P = WORLD_HUD.buildingPanel;
    this._cost.text = info.maxed ? P.maxLabel : `→ L${info.nextLevel}   ${formatCost(info.cost)}`;
    this._cost.style.fill = info.maxed ? P.maxColor : P.costColor;
    this._customAction = Boolean(actionLabel);
    this._btn.setLabel(actionLabel ?? P.upgradeLabel);
    this._btn.setEnabled(this._customAction || (!info.maxed && info.afford));
    this._root.visible = true;
    this._btn.view.visible = true;
    this._open = true;
    gsap.killTweensOf(this._root.position);
    gsap.to(this._root.position, { y: this._y, duration: P.slideMs / MS, ease: 'power2.out' });
  }

  /** @param {boolean} afford @returns {void} live-update the button while open (RESOURCE_CHANGED) */
  refreshAfford(afford) { if (this._open) this._btn.setEnabled(this._customAction || afford); }

  /** @returns {void} */
  close() {
    if (!this._open) return;
    this._open = false;
    this._btn.view.visible = false;
    const screenH = this._y + this._h + WORLD_HUD.navBar.heightPx;
    gsap.killTweensOf(this._root.position);
    gsap.to(this._root.position, {
      y: screenH, duration: WORLD_HUD.buildingPanel.slideMs / MS, ease: 'power2.in',
      onComplete: () => { this._root.visible = false; },
    });
  }

  /** @param {number} sx @param {number} sy SCREEN px @returns {boolean} */
  hitTest(sx, sy) { return this._open && sx >= 0 && sx <= this._w && sy >= this._y && sy <= this._y + this._h; }
}
