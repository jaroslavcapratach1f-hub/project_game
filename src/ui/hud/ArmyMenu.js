/**
 * ArmyMenu — the ARMY nav-tab's own pop-up panel (the player's own explicit
 * structure): anchored to the nav menu's own right edge at the SAME width,
 * running from just under the TopBar down to the top of NavBar, "like an
 * extension of the menu". 5 sections, one per Military Barracks slot
 * (`BUILDINGS.barracks.unique`) — see `ArmyBarrackRow.js` for what each
 * section actually shows (locked vs built, officer slots, the TRAIN
 * button). Training is instant and only moves `barracksTroops.js`'s own
 * counter — no production pipeline exists yet (GDD 04 / DynamicBarracks.js).
 * Screen-space on LAYERS.OVERLAY so it draws over SquadBar.
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { EVENTS } from '../../engine/GameEvents.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { ARMY_MENU, armyShellRect } from '../../config/ArmyMenuConfig.js';
import { slotState, trainAt, freeOneSlot } from '../../worldmap/barracksRoster.js';
import { ArmyBarrackRow } from './ArmyBarrackRow.js';

const HALF = 0.5;
const PLAYER_TEAM = 'player';

export class ArmyMenu {
  /**
   * @param {import('../../engine/Renderer.js').Renderer} renderer
   * @param {import('../../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../../worldmap/BaseSite.js').BaseSite} site base buildings + personnel pool
   */
  constructor(renderer, events, site) {
    this._renderer = renderer;
    this._events = events;
    this._site = site;
    this._open = false;
    this._rect = { x: 0, y: 0, w: 0, h: 0 };
    /** @private @type {?{x:number,y:number,w:number,h:number}} NavBar's own rect, kept so `refresh()` can repaint without Hud re-driving layout */
    this._navRect = null;
    this._root = new Container();
    this._root.visible = false;
    this._bg = new Graphics();
    this._title = null;
    /** @private @type {ArmyBarrackRow[]} */
    this._rows = [];
    this._onDied = (e) => this._onEntityDied(e);
  }

  /** @returns {boolean} */ get isOpen() { return this._open; }

  /** @returns {void} */
  enable() {
    const m = ARMY_MENU;
    this._title = new Text({ text: m.titleLabel, style: new TextStyle({ fontFamily: WORLD_HUD.fontFamily, fontSize: m.titlePx, fill: WORLD_HUD.accentColor, fontWeight: 'bold' }) });
    this._title.anchor.set(0, HALF);
    this._root.addChild(this._bg, this._title);
    for (let i = 0; i < m.barrackSlots; i++) {
      const row = new ArmyBarrackRow(i + 1);
      this._rows.push(row);
      this._root.addChild(row.view);
    }
    this._renderer.layer('OVERLAY').addChild(this._root);
    this._events.on(EVENTS.ENTITY_DIED, this._onDied);
  }

  /** @returns {void} */
  disable() {
    this._events.off(EVENTS.ENTITY_DIED, this._onDied);
    for (const row of this._rows) row.markDestroyed();
    this._root.parent?.removeChild(this._root);
    this._root.destroy({ children: true });
  }

  /** @returns {void} */
  open() { this._open = true; this._root.visible = true; this.refresh(); }
  /** @returns {void} */
  close() { this._open = false; this._root.visible = false; }

  /**
   * @param {{x:number,y:number,w:number,h:number}} navBarRect NavBar's own bar area — the panel matches its x/width
   * @returns {void}
   */
  layout(navBarRect) {
    const m = ARMY_MENU;
    this._navRect = navBarRect;
    const { rect, rowH, listY } = armyShellRect(navBarRect, this._rows.length);
    this._rect = rect;
    this._bg.clear().roundRect(rect.x, rect.y, rect.w, rect.h, m.radiusPx)
      .fill({ color: m.bg, alpha: m.bgAlpha })
      .stroke({ color: m.stroke, width: m.strokeWidthPx, alpha: m.strokeAlpha });
    this._title.position.set(rect.x + m.padPx, rect.y + m.padPx + m.titleHeightPx * HALF);
    const rowW = rect.w - m.padPx * 2;
    for (let i = 0; i < this._rows.length; i++) {
      this._rows[i].layout({ x: rect.x + m.padPx, y: listY + i * (rowH + m.rowGapPx), w: rowW, h: rowH });
    }
  }

  /** @returns {void} re-read the live barracks list + personnel pool into every row, then repaint */
  refresh() {
    for (let i = 0; i < this._rows.length; i++) this._rows[i].setState(slotState(this._site, i));
    if (this._navRect) this.layout(this._navRect); // a row's TRAIN button may have just appeared/vanished
  }

  /** @param {number} sx @param {number} sy @returns {boolean} the panel owns this point */
  hitTest(sx, sy) {
    const r = this._rect;
    return this._open && sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h;
  }

  /** @param {number} sx @param {number} sy @returns {void} route a tap — only TRAIN does anything yet */
  handleTap(sx, sy) {
    for (let i = 0; i < this._rows.length; i++) {
      if (this._rows[i].hitTrain(sx, sy)) return void this._train(i);
    }
  }

  /** @private spend personnel and fill one free troop slot @param {number} i barracks index */
  _train(i) {
    if (trainAt(this._site, i)) this.refresh();
  }

  /** @private a player unit died — free a barracks slot so its TRAIN button appears @param {{team:string}} e */
  _onEntityDied(e) {
    if (e?.team !== PLAYER_TEAM) return;
    if (freeOneSlot(this._site) && this._open) this.refresh();
  }
}
