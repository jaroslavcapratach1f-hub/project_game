/**
 * ArmyBarrackTile — the landscape tile `ArmyBarrackRow` shows for one
 * barracks. BUILT: the actual troop it produces, over that troop's own
 * FACTION background photo (`loadFactionTextures`, the player's own
 * correction — "unique each troop background", not one flat colour shared
 * by every row) — the exact same cover-fit faction-photo technique
 * `UnitCard`'s grid card already uses, so the two read as one visual
 * language. The troop's own art (hero cutout first — `UNIT_HERO_URL` —
 * else the live 3D snapshot) sits on top, contain-fit so it's never
 * cropped (the player's own "not properly visible" report — a previous
 * version of this file also had the sprite's own centring offset from
 * `fitContain` clobbered by a raw `position.set(x,y)` right after it,
 * placing the image almost entirely off the tile; fixed by switching to
 * local 0,0..w,h coordinates — `ArmyBarrackRow` positions `view`, this
 * file never touches an absolute screen coordinate). While that art is
 * still loading, the tile just shows the flat `_fallbackBg` — no
 * placeholder icon (the player's own call: the class-glyph fallback this
 * file used to draw there flashed visibly on a slow first load, and isn't
 * needed since this path always has real art behind it). LOCKED: that
 * barracks' own number + a padlock, centred, over the same flat tile.
 * Split out of `ArmyBarrackRow` purely to keep that file under the
 * 150-line cap.
 */
import { Assets, Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { ARMY_MENU } from '../../config/ArmyMenuConfig.js';
import { ALL_UNITS } from '../../config/UnitStats.js';
import { UNIT_HERO_URL } from '../../config/UnitHeroConfig.js';
import { UNIT_3D } from '../../config/Unit3DConfig.js';
import { getUnitIconDataURL } from '../../entities/UnitIconRenderer.js';
import { loadFactionTextures } from './SquadBarFactionBg.js';
import { fitCover, fitContain } from '../ScreenDraw.js';
import { drawLockIcon } from './ArmyIconDraw.js';

const HALF = 0.5;
// No real player-faction-choice system exists yet (BASE.army.roster is
// hardcoded USA — see BaseConfig.js) — the barracks troop render reads the
// same de-facto faction until one does.
const PLAYER_FACTION = 'usa';

/** @param {string} cls `CLASS_TRAITS` key @returns {?{key:string,unit:object}} the player faction's own roster entry for this class, if any (GDD 03: one combat unit per class per faction) */
export function rosterEntryFor(cls) {
  for (const key in ALL_UNITS) {
    const u = ALL_UNITS[key];
    if (u.faction === PLAYER_FACTION && u.cls === cls) return { key, unit: u };
  }
  return null;
}

export class ArmyBarrackTile {
  /** @param {number} number this section's 1-based barracks number */
  constructor(number) {
    this._cls = null;
    this._hasImage = false;
    this._destroyed = false;
    this._w = 0; this._h = 0;
    this.view = new Container();
    const m = ARMY_MENU;
    this._mask = new Graphics();
    this._fallbackBg = new Graphics(); // flat tile colour — locked rows, or before the faction photo has loaded
    this._factionBg = new Sprite(); // that troop's own FACTION photo — UnitCard's own cover-fit technique
    this._factionBg.visible = false;
    this._factionBg.mask = this._mask;
    this._image = new Sprite();
    this._image.visible = false;
    this._image.mask = this._mask;
    this._glyph = new Graphics(); // the locked tile's own padlock only
    this._numberLabel = new Text({ text: `${m.lockNumberLabel}${number}`, style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: m.lockNumberPx, fill: m.lockColor, fontWeight: 'bold' }) });
    this._subLabel = new Text({ text: m.lockSubLabel, style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: m.lockSubLabelPx, fill: m.lockColor }) });
    this._numberLabel.anchor.set(HALF); this._subLabel.anchor.set(HALF);
    this.view.addChild(this._mask, this._fallbackBg, this._factionBg, this._image, this._glyph, this._numberLabel, this._subLabel);
  }

  /** @param {boolean} built @param {?string} cls `CLASS_TRAITS` key this barracks produces @returns {void} */
  setState(built, cls) {
    const changed = cls !== this._cls;
    this._built = built; this._cls = cls;
    if (!built) { this._hasImage = false; this._image.visible = false; this._factionBg.visible = false; return; }
    if (changed) this._loadArt(cls);
  }

  /** @param {number} x @param {number} y top-left, screen px @param {number} w @param {number} h @returns {void} */
  layout(x, y, w, h) {
    this._w = w; this._h = h;
    this.view.position.set(x, y);
    const m = ARMY_MENU;
    this._mask.clear().roundRect(0, 0, w, h, m.tileRadiusPx).fill(0xffffff);
    this._fallbackBg.clear().rect(0, 0, w, h).fill({ color: m.lockFallbackBg, alpha: 1 });
    if (this._factionBg.visible) fitCover(this._factionBg, w, h);
    this._image.visible = this._built && this._hasImage;
    if (this._image.visible) fitContain(this._image, w, h);
    this._glyph.clear();
    this._numberLabel.visible = !this._built; this._subLabel.visible = !this._built;
    if (!this._built) this._layoutLocked(w * HALF, h * HALF);
  }

  /** @returns {void} stop a late-resolving art load from touching a torn-down tile */
  markDestroyed() { this._destroyed = true; }

  /** @private the locked tile's own centred stack: padlock, "No. N", "Barrack" @param {number} cx @param {number} cy */
  _layoutLocked(cx, cy) {
    const m = ARMY_MENU;
    const lockR = m.lockIconPx * HALF;
    const totalH = m.lockIconPx + m.lockIconGapPx + m.lockNumberPx + m.lockNumberGapPx + m.lockSubLabelPx;
    let cursorY = cy - totalH * HALF;
    drawLockIcon(this._glyph, { x: cx, y: cursorY + lockR }, m.lockIconPx, m.lockColor);
    cursorY += m.lockIconPx + m.lockIconGapPx;
    this._numberLabel.position.set(cx, cursorY + m.lockNumberPx * HALF);
    cursorY += m.lockNumberPx + m.lockNumberGapPx;
    this._subLabel.position.set(cx, cursorY + m.lockSubLabelPx * HALF);
  }

  /** @private load the faction photo backdrop + the troop's own art — hero cutout first, the live 3D snapshot as its own fallback (same priority `TroopHeroImage` uses) @param {string} cls */
  _loadArt(cls) {
    this._hasImage = false;
    this._image.visible = false;
    loadFactionTextures().then((tex) => {
      if (this._destroyed || this._cls !== cls || !tex[PLAYER_FACTION]) return;
      this._factionBg.texture = tex[PLAYER_FACTION];
      this._factionBg.visible = true;
      if (this._w) fitCover(this._factionBg, this._w, this._h);
    });
    const entry = rosterEntryFor(cls);
    const heroUrl = entry && UNIT_HERO_URL[entry.key];
    if (heroUrl) { Assets.load(heroUrl).then((tex) => this._applyArt(cls, tex)); return; }
    const unit3D = UNIT_3D[`${PLAYER_FACTION}:${cls}`];
    if (!unit3D) return;
    getUnitIconDataURL(unit3D).then((dataUrl) => Assets.load(dataUrl)).then((tex) => this._applyArt(cls, tex));
  }

  /** @private @param {string} cls the class this load was FOR (guards a late resolve) @param {import('pixi.js').Texture} tex */
  _applyArt(cls, tex) {
    if (this._destroyed || this._cls !== cls) return;
    this._image.texture = tex;
    this._hasImage = true;
    this._image.visible = this._built;
    if (this._image.visible && this._w) fitContain(this._image, this._w, this._h);
  }
}
