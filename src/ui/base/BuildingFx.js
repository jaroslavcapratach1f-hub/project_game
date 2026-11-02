/**
 * BuildingFx — the procedural FX layer for a BuildingSprite (GDD 24): a soft
 * additive glow that pulses with state, and rising smoke puffs from each
 * chimney anchor. Self-contained (no combat ParticleSystem), fixed pool, no
 * per-frame allocation once built.
 */
import { Container, Graphics } from 'pixi.js';
import { ANIM } from '../../config/BuildingArtConfig.js';

const TWO_PI = Math.PI * 2;
const PUFFS_PER_ANCHOR = 5;
const PUFF_R = 4;

export class BuildingFx {
  /** @param {object} art BuildingArtConfig entry */
  constructor(art) {
    this._art = art;
    this._root = new Container();
    this._glow = null;
    /** @private @type {{g:Graphics,ax:number,ay:number,t:number,life:number}[]} */ this._puffs = [];
    this._spawnAcc = 0;
    this._working = false;
    this._build();
  }

  /** @returns {Container} */
  get view() { return this._root; }

  /** @private */
  _build() {
    const f = this._art.fx || {};
    if (f.glow) {
      this._glow = new Graphics().circle(0, 0, f.glow.r).fill(f.glow.color);
      this._glow.position.set(f.glow.at[0], f.glow.at[1]);
      this._glow.alpha = ANIM.glowIdleAlpha;
      this._glow.blendMode = 'add';
      this._root.addChild(this._glow);
    }
    for (const a of (f.smoke || [])) {
      for (let i = 0; i < PUFFS_PER_ANCHOR; i++) {
        const g = new Graphics().circle(0, 0, PUFF_R).fill(ANIM.puffColor);
        g.visible = false;
        this._root.addChild(g);
        this._puffs.push({ g, ax: a[0], ay: a[1], t: 0, life: 0 });
      }
    }
  }

  /** @param {string} state BUILDING_STATE @returns {void} */
  setState(state) { this._working = state === 'working'; }

  /**
   * @param {number} dt seconds @param {number} phase running seconds (glow pulse)
   * @returns {void}
   */
  update(dt, phase) {
    if (this._glow) {
      const base = this._working ? ANIM.glowWorkAlpha : ANIM.glowIdleAlpha;
      const pulse = ANIM.glowPulseFloor + ANIM.glowPulseRange * Math.sin(phase * ANIM.glowPulseHz * TWO_PI);
      this._glow.alpha = base * pulse;
    }
    if (this._puffs.length === 0) return;
    this._spawnAcc += dt;
    const gap = this._working ? ANIM.puffGapWorkSec : ANIM.puffGapIdleSec;
    if (this._spawnAcc >= gap) { this._spawnAcc = 0; this._spawn(); }
    for (let i = 0; i < this._puffs.length; i++) {
      const p = this._puffs[i];
      if (p.life <= 0) continue;
      p.t += dt;
      const u = p.t / p.life;
      if (u >= 1) { p.life = 0; p.g.visible = false; continue; }
      p.g.position.set(p.ax + Math.sin(p.t * ANIM.puffDriftHz) * PUFF_R, p.ay - u * ANIM.puffRisePx);
      p.g.scale.set(ANIM.puffScaleFrom + u * ANIM.puffScaleGrow);
      p.g.alpha = (1 - u) * ANIM.puffAlphaPeak;
    }
  }

  /** @private wake the first free puff */
  _spawn() {
    for (let i = 0; i < this._puffs.length; i++) {
      const p = this._puffs[i];
      if (p.life <= 0) { p.t = 0; p.life = ANIM.puffLifeSec; p.g.visible = true; return; }
    }
  }

  /** @returns {void} */
  destroy() { this._root.destroy({ children: true }); }
}
