import test from 'node:test';
import assert from 'node:assert/strict';
import { DefenceLayout } from '../src/systems/DefenceLayout.js';
import { DEFENCE_DIRS, defenceMask, resolveDefence } from '../src/systems/DefenceConnectivity.js';
import { defenceCorners, defencePolygon } from '../src/systems/DefenceFootprint.js';
import { pointInPolygon } from '../src/utils/MathUtils.js';
import { cellCentreToPx } from '../src/utils/SquareGrid.js';
import { CELL_PX, plotCells, PLOT_STAGES } from '../src/config/BaseGridConfig.js';
import { defenceDressing } from '../src/systems/DefenceDressing.js';
import fs from 'node:fs';
import { DEFENCE_TREES as T } from '../src/config/DefencePerimeterConfig.js';
const assetExists = (asset) => fs.existsSync(new URL(`../assets/buildings/defence_wall/levels01-06/modular/${asset}.glb`, import.meta.url));

test('all 16 cardinal connectivity cases have correctly rotated meshes', () => {
  for (let bits=0;bits<16;bits++) {
    const l=new DefenceLayout();l.add(0,0);let expected=0;
    for(let i=0;i<4;i++) if(bits&(1<<i)){const [x,y]=DEFENCE_DIRS[i*2];l.add(x,y);expected|=1<<(i*2);}
    assert.equal(defenceMask(l.nodes,{cx:0,cy:0}),expected);
    const r=resolveDefence(expected);assert.ok(assetExists(r.asset),r.asset);
    const canonical={wall_post:0,wall_end:1,wall_straight:17,wall_corner:5,wall_junction:21,wall_cross:85}[r.asset];
    const turn=Math.round(r.rotation/(Math.PI/4));
    assert.equal(((canonical<<turn)|(canonical>>(8-turn)))&255,expected);
  }
});
test('every plot stage has a closed two-neighbour perimeter, inside/outside collision agreement and all source meshes',()=>{
  for(const stage of PLOT_STAGES){const level=Number.isFinite(stage.upToLevel)?stage.upToLevel:35;
    const l=DefenceLayout.perimeter(level), poly=defencePolygon(level), {cols,rows}=plotCells(level);
    for(const p of l.resolve()) {assert.equal(p.mask.toString(2).replaceAll('0','').length,2,JSON.stringify(p));assert.ok(assetExists(p.asset),p.asset);}
    for(const x of [-cols/2+.01,cols/2-.01])for(const y of [-rows/2+.01,rows/2-.01]){const p=cellCentreToPx(x,y,CELL_PX);assert.ok(pointInPolygon(p.x,p.y,poly));}
    const out=cellCentreToPx(cols/2+5,rows/2+5,CELL_PX);assert.equal(pointInPolygon(out.x,out.y,poly),false);
    assert.equal(defenceCorners(level).length,8);
  }
});
test('remove/add recalculates adjacent end sockets; JSON roundtrip and level change preserve positions',()=>{
  const l=DefenceLayout.perimeter(3);l.remove(0,-13);
  assert.equal(l.resolve().find(n=>n.cx===-1&&n.cy===-13).asset,'wall_end');
  l.add(0,-13);assert.equal(l.resolve().find(n=>n.cx===-1&&n.cy===-13).asset,'wall_straight');
  const restored=DefenceLayout.restore(JSON.parse(JSON.stringify(l.snapshot())));assert.deepEqual(restored.snapshot(),l.snapshot());
  const before=restored.snapshot().nodes;restored.level=4;assert.deepEqual(restored.snapshot().nodes,before);
  assert.throws(()=>DefenceLayout.restore({version:99,nodes:[]}));assert.throws(()=>l.add(.5,0));
});
test('dressing is deterministic, trees occupy both sides, and all props resolve to real assets',()=>{
  const a=defenceDressing(3);assert.deepEqual(a,defenceDressing(3));const poly=defencePolygon(3);
  for(const p of a.props) assert.ok(assetExists(p.asset),p.asset);
  const trees=a.props.filter(p=>p.asset.startsWith('pine'));
  const inside=trees.filter(p=>{const w=cellCentreToPx(p.cx,p.cy,CELL_PX);return pointInPolygon(w.x,w.y,poly);});
  assert.ok(inside.length>0 && inside.length<trees.length);
  assert.ok(new Set(trees.map(p=>p.sy)).size>10);
  assert.equal(new Set(a.props.filter(p=>p.asset.startsWith('pine')).map(p=>p.asset)).size,3);
});

test('all four chamfers have identical length and paired tower sockets',()=>{
 const c=defenceCorners(3),lengths=[];
 for(let i=1;i<c.length;i+=2){const a=c[i],b=c[(i+1)%c.length];lengths.push(Math.hypot(a.cx-b.cx,a.cy-b.cy));}
 assert.equal(new Set(lengths).size,1);assert.equal(lengths.length,4);
});

test('outer barrier has one post between hedgehogs and every wire end meets a support', async()=>{
 const { barrierPlacements }=await import('../src/systems/DefenceBarrier.js');
 const { offsetDefenceRing }=await import('../src/systems/DefenceDressing.js');
 const { DEFENCE }=await import('../src/config/DefencePerimeterConfig.js');
 const props=barrierPlacements(offsetDefenceRing(defenceCorners(3),DEFENCE.wireOffset));
 const posts=props.filter(p=>p.asset==='wire_post'),wires=props.filter(p=>p.asset==='barbed_wire');
 const supports=props.filter(p=>p.asset!=='barbed_wire');
 assert.equal(wires.length,posts.length*2);
 assert.equal(new Set(supports.map(p=>`${p.cx.toFixed(6)},${p.cy.toFixed(6)}`)).size,supports.length);
 for(const wire of wires)for(const sign of [-1,1]){
   const x=wire.cx+sign*Math.sin(wire.rotation)*wire.sz/2,y=wire.cy+sign*Math.cos(wire.rotation)*wire.sz/2;
   assert.ok(supports.some(p=>Math.hypot(p.cx-x,p.cy-y)<1e-6),'unattached wire end');
 }
 for(const post of posts){
   const ends=wires.filter(w=>Math.hypot(w.cx-post.cx,w.cy-post.cy)<=w.sz/2+1e-6);
   assert.equal(ends.length,2,'each intermediate post carries exactly two wire spans');
 }
});

test('every tower ladder faces into the compound, with distinct natural tree proportions', async()=>{
  const {defenceTowers}=await import('../src/systems/DefenceFootprint.js');
  const {trenchLayout}=await import('../src/systems/DefenceTrenches.js');
  const {offsetDefenceRing}=await import('../src/systems/DefenceDressing.js');
  const {DEFENCE:C,DEFENCE_TREES:T}=await import('../src/config/DefencePerimeterConfig.js');
  for(let level=1;level<=35;level+=6){
    const polygon=defencePolygon(level),towers=defenceTowers(level);
    for(const t of towers){
      const p=cellCentreToPx(t.cx-Math.sin(t.rotation),t.cy-Math.cos(t.rotation),CELL_PX);
      assert.ok(pointInPolygon(p.x,p.y,polygon),`outward ladder at ${t.cx},${t.cy}`);
    }
    const layout=trenchLayout(offsetDefenceRing(defenceCorners(level),C.trenchOffset));
    const trees=defenceDressing(level).props.filter(p=>p.asset.startsWith('pine'));
    for(const p of trees){
      assert.ok(towers.every(t=>Math.hypot(t.cx-p.cx,t.cy-p.cy)>=T.towerClearance));
      const w=cellCentreToPx(p.cx,p.cy,CELL_PX);
      if(pointInPolygon(w.x,w.y,polygon))continue;
      for(const e of layout.entries){const s=layout.segments[e.segment];assert.ok(Math.hypot(p.cx-s.a.cx-s.dx*e.distance,p.cy-s.a.cy-s.dy*e.distance)>=T.entranceClearance);}
    }
  }
});

test('tree density retains the requested ratios after gate approach geometry changes',()=>{
  const saved={inside:T.interiorRetention,outside:T.exteriorMultiplier};
  try {
    for(let stage=0;stage<6;stage++){
      T.interiorRetention=1;T.exteriorMultiplier=1;
      const baseline=defenceDressing(stage*6+1).props.filter(p=>p.asset.startsWith('pine'));
      T.interiorRetention=saved.inside;T.exteriorMultiplier=saved.outside;
      const trees=defenceDressing(stage*6+1).props.filter(p=>p.asset.startsWith('pine'));
      assert.equal(trees.filter(p=>p.interior).length,Math.round(baseline.filter(p=>p.interior).length*.75));
      assert.equal(trees.filter(p=>!p.interior).length,baseline.filter(p=>!p.interior).length*2);
    }
  } finally { T.interiorRetention=saved.inside;T.exteriorMultiplier=saved.outside; }
});
