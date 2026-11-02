import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
const root=new URL('../assets/units/',import.meta.url);
const manifest=JSON.parse(readFileSync(new URL('_enemy_tint/generated-manifest.json',root)));
const hash=file=>createHash('sha256').update(readFileSync(new URL(file,root))).digest('hex');
test('bot variants are rebuilt whenever their source tank split or paint changes',()=>{
  for(const row of manifest){
    assert.equal(hash(row.source),row.sourceSha256,`${row.source}: rebuild with recolor_enemy.py --all`);
    assert.equal(hash(row.enemy),row.enemySha256,`${row.enemy}: generated variant changed`);
  }
  const registry=readFileSync(new URL('../src/config/Unit3DConfig.js',import.meta.url),'utf8');
  const urls=[...registry.matchAll(/assets\/units\/([^']+_enemy\.glb)/g)].map(m=>m[1]);
  assert.deepEqual(new Set(manifest.map(r=>r.enemy)),new Set(urls));
});
