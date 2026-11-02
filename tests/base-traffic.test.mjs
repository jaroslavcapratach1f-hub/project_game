import test from 'node:test';
import assert from 'node:assert/strict';
import { STARTING_LAYOUT } from '../src/config/BaseConfig.js';
import { baseTrafficTexture } from '../src/engine/BaseTrafficTexture.js';
import { plotCells } from '../src/config/BaseGridConfig.js';
import { DEFENCE } from '../src/config/DefencePerimeterConfig.js';
test('gate traffic is a broad continuous worn approach and is independent of moved buildings',()=>{
 const texture=baseTrafficTexture(3,STARTING_LAYOUT),{data,width:size}=texture.image;
 const {cols,rows}=plotCells(3),w=cols+2*DEFENCE.wallSetback,h=rows+2*DEFENCE.wallSetback;
 const alpha=(cx,cy)=>data[(Math.round((cy/h+.5)*(size-1))*size+Math.round((cx/w+.5)*(size-1)))*4+3];
 const gate=cols/2+DEFENCE.wallSetback;
 assert.ok(alpha(gate-.1,0)>60,'wear must reach the gate');
 for(const y of [-.4,0,.4])assert.ok(alpha(gate-.5,y)>30,'approach must cover a broad band, including its centre');
 assert.equal(alpha(-cols/2+1,0),0,'unused grass must remain unworn');
 const moved=STARTING_LAYOUT.map(b=>b.id==='barracks'?{...b,cx:0,cy:-8}:b);
 const next=baseTrafficTexture(3,moved);assert.deepEqual(next.image.data,data);
 texture.dispose();next.dispose();
});
