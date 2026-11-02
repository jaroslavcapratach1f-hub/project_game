import test from 'node:test';
import assert from 'node:assert/strict';
import { Group, MeshStandardMaterial } from 'three';
import { DamageSmoke } from '../src/effects/DamageSmoke.js';
import { DAMAGE_SMOKE } from '../src/config/DamageSmokeConfig.js';
import { Unit3DBody } from '../src/entities/Unit3DBody.js';
import { M26Pershing } from '../src/entities/tanks/M26Pershing.js';
import { EventEmitter } from '../src/utils/EventEmitter.js';
import { EVENTS } from '../src/engine/GameEvents.js';
import { EffectsSystem } from '../src/effects/EffectsSystem.js';
import { DEATH_SHAKE } from '../src/config/EffectsConfig.js';

function smokeHarness() {
  const e={id:'heavy',cls:'heavyTank',faction:'usa',hp:100,maxHp:100,isAlive:true,x:100,y:100,rotation:0,bodyScale:1.25};
  const calls=[], rows=[e];
  const smoke=new DamageSmoke({forEach:fn=>rows.forEach(fn)}, {emitBurst:(...args)=>calls.push(args)});
  const run=()=>{for(let i=0;i<40;i++)smoke.update(.05);};
  return {e,calls,rows,smoke,run};
}
test('smoke thresholds are 75%, 50%, 25% remaining HP, with increasing amounts',()=>{
  const {e,calls,smoke,run}=smokeHarness();let previous=0;
  for(const hp of [100,76,75,50,25]) {
    e.hp=hp;smoke.clear();calls.length=0;run();
    const count=calls.reduce((n,c)=>n+c[3],0);
    if(hp>75) assert.equal(count,0);
    else {assert.ok(count>previous);previous=count;const stage=DAMAGE_SMOKE.stages.find(s=>s.atFrac===hp/100);assert.equal(calls[0][0],stage.particle);}
  }
});
test('smoke follows a moving hull and stops after repair, death or removal; infantry do not smoke',()=>{
  const {e,calls,smoke,run,rows}=smokeHarness();e.hp=25;run();const origin=calls.at(-1)[1];e.x+=100;run();assert.equal(calls.at(-1)[1],origin+100);
  for(const mode of ['repair','dead','infantry','removed']){
    smoke.clear();calls.length=0;e.hp=25;e.isAlive=true;e.cls='heavyTank';
    if(mode==='repair')e.hp=100;if(mode==='dead')e.isAlive=false;if(mode==='infantry')e.cls='infantry';if(mode==='removed')rows.length=0;
    run();assert.equal(calls.length,0);assert.equal(smoke._acc.size,0);
  }
});
test('authored hull/turret colors remain identical through damage and healing; only wreck darkens',()=>{
  const b=new Unit3DBody({});b._root=new Group();b._turretPivot=new Group();b._unit3D={headingToSceneY:a=>a};
  b._hullMats=[new MeshStandardMaterial({color:0x69834a})];b._turretMats=[new MeshStandardMaterial({color:0x8a762d})];
  const mats=[...b._hullMats,...b._turretMats],colors=mats.map(m=>m.color.clone());
  for(const hp of [100,75,50,25,1,100]){b.sync({rotation:0,turretAngle:1,hp,maxHp:100});mats.forEach((m,i)=>assert.ok(m.color.equals(colors[i])));}
  b.markWreck();mats.forEach((m,i)=>assert.ok(!m.color.equals(colors[i])));
  b.setWreckAlpha(.5);assert.ok(mats.every(m=>m.opacity===.5));
});
test('lethal damage emits one explosion and one small shake; hits and repeated damage add no shakes',()=>{
  const events=new EventEmitter(),shakes=[],bursts=[];
  const fx=new EffectsSystem({}, {shake:(...args)=>shakes.push(args)},null,events);
  fx.particles={emitBurst:(...args)=>bursts.push(args),addEmitter:()=>{}};
  events.on(EVENTS.ENTITY_DIED,p=>fx._death(p));
  const e=new M26Pershing({id:'tank',team:'player',x:0,y:0,events});
  e.takeDamage(e.maxHp*.25);assert.equal(shakes.length,0);
  fx._impact({weapon:'shell',x:0,y:0});assert.equal(shakes.length,0);bursts.length=0;
  e.takeDamage(e.maxHp);const count=bursts.length;e.takeDamage(e.maxHp);e.die();
  assert.ok(count>0);assert.equal(bursts.length,count);assert.deepEqual(shakes,[[DEATH_SHAKE.intensity,DEATH_SHAKE.durationMs,DEATH_SHAKE.type]]);
});

test('continuous smoke leaves particle capacity available for death explosions',()=>{
  const {e,calls,smoke,run}=smokeHarness();e.hp=25;smoke._particles.activeCount=500;run();assert.equal(calls.length,0);
  smoke._particles.activeCount=0;run();assert.ok(calls.length>0);
});
