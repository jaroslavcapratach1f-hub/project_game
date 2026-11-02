import { MENU_ICON as I } from '../../config/BuildingMenuConfig.js';
/**
 * ActionIconDraw — small vector icons for BuildingHexOption (Warpath
 * reference: GAME_DESIGN.md/Headquarter.jpeg's clean glyph-on-a-disc
 * buttons). Plain Unicode glyphs ("i", "↑") read as cheap placeholder text
 * at this size — these are hand-drawn PixiJS Graphics shapes instead, one
 * builder per action, all centred on (0,0) and sized off `BUILDING_MENU
 * .iconPx` so they scale with the rest of the menu. Pure builders, no state.
 */
const HALF = 0.5;

/** Proportions as a fraction of the icon's own half-size — pure shape data, not gameplay tuning. */
const UPGRADE = { headW: 0.85, headTopY: -0.75, headBaseY: -0.05, stemW: 0.34, stemBottomY: 0.48 };
const MANAGE_START_TURNS = -0.65, MANAGE_END_TURNS = 0.55; // fraction of a half-turn (PI rad)
const MANAGE = {
  ringR: 0.62, ringW: 0.2, startRad: MANAGE_START_TURNS * Math.PI, endRad: MANAGE_END_TURNS * Math.PI,
  headLen: 0.4, headHalfW: 0.28,
};

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color @returns {void} an "i" — dot + rounded bar */
export function drawInfoIcon(g, sizePx, color) {
  const s = sizePx * HALF;
  g.rect(...I.infoDot.map((v) => v * s)).fill(color);
  g.poly(I.infoBody.map((v) => v * s)).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color @returns {void} an upward arrow — chevron head + stem */
export function drawUpgradeIcon(g, sizePx, color) {
  const s = sizePx * HALF, u = UPGRADE;
  g.rect(-s * u.stemW, s * I.upgradeBaseY, s * u.stemW * 2, s * I.upgradeBaseHeight).fill(color);
  const headTopY = s * u.headTopY, headBaseY = s * u.headBaseY;
  const headW = s * u.headW, stemW = s * u.stemW, stemBottomY = s * u.stemBottomY;
  g.poly([0, headTopY, headW, headBaseY, stemW, headBaseY, stemW, stemBottomY,
    -stemW, stemBottomY, -stemW, headBaseY, -headW, headBaseY]).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color @returns {void} a cycle arrow — ring + arrowhead */
export function drawManageIcon(g, sizePx, color) {
  const s = sizePx * HALF, m = MANAGE;
  const r = s * m.ringR, w = s * m.ringW;
  g.arc(0, 0, r + w * HALF, m.startRad, m.endRad).arc(0, 0, r - w * HALF, m.endRad, m.startRad, true).fill(color);
  const nx = Math.cos(m.endRad), ny = Math.sin(m.endRad); // outward normal at the ring's open end
  const ax = -ny, ay = nx; // tangent direction, for the arrowhead's base width
  const hx = r * nx, hy = r * ny;
  const headLen = s * m.headLen, headHalfW = s * m.headHalfW;
  g.poly([
    hx + nx * headLen, hy + ny * headLen,
    hx - ax * headHalfW, hy - ay * headHalfW,
    hx + ax * headHalfW, hy + ay * headHalfW,
  ]).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color binoculars */
export function drawViewIcon(g, sizePx, color) {
  const s = sizePx * HALF, b = I.binoculars;
  for (const side of [-1, 1]) {
    const x = side * s * b.offset;
    g.roundRect(x - s * b.halfWidth, s * b.top, s * b.width, s * b.height, s * b.radius).fill(color);
    g.circle(x, s * b.lensY, s * b.lensRadius).fill(color);
    g.circle(x, s * b.lensY, s * b.halfWidth).stroke({ color: b.rimColor, width: s * b.rimWidth });
  }
  g.rect(...b.bridge.map((v) => v * s)).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color factory — sawtooth roof + chimney */
export function drawProduceIcon(g, sizePx, color) {
  const s = sizePx * HALF, f = I.factory;
  g.poly(f.roof.map((v) => v * s)).fill(color);
  g.rect(f.bodyX * s, f.bodyY * s, f.bodyW * s, f.bodyH * s).fill(color);
  g.rect(f.chimneyX * s, f.chimneyY * s, f.chimneyW * s, f.chimneyH * s).fill(color);
}

/** @param {import('pixi.js').Graphics} g @param {number} sizePx @param {number} color flask — narrow neck + rim cap widening into a body, one bubble */
export function drawResearchIcon(g, sizePx, color) {
  const s = sizePx * HALF, f = I.flask;
  g.rect(-s * f.rimHalfW, s * f.neckTopY - s * f.rimH, s * f.rimHalfW * 2, s * f.rimH).fill(color);
  g.poly([
    -s * f.neckHalfW, s * f.neckTopY, s * f.neckHalfW, s * f.neckTopY,
    s * f.neckHalfW, s * f.neckBottomY, s * f.bodyHalfW, s * f.bodyBottomY,
    -s * f.bodyHalfW, s * f.bodyBottomY, -s * f.neckHalfW, s * f.neckBottomY,
  ]).stroke({ color, width: s * 0.12 });
  g.circle(s * f.bubbleX, s * f.bubbleY, s * f.bubbleR).fill(color);
}

/** @type {Record<string,(g:import('pixi.js').Graphics, sizePx:number, color:number)=>void>} */
export const ACTION_ICON_DRAW = { info: drawInfoIcon, upgrade: drawUpgradeIcon, manage: drawManageIcon, view: drawViewIcon, produce: drawProduceIcon, research: drawResearchIcon };
