/** Detailed GLB revetments follow the same open channel and entrance cuts. */
import { trenchOffset } from './DefenceTrenches.js';
import { DEFENCE_TRENCH as T } from '../config/DefencePerimeterConfig.js';

const HALF = 0.5;

/** @param {object} layout @returns {object[]} rounded earth, timber courses, stakes and coping */
export function trenchBankPlacements(layout) {
  const placements = [];
  for (const s of layout.segments) {
    const point = (offset, t) => t === 0 || t === 1 ? trenchOffset(layout.path, s.index + t, offset)
      : { cx: s.a.cx + s.dx * s.len * t + s.dy * offset, cy: s.a.cy + s.dy * s.len * t - s.dx * offset };
    const entry = layout.entries.find(e => e.segment === s.index);
    for (const sign of [-1, 1]) {
      const ranges = sign < 0 && entry ? [[0, (entry.distance - T.entryWidth / 2) / s.len],
        [(entry.distance + T.entryWidth / 2) / s.len, 1]] : [[0, 1]];
      for (const [a, b] of ranges) addBank(placements, point(sign * T.halfWidth, a), point(sign * T.halfWidth, b), sign);
    }
    if (entry) addEntry(placements, s, entry);
  }
  // Close the two gate-side trench ends with the same rounded retaining bank.
  for (const [index, sign] of [[0, 1], [layout.path.length - 1, -1]]) {
    const a = trenchOffset(layout.path, index, -T.halfWidth);
    const b = trenchOffset(layout.path, index, T.halfWidth);
    addBank(placements, a, b, sign);
  }
  return placements;
}

function addBank(placements, a, b, sign, taper = false) {
  const dx = b.cx - a.cx, dy = b.cy - a.cy, len = Math.hypot(dx, dy), count = Math.ceil(len / T.bankSection);
  for (let i = 0; i < count; i++) {
    const t = (i + HALF) / count;
    placements.push({ asset: 'trench_revetment', cx: a.cx + dx * t, cy: a.cy + dy * t,
      rotation: -Math.atan2(dy, dx) + (sign > 0 ? Math.PI : 0), sx: len / count / T.bankSection,
      sy: taper ? Math.max(T.entryEndScale, 1 - t) : 1 });
  }
}

function addEntry(placements, s, entry) {
  const middle = { cx: s.a.cx + s.dx * entry.distance, cy: s.a.cy + s.dy * entry.distance };
  for (const sign of [-1, 1]) {
    const a = { cx: middle.cx + s.dx * sign * T.entryWidth / 2 - s.dy * T.halfWidth,
      cy: middle.cy + s.dy * sign * T.entryWidth / 2 + s.dx * T.halfWidth };
    const b = { cx: a.cx - s.dy * T.entryLength, cy: a.cy + s.dx * T.entryLength };
    addBank(placements, a, b, sign, true);
  }
}
