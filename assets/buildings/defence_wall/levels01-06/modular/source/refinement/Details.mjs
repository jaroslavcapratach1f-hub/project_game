/** Geometry details in existing grid-cell units; sockets and pivots stay unchanged. */
import { Vector3,Quaternion,BufferGeometry,Float32BufferAttribute,SphereGeometry } from 'three';
import { box,rod } from '../../../../../hq/levels01-06/source/refinement/Shapes.mjs';
export function fittings(name,add,mat){
 const steel=mat('Oxidized dark steel'),wood=mat('Weathered timber');
 if(name==='watchtower'){
  for(const x of [-.66,.66])for(const z of [-.66,.66]){
   add(box([.064,.96,.064],[x,2.62,z],.007),wood);
   add(rod([x-.037,2.32,z],[x+.037,2.32,z],.014,8),steel);
  }
  for(const z of [-.8,.8])for(const x of [-1,1])add(rod([0,3.27,z],[x*.97,2.96,z],.025,8),wood);
 }
 if(name==='gate'){
  for(const z of [-1.32,1.32])for(const y of [.25,1.02]){
   add(box([.026,.055,.28],[.102,y,z],.004),steel);
   for(const dz of [-.09,.09])add(rod([.10,y,z+dz],[.125,y,z+dz],.013,8),steel);
  }
  add(box([.037,.06,.31],[.125,.70,0],.005),steel);
  for(const z of [-.12,.12])add(rod([.12,.6,z],[.12,.69,z],.012,8),steel);
 }
}
export function obstacle(add,mat){
 const steel=mat('Oxidized dark steel');
 // Three mutually perpendicular axes, each tilted upward from its own ground contact.
 const axes=[[Math.SQRT1_2,1/Math.sqrt(3),1/Math.sqrt(6)],[-Math.SQRT1_2,1/Math.sqrt(3),1/Math.sqrt(6)],[0,1/Math.sqrt(3),-Math.sqrt(2/3)]];
 for(const axis of axes){
  const a=axis.map((v,i)=>(i===1?.35:0)-v*.52),b=axis.map((v,i)=>(i===1?.35:0)+v*.52);
  const start=new Vector3(...a),end=new Vector3(...b),delta=end.clone().sub(start),length=delta.length();
  const q=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),delta.normalize()),mid=start.add(end).multiplyScalar(.5);
  const pieces=[];
  for(const [size,p]of [[[.016,length,.080],[0,0,0]],[[.105,length,.016],[0,0,-.048]],[[.105,length,.016],[0,0,.048]]]){
   const g=box(size,p,.003);g.applyQuaternion(q).translate(...mid.toArray());g.computeBoundingBox();pieces.push(g);
  }
  const floor=Math.min(...pieces.map(g=>g.boundingBox.min.y));
  for(const g of pieces){g.translate(0,-floor,0);add(g,steel);}
 }
 for(const x of [-.04,.04])add(rod([x,.35,-.065],[x,.35,.065],.017,8),steel);
}
export function wire(add,mat){
 const steel=mat('Oxidized dark steel'),steps=32;
 for(const phase of [0,Math.PI])for(let i=0;i<steps;i++){
  const at=t=>[.003*Math.cos(t*Math.PI*24+phase),.35-.045*Math.sin(t*Math.PI)+.003*Math.sin(t*Math.PI*24+phase),t-.5];
  add(rod(at(i/steps),at((i+1)/steps),.003,5),steel);
 }
 for(let i=0;i<7;i++){
  const z=-.4+i*.13,y=.35-.045*Math.cos(z*Math.PI);
  add(rod([-.024,y-.019,z-.009],[.024,y+.019,z+.009],.0027,5),steel);
  add(rod([-.020,y+.02,z+.012],[.020,y-.020,z-.012],.0027,5),steel);
 }
}
export function revetment(add,mat){
 const earth=mat('Earth revetment'),wood=mat('Weathered timber'),steel=mat('Oxidized dark steel');
 const profile=[[0,-.245],[.02,-.245],[.034,.009],[.115,.034],[.25,.014],[.40,-.004]],p=[],uv=[],indices=[];
 for(let i=0;i<=4;i++)for(let j=0;j<profile.length;j++){
  const [z,y]=profile[j],x=-.201+i*.1005;
  p.push(x,y+(j>1&&j<5?.007*Math.sin(i*2.7+j):0),z);uv.push(x*2,z*3);
 }
 for(let i=0;i<4;i++)for(let j=0;j<profile.length-1;j++){const a=i*profile.length+j,b=a+profile.length;indices.push(a,a+1,b,a+1,b+1,b);}
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(p,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();add(g,earth);
 for(const y of [-.185,-.103,-.024])add(box([.402,.072,.025],[0,y,.014],.005),wood);
 for(const x of [-.16,.16]){
  add(box([.026,.252,.026],[x,-.116,.017],.004),wood);
  for(const y of [-.18,-.025])add(rod([x,y,-.002],[x,y,-.007],.006,6),steel);
 }
}

/** Soft compacted-earth shoulders; organic domes instead of bevelled block clods. */
export function soilMounds(add,mat){
 const earth=mat('Earth revetment');
 // Compacted earth behind the retaining boards closes the gaps between stakes.
 add(box([.402,.25,.08],[0,-.12,.055],.006),earth);
 for(let i=0;i<3;i++){
  const g=new SphereGeometry(1,14,8),p=g.attributes.position;
  for(let j=0;j<p.count;j++){
   const x=p.getX(j),y=p.getY(j),z=p.getZ(j);
   const shape=1+.035*Math.sin(x*7+z*9+i*2);
   p.setXYZ(j,-.145+i*.145+x*.12*shape,-.030+y*.072,.14+z*.18*shape);
  }
  g.computeVertexNormals();add(g,earth);
 }
}
