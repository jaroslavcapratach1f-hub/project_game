/**
 * SettingsConfig — the player-settings schema (one entry per setting) plus the
 * graphics-quality presets that map a choice onto engine knobs. `SettingsStore`
 * validates every write against `SETTINGS_SCHEMA`; `SettingsScreen` builds one
 * control per entry, in order.
 *
 * DRAFT. No audio system exists yet — `musicVolume` / `sfxVolume` are persisted
 * now for a later consumer.
 */

/**
 * @typedef {Object} SettingDef
 * @property {string} key
 * @property {'range'|'enum'|'bool'} type
 * @property {*} default
 * @property {string} label
 * @property {number} [min]
 * @property {number} [max]
 * @property {number} [step]
 * @property {string[]} [options]
 */

/** @type {SettingDef[]} render order for SettingsScreen rows. */
export const SETTINGS_SCHEMA = [
  { key: 'musicVolume', type: 'range', default: 70, min: 0, max: 100, step: 5, label: 'Music Volume' },
  { key: 'sfxVolume', type: 'range', default: 80, min: 0, max: 100, step: 5, label: 'SFX Volume' },
  { key: 'touchSensitivity', type: 'range', default: 1.0, min: 0.2, max: 2.0, step: 0.1, label: 'Touch Sensitivity' },
  { key: 'graphicsQuality', type: 'enum', default: 'Medium', options: ['Low', 'Medium', 'High'], label: 'Graphics Quality' },
  { key: 'vibration', type: 'bool', default: true, label: 'Vibration' },
  { key: 'damageNumbers', type: 'bool', default: true, label: 'Damage Numbers' },
  { key: 'fpsCounter', type: 'bool', default: false, label: 'FPS Counter' },
];

/** Fast lookup of a def by its key. */
export const SETTINGS_BY_KEY = Object.freeze(
  SETTINGS_SCHEMA.reduce((map, def) => { map[def.key] = def; return map; }, {}),
);

/** localStorage key holding the persisted settings snapshot. */
export const SETTINGS_STORAGE_KEY = 'blitzmire.settings';

/**
 * `graphicsQuality` choice -> engine knobs (consumed via GRAPHICS_PRESETS in
 * Session C — Renderer dpr cap, particle pool ceiling, decal pool fraction).
 */
export const GRAPHICS_PRESETS = {
  Low: { dprCap: 1, maxParticles: 200, decalPoolFrac: 0.4 },
  Medium: { dprCap: 2, maxParticles: 350, decalPoolFrac: 0.7 },
  High: { dprCap: 2, maxParticles: 500, decalPoolFrac: 1.0 },
};
