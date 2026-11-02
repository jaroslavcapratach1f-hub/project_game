/**
 * TopBar — the persistent world-map HUD top corners (S70 icon redesign —
 * the player's own explicit rule: no text labels, icon + number only, two
 * corner clusters instead of one left-aligned wrapping strip with its own
 * full-width bordered bar). `TopBarLeftCluster` (avatar + Power + base
 * coordinates) and `TopBarRightCluster` (personnel, then Money/Oil/Steel/
 * Gold) do the actual drawing — this file only wires live game data into
 * them and routes the avatar's tap. Screen-space on LAYERS.HUD. No per-frame
 * allocation; the coordinate refresh is throttled.
 */
import { Container } from 'pixi.js';
import { EVENTS } from '../../engine/GameEvents.js';
import { WORLD_HUD, navEdgePad } from '../../config/HudConfig.js';
import { WORLDMAP } from '../../config/WorldMapConfig.js';
import { pixelToAxial } from '../../utils/Hex.js';
import { TopBarLeftCluster } from './TopBarLeftCluster.js';
import { TopBarRightCluster } from './TopBarRightCluster.js';

const MS_PER_SECOND = 1000;

export class TopBar {
  /**
   * @param {import('../../engine/Renderer.js').Renderer} renderer
   * @param {import('../../engine/Camera.js').Camera} camera
   * @param {import('../../utils/EventEmitter.js').EventEmitter} events
   */
  constructor(renderer, camera, events) {
    this._renderer = renderer;
    this._camera = camera;
    this._events = events;
    this._root = new Container();
    this._left = new TopBarLeftCluster();
    this._right = new TopBarRightCluster();
    this._root.addChild(this._left.view, this._right.view);
    this._coordAcc = 0;
    this._axial = { q: 0, r: 0 };
    this._lastQ = null; this._lastR = null;
    this._commander = 1;
    this._onAvatarTap = null;
    this._onGoldTap = null;
    this._onResource = (p) => { this._right.setResources(p); this._layout(); };
    this._onBuilding = (p) => { if (p.id === 'headquarters') { this._commander = p.level; this._left.setLevel(p.level); this._layout(); } };
    this._onBaseHp = (p) => { this._left.setBaseHp(p.frac); this._layout(); };
    this._onOnslaughtEnd = () => { this._left.setBaseHp(1); this._layout(); };
    this._onPersonnel = (p) => { this._right.setPersonnel(p.current, p.max); this._layout(); };
    this._onPower = (p) => { this._left.setPower(p.total); this._layout(); };
  }

  /** @returns {void} */
  enable() {
    this._renderer.layer('HUD').addChild(this._root);
    this._layout();
    this._events.on(EVENTS.RESOURCE_CHANGED, this._onResource);
    this._events.on(EVENTS.BUILDING_UPGRADED, this._onBuilding);
    this._events.on(EVENTS.ONSLAUGHT_BASE_HP, this._onBaseHp);
    this._events.on(EVENTS.ONSLAUGHT_ENDED, this._onOnslaughtEnd);
    this._events.on(EVENTS.PERSONNEL_CHANGED, this._onPersonnel);
    this._events.on(EVENTS.POWER_CHANGED, this._onPower);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.RESOURCE_CHANGED, this._onResource);
    this._events.off(EVENTS.BUILDING_UPGRADED, this._onBuilding);
    this._events.off(EVENTS.ONSLAUGHT_BASE_HP, this._onBaseHp);
    this._events.off(EVENTS.ONSLAUGHT_ENDED, this._onOnslaughtEnd);
    this._events.off(EVENTS.PERSONNEL_CHANGED, this._onPersonnel);
    this._events.off(EVENTS.POWER_CHANGED, this._onPower);
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /** @param {number} level live headquarters level, shown as a badge on the avatar's own bottom rim @returns {void} */
  setCommander(level) { this._commander = level; this._left.setLevel(level); this._layout(); }

  /** @param {(sx:number,sy:number)=>void} fn called when the player taps the avatar @returns {void} */
  setAvatarTap(fn) { this._onAvatarTap = fn; }

  /** @param {(sx:number,sy:number)=>void} fn called when the player taps the Gold "+" purchase button @returns {void} */
  setGoldTap(fn) { this._onGoldTap = fn; }

  /** @param {number} screenWidth @param {number} screenHeight @returns {void} */
  layout(screenWidth, screenHeight) {
    this._w = screenWidth; this._h = screenHeight;
    this._layout();
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    this._coordAcc += dt * MS_PER_SECOND;
    if (this._coordAcc < WORLD_HUD.topBar.coordThrottleMs) return;
    this._coordAcc = 0;
    const a = pixelToAxial(this._camera.x, this._camera.y, WORLDMAP.hexSize, this._axial);
    if (a.q === this._lastQ && a.r === this._lastR) return;
    this._lastQ = a.q; this._lastR = a.r;
    this._left.setCoord(a.q, a.r);
    this._layout();
  }

  /** @param {number} sx @param {number} sy @returns {boolean} the avatar or the Gold "+" button owns this tap */
  hitTest(sx, sy) { return this._left.hitTestAvatar(sx, sy) || this._right.hitTestGoldButton(sx, sy); }

  /** @param {number} sx @param {number} sy @returns {void} */
  handleTap(sx, sy) {
    if (this._left.hitTestAvatar(sx, sy)) { this._left.pulse(); this._onAvatarTap?.(sx, sy); return; }
    if (this._right.hitTestGoldButton(sx, sy)) this._onGoldTap?.(sx, sy);
  }

  /** @private */
  _layout() {
    if (!this._w) return;
    const t = WORLD_HUD.topBar, edge = navEdgePad(this._w, this._h);
    const leftW = this._left.layout(t.topInsetPx, edge);
    // Portrait: one row, same as landscape — avatar/Power/Location on the
    // left, resources beside them on the right (the player's own
    // correction: not its own row, not stacked). The right cluster's
    // natural width rarely fits what's left on a narrow phone, so it gets
    // a hard budget and shrinks itself to it (TopBarRightCluster.layout's
    // own `maxWidthPx`) instead of overlapping.
    const portrait = this._h > this._w;
    const maxW = portrait ? this._w - edge - leftW - t.rightRowGapPx : Infinity;
    this._right.layout(this._w, t.topInsetPx, edge, maxW);
  }
}
