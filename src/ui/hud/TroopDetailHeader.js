/**
 * TroopDetailHeader — the docked bar above `TroopDetailScreen`'s hero
 * image: a back button + the unit's display name, same header convention
 * `UnitsMenu` itself uses (back + bold title, `headerPx` tall, a hairline
 * rule below it) — pulled out to keep `TroopDetailScreen` under the
 * 150-line cap. Pure view + layout + hit-test.
 */
import { TROOP_MENU as T } from '../../config/TroopMenuTheme.js';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { BackButton } from './BackButton.js';

const HALF = 0.5;

export class TroopDetailHeader {
  constructor() {
    this.view = new Container();
    this.back = new BackButton();
    this._line = new Graphics();
    const fam = WORLD_HUD.fontFamily, m = WORLD_HUD.troopDetail;
    this._name = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: m.namePx, fill: WORLD_HUD.accentColor, fontWeight: 'bold' }) });
    this._name.anchor.set(0, HALF);
    this._kicker = new Text({ text: 'UNIT DOSSIER', style: new TextStyle({ fontFamily: fam, fontSize: T.kickerPx, fill: T.brass, letterSpacing: 2 }) });
    this.view.addChild(this._kicker, this._line, this.back.bg, this.back.icon, this._name);
  }

  /** @param {string} text @returns {void} */
  setName(text) { this._name.text = text; }

  /** @param {number} w full screen width @param {number} sidePad left inset @returns {void} */
  layout(w, sidePad) {
    const m = WORLD_HUD.troopDetail, u = WORLD_HUD.unitsMenu;
    this._line.clear().rect(0, m.headerPx, w, 1).fill({ color: WORLD_HUD.panel.cardStroke, alpha: 0.5 });
    this.back.layout(sidePad, (m.headerPx - u.backSizePx) * HALF);
    this._name.position.set(sidePad + u.backSizePx + u.titleGapPx, T.titleY + T.inset);
    this._kicker.position.set(sidePad + u.backSizePx + u.titleGapPx, T.kickerY);
    this._name.scale.set(1);
    this._name.scale.set(Math.min(1, (w - sidePad * 2 - u.backSizePx - u.titleGapPx) / this._name.width));
  }

  /** @param {number} sx @param {number} sy @returns {boolean} */
  hit(sx, sy) { return this.back.hit(sx, sy); }
}
