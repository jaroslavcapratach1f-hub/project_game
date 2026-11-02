/**
 * FormatNumber — compact "K/M/B" display for large HUD numbers (money,
 * steel, oil, personnel, gold, power): the player's own ask — a raw
 * digit-grouped value like "1,350,000" "takes a lot of space", show
 * "1.4M" instead. Plain digits below 1000 so small values still read
 * exactly. One decimal (not two) and a `WORST_CASE` reservation capped at
 * a realistic ceiling, not literally the largest JS can print — both the
 * player's own later correction: "reduce glass section width as it's too
 * big". `abbrSlotWidth` pairs with this: it measures `WORST_CASE` in a
 * given Text's own style, once, so a badge can reserve a fixed-width slot
 * instead of resizing (and shoving its neighbours) every time a value
 * crosses a digit boundary — the player's own earlier report: "whole line
 * of resources moving".
 */
const UNITS = [{ v: 1e9, s: 'B' }, { v: 1e6, s: 'M' }];
const WORST_CASE = '99.9M';

/**
 * @param {number} n
 * @param {number} [kThreshold] value at which "K" kicks in — Power passes
 *   10000 so it reads as plain digits up to 4 of them (the player's own
 *   ask: "max 4 numbers... keep a close eye on its base power"); every
 *   other caller uses the default 1000.
 * @returns {string} e.g. 100500 -> "100.5K", 1350000 -> "1.4M"
 */
export function formatAbbr(n, kThreshold = 1000) {
  const v = Math.round(n);
  for (const u of UNITS) {
    if (Math.abs(v) >= u.v) return `${(v / u.v).toFixed(1).replace(/\.0$/, '')}${u.s}`;
  }
  if (Math.abs(v) >= kThreshold) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  return v.toLocaleString('en-US');
}

/** @param {import('pixi.js').Text} probe scratch Text already carrying the real style @returns {number} px */
export function abbrSlotWidth(probe) {
  const prev = probe.text;
  probe.text = WORST_CASE;
  const w = probe.width;
  probe.text = prev;
  return w;
}
