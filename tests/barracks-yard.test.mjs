import test from 'node:test';
import assert from 'node:assert/strict';
import { barracksYardLayout } from '../src/systems/BarracksYardLayout.js';
import { readGlb, geometry } from '../assets/buildings/hq/levels01-06/source/refinement/GlbEdit.mjs';
import { Box3 } from 'three';
test('yard has the approved class counts and positions within the assembly area',()=>{
 assert.equal(barracksYardLayout('infantry').length,16);
 assert.equal(barracksYardLayout('mediumTank').length,4);
 assert.equal(barracksYardLayout('tankHunter').length,4);
 assert.equal(barracksYardLayout('howitzer').length,4);
 assert.equal(barracksYardLayout('heavyTank').length,2);
 assert.equal(barracksYardLayout('superHeavyTank').length,1);
 for(const cls of ['infantry','mediumTank','lightTank','heavyTank','tankHunter','howitzer','superHeavyTank']){
  const p=barracksYardLayout(cls);assert.equal(new Set(p.map(v=>v.x+','+v.z)).size,p.length);
  assert.ok(p.every(v=>Math.abs(v.x)<2&&v.z>-.71&&v.z<2));
 }
});
test('new reference barracks stays in its 4x4 placement footprint',()=>{
 const file=readGlb(new URL('../assets/buildings/barracks/levels01-06/reference_barracks.glb',import.meta.url)),b=new Box3();
 for(const m of file.doc.meshes)for(const p of m.primitives){const g=geometry(file,p);g.computeBoundingBox();b.union(g.boundingBox);}
 assert.ok(Math.abs(b.max.x-b.min.x-4)<.001);assert.ok(Math.abs(b.max.z-b.min.z-4)<.001);
 assert.equal(file.doc.asset.extras.assemblyBays,4);
});
test('infantry forms four evenly spaced ranks of four',()=>{
 const p=barracksYardLayout('infantry'),xs=[...new Set(p.map(v=>v.x))].sort((a,b)=>a-b),zs=[...new Set(p.map(v=>v.z))].sort((a,b)=>a-b);
 assert.equal(xs.length,4);assert.equal(zs.length,4);
 for(const z of zs)assert.equal(p.filter(v=>v.z===z).length,4);
 for(let i=2;i<4;i++){assert.ok(Math.abs((xs[i]-xs[i-1])-(xs[1]-xs[0]))<1e-9);assert.ok(Math.abs((zs[i]-zs[i-1])-(zs[1]-zs[0]))<1e-9);}
});
