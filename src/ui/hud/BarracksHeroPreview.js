/**
 * BarracksHeroPreview — the barracks' own hero art (left column, square,
 * faction-photo-cover backdrop + a contain-fit cutout — `ArmyBarrackTile`'s
 * own technique), a dark name bar below it with a real level badge (the
 * reference's own tier-badge + name bar), a compact real Power/squad-size
 * line (`troopPower`/`SQUAD_BASE_CAP` — real config, no fabricated numbers),
 * and ONE action button at the bottom in one of two states
 * (`BarracksDetailScreen` owns which): REMOVE (a unit IS currently
 * assigned) or ASSIGN (the barracks is locally emptied — disabled/dim until
 * the player has tapped a candidate in the grid below). Empty state (no
 * entry) shows no art/name, just a blank meta line.
 */
import { Assets, Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD, unitLabel } from '../../config/HudConfig.js';
import { BARRACKS_DETAIL as C } from '../../config/BuildingScreenConfig.js';
import { UNIT_HERO_URL } from '../../config/UnitHeroConfig.js';
import { UNIT_3D } from '../../config/Unit3DConfig.js';
import { getUnitIconDataURL } from '../../entities/UnitIconRenderer.js';
import { troopLevel } from '../../worldmap/troopLevels.js';
import { loadFactionTextures } from './SquadBarFactionBg.js';
import { fitCover, fitContain } from '../ScreenDraw.js';
import { troopPower } from '../../config/PowerConfig.js';
import { SQUAD_BASE_CAP } from '../../config/PersonnelConfig.js';

const HALF = 0.5;
const PLAYER_FACTION = 'usa'; // same de-facto faction ArmyBarrackTile reads until a real faction-choice system exists

export class BarracksHeroPreview {
  constructor() {
    this.view = new Container();
    this._mask = new Graphics();
    this._bg = new Graphics();
    this._factionBg = new Sprite(); this._factionBg.visible = false; this._factionBg.mask = this._mask;
    this._image = new Sprite(); this._image.visible = false; this._image.mask = this._mask;
    const fam = WORLD_HUD.fontFamily, h = C.hero;
    this._nameBarBg = new Graphics();
    this._levelBg = new Graphics();
    this._levelLabel = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: h.levelPx, fill: h.nameColor }) });
    this._name = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: h.namePx, fill: h.nameColor, fontWeight: 'bold' }) });
    this._meta = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: h.metaPx, fill: h.metaColor }) });
    this._actionBg = new Graphics();
    this._actionLabel = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: C.action.labelPx, fontWeight: 'bold' }) });
    this._actionLabel.anchor.set(HALF);
    this._actionRect = { x: 0, y: 0, w: 0, h: 0 };
    this._destroyed = false; this._entryKey = null;
    this.view.addChild(this._mask, this._bg, this._factionBg, this._image, this._nameBarBg,
      this._levelBg, this._levelLabel, this._name, this._meta, this._actionBg, this._actionLabel);
  }

  /** @returns {void} */ markDestroyed() { this._destroyed = true; }

  /** @param {?{key:string,unit:object}} entry the assigned/previewed roster entry, or null (empty) @returns {void} */
  setEntry(entry) {
    this._entryKey = entry?.key ?? null;
    this._name.text = entry ? unitLabel(entry.unit.cls, entry.unit.faction) : '';
    this._levelLabel.text = entry ? `Lvl ${troopLevel(entry.key)}` : '';
    this._image.visible = false; this._factionBg.visible = false;
    if (!entry) { this._meta.text = ''; return; }
    const power = troopPower(entry.unit, SQUAD_BASE_CAP[entry.unit.cls] ?? 1);
    this._meta.text = `Power ${power.toLocaleString('en-US')}  ·  Squad x${SQUAD_BASE_CAP[entry.unit.cls] ?? 1}`;
    this._loadArt(entry);
  }

  /** @param {'remove'|'assign'} mode @param {boolean} enabled @returns {void} */
  setAction(mode, enabled) {
    const a = C.action;
    this._actionMode = mode;
    this._actionLabel.text = mode === 'remove' ? a.removeLabel : a.assignLabel;
    this._actionEnabled = enabled;
  }

  /** @param {number} x @param {number} y top-left @param {number} w square art width @returns {number} total height used */
  layout(x, y, w) {
    const h = C.hero, a = C.action;
    this._size = w;
    this.view.position.set(x, y);
    this._mask.clear().roundRect(0, 0, w, w, h.radiusPx).fill(0xffffff);
    this._bg.clear().roundRect(0, 0, w, w, h.radiusPx).fill(h.bg);
    if (this._factionBg.visible) fitCover(this._factionBg, w, w);
    if (this._image.visible) fitContain(this._image, w, w);
    let ny = w + h.gapPx;
    this._nameBarBg.clear().roundRect(0, ny, w, h.nameBarH, 6).fill({ color: 0x0a0a08, alpha: 0.75 });
    const barCy = ny + h.nameBarH * HALF;
    this._levelBg.clear();
    if (this._levelLabel.text) {
      const lw = this._levelLabel.width + h.levelPadPx * 2;
      this._levelBg.roundRect(6, barCy - h.levelPx * HALF - h.levelPadPx, lw, h.levelPx + h.levelPadPx * 2, h.levelRadiusPx)
        .fill({ color: h.levelBg, alpha: h.levelBgAlpha });
      this._levelLabel.position.set(6 + h.levelPadPx, barCy - h.levelPx * HALF);
      this._name.position.set(6 + lw + 6, barCy - h.namePx * HALF);
    } else {
      this._name.position.set(8, barCy - h.namePx * HALF);
    }
    ny += h.nameBarH + h.gapPx;
    this._meta.position.set(0, ny); ny += h.metaPx + h.gapPx;
    const alpha = this._actionMode === 'assign' && !this._actionEnabled ? a.assignDisabledAlpha : 1;
    const bg = this._actionMode === 'remove' ? a.removeBg : a.assignBg;
    this._actionBg.clear().roundRect(0, ny, w, a.heightPx, a.radiusPx).fill({ color: bg, alpha });
    this._actionLabel.style.fill = this._actionMode === 'remove' ? a.removeColor : a.assignColor;
    this._actionLabel.alpha = alpha;
    this._actionLabel.position.set(w * HALF, ny + a.heightPx * HALF);
    this._actionRect = { x, y: y + ny, w, h: a.heightPx };
    ny += a.heightPx;
    return ny;
  }

  /** @param {number} sx @param {number} sy @returns {boolean} the action button was tapped AND it's currently enabled */
  hitAction(sx, sy) {
    if (this._actionMode === 'assign' && !this._actionEnabled) return false;
    const r = this._actionRect;
    return sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h;
  }

  /** @private @param {{key:string,unit:object}} entry */
  _loadArt(entry) {
    const key = entry.key, cls = entry.unit.cls;
    loadFactionTextures().then((tex) => {
      if (this._destroyed || this._entryKey !== key || !tex[PLAYER_FACTION]) return;
      this._factionBg.texture = tex[PLAYER_FACTION]; this._factionBg.visible = true;
      if (this._size) fitCover(this._factionBg, this._size, this._size);
    });
    const heroUrl = UNIT_HERO_URL[key];
    const apply = (tex) => {
      if (this._destroyed || this._entryKey !== key) return;
      this._image.texture = tex; this._image.visible = true;
      if (this._size) fitContain(this._image, this._size, this._size);
    };
    if (heroUrl) { Assets.load(heroUrl).then(apply); return; }
    const unit3D = UNIT_3D[`${entry.unit.faction}:${cls}`];
    if (!unit3D) return;
    getUnitIconDataURL(unit3D).then((dataUrl) => Assets.load(dataUrl)).then(apply);
  }
}
