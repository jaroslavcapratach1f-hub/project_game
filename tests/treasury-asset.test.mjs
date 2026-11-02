import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readGlb, geometry } from '../assets/buildings/hq/levels01-06/source/refinement/GlbEdit.mjs';
const path = new URL('../assets/buildings/treasury/levels01-06/treasury.glb', import.meta.url);
test('treasury is a grounded, textured mobile mesh with valid geometry', () => {
  const file = readGlb(path), doc = file.doc;
  assert.deepEqual(doc.asset.extras.visualLevels, [1, 6]);
  assert.deepEqual(doc.asset.extras.footprintCells, [2, 2]);
  assert.equal(doc.asset.extras.front, '+X');
  assert.ok(doc.images.length > 0 && doc.images.every(i => i.bufferView !== undefined));
  let triangles = 0, minY = Infinity;
  for (const mesh of doc.meshes) for (const primitive of mesh.primitives) {
    const g = geometry(file, primitive), p = g.attributes.position;
    for (const a of Object.values(g.attributes)) assert.ok([...a.array].every(Number.isFinite));
    assert.ok([...g.index.array].every(i => i >= 0 && i < p.count));
    for (let i = 0; i < p.count; i++) minY = Math.min(minY, p.getY(i));
    triangles += g.index.count / 3;
  }
  assert.ok(Math.abs(minY) < 1e-5, 'ground-contact pivot');
  assert.ok(triangles < 105000, 'reconstruction exceeds mobile triangle ceiling');
  assert.ok(fs.statSync(path).size < 8 * 1024 * 1024, 'embedded asset size ceiling');
});
