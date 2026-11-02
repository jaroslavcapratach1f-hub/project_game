/**
 * ProductionQueueStrip — the horizontal-scroll row of small WAITING-job
 * icons under the active job in `ProductionQueuePanel` (master-task
 * section 10: "player has to be able to click on any material in
 * production queue and remove it"). Tapping one removes exactly that
 * queued job. Scrollable because capacity is 10 — up to 9 waiting icons
 * at once would otherwise overflow into the Clear button next to it (a
 * real bug this replaced). Split out purely to keep
 * `ProductionQueuePanel.js` under the 150-line cap.
 */
import { Container, Graphics } from 'pixi.js';
import { PRODUCTION_SCREEN as S } from '../../config/ProductionScreenConfig.js';
import { MATERIAL_TIER_COLOR, MATERIALS } from '../../config/MaterialsConfig.js';
import { drawMaterialIcon } from './BuildingIconDraw.js';
import { ScrollDragX } from './ScrollDragX.js';

export class ProductionQueueStrip {
  /** @param {import('../../utils/EventEmitter.js').EventEmitter} events */
  constructor(events) {
    this.view = new Container();
    this._mask = new Graphics();
    this._content = new Container();
    this._content.mask = this._mask;
    this.view.addChild(this._mask, this._content);
    /** @private @type {{bg:Graphics,icon:Graphics,rect:{x:number,y:number,w:number,h:number}}[]} */ this._icons = [];
    this._jobs = [];
    this._rect = { x: 0, y: 0, w: 0, h: 0 };
    this._scroll = new ScrollDragX(events, () => this._rect, () => this._draw());
  }

  /** @returns {void} */ enable() { this._scroll.enable(); }
  /** @returns {void} */ disable() { this._scroll.disable(); }
  /** @returns {boolean} a scroll drag is in progress — Game suppresses camera-pan */ get isDragging() { return this._scroll.isDragging; }

  /** @param {{materialKey:string,active:boolean}[]} waitingJobs (active job excluded) @returns {void} */
  setJobs(waitingJobs) {
    this._jobs = waitingJobs;
    while (this._icons.length < waitingJobs.length) {
      const bg = new Graphics(), icon = new Graphics();
      this._content.addChild(bg, icon);
      this._icons.push({ bg, icon, rect: { x: 0, y: 0, w: 0, h: 0 } });
    }
    while (this._icons.length > waitingJobs.length) {
      const dead = this._icons.pop();
      dead.bg.destroy(); dead.icon.destroy();
    }
    this._draw();
  }

  /** @param {number} absX @param {number} absY @param {number} w @returns {void} */
  layout(absX, absY, w) {
    this._originX = absX; this._originY = absY;
    this._rect = { x: absX, y: absY, w, h: S.queue.waitIconR * 2 };
    this._mask.clear().rect(absX, absY, w, this._rect.h).fill(0xffffff);
    const q = S.queue, step = q.waitIconR * 2 + q.waitIconGapPx;
    this._scroll.setBounds(Math.min(0, w - (this._icons.length * step - q.waitIconGapPx)));
    this._draw();
  }

  /** @param {number} sx @param {number} sy ABSOLUTE @returns {number} the tapped waiting job's index, or -1 */
  hitTest(sx, sy) {
    for (let i = 0; i < this._icons.length; i++) {
      const r = this._icons[i].rect;
      if (sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h) return i;
    }
    return -1;
  }

  /** @private redraw every icon at its current scrolled slot + record its absolute hit rect */
  _draw() {
    if (this._originX === undefined) return;
    const q = S.queue, step = q.waitIconR * 2 + q.waitIconGapPx, scrollX = this._scroll.x;
    for (let i = 0; i < this._icons.length; i++) {
      const { bg, icon, rect } = this._icons[i];
      const cx = this._originX + i * step + q.waitIconR + scrollX, cy = this._originY + q.waitIconR;
      const visible = cx + q.waitIconR >= this._originX && cx - q.waitIconR <= this._originX + this._rect.w;
      bg.visible = icon.visible = visible;
      rect.x = cx - q.waitIconR; rect.y = cy - q.waitIconR; rect.w = q.waitIconR * 2; rect.h = q.waitIconR * 2;
      if (!visible) continue;
      bg.clear().circle(cx, cy, q.waitIconR).fill({ color: q.waitIconBg, alpha: 0.95 }).stroke({ color: 0xe4e5e6, width: 1, alpha: 0.3 });
      const tier = MATERIALS[this._jobs[i].materialKey]?.tier ?? 1;
      icon.clear();
      drawMaterialIcon(icon, cx, cy, q.waitIconR * 0.6, MATERIAL_TIER_COLOR[(tier - 1) % MATERIAL_TIER_COLOR.length]);
    }
  }
}
