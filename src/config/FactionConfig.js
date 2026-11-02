/**
 * FactionConfig — the 3 faction identities (GDD 03) + pure queries over the
 * UnitStats roster. No PixiJS, no state, no per-frame work.
 *
 * The per-faction roster is DERIVED from UnitStats rows (each row carries
 * `faction`), never hand-authored here — so adding / moving a unit row is the
 * only edit a roster change needs. `exclusives` / `lacks` below are stated
 * verbatim from GDD 03 for quick reference + validation, but the authoritative
 * answer always comes from the rows.
 *
 * Faction affects stats ONLY through the Nation Bonus — an additive fraction
 * passed to StatResolution as `ctx.nation` (see ProgressionConfig.nationBonus).
 * There are NO per-stat faction multipliers and nothing writes faction stats
 * onto entities: it is the roster + each unit's own base stats that make
 * Germany armoured, USA fast, Russia durable.
 *
 * NOTE: the player's CHOSEN faction and its persistence belong to the future
 * save / meta layer. On the world map today, the platoon + Legion rosters are
 * `UnitStats` keys in `BASE.army.roster` / `BASE.enemy.roster` (BaseConfig),
 * spawned via `worldmap/unitRoster.js` — keep those consistent with
 * `getAvailableUnits()`.
 *
 * DRAFT: names / doctrine strings are GDD 03 verbatim. REVIEW on any rename.
 */
import { ALL_COMBAT_UNITS, ALL_UNITS, CLASS_TRAITS } from './UnitStats.js';
import { nationBonus } from './ProgressionConfig.js';

const ANY = 'any'; // GatherTruck faction sentinel — cosmetic skin, available to all

/**
 * The 3 factions (GDD 03 "FACTION IDENTITY & EXCLUSIVES"). `exclusives` /
 * `lacks` are CLASS_TRAITS keys.
 */
export const FACTIONS = {
  germany: {
    id: 'germany', name: 'Germany', doctrine: 'Defense & Armor',
    exclusives: ['superHeavyTank', 'atGun'],
    lacks: ['lightTank', 'howitzer', 'launcher'],
  },
  usa: {
    id: 'usa', name: 'USA', doctrine: 'Speed & Range',
    exclusives: ['lightTank'],
    lacks: ['superHeavyTank', 'atGun', 'launcher'],
  },
  russia: {
    id: 'russia', name: 'Russia', doctrine: 'AoE & Durability',
    exclusives: ['launcher'],
    lacks: ['superHeavyTank', 'atGun', 'lightTank'],
  },
};

/** @type {string[]} valid faction ids */
export const FACTION_IDS = Object.keys(FACTIONS);

/**
 * Combat-unit KEYS this faction fields (e.g. 'panzer_iv'), sorted. The Gather
 * Truck (faction 'any') is a cosmetic Armored Car, not an Armory troop —
 * excluded here.
 * @param {string} faction 'germany' | 'usa' | 'russia'
 * @returns {string[]}
 */
export function getAvailableUnits(faction) {
  return Object.keys(ALL_COMBAT_UNITS)
    .filter((key) => ALL_COMBAT_UNITS[key].faction === faction)
    .sort();
}

/**
 * Is `unitKey` fieldable by `faction`? A row with faction 'any' (the Gather
 * Truck) counts as available to every faction.
 * @param {string} unitKey @param {string} faction
 * @returns {boolean}
 */
export function isUnitAvailable(unitKey, faction) {
  const row = ALL_UNITS[unitKey];
  return Boolean(row) && (row.faction === faction || row.faction === ANY);
}

/**
 * The set of CLASS_TRAITS keys this faction can field (combat classes only).
 * @param {string} faction
 * @returns {Set<string>}
 */
export function unitClassesFor(faction) {
  const set = new Set();
  for (const key of getAvailableUnits(faction)) set.add(ALL_COMBAT_UNITS[key].cls);
  return set;
}

/**
 * GDD 03 "TROOP SUMMARY" as data — `{ faction: { cls: boolean } }` for every
 * CLASS_TRAITS key, DERIVED from the rows so it can't drift from the roster.
 * `gatherTruck` (the cosmetic Armored Car) is true for every faction.
 * @type {Record<string, Record<string, boolean>>}
 */
export const FACTION_CLASS_COVERAGE = Object.fromEntries(
  FACTION_IDS.map((fid) => {
    const has = unitClassesFor(fid);
    const row = Object.fromEntries(
      Object.keys(CLASS_TRAITS).map((cls) => [cls, cls === 'gatherTruck' || has.has(cls)]),
    );
    return [fid, row];
  }),
);

/**
 * The Nation Bonus fraction for this faction's troops — a pure passthrough to
 * ProgressionConfig.nationBonus(). Callers pass the result as StatResolution
 * `ctx.nation`. Faction identity does NOT branch the math here.
 * @param {string} faction accepted for call-site symmetry; unused by the math
 * @param {number} sameNationBarracks 0..5
 * @returns {number} additive fraction 0..0.24 (capped by BONUS_CAPS.nation)
 */
export function nationBonusFor(faction, sameNationBarracks) {
  return nationBonus(sameNationBarracks);
}
