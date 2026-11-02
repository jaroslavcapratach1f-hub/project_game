import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { readGlb, geometry } from '../assets/buildings/hq/levels01-06/source/refinement/GlbEdit.mjs';
const root = new URL('../assets/units/super_heavy/tier01/', import.meta.url);
const report = JSON.parse(readFileSync(new URL('source/split-report.json', root)));
test('Maus split preserves source surfaces and keeps deck fittings on hull', () => {
  assert.ok(report.surfaceAreaError < 1e-8, 'cut must not discard visible surfaces');
  assert.ok(report.fixedUpperFaces > 0, 'deck fittings above skirt stay fixed');
  assert.equal(report.turretBounds[0][1], 0, 'turret underside lies at pivot plane');
  assert.ok(report.hullBounds[1][1] < report.sourceBounds[1][1] / 2);
  assert.ok(report.turretBounds[1][2] > .6, 'barrel points along source +Z');
});
test('Maus runtime packet has finite textured geometry within mobile budget', () => {
  let triangles = 0;
  for (const name of ['maus_hull.glb', 'maus_turret.glb']) {
    const file = readGlb(new URL(name, root));
    assert.ok(file.doc.images.length > 0);
    assert.equal(file.doc.materials[0].pbrMetallicRoughness.metallicFactor, 0);
    for (const mesh of file.doc.meshes) for (const primitive of mesh.primitives) {
      const g = geometry(file, primitive);
      assert.ok([...g.attributes.position.array].every(Number.isFinite));
      triangles += (g.index?.count ?? g.attributes.position.count) / 3;
    }
  }
  assert.ok(triangles > 10000 && triangles < 20000);
});
