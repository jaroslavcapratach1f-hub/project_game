/**
 * TopBarLeftCluster — TopBar's own top-LEFT corner group (S70 redesign): a
 * round player-avatar BUTTON (real tap affordance + a GSAP press-punch,
 * same tactile language `ui/controls/Button.js` already uses elsewhere) —
 * opens the full game menu/settings once that's built (`setAvatarTap`,
 * currently wired to a "coming soon" stub by `Hud.js`, same pattern as the
 * Gold "+" button). A real portrait photo (the player's own reference
 * image, background-removed) masked circular, with a live headquarters-
 * level badge on its own bottom rim — beside Power, now its own star+glass
 * badge (`PowerBadge.js`, the player's own reference image), the base's
 * own map coordinates, and — only while the base is damaged — a red
 * HP-warning line. No backing pill behind any of this any more (the
 * player's own explicit ask: "remove current glass section around player
 * avatar") — `PowerBadge` carries its own glass, the rest floats free.
 */
import { Assets, Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import gsap from 'gsap';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { drawAvatarIcon } from './TopBarIconDraw.js';
import { PowerBadge } from './PowerBadge.js';
import { LocationBadge } from './LocationBadge.js';
import avatarPortraitUrl from '../../../assets/ui/topbar/avatar_portrait.png';

const HALF = 0.5;
const PUNCH_MS = 0.12;

export class TopBarLeftCluster {
  constructor() {
    const t = WORLD_HUD.topBar, fam = WORLD_HUD.fontFamily;
    this.view = new Container();
    // Grouped so `pulse()` can scale the whole button as one unit around its
    // own centre — `layout()` keeps `pivot`/`position` equal (net zero
    // offset at scale 1), so every child below still just draws at the
    // same absolute (acx,cy) coordinates it always has.
    this._avatarGroup = new Container();
    this._avatarBg = new Graphics();
    this._avatarIcon = new Graphics(); // fallback silhouette, visible until the real photo finishes loading
    this._avatarMask = new Graphics();
    this._avatarPhoto = new Sprite();
    this._avatarPhoto.anchor.set(HALF);
    this._avatarPhoto.mask = this._avatarMask;
    this._avatarPhoto.visible = false;
    Assets.load(avatarPortraitUrl).then((tex) => { this._avatarPhoto.texture = tex; this._avatarPhoto.visible = true; this._avatarIcon.visible = false; });
    this._levelBg = new Graphics();
    this._levelText = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: t.levelBadge.textPx, fill: t.levelBadge.textColor, fontWeight: 'bold' }) });
    this._levelText.anchor.set(HALF);
    this._avatarGroup.addChild(this._avatarBg, this._avatarIcon, this._avatarMask, this._avatarPhoto, this._levelBg, this._levelText);
    this._powerBadge = new PowerBadge();
    this._locationBadge = new LocationBadge();
    this._warn = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: t.baseWarnPx, fill: t.baseWarnColor, fontWeight: 'bold' }) });
    this.view.addChild(this._avatarGroup, this._powerBadge.view, this._locationBadge.view, this._warn);
    this._avatarRect = { x: 0, y: 0, w: 0, h: 0 };
    this._level = 1;
  }

  /** @returns {void} GSAP press-punch on tap (the player's own ask: "make it... like a button") */
  pulse() {
    const s = WORLD_HUD.topBar.avatarPressScale;
    gsap.killTweensOf(this._avatarGroup.scale);
    gsap.timeline()
      .to(this._avatarGroup.scale, { x: s, y: s, duration: PUNCH_MS, ease: 'power2.out' })
      .to(this._avatarGroup.scale, { x: 1, y: 1, duration: PUNCH_MS, ease: 'back.out(3)' });
  }

  /** @param {number} total @returns {void} */
  setPower(total) { this._powerBadge.setValue(total); }
  /** @param {number} q @param {number} r @returns {void} */
  setCoord(q, r) { this._locationBadge.setCoord(q, r); }
  /** @param {number} level live headquarters level @returns {void} */
  setLevel(level) { this._level = level; this._levelText.text = `${Math.round(level)}`; }
  /** @param {number} frac @returns {void} */
  setBaseHp(frac) {
    const t = WORLD_HUD.topBar;
    this._warn.text = frac < 1 ? `${Math.round(frac * 100)}%` : '';
    this._warn.style.fill = frac < t.baseWarnFrac ? t.baseWarnColor : t.baseHpColor;
  }

  /** @param {number} topInsetPx @param {number} edgeX left edge x (screen px, after navEdgePad) @returns {number} this cluster's own footprint width — lets TopBar.js budget room for the right cluster beside it */
  layout(topInsetPx, edgeX) {
    const t = WORLD_HUD.topBar;
    const d = t.avatarRadiusPx * 2;
    const cy = topInsetPx + d * HALF;
    const acx = edgeX + t.avatarEdgeMarginPx + t.avatarRadiusPx; // a touch off the true screen edge
    this._avatarGroup.pivot.set(acx, cy);
    this._avatarGroup.position.set(acx, cy);
    this._avatarBg.clear().circle(acx, cy, t.avatarRadiusPx).fill({ color: t.avatarBg, alpha: t.avatarBgAlpha })
      .stroke({ color: t.avatarStroke, width: t.avatarStrokeWidthPx, alpha: t.avatarStrokeAlpha });
    this._avatarIcon.clear();
    drawAvatarIcon(this._avatarIcon, acx, cy, t.avatarRadiusPx * 0.72, t.avatarIconColor);
    this._avatarMask.clear().circle(acx, cy, t.avatarRadiusPx).fill(0xffffff);
    this._avatarPhoto.position.set(acx, cy);
    this._avatarPhoto.width = this._avatarPhoto.height = d;
    const ringY = cy + t.avatarRadiusPx;
    this._drawLevelBadge(acx, ringY);
    this._avatarRect = { x: edgeX + t.avatarEdgeMarginPx, y: topInsetPx, w: d, h: d };
    // Power, then Location, stacked CENTRED under the avatar (not beside
    // it any more — the player's own ask), each almost touching the one
    // above: `badgeGapPx` is already tiny, reused for both the level
    // badge -> Power gap and the Power -> Location gap. `layout(0,0)`
    // first just to read the badge's own current width (content-driven,
    // unknown until drawn) before centring it for real.
    const levelBottom = ringY + t.levelBadge.heightPx * HALF;
    const pw = this._powerBadge.layout(0, 0);
    const powerCy = levelBottom + t.badgeGapPx + pw.height * HALF;
    this._powerBadge.layout(acx - pw.width * HALF, powerCy);
    const lw = this._locationBadge.layout(0, 0);
    const locCy = powerCy + pw.height * HALF + t.badgeGapPx + lw.height * HALF;
    this._locationBadge.layout(acx - lw.width * HALF, locCy);
    const ty = locCy + lw.height * HALF + t.lineGapPx;
    this._warn.position.set(acx - this._warn.width * HALF, ty);
    return acx + Math.max(t.avatarRadiusPx, pw.width * HALF, lw.width * HALF) - edgeX;
  }

  /** @param {number} sx @param {number} sy @returns {boolean} tapped the avatar */
  hitTestAvatar(sx, sy) {
    const r = this._avatarRect, cx = r.x + r.w * HALF, cy = r.y + r.h * HALF, dx = sx - cx, dy = sy - cy;
    return dx * dx + dy * dy <= (r.w * HALF) * (r.w * HALF);
  }

  /** @private dark rounded tag overlapping the avatar's own bottom rim, sized to its live text @param {number} cx @param {number} ringY */
  _drawLevelBadge(cx, ringY) {
    const b = WORLD_HUD.topBar.levelBadge;
    this._levelText.text = `${Math.round(this._level)}`;
    const w = this._levelText.width + b.padXPx * 2;
    const x = cx - w * HALF, y = ringY - b.heightPx * HALF;
    this._levelBg.clear().roundRect(x, y, w, b.heightPx, b.radiusPx)
      .fill({ color: b.bg, alpha: b.bgAlpha }).stroke({ color: b.stroke, width: b.strokeWidthPx, alpha: b.strokeAlpha });
    this._levelText.position.set(cx, ringY);
  }
}
