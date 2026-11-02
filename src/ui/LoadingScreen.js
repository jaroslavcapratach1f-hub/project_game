/**
 * LoadingScreen — a front-end screen on LAYERS.OVERLAY: a background photo
 * (S58 — the user's own art, horizontal or vertical picked by the current
 * screen orientation, cover-fit + a dark scrim for text contrast) behind
 * gold "BLITZMIRE", a progress bar fed by LOADING_PROGRESS { frac } with a
 * "NN%" label, and a `LOADING_TIPS` line that cross-fades every
 * MENU.loading.tipRotateMs. At frac >= 1 the bar fills gold and a pulsing
 * "TAP TO BEGIN" appears; an INPUT_TAP then emits LOADING_DISMISSED.
 * update(dt) only advances the tip timer. Shape / positioning helpers live
 * in ui/LoadingDraw.js.
 *
 * S58: `_root` (this whole screen, including the plain dark `bg`) is
 * visible from `enable()` all the way to `disable()` — it must ALWAYS
 * cover the world underneath while the game boots. `_content` (the photo +
 * title + bar + tip — everything BUT `bg`) is the separate thing gated on
 * the background photo actually being loaded (`show()`/`hide()`): an
 * earlier version gated the whole root on that instead, which for however
 * long the photo took to load left NOTHING covering the world map — a
 * real, reported bug on a real phone's slower connection, not just a photo
 * popping in late. Worst case (a slow or failed photo load) now reads as a
 * plain dark screen, never the raw map underneath.
 */
import { Assets, Container, Graphics, Sprite } from 'pixi.js';
import gsap from 'gsap';
import { EVENTS } from '../engine/GameEvents.js';
import { MENU, LOADING_TIPS } from '../config/MenuConfig.js';
import { clamp } from '../utils/MathUtils.js';
import { buildBar } from './ScreenDraw.js';
import { makeText, barWidth, layoutLoading } from './LoadingDraw.js';

// S58: served from public/ (not a module-imported, build-hashed asset) at
// this exact literal path so index.html's <link rel="preload"> — which
// starts fetching these before main.js even runs — actually matches and
// gets reused, instead of Assets.load() below triggering a second fetch.
const HORIZONTAL_BG_URL = '/loading/horizontal.jpg';
const VERTICAL_BG_URL = '/loading/vertical.jpg';

const MS_PER_SECOND = 1000;
const HALF = 0.5;
const PERCENT = 100;

export class LoadingScreen {
  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   */
  constructor(renderer, events) {
    const l = MENU.loading;
    this._renderer = renderer;
    this._events = events;
    this._root = new Container();
    /** @private everything except `bg` — see this class's own doc for why it's gated separately from `_root` */
    this._content = new Container();
    this._content.visible = false;
    this._r = {
      bg: new Graphics(), image: new Sprite(), scrim: new Graphics(), track: new Graphics(), fill: new Graphics(),
      title: makeText(l.titlePx, MENU.color.goldBright, MENU.title),
      percent: makeText(l.percentPx, MENU.color.text, '0%'),
      tip: makeText(l.tipPx, MENU.color.gold, LOADING_TIPS[0]),
      begin: makeText(l.beginPx, MENU.color.goldBright, l.beginText),
    };
    this._r.begin.visible = false;
    this._target = 0;
    this._tipMs = 0;
    this._tipIndex = 0;
    this._ready = false;
    this._dismissed = false;
    /** @private @type {{h:?import('pixi.js').Texture, v:?import('pixi.js').Texture}} loaded lazily, see enable() */
    this._bg = { h: null, v: null };
    /** @private @type {?Promise<void>} set by enable(), see waitForBackground() */
    this._bgReady = null;
    this._onProgress = (p) => this._progress(p.frac);
    this._onTap = () => this._tap();
    this._onResize = () => this._layout();
  }

  /** @returns {Container} */ get view() { return this._root; }

  /** @returns {void} build the tree + subscribe + kick off the background photo load */
  enable() {
    const r = this._r;
    r.fill.scale.x = 0;
    this._content.addChild(r.image, r.scrim, r.track, r.fill, r.title, r.percent, r.tip, r.begin);
    this._root.addChild(r.bg, this._content);
    this._root.visible = true; // ALWAYS covers the world from here to disable() — see this class's own doc
    this._layout();
    // S58: kicked off here (not awaited here) so Game.init() can overlap it
    // with its own setup work — but Game.init() DOES await
    // waitForBackground() before ever calling show(), so the photo is
    // always already in place for the very first visible frame. Showing
    // the flat-colour `bg` fallback first and popping the photo in a beat
    // later (the original approach) read as a real bug on a real phone's
    // slower network, not a nice-to-have.
    // Assets.load(array) resolves an object KEYED BY URL, not a positional array.
    // Game.init() awaits this before its first show() — a rejection (bad
    // network, missing file) must never hang or throw through that await,
    // or the whole game would fail to boot over one photo; fall back to
    // the flat `bg` colour instead.
    this._bgReady = Assets.load([HORIZONTAL_BG_URL, VERTICAL_BG_URL]).then((textures) => {
      this._bg.h = textures[HORIZONTAL_BG_URL];
      this._bg.v = textures[VERTICAL_BG_URL];
      this._layout(); // pick the right one + cover-fit now that it's ready
    }).catch((err) => console.warn('[LoadingScreen] background photo failed to load', err));
    this._events.on(EVENTS.LOADING_PROGRESS, this._onProgress);
    this._events.on(EVENTS.INPUT_TAP, this._onTap);
    this._events.on(EVENTS.RESIZE, this._onResize);
  }

  /** @returns {Promise<void>} resolves once the background photo has loaded — Game.init() awaits this before the first show() */
  waitForBackground() { return this._bgReady; }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.LOADING_PROGRESS, this._onProgress);
    this._events.off(EVENTS.INPUT_TAP, this._onTap);
    this._events.off(EVENTS.RESIZE, this._onResize);
    gsap.killTweensOf([this._r.fill.scale, this._r.begin, this._r.tip]);
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /** @returns {void} reveal the photo + title + bar (NOT `_root`, already visible since enable()) — reflect whatever progress already arrived */
  show() {
    this._content.visible = true;
    this._dismissed = false;
    this._tipMs = 0;
    this._r.tip.text = LOADING_TIPS[this._tipIndex];
    this._r.fill.scale.x = this._target;
    this._r.percent.text = `${Math.round(this._target * PERCENT)}%`;
    if (this._target >= 1) this._armBegin();
    this._layout();
  }

  /** @returns {void} */
  hide() {
    this._content.visible = false;
    gsap.killTweensOf([this._r.begin, this._r.tip]);
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    if (!this._content.visible) return;
    this._tipMs += dt * MS_PER_SECOND;
    if (this._tipMs >= MENU.loading.tipRotateMs) { this._tipMs = 0; this._rotateTip(); }
  }

  /** @private @param {number} frac */
  _progress(frac) {
    this._target = clamp(frac, 0, 1);
    const full = this._target >= 1;
    buildBar(this._r.fill, barWidth(this._renderer.app.screen), full ? MENU.loading.barFillFull : MENU.loading.barFill);
    gsap.killTweensOf(this._r.fill.scale);
    gsap.to(this._r.fill.scale, {
      x: this._target, duration: MENU.loading.barFillMs / MS_PER_SECOND, ease: 'power1.out',
      onUpdate: () => { this._r.percent.text = `${Math.round(this._r.fill.scale.x * PERCENT)}%`; },
      onComplete: () => { if (full) this._armBegin(); },
    });
  }

  /** @private start the "TAP TO BEGIN" pulse */
  _armBegin() {
    if (this._ready) return;
    this._ready = true;
    this._r.begin.visible = true;
    gsap.fromTo(this._r.begin, { alpha: 1 }, {
      alpha: MENU.loading.beginMinAlpha, duration: MENU.loading.beginPulseMs / MS_PER_SECOND,
      ease: 'sine.inOut', yoyo: true, repeat: -1,
    });
  }

  /** @private */
  _tap() {
    if (!this._content.visible || !this._ready || this._dismissed) return;
    this._dismissed = true;
    this._events.emit(EVENTS.LOADING_DISMISSED, {});
  }

  /** @private cross-fade to the next tip */
  _rotateTip() {
    const half = MENU.loading.tipFadeMs * HALF / MS_PER_SECOND;
    gsap.killTweensOf(this._r.tip);
    gsap.to(this._r.tip, { alpha: 0, duration: half, onComplete: () => {
      this._tipIndex = (this._tipIndex + 1) % LOADING_TIPS.length;
      this._r.tip.text = LOADING_TIPS[this._tipIndex];
      gsap.to(this._r.tip, { alpha: 1, duration: half });
    } });
  }

  /** @private pick the horizontal/vertical background photo for the current orientation, then re-anchor everything */
  _layout() {
    const screen = this._renderer.app.screen;
    const tex = screen.width >= screen.height ? this._bg.h : this._bg.v;
    if (tex) this._r.image.texture = tex;
    layoutLoading(this._r, screen, this._target);
  }
}
