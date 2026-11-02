/**
 * StarRow — a row of real gold star SHAPES (PixiJS `Graphics.star()`, not
 * flat Unicode glyphs — the player's own complaint that the troop screens
 * "look very unpleasant... built just to complete the task"), each with a
 * soft drop shadow for a little depth. Used by both `UnitCard` (small,
 * grid) and `TroopDetailScreen` (bigger, detail header) so the two stay
 * visually identical by construction. A fractional star tier (e.g. 4.5)
 * is the CALLER's own "+" badge next to the row — see `width` below.
 */
import { Container, Graphics } from 'pixi.js';

const POINTS = 5;

export class StarRow {
  /**
   * @param {{sizePx:number, gapPx:number, max:number, filledColor:number,
   *   emptyColor:number, shadowColor?:number, shadowAlpha?:number, shadowOffsetPx?:number}} opts
   */
  constructor(opts) {
    const { sizePx, gapPx, max, filledColor, emptyColor, shadowColor = 0x000000, shadowAlpha = 0.35, shadowOffsetPx = 1.5 } = opts;
    this._sizePx = sizePx;
    this._gapPx = gapPx;
    this._max = max;
    this._filledColor = filledColor;
    this._emptyColor = emptyColor;
    this.view = new Container();
    /** @private @type {{star:import('pixi.js').Graphics, cx:number}[]} */
    this._stars = [];
    const cell = sizePx * 2 + gapPx;
    for (let i = 0; i < max; i++) {
      const cx = sizePx + i * cell;
      const shadow = new Graphics().star(cx + shadowOffsetPx, shadowOffsetPx, POINTS, sizePx).fill({ color: shadowColor, alpha: shadowAlpha });
      const star = new Graphics();
      this._stars.push({ star, cx });
      this.view.addChild(shadow, star);
    }
  }

  /** @returns {number} total row width, px — the caller's own "+" half-tier badge goes right after this */
  get width() { return this._max * this._sizePx * 2 + Math.max(0, this._max - 1) * this._gapPx; }

  /** @param {number} filledCount 0..max, whole stars only @returns {void} */
  setFilled(filledCount) {
    for (let i = 0; i < this._stars.length; i++) {
      const s = this._stars[i];
      s.star.clear().star(s.cx, 0, POINTS, this._sizePx).fill(i < filledCount ? this._filledColor : this._emptyColor);
    }
  }
}
