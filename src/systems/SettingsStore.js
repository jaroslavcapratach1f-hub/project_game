/**
 * SettingsStore — the player-settings model. Framework-free (no PixiJS): loads a
 * snapshot from localStorage, validates + clamps every write against
 * SETTINGS_SCHEMA, persists, and emits SETTINGS_CHANGED { key, value }.
 * Constructed once in Game.init() and handed to consumers (SettingsScreen,
 * Renderer, InputManager, a haptics helper…). Not a loop system — no update().
 */
import { EVENTS } from '../engine/GameEvents.js';
import {
  SETTINGS_SCHEMA, SETTINGS_BY_KEY, SETTINGS_STORAGE_KEY,
} from '../config/SettingsConfig.js';
import { clamp } from '../utils/MathUtils.js';

const SUB_ONE_DECIMALS = 1; // range steps < 1 keep one decimal; whole steps keep none

export class SettingsStore {
  /** @param {import('../utils/EventEmitter.js').EventEmitter} events shared bus */
  constructor(events) {
    /** @private */ this._events = events;
    /** @private @type {Record<string, *>} */ this._values = defaults();
    this.load();
  }

  /**
   * Reset to defaults, then merge the persisted snapshot over them. Unknown keys
   * are dropped; malformed / absent / disabled storage falls back to defaults.
   * Never throws.
   * @returns {void}
   */
  load() {
    this._values = defaults();
    const parsed = readStorage();
    if (!parsed) return;
    for (let i = 0; i < SETTINGS_SCHEMA.length; i++) {
      const def = SETTINGS_SCHEMA[i];
      if (Object.prototype.hasOwnProperty.call(parsed, def.key)) {
        this._values[def.key] = coerce(def, parsed[def.key]);
      }
    }
  }

  /** @param {string} key @returns {*} current value (undefined for an unknown key) */
  get(key) {
    return this._values[key];
  }

  /** @returns {Record<string, *>} a shallow snapshot of every setting */
  all() {
    return { ...this._values };
  }

  /**
   * Re-emit SETTINGS_CHANGED for every key so a freshly-wired consumer can pull
   * the current value through the same path a live change uses. Idempotent for
   * consumers (they set the same value they already hold).
   * @returns {void}
   */
  broadcast() {
    for (let i = 0; i < SETTINGS_SCHEMA.length; i++) {
      const key = SETTINGS_SCHEMA[i].key;
      this._events.emit(EVENTS.SETTINGS_CHANGED, { key, value: this._values[key] });
    }
  }

  /**
   * Coerce val against the schema, store it, persist, emit SETTINGS_CHANGED.
   * No-op (no write, no emit) for an unknown key or an unchanged value.
   * @param {string} key @param {*} val @returns {void}
   */
  set(key, val) {
    const def = SETTINGS_BY_KEY[key];
    if (!def) return;
    const next = coerce(def, val);
    if (next === this._values[key]) return;
    this._values[key] = next;
    this._persist();
    this._events.emit(EVENTS.SETTINGS_CHANGED, { key, value: next });
  }

  /** @private write the snapshot; swallow quota / disabled-storage errors */
  _persist() {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this._values));
    } catch { /* storage unavailable — in-memory only this session */ }
  }
}

/** @returns {Record<string, *>} a fresh key -> default map */
function defaults() {
  const out = {};
  for (let i = 0; i < SETTINGS_SCHEMA.length; i++) out[SETTINGS_SCHEMA[i].key] = SETTINGS_SCHEMA[i].default;
  return out;
}

/** @returns {?Record<string, *>} the parsed storage object, or null on any failure */
function readStorage() {
  let raw = null;
  try { raw = localStorage.getItem(SETTINGS_STORAGE_KEY); } catch { return null; }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch { return null; }
}

/**
 * Coerce a raw value into the schema's shape: bools cast, enums restricted to
 * `options`, ranges clamped to [min,max] and snapped to `step` (float dust
 * trimmed). Returns the def default when the value cannot be salvaged.
 * @param {import('../config/SettingsConfig.js').SettingDef} def @param {*} val
 * @returns {*}
 */
function coerce(def, val) {
  if (def.type === 'bool') return Boolean(val);
  if (def.type === 'enum') return def.options.includes(val) ? val : def.default;
  const n = Number(val);
  if (!Number.isFinite(n)) return def.default;
  const decimals = def.step < 1 ? SUB_ONE_DECIMALS : 0;
  const snapped = def.min + Math.round((clamp(n, def.min, def.max) - def.min) / def.step) * def.step;
  return Number(snapped.toFixed(decimals));
}
