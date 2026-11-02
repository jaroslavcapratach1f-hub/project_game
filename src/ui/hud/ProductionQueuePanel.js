/**
 * ProductionQueuePanel — the Factory's active (crafting) job: icon +
 * progress bar + remaining time, the `ProductionQueueStrip` of waiting
 * jobs underneath, a Clear button (drop the whole queue), and the total
 * queue time + Rush (force-finish the active job now — no Gold/cost model
 * exists yet, so this is a free placeholder until a real one is specified).
 */
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { PRODUCTION_SCREEN as S } from '../../config/ProductionScreenConfig.js';
import { MATERIAL_TIER_COLOR, MATERIALS } from '../../config/MaterialsConfig.js';
import { drawMaterialIcon } from './BuildingIconDraw.js';
import { ProductionQueueStrip } from './ProductionQueueStrip.js';

const HALF = 0.5;

/** @param {number} ms @returns {string} "3h 50min" / "6min 28s" / "12s" */
export function fmtDuration(ms) {
  const totalSec = Math.ceil(ms / 1000);
  const h = Math.floor(totalSec / 3600), m = Math.floor((totalSec % 3600) / 60), s = totalSec % 60;
  if (h > 0) return `${h}h ${m}min`;
  if (m > 0) return `${m}min ${s}s`;
  return `${s}s`;
}

export class ProductionQueuePanel {
  /** @param {import('../../utils/EventEmitter.js').EventEmitter} events */
  constructor(events) {
    this.view = new Container();
    this._bg = new Graphics();
    const fam = WORLD_HUD.fontFamily, q = S.queue;
    this._queueLabel = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: q.queueLabelPx, fontWeight: 'bold' }) });
    this._activeBg = new Graphics(); this._activeIcon = new Graphics();
    this._timeLabel = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: q.timePx, fill: q.timeColor }) });
    this._timeLabel.anchor.set(HALF, 0);
    this._strip = new ProductionQueueStrip(events);
    this._clearBg = new Graphics();
    this._clearLabel = new Text({ text: 'CLEAR', style: new TextStyle({ fontFamily: fam, fontSize: q.clearLabelPx, fill: q.clearLabelColor, fontWeight: 'bold' }) });
    this._clearLabel.anchor.set(HALF);
    this._footerTime = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: q.timePx, fill: q.timeColor }) });
    this._footerTime.anchor.set(0, HALF);
    this._rushBg = new Graphics();
    this._rushLabel = new Text({ text: q.rushLabel, style: new TextStyle({ fontFamily: fam, fontSize: q.rushLabelPx, fill: WORLD_HUD.accentColor, fontWeight: 'bold' }) });
    this._rushLabel.anchor.set(HALF);
    this.view.addChild(this._bg, this._queueLabel, this._activeBg, this._activeIcon, this._timeLabel,
      this._strip.view, this._clearBg, this._clearLabel, this._footerTime, this._rushBg, this._rushLabel);
    this._clearRect = { x: 0, y: 0, w: 0, h: 0 }; this._rushRect = { x: 0, y: 0, w: 0, h: 0 };
  }

  /** @returns {void} */ enable() { this._strip.enable(); }
  /** @returns {void} */ disable() { this._strip.disable(); }
  /** @returns {boolean} a scroll drag is in progress — Game suppresses camera-pan */ get isDragging() { return this._strip.isDragging; }

  /** @param {{materialKey:string,active:boolean,remainingMs:number,progress:number}[]} jobs @param {number} capacity @returns {void} */
  setJobs(jobs, capacity) {
    this._jobs = jobs; this._capacity = capacity;
    this._active = jobs.find((j) => j.active) ?? null;
    this._strip.setJobs(jobs.filter((j) => !j.active));
    this._queueLabel.text = `Queue: ${jobs.length}/${capacity}`;
    this._queueLabel.style.fill = jobs.length >= capacity ? S.queue.queueFullColor : S.queue.queueLabelColor;
    const total = jobs.reduce((ms, j) => ms + j.remainingMs, 0);
    this._footerTime.text = jobs.length ? fmtDuration(total) : '';
    this._drawActive();
  }

  /** @param {number} absX @param {number} absY top-left @param {number} w @returns {void} */
  layout(absX, absY, w) {
    this._x = absX; this._y = absY; this._w = w;
    const q = S.queue;
    this._bg.clear().roundRect(absX, absY, w, q.heightPx, q.radiusPx).fill({ color: q.bg, alpha: q.bgAlpha }).stroke({ color: q.stroke, width: 1, alpha: q.strokeAlpha });
    this._queueLabel.position.set(absX + 10, absY + 8);
    this._activeCx = absX + w * HALF; this._activeCy = absY + 36 + q.activeIconR;
    this._timeLabel.position.set(this._activeCx, this._activeCy + q.activeIconR + 8);
    const cx = absX + w - 10 - q.clearW, cy = absY + q.rowY;
    this._strip.layout(absX + 10, cy, cx - (absX + 10) - 8); // stop short of the Clear button — the strip scrolls instead of overflowing into it
    this._clearRect = { x: cx, y: cy, w: q.clearW, h: q.clearH };
    this._clearBg.clear().roundRect(cx, cy, q.clearW, q.clearH, q.clearRadiusPx).fill({ color: q.clearBg, alpha: 0.9 }).stroke({ color: q.clearStroke, width: 1 });
    this._clearLabel.position.set(cx + q.clearW * HALF, cy + q.clearH * HALF);
    this._footerTime.position.set(absX + 10, absY + q.footerY + q.rushH * HALF);
    const rx = absX + w - 10 - q.rushW, ry = absY + q.footerY;
    this._rushRect = { x: rx, y: ry, w: q.rushW, h: q.rushH };
    this._rushLabel.position.set(rx + q.rushW * HALF, ry + q.rushH * HALF);
    this._drawActive(); this._drawRush();
  }

  /** @param {number} sx @param {number} sy @returns {'clear'|'rush'|number|null} a strip index (number), or an action key, or null */
  hitTest(sx, sy) {
    const strip = this._strip.hitTest(sx, sy);
    if (strip >= 0) return strip;
    if (within(this._clearRect, sx, sy)) return 'clear';
    if (this._canRush && within(this._rushRect, sx, sy)) return 'rush';
    return null;
  }

  /**
   * @private The active job's tile fills from the BOTTOM up as it
   * progresses (a clipped green rect behind the icon, not a separate bar —
   * matches the player's own reference exactly) rather than a bar below it.
   */
  _drawActive() {
    if (this._activeCx === undefined) return;
    const q = S.queue, s = q.activeIconR * 2;
    const x = this._activeCx - q.activeIconR, y = this._activeCy - q.activeIconR;
    this._activeBg.clear().roundRect(x, y, s, s, q.activeIconRadiusPx).fill({ color: q.activeIconBg, alpha: 0.95 });
    if (this._active) {
      const fillH = s * this._active.progress;
      this._activeBg.rect(x, y + s - fillH, s, fillH).fill({ color: q.barFill, alpha: 0.55 });
    }
    this._activeIcon.clear();
    if (this._active) {
      const tier = MATERIALS[this._active.materialKey]?.tier ?? 1;
      drawMaterialIcon(this._activeIcon, this._activeCx, this._activeCy, q.activeIconR * 0.6, MATERIAL_TIER_COLOR[(tier - 1) % MATERIAL_TIER_COLOR.length]);
    }
    this._timeLabel.text = this._active ? fmtDuration(this._active.remainingMs) : '';
    this._canRush = Boolean(this._active);
  }

  /** @private */
  _drawRush() {
    const q = S.queue;
    this._rushBg.clear().roundRect(this._rushRect.x, this._rushRect.y, q.rushW, q.rushH, q.rushRadiusPx)
      .fill({ color: q.rushBg, alpha: this._canRush ? 1 : q.rushDisabledAlpha }).stroke({ color: q.rushStroke, width: 1, alpha: this._canRush ? 1 : q.rushDisabledAlpha });
    this._rushLabel.alpha = this._canRush ? 1 : q.rushDisabledAlpha;
  }
}

/** @param {{x:number,y:number,w:number,h:number}} r @param {number} sx @param {number} sy @returns {boolean} */
function within(r, sx, sy) { return sx >= r.x && sx <= r.x + r.w && sy >= r.y && sy <= r.y + r.h; }
