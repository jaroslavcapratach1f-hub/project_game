/**
 * TroopHeroImage — `TroopDetailScreen`'s big picture: the troop's own art
 * (contain-fit, never cropped) over a light "studio" backdrop (3 flat
 * horizontal bands, lightest at top) — the reference screenshot's own
 * catalog-photo look, deliberately different from the grid card's dark
 * cinematic faction photo. Owns its own loading (`load(entry)` — the hero
 * cutout URL if one exists, `UnitHeroConfig.js`, else the live 3D snapshot
 * `UnitCard` also falls back to) so `TroopDetailScreen` doesn't have to; a
 * generation token guards a late-resolving load from a previous troop
 * overwriting a newer one.
 */
import { drawTroopSurface } from './TroopMenuDraw.js';
import { Assets, Container, Graphics, Sprite } from 'pixi.js';
import { UNIT_HERO_URL } from '../../config/UnitHeroConfig.js';
import { UNIT_3D } from '../../config/Unit3DConfig.js';
import { getUnitIconDataURL } from '../../entities/UnitIconRenderer.js';
import { fitContain } from '../ScreenDraw.js';

export class TroopHeroImage {
  constructor() {
    this.view = new Container();
    this._mask = new Graphics();
    this._bg = new Graphics();
    this._image = new Sprite();
    this._image.mask = this._mask;
    this._image.visible = false;
    this.view.addChild(this._mask, this._bg, this._image);
    this._w = 0; this._h = 0;
    this._token = null;
  }

  /** @param {{key:string,unit:object}} entry @returns {void} start loading this troop's art */
  load(entry) {
    this._token = entry;
    this._image.visible = false;
    const heroUrl = UNIT_HERO_URL[entry.key];
    if (heroUrl) { Assets.load(heroUrl).then((tex) => { if (this._token === entry) this.setImage(tex); }); return; }
    const unit3D = UNIT_3D[`${entry.unit.faction}:${entry.unit.cls}`];
    if (!unit3D) return;
    getUnitIconDataURL(unit3D).then((dataUrl) => Assets.load(dataUrl))
      .then((tex) => { if (this._token === entry) this.setImage(tex); });
  }

  /** @param {number} w @param {number} h @returns {void} */
  resize(w, h) {
    this._w = w; this._h = h;
    this._mask.clear().rect(0, 0, w, h).fill(0xffffff);
    drawTroopSurface(this._bg, w, h, true);
    if (this._image.visible) fitContain(this._image, w, h);
  }

  /** @param {import('pixi.js').Texture} tex the troop's own hero cutout or 3D snapshot @returns {void} */
  setImage(tex) {
    this._image.texture = tex;
    this._image.visible = true;
    if (this._w) fitContain(this._image, this._w, this._h);
  }
}
