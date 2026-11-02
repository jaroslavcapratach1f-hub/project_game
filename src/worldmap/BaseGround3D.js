/** Existing live ground owner: grass, permanent gate-origin traffic marks and relocation grid. */
import { Group, Mesh, MeshBasicMaterial, PlaneGeometry, BufferGeometry, Float32BufferAttribute, LineSegments, LineBasicMaterial } from 'three';
import { CELL_PX, plotCells } from '../config/BaseGridConfig.js';
import { BASE3D } from '../config/Base3DConfig.js';
import { DEFENCE } from '../config/DefencePerimeterConfig.js';
import { GROUND_3D as C } from '../config/BaseGround3DConfig.js';
import { baseGrassMaterial } from '../engine/BaseGrassMaterial.js';
import { baseTrafficTexture } from '../engine/BaseTrafficTexture.js';
import { defenceCorners } from '../systems/DefenceFootprint.js';
const UNIT = CELL_PX * BASE3D.cameraScale, HALF = 0.5, XYZ = 3;
export class BaseGround3D {
  /** @param {object} base3D @param {object} origin */
  constructor(base3D, origin = { cx: 0, cy: 0 }) {
    this._origin = origin; this._base3D = base3D;
    this._root = null;
  }
  /** @param {number} level @returns {void} */
  enable(level) {
    this.disable(); this._level = level;
    const { cols, rows } = plotCells(level), root = new Group(); this._root = root;
    root.position.set(this._origin.cx * UNIT, 0, this._origin.cy * UNIT);
    const g = this._groundGeometry(level);
    for (let i = 0; i < g.attributes.uv.count; i++) g.attributes.uv.setXY(i, g.attributes.position.getX(i) / UNIT / C.tileCells, g.attributes.position.getZ(i) / UNIT / C.tileCells);
    const ground = new Mesh(g, baseGrassMaterial()); ground.position.y = C.elevation * UNIT; root.add(ground);
    const overlay = new PlaneGeometry((cols + DEFENCE.wallSetback * 2) * UNIT, (rows + DEFENCE.wallSetback * 2) * UNIT); overlay.rotateX(-Math.PI / 2);
    // Texture rows follow grid +Z; plane UV Y needs reversing.
    for (let i = 0; i < overlay.attributes.uv.count; i++) overlay.attributes.uv.setY(i, 1 - overlay.attributes.uv.getY(i));
    this._tracks = new Mesh(overlay, new MeshBasicMaterial({ transparent: true, depthWrite: false }));
    this._tracks.position.y = C.trafficElevation * UNIT; root.add(this._tracks);
    this._grid = this._makeGrid(cols, rows); root.add(this._grid); this._grid.visible = false;
    this._refreshTracks(); this._base3D.addObject(root);
  }
  /** @param {boolean} visible @returns {void} */
  setPlacementVisible(visible) { if (this._grid) this._grid.visible = visible; }
  /** @param {boolean} hidden @returns {void} */
  setForceHidden(hidden) { if (this._root) this._root.visible = !hidden; }
  /** @private */
  _refreshTracks() {
    if (!this._root) return;
    this._tracks.material.map?.dispose(); this._tracks.material.map = baseTrafficTexture(this._level); this._tracks.material.needsUpdate = true;
  }
  /** @private fill to the wall, including its setback belt; placement grid is unchanged */
  _groundGeometry(level) {
    const corners = defenceCorners(level), vertices = [0, 0, 0], indices = [];
    for (const p of corners) vertices.push(p.cx * UNIT, 0, p.cy * UNIT);
    for (let i = 0; i < corners.length; i++) indices.push(0, (i + 1) % corners.length + 1, i + 1);
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(vertices, XYZ));
    g.setAttribute('uv', new Float32BufferAttribute(new Float32Array(vertices.length / XYZ * 2), 2));
    g.setIndex(indices); g.computeVertexNormals(); return g;
  }
  /** @private @returns {LineSegments} */
  _makeGrid(cols, rows) {
    const points = [], y = C.gridElevation * UNIT;
    for (let x = -cols * HALF; x <= cols * HALF; x++) points.push(x * UNIT, y, -rows * HALF * UNIT, x * UNIT, y, rows * HALF * UNIT);
    for (let z = -rows * HALF; z <= rows * HALF; z++) points.push(-cols * HALF * UNIT, y, z * UNIT, cols * HALF * UNIT, y, z * UNIT);
    const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(points, XYZ));
    return new LineSegments(g, new LineBasicMaterial({ color: C.gridColor, transparent: true, opacity: C.gridOpacity }));
  }
  /** @returns {void} */
  disable() {
    if (!this._root) return;
    this._tracks.material.map?.dispose();
    for (const child of this._root.children) { child.geometry.dispose(); child.material.dispose(); }
    this._base3D.removeObject(this._root); this._root = null; this._grid = null;
  }
}
