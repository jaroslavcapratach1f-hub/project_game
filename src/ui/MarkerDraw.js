/**
 * MarkerDraw — the "fort" icon a neighbour base shows on the world map
 * (PlotMarker; the player's own base uses the real HQ art — see
 * worldmap/HqView.js). A stylised PLACEHOLDER, not final art: a low
 * isometric earth plate (a squashed flat-top hexagon — keeps the hex identity
 * but reads as a footprint seen at an angle), a raised perimeter wall with
 * visible faces + a gate gap, corner towers, a central keep and two outbuildings
 * — each raised element faked with a shadow face + a lit top face. Sizes come
 * from a WORLDMAP.plot spec. OrderDraw / MinimapDraw pattern; no state.
 */
import { HEX_CORNER_UNITS } from '../utils/Hex.js';

const SIX = 6;
const HALF = 0.5;
const POLY_LEN = 12;
const RIM_W = 3;
const BLOCK_R = 5;
const SHADOW_GROW = 1.04;
const SHADOW_DROP = 0.34;
const FRONT_EDGES = [0, 1, 2]; // the 3 viewer-facing hex edges (corner e -> e+1)
const GATE_EDGE = 1;           // middle front edge carries the gate gap
const TOWER_SHADOW_RX_FRAC = 1.1; // fraction of bodyHalfPx
const TOWER_SHADOW_RY_FRAC = 0.32;
const TOWER_WINDOW_FRAC = 0.5;    // lookout-slit width, as a fraction of bodyHalfPx

/** squashed flat-top hexagon outline into `out` (12 nums) */
function squashHex(cx, cy, r, squash, out) {
  for (let i = 0; i < SIX; i++) {
    out[i * 2] = cx + HEX_CORNER_UNITS[i * 2] * r;
    out[i * 2 + 1] = cy + HEX_CORNER_UNITS[i * 2 + 1] * r * squash;
  }
  return out;
}

/** a raised block: shadow face at base, lit top face `lift` px higher */
function raisedBlock(g, b) {
  const x = b.cx - b.w * HALF;
  g.roundRect(x, b.cy - b.h * HALF, b.w, b.h, BLOCK_R).fill(b.side);
  g.roundRect(x, b.cy - b.h * HALF - b.lift, b.w, b.h, BLOCK_R).fill(b.top);
}

/** fill the wall's vertical face between rings `lo`/`hi` along hex edge `e`, span [t0,t1] */
function wallFace(g, rings, e, span, color) {
  const i = e * 2;
  const j = ((e + 1) % SIX) * 2;
  const at = (ring, k, t) => ring[i + k] + (ring[j + k] - ring[i + k]) * t;
  const { lo, hi } = rings;
  g.poly([
    at(lo, 0, span[0]), at(lo, 1, span[0]), at(lo, 0, span[1]), at(lo, 1, span[1]),
    at(hi, 0, span[1]), at(hi, 1, span[1]), at(hi, 0, span[0]), at(hi, 1, span[0]),
  ]).fill(color);
}

/**
 * @param {import('pixi.js').Graphics} g cleared + redrawn
 * @param {object} o spec — see WORLDMAP.marker / .plot
 * @returns {void}
 */
export function buildCompoundIcon(g, o) {
  const r = o.sizePx;
  const s = o.isoSquash;
  const wallR = r - o.wallWidthPx * HALF;
  const rings = { lo: new Array(POLY_LEN), hi: new Array(POLY_LEN) };
  squashHex(0, 0, wallR, s, rings.lo);
  squashHex(0, -o.wallHeightPx, wallR, s, rings.hi);
  const plate = new Array(POLY_LEN);
  g.clear()
    .poly(squashHex(o.shadowOffsetPx, o.shadowOffsetPx + r * s * SHADOW_DROP, r * SHADOW_GROW, s, plate))
    .fill({ color: o.shadow, alpha: o.shadowAlpha })
    .poly(squashHex(0, 0, r, s, plate)).fill(o.ground).stroke({ color: o.rim, width: RIM_W });
  const t = (1 - o.gateFrac) * HALF;
  for (const e of FRONT_EDGES) {
    if (e === GATE_EDGE) { wallFace(g, rings, e, [0, t], o.wallShade); wallFace(g, rings, e, [1 - t, 1], o.wallShade); }
    else wallFace(g, rings, e, [0, 1], o.wallShade);
  }
  g.poly(rings.hi).stroke({ color: o.wall, width: o.wallWidthPx });
  for (let k = 0; k < SIX; k++) {
    raisedBlock(g, {
      cx: HEX_CORNER_UNITS[k * 2] * wallR, cy: HEX_CORNER_UNITS[k * 2 + 1] * wallR * s,
      w: o.towerW, h: o.towerW * s, lift: o.towerHeightPx, side: o.towerSide, top: o.towerTop,
    });
  }
  for (const dx of [-o.bldDX, o.bldDX]) {
    raisedBlock(g, { cx: dx, cy: o.bldDY, w: o.bldW, h: o.bldW * s, lift: o.bldHeightPx, side: o.bldSide, top: o.bldTop });
  }
  raisedBlock(g, { cx: 0, cy: 0, w: o.keepW, h: o.keepH * s, lift: o.keepHeightPx, side: o.keepSide, top: o.keepTop });
}

/**
 * The zoomed-out stand-in for `buildCompoundIcon` (S57 — WORLDMAP.pin,
 * S58 restyled to a crenellated castle/rook-style tower — the user's own
 * "chess tower" call, after a first peaked-roof watchtower pass read as
 * generic/disappointing). A square trunk planted at the base's true world
 * point (local 0,0), a jutting battlement deck, `merlonCount` raised teeth
 * across its top edge, and a dark lookout-slit window — the same
 * flat-shaded solid-block language `buildCompoundIcon`'s own `raisedBlock`
 * uses, mostly right angles so it stays crisp at the tiny sizes this
 * renders at fully zoomed out (a rook's silhouette reads instantly even
 * small, unlike the previous tapered/peaked shape). `o.color` is the
 * resolved alliance-state colour (WORLDMAP.pin.colors) — see
 * BasePinIcon.js, the only caller.
 * @param {import('pixi.js').Graphics} g cleared + redrawn
 * @param {object} o spec — WORLDMAP.pin + a resolved `color`
 * @returns {void}
 */
export function buildTowerIcon(g, o) {
  const bh = o.bodyHalfPx;
  const bodyTopY = -o.bodyHeightPx;
  const deckTopY = bodyTopY - o.deckThicknessPx;
  const winW = bh * TOWER_WINDOW_FRAC;
  const winCy = bodyTopY * HALF;
  g.clear()
    .ellipse(0, 0, bh * TOWER_SHADOW_RX_FRAC, bh * TOWER_SHADOW_RY_FRAC).fill({ color: o.shadow, alpha: o.shadowAlpha })
    .rect(-bh, bodyTopY, bh * 2, o.bodyHeightPx)
    .fill(o.color).stroke({ color: o.outlineColor, width: o.outlineWidthPx })
    .rect(-o.deckHalfPx, deckTopY, o.deckHalfPx * 2, o.deckThicknessPx)
    .fill(o.color).stroke({ color: o.outlineColor, width: o.outlineWidthPx })
    .rect(-winW * HALF, winCy - winW * HALF, winW, winW).fill(o.outlineColor);
  const n = o.merlonCount;
  const merlonW = (o.deckHalfPx * 2 - (n - 1) * o.merlonGapPx) / n;
  let x = -o.deckHalfPx;
  for (let i = 0; i < n; i++) {
    g.rect(x, deckTopY - o.merlonHeightPx, merlonW, o.merlonHeightPx)
      .fill(o.color).stroke({ color: o.outlineColor, width: o.outlineWidthPx });
    x += merlonW + o.merlonGapPx;
  }
}
