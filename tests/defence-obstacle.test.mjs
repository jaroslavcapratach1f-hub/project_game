import test from 'node:test';
import assert from 'node:assert/strict';
import { Box3 } from 'three';
import { obstacle } from '../assets/buildings/defence_wall/levels01-06/modular/source/refinement/Details.mjs';
test('all three steel hedgehog beams rest on the ground and rise through the joint',()=>{
 const parts=[];obstacle(g=>parts.push(g),()=>0);
 for(let beam=0;beam<3;beam++){
  const bounds=new Box3();
  for(const g of parts.slice(beam*3,beam*3+3)){g.computeBoundingBox();bounds.union(g.boundingBox);}
  assert.ok(Math.abs(bounds.min.y)<1e-6,'floating beam');
  assert.ok(bounds.max.y>.55,'horizontal suspended beam');
  assert.ok(bounds.min.x<.1&&bounds.max.x>-.1&&bounds.min.z<.1&&bounds.max.z>-.1,'beam misses central assembly');
 }
});
