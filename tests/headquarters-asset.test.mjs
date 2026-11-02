import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readGlb, geometry } from '../assets/buildings/hq/levels01-06/source/refinement/GlbEdit.mjs';
const root=new URL('../assets/buildings/hq/levels01-06/',import.meta.url);
test('refined HQ has finite indexed geometry, embedded PBR textures and four scaled gun crews',()=>{
 const path=new URL('timber_headquarters.glb',root),data=fs.readFileSync(path),file=readGlb(path),doc=file.doc;
 assert.equal(data.readUInt32LE(0),0x46546c67);assert.equal(data.readUInt32LE(8),data.length);
 assert.ok(doc.images.length>=3);assert.ok(doc.images.every(i=>i.bufferView!==undefined));
 const used=new Set();let triangles=0;
 for(const mesh of doc.meshes)for(const p of mesh.primitives){
  used.add(p.material);const g=geometry(file,p),count=g.attributes.position.count;
  for(const a of Object.values(g.attributes))assert.ok([...a.array].every(Number.isFinite));
  assert.ok([...g.index.array].every(i=>i>=0&&i<count));triangles+=g.index.count/3;
 }
 assert.ok(triangles<165000,'HQ silhouette budget exceeded');
 for(const id of used){const mat=doc.materials[id];if(mat.extensions?.KHR_materials_unlit)continue;const p=mat.pbrMetallicRoughness;assert.ok(p.roughnessFactor>=.4&&p.roughnessFactor<=1);assert.ok((p.metallicFactor??0)>=0&&(p.metallicFactor??0)<=1);}
 assert.ok([...used].some(i=>doc.materials[i].normalTexture));
 assert.equal(doc.asset.extras.guards,4);assert.equal(doc.asset.extras.machineGuns,4);assert.equal(doc.asset.extras.soldierMetres,1.78);assert.equal(doc.asset.extras.fieldTroopScaleMatched,true);
 const registry=fs.readFileSync(new URL('../src/config/Building3DConfig.js',import.meta.url),'utf8');assert.ok(registry.includes('hq/levels01-06/timber_headquarters.glb'));
});
