/**
 * DynamicBarracks — pure helpers for the GDD-04 Dynamic Barracks: a Military
 * Barracks re-skins to Tank Factory / Artillery Factory by what it is set to
 * produce, instantly and reversibly (no cost, no timer). Not a class per
 * building — the live `produces` class and derived `variant` are plain fields on
 * the barracks instance held by BaseManager; these functions derive the rest.
 *
 * There is no production pipeline yet — "can produce tanks" just means the Tank
 * Factory variant reports the tank classes from `allowedClasses`. A real build
 * queue (personnel spend, timers, output) is FORWARD.
 */
import { BARRACKS_VARIANTS, barracksVariantForClass } from '../config/BuildingConfig.js';

const FALLBACK = 'militaryBarracks';

/**
 * @param {string} producesClass combat class the barracks is set to produce
 * @returns {string} BARRACKS_VARIANTS key
 */
export function variantFor(producesClass) {
  return barracksVariantForClass(producesClass);
}

/**
 * @param {string} variant BARRACKS_VARIANTS key
 * @returns {string[]} combat classes this variant may queue
 */
export function allowedClasses(variant) {
  return (BARRACKS_VARIANTS[variant] ?? BARRACKS_VARIANTS[FALLBACK]).classes;
}

/**
 * @param {string} variant BARRACKS_VARIANTS key
 * @returns {string} display label
 */
export function label(variant) {
  return (BARRACKS_VARIANTS[variant] ?? BARRACKS_VARIANTS[FALLBACK]).label;
}

/**
 * @param {string} variant BARRACKS_VARIANTS key
 * @returns {number} placeholder rect tint
 */
export function tint(variant) {
  return (BARRACKS_VARIANTS[variant] ?? BARRACKS_VARIANTS[FALLBACK]).tint;
}
