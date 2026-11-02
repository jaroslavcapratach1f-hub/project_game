import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readGlb, geometry } from '../assets/buildings/hq/levels01-06/source/refinement/GlbEdit.mjs';
const path = new URL('../assets/buildings/armory/levels01-06/armory.glb', import.meta.url);
test('armory is a grounded, textured mobile mesh with valid geometry', () => {
  const file = readGlb(path), doc = file.doc;
  assert.deepEqual(doc.asset.extras.visualLevels, [1, 6]);
  assert.deepEqual(doc.asset.extras.footprintCells, [3, 3]);
  assert.equal(doc.asset.extras.front, '+Z');
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

test('armory textured tank paint stays readable and closure plates are olive', () => {
  const { doc } = readGlb(path);
  const tank = doc.materials.filter(m => m.name.startsWith('Material_'));
  assert.ok(tank.some(m => m.pbrMetallicRoughness.baseColorTexture));
  for (const m of tank) {
    const pbr = m.pbrMetallicRoughness, color = pbr.baseColorFactor;
    if (pbr.baseColorTexture) assert.ok(color.slice(0, 3).every(v => v > .3), 'tank texture must not be multiplied almost black');
    else assert.ok(color.slice(0, 3).every(v => v < .2), 'exposed mounting plates must not turn white');
  }
});
