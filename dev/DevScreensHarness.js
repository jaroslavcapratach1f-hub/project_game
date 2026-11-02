/**
 * DevScreensHarness — dev-only, deletable (gated by RENDER.devScreens, composed
 * by DevEntityHarness like DevSkirmishHarness). Mounts one Button + one Slider +
 * one Toggle on LAYERS.OVERLAY so the reusable controls can be exercised
 * (press-punch, quantised drag/tap, knob slide), seeds them from a SettingsStore,
 * logs every callback, and runs a localStorage round-trip self-test. Exposes
 * window.settings. Superseded once the real front-end screens exist (Session B+).
 */
import { RENDER } from '../config/GameConfig.js';
import { MENU } from '../config/MenuConfig.js';
import { SETTINGS_BY_KEY } from '../config/SettingsConfig.js';
import { SettingsStore } from '../systems/SettingsStore.js';
import { Button } from '../ui/controls/Button.js';
import { Slider } from '../ui/controls/Slider.js';
import { Toggle } from '../ui/controls/Toggle.js';

const HALF = 0.5;
const TOP_PX = 120;
const ROW_GAP_PX = 96;
const SENS = SETTINGS_BY_KEY.touchSensitivity;

export class DevScreensHarness {
  constructor() {
    /** @private @type {?SettingsStore} */ this._store = null;
    /** @private @type {?Button} */ this._button = null;
    /** @private @type {?Slider} */ this._slider = null;
    /** @private @type {?Toggle} */ this._toggle = null;
  }

  /**
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @returns {void}
   */
  enable(renderer, events) {
    if (!RENDER.devScreens) return;
    this._store = new SettingsStore(events);
    const cx = renderer.app.screen.width * HALF;
    this._button = new Button(events, 'DEPLOY', () => console.debug('[Screens] button pressed'));
    this._slider = new Slider(events, SENS, (v) => console.debug(`[Screens] slider -> ${v}`));
    this._toggle = new Toggle(events, (b) => console.debug(`[Screens] toggle -> ${b}`));
    for (const ctl of [this._button, this._slider, this._toggle]) {
      ctl.enable();
      renderer.layer('OVERLAY').addChild(ctl.view);
    }
    this._button.setPosition(cx - MENU.button.widthPx * HALF, TOP_PX);
    this._slider.setPosition(cx - MENU.control.trackWidthPx * HALF, TOP_PX + ROW_GAP_PX);
    this._toggle.setPosition(cx - MENU.control.toggleWidthPx * HALF, TOP_PX + ROW_GAP_PX * 2);
    this._slider.setValue(this._store.get('touchSensitivity'));
    this._toggle.setValue(this._store.get('damageNumbers'));
    this._roundTrip(events);
    if (typeof window !== 'undefined') window.settings = this._store;
  }

  /** @returns {void} */
  disable() {
    for (const ctl of [this._button, this._slider, this._toggle]) ctl?.disable();
    if (typeof window !== 'undefined' && window.settings === this._store) delete window.settings;
    this._store = this._button = this._slider = this._toggle = null;
  }

  /** @private localStorage round-trip: set -> reload a fresh store -> compare */
  _roundTrip(events) {
    const key = 'fpsCounter';
    const original = this._store.get(key);
    this._store.set(key, !original);
    const reloaded = new SettingsStore(events);
    const pass = reloaded.get(key) === !original;
    console.debug(`[Screens] SettingsStore round-trip ${pass ? 'PASS' : 'FAIL'} — ${key} ${original} -> ${reloaded.get(key)}`);
    this._store.set(key, original);
  }
}
