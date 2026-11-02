import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root = new URL('../', import.meta.url);
const catalog = JSON.parse(readFileSync(new URL('assets/asset_catalog.json', root)));
test('catalogued runtime meshes and rebuild inputs exist and match their saved hashes', () => {
  assert.ok(catalog.models.length > 100);
  for (const row of catalog.models) {
    const url = new URL(row.path, root);
    assert.ok(existsSync(url), row.path);
    const bytes = readFileSync(url);
    assert.equal(bytes.subarray(0, 4).toString(), 'glTF', row.path);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), row.sha256, row.path);
  }
});
test('HQ, barracks and complete defence share one packet across levels 1–6', () => {
  assert.deepEqual(catalog.sharedBuildingVisuals.levels, [1, 6]);
  for (const path of Object.values(catalog.sharedBuildingVisuals).filter(v => typeof v === 'string')) {
    assert.ok(existsSync(new URL(path, root)), path);
    assert.ok(path.split('/').includes('levels01-06'));
  }
});
