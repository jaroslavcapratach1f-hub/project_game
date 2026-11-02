/**
 * ResourceStatIcon — the one place every building screen (Info, Upgrade's
 * FEATURES UNLOCKED, Upgrade's RESOURCE COST) gets its Money/Steel/Oil
 * icon from, so they all show the exact same real-art image the TopBar
 * uses (the player's own explicit ask: "use same resources icons in every
 * building upgrade menu... no more generated models"). Any other stat key
 * (troop capacity, speeds, Power, build points, ...) has no real art and
 * still falls back to `BuildingIconDraw`'s own hand-drawn glyph — this
 * class owns both a Sprite and a Graphics in one `view` and toggles which
 * is visible per `draw()` call, so callers that used to own a bare
 * `Graphics` icon can swap in one of these with no other shape change
 * (`.view` instead of the icon itself, `.draw(key,...)` instead of
 * `.clear()` + a manual glyph call, `.destroy()` the same way).
 */
import { Assets, Container, Graphics, Sprite } from 'pixi.js';
import { pickStatIcon } from './BuildingIconDraw.js';
import moneyIconUrl from '../../../assets/ui/topbar/money_icon.png';
import oilIconUrl from '../../../assets/ui/topbar/oil_icon.png';
import steelIconUrl from '../../../assets/ui/topbar/steel_icon.png';

const HALF = 0.5;
// Both the plain resource key (BuildingCostSections) and its "...PerHour"
// production-stat key (BuildingInfoScreen / BuildingUpgradeContent) map to
// the same art — same aspect ratios TopBarRightCluster.js's own RESOURCE
// config uses, so every screen renders pixel-identical icons.
const REAL_ICON = {
  money: { url: moneyIconUrl, aspect: 170 / 160 },
  oil: { url: oilIconUrl, aspect: 127 / 160 },
  steel: { url: steelIconUrl, aspect: 148 / 160 },
};
REAL_ICON.moneyPerHour = REAL_ICON.money;
REAL_ICON.oilPerHour = REAL_ICON.oil;
REAL_ICON.steelPerHour = REAL_ICON.steel;

export class ResourceStatIcon {
  constructor() {
    this.view = new Container();
    this._glyph = new Graphics();
    this._sprite = new Sprite();
    this._sprite.anchor.set(HALF);
    this._sprite.visible = false;
    this.view.addChild(this._glyph, this._sprite);
    this._destroyed = false;
    this._loadedKey = null;
  }

  /** @returns {void} these rows get destroyed/rebuilt often (every cost or stat refresh) — guards the async texture load below against setting it on an already-destroyed Sprite */
  destroy() { this._destroyed = true; this.view.destroy({ children: true }); }

  /** @param {string} key @param {number} cx @param {number} cy @param {number} r @param {number} color @returns {void} */
  draw(key, cx, cy, r, color) {
    this._glyph.clear();
    const real = REAL_ICON[key];
    this._sprite.visible = Boolean(real);
    this._glyph.visible = !real;
    if (!real) { pickStatIcon(key)(this._glyph, cx, cy, r, color); return; }
    const h = r * 2;
    this._sprite.position.set(cx, cy);
    this._sprite.width = h * real.aspect;
    this._sprite.height = h;
    // Skip the (async, re-triggered-every-frame-by-callers-that-redraw-
    // every-tick) texture load once this exact key is already showing —
    // the promise resolving a tick late every single frame was never a
    // VISIBLE gap on its own (the sprite keeps its last texture meanwhile)
    // but is pure waste at 60fps; real callers (`ResearchNodeAction`'s own
    // destroy/recreate pattern) caused the actual player-reported flicker.
    if (this._loadedKey === key) return;
    this._loadedKey = key;
    Assets.load(real.url).then((tex) => { if (!this._destroyed) this._sprite.texture = tex; });
  }
}
