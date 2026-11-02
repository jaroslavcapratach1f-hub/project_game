/**
 * Particle — a plain-data record for ONE pooled particle. NO PixiJS: the paired
 * Graphics lives in ParticleSystem. `particleStep.js` integrates and draws it.
 * All fields are pre-declared so a pooled instance never grows a new shape.
 */
const WHITE = 0xffffff;

export class Particle {
  constructor() {
    this.reset();
  }

  /** Zero every field back to an inert disc. @returns {void} */
  reset() {
    this.active = false;
    this.x = 0; this.y = 0;
    this.vx = 0; this.vy = 0;
    this.ax = 0; this.ay = 0;
    this.windX = 0; this.gravityY = 0;
    this.life = 0; this.maxLife = 1;
    this.radius = 0; this.radiusStart = 0; this.radiusEnd = 0;
    this.alpha = 1; this.alphaStart = 1; this.alphaEnd = 0;
    this.color = WHITE; this.colorStart = WHITE; this.colorEnd = WHITE;
    this.rotation = 0; this.rotationSpeed = 0;
    this.drawMode = 'disc'; // 'disc' | 'ring'
    this.ringWidthPx = 1;
    this.blend = 'normal'; // 'normal' | 'add'
    this.ease = null; // ?string key into particleStep's EASE map
  }
}
