/** Compact supply staging opposite the dispatch shelter; all pieces are decorative. */
import { BufferGeometry,Float32BufferAttribute } from 'three';
import { box,rod,pillow,tint } from './Shapes.mjs';
export function addSupplyDressing(add,material,canvas){
 const wood=material('Weathered timber'),edge=material('Timber worn edges');
 const metal=material('Oxidized dark steel'),green=material('Military green cases');
 const sand=material('Olive canvas'),x=-1.43,z=.83;
 // A low slatted pallet keeps the stores above wet ground.
 for(const dx of [-.24,0,.24])add(box([.07,.045,.58],[x+dx,.032,z]),wood,'Supply pallet bearer');
 for(let i=0;i<6;i++)add(box([.70,.027,.077],[x,.068,z-.24+i*.096]),edge,'Supply pallet slat');
 for(const dx of [-.17,.17])for(const dz of [-.135,.135]){
  add(box([.31,.22,.245],[x+dx,.193,z+dz],.009),wood,'Packed command stores');
  for(const offset of [-.10,.10])add(box([.024,.23,.252],[x+dx+offset,.193,z+dz],.003),edge,'Cargo reinforcement');
 }
 // Continuous top and hanging skirts clear the highest wooden battens on every side.
 const verts=[],uv=[],indices=[],n=16;
 for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){
  const u=i/n,v=j/n,dx=(u-.5)*.71,dz=(v-.5)*.58;
  verts.push(x+dx,.34+.003*Math.sin(u*18+v*3),z+dz);uv.push(u,v);
 }
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){const a=j*(n+1)+i,b=a+n+1;indices.push(a,b,a+1,a+1,b,b+1);}
 const rim=[];
 for(let i=0;i<n;i++)rim.push(i);
 for(let j=0;j<n;j++)rim.push(j*(n+1)+n);
 for(let i=n;i>0;i--)rim.push(n*(n+1)+i);
 for(let j=n;j>0;j--)rim.push(j*(n+1));
 const skirt=verts.length/3;
 rim.forEach((id,k)=>{
  const dx=verts[id*3]-x,dz=verts[id*3+2]-z,fold=.003*Math.sin(k*1.7);
  verts.push(x+dx*1.055+Math.sign(dx)*fold,.125+.007*Math.sin(k*.75),z+dz*1.06+Math.sign(dz)*fold);
  uv.push(uv[id*2],uv[id*2+1]+.28);
 });
 for(let k=0;k<rim.length;k++){const next=(k+1)%rim.length;indices.push(rim[k],rim[next],skirt+k,rim[next],skirt+next,skirt+k);}
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(verts,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();add(g,canvas,'Continuous fitted supply tarpaulin');
 for(const [cx,cz,y]of [[-.92,1.15,.085],[-.72,.97,.085],[-.91,1.14,.245]]){
  add(box([.24,.145,.155],[cx,y,cz],.009),green,'Command equipment case');
  add(box([.248,.018,.16],[cx,y+.068,cz],.004),metal,'Case lid rim');
  add(rod([cx-.034,y+.087,cz],[cx+.034,y+.087,cz],.005,8),metal,'Case carrying handle');
 }
 // Low outside edging leaves the inner side open to the central footpath.
 for(let i=0;i<6;i++){
  const bag=tint(pillow(211+i),.92+.025*Math.sin(i));bag.scale(.78,.78,.78);bag.rotateY(Math.PI/2+.04*Math.sin(i));bag.translate(-1.92,.031,.35+i*.21);add(bag,sand,'Supply bay sandbag edging');
 }
}
