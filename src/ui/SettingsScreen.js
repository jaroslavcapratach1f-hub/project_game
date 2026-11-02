/**
 * SettingsScreen — a modal panel over a dimmer on LAYERS.OVERLAY. One row per
 * SETTINGS_SCHEMA entry: `Slider` (range), `SegmentedControl` (enum), `Toggle`
 * (bool). Each control's onChange → `settingsStore.set(key, val)` (persists +
 * emits SETTINGS_CHANGED). DONE calls `onDone`. `open()` seeds every control
 * from `settingsStore.all()`. No auto-fire row. update(dt) no-op.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';
import { EVENTS } from '../engine/GameEvents.js';
import { MENU } from '../config/MenuConfig.js';
import { SETTINGS_SCHEMA } from '../config/SettingsConfig.js';
import { buildDimmer, buildPanel, centredPanel } from './SettingsDraw.js';
import { Button } from './controls/Button.js';
import { Slider } from './controls/Slider.js';
import { Toggle } from './controls/Toggle.js';
import { SegmentedControl } from './controls/SegmentedControl.js';

const MS_PER_SECOND = 1000;
const HALF = 0.5;

export class SettingsScreen {
  /**
   * @param {object} renderer Renderer @param {object} events shared bus
   * @param {object} settingsStore SettingsStore @param {Function} onDone on DONE
   */
  constructor(renderer, events, settingsStore, onDone) {
    this._renderer = renderer;
    this._events = events;
    this._store = settingsStore;
    this._onDone = onDone;
    this._root = new Container();
    this._root.visible = false;
    this._dim = new Graphics();
    this._panel = new Graphics();
    this._title = mkText(MENU.panel.titlePx, MENU.color.goldBright, MENU.settings.title, HALF);
    /** @private @type {{def:object,label:Text,control:object}[]} */ this._rows = [];
    this._done = new Button(events, MENU.settings.doneLabel, () => this._finish());
    this._onResize = () => this._layout();
  }

  /** @returns {Container} */ get view() { return this._root; }
  /** @returns {boolean} */ get isOpen() { return this._root.visible; }

  /** @returns {void} */
  enable() {
    this._root.addChild(this._dim, this._panel, this._title);
    for (let i = 0; i < SETTINGS_SCHEMA.length; i++) {
      const def = SETTINGS_SCHEMA[i];
      const label = mkText(MENU.panel.labelPx, MENU.color.text, def.label, 0);
      const control = this._makeControl(def);
      control.enable();
      control.view.visible = false;
      this._root.addChild(label, control.view);
      this._rows.push({ def, label, control });
    }
    this._done.enable();
    this._done.view.visible = false;
    this._root.addChild(this._done.view);
    this._layout();
    this._events.on(EVENTS.RESIZE, this._onResize);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.RESIZE, this._onResize);
    for (let i = 0; i < this._rows.length; i++) this._rows[i].control.disable();
    this._done.disable();
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /** @returns {void} show + seed every control from the store */
  open() {
    const vals = this._store.all();
    for (let i = 0; i < this._rows.length; i++) {
      const r = this._rows[i];
      r.control.setValue(vals[r.def.key]);
      r.control.view.visible = true;
    }
    this._done.view.visible = true;
    this._root.visible = true;
    this._layout();
    gsap.killTweensOf(this._root);
    gsap.fromTo(this._root, { alpha: 0 }, { alpha: 1, duration: MENU.panel.enterMs / MS_PER_SECOND });
  }

  /** @returns {void} */
  close() {
    this._root.visible = false;
    for (let i = 0; i < this._rows.length; i++) this._rows[i].control.view.visible = false;
    this._done.view.visible = false;
  }

  /** @param {number} _dt @returns {void} */
  update(_dt) { /* controls are event-driven */ }

  /** @private */
  _finish() {
    this.close();
    if (this._onDone) this._onDone();
  }

  /** @private @param {object} def SETTINGS_SCHEMA entry @returns {object} control */
  _makeControl(def) {
    const set = (v) => this._store.set(def.key, v);
    if (def.type === 'range') return new Slider(this._events, def, set);
    if (def.type === 'enum') return new SegmentedControl(this._events, def.options, set);
    return new Toggle(this._events, set);
  }

  /** @private re-anchor the dimmer, panel, title, every row and DONE */
  _layout() {
    const p = MENU.panel;
    const s = this._renderer.app.screen;
    const stride = p.rowHeightPx + p.rowGapPx;
    const contentH = p.padPx * 2 + p.titlePx + p.titleGapPx
      + this._rows.length * stride + MENU.settings.doneGapPx + MENU.button.heightPx;
    const box = centredPanel(s, contentH);
    buildDimmer(this._dim, s.width, s.height);
    buildPanel(this._panel, box.w, box.h);
    this._panel.position.set(box.x, box.y);
    this._title.position.set(box.x + box.w * HALF, box.y + p.padPx + p.titlePx * HALF);
    const ctlX = box.x + box.w - p.padPx - MENU.settings.controlColPx;
    let y = box.y + p.padPx + p.titlePx + p.titleGapPx;
    for (let i = 0; i < this._rows.length; i++) {
      this._rows[i].label.position.set(box.x + p.padPx, y + p.rowHeightPx * HALF);
      placeControl(this._rows[i], ctlX, y);
      y += stride;
    }
    this._done.setPosition(box.x + (box.w - MENU.button.widthPx) * HALF, y + MENU.settings.doneGapPx - p.rowGapPx);
  }
}

/** @param {{def:object,control:object}} row @param {number} x @param {number} y @returns {void} */
function placeControl(row, x, y) {
  const h = MENU.panel.rowHeightPx;
  const c = MENU.control;
  if (row.def.type === 'range') row.control.setPosition(x, y + h * HALF - c.knobRadiusPx);
  else if (row.def.type === 'bool') row.control.setPosition(x, y + (h - c.toggleHeightPx) * HALF);
  else row.control.setPosition(x, y + (h - MENU.segmented.heightPx) * HALF);
}

/** @param {number} size @param {number} fill @param {string} value @param {number} anchorX @returns {Text} */
function mkText(size, fill, value, anchorX) {
  const t = new Text({ text: value, style: new TextStyle({ fontFamily: MENU.fontFamily, fontSize: size, fill }) });
  t.anchor.set(anchorX, HALF);
  return t;
}
