import test from 'node:test';
import assert from 'node:assert/strict';
import { GroundTrails } from '../src/effects/GroundTrails.js';
import { GROUND_TRAIL as C } from '../src/config/GroundTrailConfig.js';
import { ALL_UNITS } from '../src/config/UnitStats.js';
import { DecalField } from '../src/world/DecalField.js';
import { Container } from 'pixi.js';

function setup() {
  const marks = [], trails = new GroundTrails({ addGroundMark: (type, q) => marks.push({type, q: [...q]}) });
  const e = { id: 'tank', faction: 'usa', cls: 'heavyTank', x: 0, y: 0, rotation: 0, isAlive: true };
  const tick = () => { trails.begin(); trails.update(e); trails.end(); };
  return { marks, trails, e, tick };
}
test('every ground vehicle class has a contact profile and increasing tank widths', () => {
  for (const u of Object.values(ALL_UNITS)) if (u.cls !== 'infantry') assert.ok(C.classes[u.cls], u.cls);
  const widths = ['lightTank','mediumTank','heavyTank','superHeavyTank'].map(k=>C.classes[k].width);
  assert.deepEqual(widths, [...widths].sort((a,b)=>a-b));
  assert.equal(C.classes.mediumTank.width, C.classes.tankHunter.width);
});
test('movement produces separate continuous left/right bands, no stationary or teleport streak', () => {
  const {marks,e,tick}=setup(); tick(); tick(); assert.equal(marks.length,0);
  e.x=10; tick(); assert.equal(marks.length,4);
  assert.notEqual(marks[0].q[1],marks[1].q[1]);
  assert.deepEqual(marks[0].q.slice(2,6),[...marks[2].q.slice(0,2),...marks[2].q.slice(6,8)]);
  tick(); assert.equal(marks.length,4);
  e.x=1000; tick(); assert.equal(marks.length,4);
});
test('pivot turns sweep finite paired contacts; dead units stop leaving marks', () => {
  const {marks,e,tick}=setup(); tick(); e.rotation=Math.PI/2; tick();
  assert.ok(marks.length>2 && marks.length%2===0);
  assert.ok(marks.every(m=>m.q.every(Number.isFinite)));
  const n=marks.length;e.isAlive=false;e.x=20;tick();assert.equal(marks.length,n);
});
test('individual living soldiers leave alternating footprints and histories are pruned', () => {
  const {marks,trails,e,tick}=setup();
  e.soldiers=[{...e,id:'a'},{...e,id:'b',x:30}];tick();
  e.soldiers[0].x+=10;tick();assert.equal(marks.length,1);assert.equal(marks[0].type,'foot');
  e.soldiers[0].x+=10;tick();assert.ok(marks[0].q[1]*marks[1].q[1]<0);
  e.soldiers[1].isAlive=false;tick();assert.equal(trails._states.size,1);
});
test('Pixi keeps finite independent polygons when the input buffer is reused', () => {
  const field=new DecalField();field.enable(new Container());
  const q=new Float32Array([0,0,5,0,5,2,0,2]);field.addGroundMark('tread',q);
  q.fill(100);field.addGroundMark('tread',q);
  const bounds=field._active[0].getLocalBounds();
  assert.equal(bounds.width,5);assert.equal(bounds.height,2);
  field.destroy();
});
