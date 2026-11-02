import test from 'node:test';
import assert from 'node:assert/strict';
import { Raycaster, Vector3 } from 'three';
import { trenchLayout } from '../src/systems/DefenceTrenches.js';
import { defenceCorners } from '../src/systems/DefenceFootprint.js';
import { offsetDefenceRing } from '../src/systems/DefenceDressing.js';
import { buildDefenceTrench, disposeDefenceTrench } from '../src/engine/DefenceTrenchMesh.js';
import { DEFENCE as C, DEFENCE_TRENCH as T } from '../src/config/DefencePerimeterConfig.js';
import { PLOT_STAGES, CELL_PX } from '../src/config/BaseGridConfig.js';
import { excavationLines, defenceTerrainHeight } from '../src/systems/DefenceTerrainHeight.js';
import { BASE3D } from '../src/config/Base3DConfig.js';
const unit = CELL_PX * BASE3D.cameraScale;
const layoutFor = level => trenchLayout(offsetDefenceRing(defenceCorners(level), C.trenchOffset));
function clearRay(mesh, a, b, endY = T.floorY + 0.10) {
  const from = new Vector3(a.cx * unit, (T.floorY + 0.10) * unit, a.cy * unit);
  const to = new Vector3(b.cx * unit, endY * unit, b.cy * unit);
  const distance = from.distanceTo(to), direction = to.sub(from).normalize();
  assert.equal(new Raycaster(from, direction, 0.001, distance - 0.001).intersectObjects(mesh.children).length, 0,
    `Blocked passage from ${JSON.stringify(a)} to ${JSON.stringify(b)}`);
}
test('trench channels and every corner stay open at all six plot sizes', () => {
  for (const index of PLOT_STAGES.keys()) {
    const layout = layoutFor(index * 6 + 1), mesh = buildDefenceTrench(layout); mesh.updateMatrixWorld(true);
    for (const s of layout.segments) clearRay(mesh, s.a, s.b);
    for (let i = 1; i < layout.segments.length; i++) {
      const before = layout.segments[i - 1], after = layout.segments[i];
      clearRay(mesh, { cx: before.b.cx - before.dx * 0.15, cy: before.b.cy - before.dy * 0.15 },
        { cx: after.a.cx + after.dx * 0.15, cy: after.a.cy + after.dy * 0.15 });
    }
    disposeDefenceTrench(mesh);
  }
});
test('eight uncapped side accesses and ten separated bridges replace twenty crossings', () => {
  const layout = layoutFor(3), mesh = buildDefenceTrench(layout); mesh.updateMatrixWorld(true);
  assert.equal(layout.bridges.length, 10); assert.equal(layout.entries.length, 8);
  for (const entry of layout.entries) {
    const s = layout.segments[entry.segment], a = { cx: s.a.cx + s.dx * entry.distance, cy: s.a.cy + s.dy * entry.distance };
    clearRay(mesh, a, { cx: a.cx - s.dy * (T.halfWidth + T.entryLength), cy: a.cy + s.dx * (T.halfWidth + T.entryLength) }, 0.10);
    for (const b of layout.bridges) assert.ok(Math.hypot(a.cx - b.cx, a.cy - b.cy) > T.entryWidth);
  }
  assert.equal(mesh.children.length, 2);
  disposeDefenceTrench(mesh);
});

test('excavated terrain stays beneath every sloping access ramp', () => {
 for(const stage of PLOT_STAGES.keys()){
  const layout=layoutFor(stage*6+1),lines=excavationLines(layout);
  for(const entry of layout.entries){
   const s=layout.segments[entry.segment],x=s.a.cx+s.dx*entry.distance,z=s.a.cy+s.dy*entry.distance;
   for(let i=0;i<=20;i++){
    const t=i/20,d=T.halfWidth+T.entryLength*t;
    const ground=defenceTerrainHeight(x-s.dy*d,z+s.dx*d,lines);
    assert.ok(ground<=T.floorY*(1-t)+1e-6,'grass penetrates entrance ramp');
   }
  }
  assert.equal(defenceTerrainHeight(100,100,lines),0);
 }
});
