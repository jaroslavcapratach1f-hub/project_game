/** Static contact and directional shading. Baked once; no live shadow map cost. */
import { Vector3, Float32BufferAttribute, PlaneGeometry } from 'three';
import { png } from './Textures.mjs';
const sun=new Vector3(.406,.707,.579).normalize();
function bounds(tris){const min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity];for(const t of tris)for(let j=0;j<9;j++){const k=j%3;min[k]=Math.min(min[k],t[j]);max[k]=Math.max(max[k],t[j]);}return {min,max};}
function tree(tris,depth=0){const b=bounds(tris);if(tris.length<20)return {...b,tris};const spans=b.max.map((v,i)=>v-b.min[i]),axis=spans.indexOf(Math.max(...spans));tris.sort((a,b)=>(a[axis]+a[axis+3]+a[axis+6])-(b[axis]+b[axis+3]+b[axis+6]));const mid=tris.length>>1;return {...b,left:tree(tris.slice(0,mid),depth+1),right:tree(tris.slice(mid),depth+1)};}
function hitBox(n,o,d,limit){let lo=0,hi=limit;for(let i=0;i<3;i++){let a=(n.min[i]-o[i])/d[i],b=(n.max[i]-o[i])/d[i];if(a>b)[a,b]=[b,a];lo=Math.max(lo,a);hi=Math.min(hi,b);if(hi<lo)return false;}return true;}
function triangle(t,o,d,limit){const ax=t[3]-t[0],ay=t[4]-t[1],az=t[5]-t[2],bx=t[6]-t[0],by=t[7]-t[1],bz=t[8]-t[2];const px=d[1]*bz-d[2]*by,py=d[2]*bx-d[0]*bz,pz=d[0]*by-d[1]*bx,det=ax*px+ay*py+az*pz;if(Math.abs(det)<1e-9)return false;const inv=1/det,tx=o[0]-t[0],ty=o[1]-t[1],tz=o[2]-t[2],u=(tx*px+ty*py+tz*pz)*inv;if(u<0||u>1)return false;const qx=ty*az-tz*ay,qy=tz*ax-tx*az,qz=tx*ay-ty*ax,v=(d[0]*qx+d[1]*qy+d[2]*qz)*inv;if(v<0||u+v>1)return false;const distance=(bx*qx+by*qy+bz*qz)*inv;return distance>.003&&distance<limit;}
function hit(n,o,d,limit){if(!hitBox(n,o,d,limit))return false;if(n.tris)return n.tris.some(t=>triangle(t,o,d,limit));return hit(n.left,o,d,limit)||hit(n.right,o,d,limit);}
export function bakeLighting(parts){
 const tris=[];for(const {g}of parts){const p=g.attributes.position,idx=g.index?.array;if(!idx)continue;for(let i=0;i<idx.length;i+=3){const t=[];for(let j=0;j<3;j++){const v=idx[i+j];t.push(p.getX(v),p.getY(v),p.getZ(v));}tris.push(t);}}
 const bvh=tree(tris),cache=new Map(),directions=[[.58,.58,.58],[-.58,.58,.58],[.58,.58,-.58],[-.58,.58,-.58],[0,1,.001]];
 for(const {g}of parts){const p=g.attributes.position,n=g.attributes.normal,old=g.attributes.color,a=new Float32Array(p.count*3);
  for(let i=0;i<p.count;i++){
   const o=[p.getX(i)+n.getX(i)*.004,p.getY(i)+n.getY(i)*.004,p.getZ(i)+n.getZ(i)*.004],key=o.map(v=>Math.round(v*350)).join(',');let shade=cache.get(key);
   if(shade===undefined){let blocked=0,total=0;for(const d of directions){if(d[0]*n.getX(i)+d[1]*n.getY(i)+d[2]*n.getZ(i)<-.1)continue;total++;if(hit(bvh,o,d,.22))blocked++;}shade=1-.26*blocked/Math.max(1,total);if(hit(bvh,o,sun.toArray(),5))shade*=.82;cache.set(key,shade);}
   for(let k=0;k<3;k++)a[i*3+k]=shade*(old?old.array[i*3+k]:1);
  }g.setAttribute('color',new Float32BufferAttribute(a,3));
 }
 return bvh;
}
export function groundShadow(writer,bvh,box){
 const size=192,w=box.max.x-box.min.x,d=box.max.z-box.min.z,alpha=new Float32Array(size*size);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const pos=[box.min.x+x/(size-1)*w,.015,box.min.z+y/(size-1)*d];let value=0;
  if(hit(bvh,pos,sun.toArray(),6))value=.19;if(hit(bvh,pos,[.001,1,.001],.8))value+=.22;alpha[y*size+x]=value;
 }
 const pixels=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  let sum=0,count=0;for(let oy=-2;oy<=2;oy++)for(let ox=-2;ox<=2;ox++){const xx=x+ox,yy=y+oy;if(xx<0||xx>=size||yy<0||yy>=size)continue;sum+=alpha[yy*size+xx];count++;}
  const p=(y*size+x)*4;pixels.set([20,19,15,Math.round(sum/count*255*Math.min(1,x/4,y/4,(size-1-x)/4,(size-1-y)/4))],p);
 }
 const tex=writer.image(png(size,size,pixels),'HQ soft baked contact shadows'),material=writer.doc.materials.length;
 writer.doc.extensionsUsed=['KHR_materials_unlit'];writer.doc.materials.push({name:'HQ baked ground contact',pbrMetallicRoughness:{baseColorTexture:{index:tex}},alphaMode:'BLEND',doubleSided:true,extensions:{KHR_materials_unlit:{}}});
 const g=new PlaneGeometry(w,d);g.rotateX(-Math.PI/2);for(let i=0;i<g.attributes.uv.count;i++)g.attributes.uv.setY(i,1-g.attributes.uv.getY(i));g.translate((box.min.x+box.max.x)/2,.001,(box.min.z+box.max.z)/2);return {g,material};
}
