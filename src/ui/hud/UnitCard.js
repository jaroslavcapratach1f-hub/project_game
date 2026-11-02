/** Roster card with live troop portrait, service status and current level. */
import { drawTroopCard, drawPortraitShade } from './TroopMenuDraw.js';
import { troopLevel } from '../../worldmap/troopLevels.js';
import { Assets, Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD, portraitColor, unitLabel } from '../../config/HudConfig.js';
import { UNIT_3D } from '../../config/Unit3DConfig.js';
import { getUnitIconDataURL } from '../../entities/UnitIconRenderer.js';
import { fitCover } from '../ScreenDraw.js';
import { StarRow } from './StarRow.js';
import { drawUnitClassIcon } from './UnitClassIconDraw.js';

const HALF = 0.5;
const MASK_FILL = 0xffffff;
const RIM_ALPHA = 0.55;

export class UnitCard {
  /** @param {{key:string, unit:object, deployed:boolean}} entry */
  constructor(entry) {
    this._entry = entry;
    this._destroyed = false;
    this._hasImage = false;
    this._size = 0;
    /** @type {?{x:number,y:number,w:number,h:number}} the grid cell this card was last placed in (`UnitsMenu`'s own tap hit-testing) */
    this.gridRect = null;
    this.view = new Container();
    this._mask = new Graphics();
    this._bgImage = new Sprite();
    this._portrait = new Graphics();
    this._image = new Sprite();
    this._bgImage.mask = this._mask; this._bgImage.visible = false;
    this._image.mask = this._mask; this._image.visible = false;
    this._rim = new Graphics();
    this._rimInner = new Graphics();
    this._vignette = new Graphics();
    this._levelBg = new Graphics();
    this._classIcon = new Graphics();
    const fam = WORLD_HUD.fontFamily, m = WORLD_HUD.unitsMenu;
    this._levelText = new Text({ text: `Lvl ${m.levelPlaceholder}`, style: new TextStyle({ fontFamily: fam, fontSize: m.levelPx, fill: WORLD_HUD.textColor }) });
    this._stars = new StarRow({ sizePx: m.starPx, gapPx: m.starGapPx, max: m.starMax, filledColor: m.starColor, emptyColor: m.starEmptyColor });
    this._starPlus = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: m.starPx * 2, fill: m.starColor, fontWeight: 'bold' }) });
    this._name = new Text({
      text: unitLabel(entry.unit.cls, entry.unit.faction),
      style: new TextStyle({ fontFamily: fam, fontSize: m.namePx, fill: WORLD_HUD.textColor, align: 'center', fontWeight: 'bold' }),
    });
    this._name.anchor.set(HALF, 0);
    this._deployed = new Text({
      text: entry.deployed ? m.deployedLabel : '',
      style: new TextStyle({ fontFamily: fam, fontSize: m.deployedPx, fill: WORLD_HUD.dimColor }),
    });
    this._deployed.anchor.set(HALF, 0);
    this.view.addChild(this._mask, this._bgImage, this._portrait, this._image, this._vignette, this._rim, this._rimInner,
      this._levelBg, this._levelText, this._classIcon, this._stars.view, this._starPlus, this._name, this._deployed);
    this._paintStars();
    const unit3D = UNIT_3D[`${entry.unit.faction}:${entry.unit.cls}`];
    if (unit3D) this._loadPortrait(unit3D);
  }

  /** @param {number} size the square art tile's side, px @returns {void} */
  resize(size) {
    this._size = size;
    this._levelText.text = `LV ${troopLevel(this._entry.key)}`;
    const m = WORLD_HUD.unitsMenu;
    this._mask.clear().rect(0, 0, size, size).fill(MASK_FILL);
    this._portrait.clear().rect(0, 0, size, size).fill(portraitColor(this._entry.unit.cls));
    if (this._bgImage.texture?.width) fitCover(this._bgImage, size, size);
    if (this._hasImage) fitCover(this._image, size, size);
    drawPortraitShade(this._vignette, size);
    // two-tone "trading card" bevel: a dark outer rim + a faint bright inset line.
    drawTroopCard(this._rim, size, m.nameHeightPx, this._entry.deployed);
    this._rimInner.clear().rect(1.5, 1.5, size - 3, size - 3).stroke({ color: WORLD_HUD.panel.cardStroke, width: 1, alpha: RIM_ALPHA });
    const inset = m.levelInsetPx;
    this._levelBg.clear().roundRect(inset, inset, this._levelText.width + m.levelPadPx * 2, m.levelPx + m.levelPadPx * 2, m.levelRadiusPx)
      .fill({ color: m.levelBg, alpha: m.levelBgAlpha })
      .stroke({ color: WORLD_HUD.panel.cardStroke, width: 1, alpha: 0.4 });
    this._levelText.position.set(inset + m.levelPadPx, inset + m.levelPadPx * HALF);
    const starY = size - m.starPx * 2 - m.tilePadPx;
    this._classIcon.clear();
    const iconPt = { x: m.tilePadPx + m.classIconPx * HALF, y: starY + m.starPx };
    drawUnitClassIcon(this._classIcon, this._entry.unit.cls, iconPt, m.classIconPx * HALF, WORLD_HUD.textColor);
    const starX = m.tilePadPx + m.classIconPx + m.classIconGapPx;
    this._stars.view.position.set(starX, starY);
    this._starPlus.position.set(starX + this._stars.width + 2, starY - m.starPx * HALF);
    this._name.position.set(size * HALF, size + m.tilePadPx);
    this._deployed.position.set(size * HALF, size + m.tilePadPx + m.namePx + 2);
  }

  /** @returns {string} the unit's faction, for `UnitsMenu` to pick its background photo */
  get faction() { return this._entry.unit.faction; }

  /** @returns {{key:string,unit:object,deployed:boolean}} the roster entry this card renders */
  get entry() { return this._entry; }

  /** @returns {void} stop a late-resolving portrait load from touching a torn-down card */
  markDestroyed() { this._destroyed = true; }

  /** @param {import('pixi.js').Texture} tex the unit's faction background photo (`SquadBarFactionBg`) @returns {void} */
  setFactionBg(tex) {
    this._bgImage.texture = tex;
    this._bgImage.visible = true;
    if (this._size) fitCover(this._bgImage, this._size, this._size);
  }

  /** @private */
  _paintStars() {
    const m = WORLD_HUD.unitsMenu, star = this._entry.unit.star;
    const filled = Math.max(0, Math.min(m.starMax, Math.floor(star)));
    this._stars.setFilled(filled);
    this._starPlus.text = star % 1 !== 0 ? '+' : '';
  }

  /** @private @param {object} unit3D a `UNIT_3D` entry */
  _loadPortrait(unit3D) {
    getUnitIconDataURL(unit3D).then((dataUrl) => Assets.load(dataUrl)).then((tex) => {
      if (this._destroyed) return;
      this._image.texture = tex;
      this._hasImage = true;
      this._image.visible = true;
      this._portrait.visible = false;
      if (this._size) fitCover(this._image, this._size, this._size);
    });
  }
}
