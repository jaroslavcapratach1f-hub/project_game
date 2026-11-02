import test from 'node:test';
import assert from 'node:assert/strict';
import { Container, Sprite, Texture, CanvasSource } from 'pixi.js';
import { rebuildCanvasSprite } from '../src/engine/CanvasSprite3D.js';
import { WORLD_HUD, navEdgePad } from '../src/config/HudConfig.js';

test('3D composition replaces and releases texture sources through repeated rotations',()=>{
  const canvas={width:780,height:1688};
  const slot=new Container();let sprite=new Sprite(new Texture({source:new CanvasSource({resource:canvas,resolution:1})}));slot.addChild(sprite);
  for(const [width,height] of [[1688,780],[780,1688],[1688,780]]){
    const oldSource=sprite.texture.source;canvas.width=width;canvas.height=height;
    sprite=rebuildCanvasSprite(sprite,slot,canvas);
    assert.notEqual(sprite.texture.source,oldSource);assert.equal(oldSource.destroyed,true);
    assert.equal(sprite.texture.width,width);assert.equal(sprite.texture.height,height);
    assert.equal(slot.children.length,1);assert.equal(canvas.width,width);
  }
  slot.destroy({children:true,texture:true,textureSource:true});
});
test('TopBar corner clusters dock flush in portrait and inset in landscape (navEdgePad), and cover every S70 resource key',()=>{
  assert.equal(navEdgePad(390,844),0,'portrait docks flush to the corner');
  assert.equal(navEdgePad(844,390),WORLD_HUD.navEdgeInsetLandscapePx,'landscape keeps the camera-notch inset');
  // the right cluster's render order (TopBarRightCluster.js) — personnel
  // first, then every CORE_RESOURCES key, gold last nearest the edge.
  const order=['personnel',...WORLD_HUD.topBar.resourceKeys,'gold'];
  assert.deepEqual(order,['personnel','money','oil','steel','gold']);
});
