/** Metre-based, reusable static gun positions within the original HQ layout. */
import { Matrix4, Vector3 } from 'three';
import { SimplifyModifier } from 'three/addons/modifiers/SimplifyModifier.js';
import { readGlb,geometry } from './GlbEdit.mjs';
import { machineGun } from './MachineGun.mjs';
import { box,rod,pillow,tint,pose } from './Shapes.mjs';
export const METRE=.8/1.78;
export const POSTS=[{p:[-1.85,1.28,-.70],yaw:-Math.PI/2,balcony:true},{p:[1.85,1.28,-.70],yaw:Math.PI/2,balcony:true},{p:[-2.05,.065,2.85],yaw:-.035},{p:[2.05,.065,2.85],yaw:.055}];
export function oldPostPart(center,size,material){
 if(material.startsWith('Guard ')||material==='Olive canvas')return true;
 return POSTS.some(post=>{
   const p=center.clone().sub(new Vector3(...post.p)).applyMatrix4(new Matrix4().makeRotationY(-post.yaw));
   // Old weapons, ledges and stitched lines only; retain surrounding building shells/decks.
   return size.length()<1.28&&p.y>-.01&&p.y<.70&&Math.abs(p.x)<.29&&p.z>-.01&&p.z<.95;
 });
}
export function addPosts(add,materials){
 POSTS.forEach((post,pi)=>{
  const radius=post.balcony?.55:.63,rows=6;
  for(let row=0;row<rows;row++){
   const count=post.balcony?7:10,start=post.balcony?-.015:-.25,span=post.balcony?Math.PI:Math.PI+.50;
   for(let i=0;i<count;i++){
    const angle=start+(i+.35+(row%2)*.42)*span/count,seed=pi*71+row*13+i;
    const r=radius+.009*Math.sin(seed*2.1),y=.045+row*.068+.002*Math.cos(seed);
    const g=pillow(seed);g.rotateY(Math.PI/2-angle+.035*Math.sin(seed));g.translate(r*Math.cos(angle),y,r*Math.sin(angle));
    add(pose(tint(g,.90+.06*Math.sin(seed)),post.p,post.yaw),materials.sand,'Sewn compressed sandbag');
   }
  }
  const parts=machineGun(materials);
  for(const [g,m]of parts)add(pose(g,post.p,post.yaw),m,'Fixed field machine gun');
 });
}
export async function detailedGuard(path){
 const source=readGlb(path),raw=geometry(source,source.doc.meshes[0].primitives[0]),p=raw.attributes.position;
 // Keep hands/stock, remove only the projecting rifle muzzle, replaced by the fixed gun jacket.
 const idx=raw.index.array,keep=[];
 for(let i=0;i<idx.length;i+=3){let cut=false;for(let j=0;j<3;j++){const v=idx[i+j];if(p.getZ(v)<-.285&&p.getY(v)>-.035)cut=true;}if(!cut)keep.push(idx[i],idx[i+1],idx[i+2]);}raw.setIndex(keep);
 for(let i=0;i<p.count;i++){
  let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
  if(x>.01&&y<-.30){const a=-.36*Math.min(1,(-.30-y)/.08),dy=y+.41,dz=z+.20;y=-.41+dy*Math.cos(a)-dz*Math.sin(a);z=-.20+dy*Math.sin(a)+dz*Math.cos(a);}
  const t=Math.max(0,Math.min(1,(-.16-y)/.22)),smooth=t*t*(3-2*t),side=Math.max(-1,Math.min(1,x/.025));
  z+=(side<0?-.25*(-side):.16*side)*smooth;
  if(y<-.40)y=-.500255+(y+.500255)*.65;
  // Level the held weapon and forearms without moving the head or cutting the torso.
  const arm=Math.max(0,Math.min(1,(-z-.035)/.13))*Math.max(0,Math.min(1,(y+.04)/.12))*Math.max(0,Math.min(1,(.25-y)/.10));
  y+=(-z-.035)*.27*arm;
  p.setXYZ(i,-x*.8,(y+.500255)*.8,-z*.8);
 }
 raw.computeVertexNormals();const g=await new SimplifyModifier().modify(raw,Math.floor(p.count*.43));g.computeBoundingBox();g.translate(0,-g.boundingBox.min.y,0);g.scale(.8/(g.boundingBox.max.y-g.boundingBox.min.y),.8/(g.boundingBox.max.y-g.boundingBox.min.y),.8/(g.boundingBox.max.y-g.boundingBox.min.y));
 return {source,g};
}
