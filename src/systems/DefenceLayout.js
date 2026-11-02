/** Versioned visual perimeter state; the existing whole-base collision remains authoritative. */
import { defenceCorners } from './DefenceFootprint.js';
import { defenceKey, defenceMask, resolveDefence } from './DefenceConnectivity.js';
const VERSION = 1;

export class DefenceLayout {
  /** @param {number} [level=1] defence building level */
  constructor(level = 1) { this.level = level; this.nodes = new Map(); }

  /** @param {number} cx @param {number} cy @returns {void} add/replace a grid node */
  add(cx, cy) {
    if (!Number.isInteger(cx) || !Number.isInteger(cy)) throw new Error('Defence sockets require integer grid coordinates');
    this.nodes.set(defenceKey(cx, cy), { cx, cy });
  }

  /** @param {number} cx @param {number} cy @returns {boolean} neighbours resolve automatically on next render */
  remove(cx, cy) { return this.nodes.delete(defenceKey(cx, cy)); }

  /** @returns {object[]} resolved meshes, rotations and masks; called on rebuild, never per frame */
  resolve() {
    return [...this.nodes.values()].map((n) => {
      const mask = defenceMask(this.nodes, n);
      return { ...n, mask, ...resolveDefence(mask) };
    });
  }

  /** @returns {object} JSON-safe state; does not pretend the game has a base persistence backend */
  snapshot() { return { version: VERSION, level: this.level, nodes: [...this.nodes.values()].map((n) => [n.cx, n.cy]) }; }

  /** @param {object} state @returns {DefenceLayout} validates before returning a new layout */
  static restore(state) {
    if (state?.version !== VERSION || !Number.isInteger(state.level) || state.level < 1 || !Array.isArray(state.nodes)) throw new Error('Invalid defence snapshot');
    const layout = new DefenceLayout(state.level);
    for (const n of state.nodes) {
      if (!Array.isArray(n) || n.length !== 2) throw new Error('Invalid defence node');
      layout.add(n[0], n[1]);
    }
    return layout;
  }

  /** @param {number} hqLevel @param {number} [level=1] @returns {DefenceLayout} current authoritative rectangular footprint */
  static perimeter(hqLevel, level = 1) {
    const corners = defenceCorners(hqLevel), layout = new DefenceLayout(level);
    for (let edge = 0; edge < corners.length; edge++) {
      const a = corners[edge], b = corners[(edge + 1) % corners.length];
      const steps = Math.max(Math.abs(b.cx - a.cx), Math.abs(b.cy - a.cy));
      for (let i = 0; i < steps; i++) layout.add(a.cx + (b.cx - a.cx) * i / steps, a.cy + (b.cy - a.cy) * i / steps);
    }
    return layout;
  }
}
