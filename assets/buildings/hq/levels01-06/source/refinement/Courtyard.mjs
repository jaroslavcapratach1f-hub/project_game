/** Command-yard dressing: clear routes, practical shelter and grouped dispatch equipment. */
import { BufferGeometry, Float32BufferAttribute, PlaneGeometry, Vector3 } from 'three';
import { box,rod } from './Shapes.mjs';
import { png,surface } from './Textures.mjs';
import { addSupplyDressing } from './SupplyDressing.mjs';
import { addYardDressing } from './YardDressing.mjs';
export function addCourtyard(add,writer,material){
 const timber=material('Weathered timber'),metal=material('Oxidized dark steel'),green=material('Military green cases');
 const cloth=surface(writer,'Weathered field canvas',[112,117,78],'cloth'),normalTexture=cloth.normalTexture;delete cloth.normalTexture;
 const canvasMat=writer.doc.materials.length;writer.doc.materials.push({name:'Command dispatch canvas',pbrMetallicRoughness:{...cloth,baseColorFactor:[.25,.25,.25,1],metallicFactor:0,roughnessFactor:.95},normalTexture,doubleSided:true});
 addSupplyDressing(add,material,canvasMat);
 addYardDressing(add,material);
 // One low, open canvas lean-to beside the right wing; no new building or gameplay role.
 const x0=1.10,x1=2.12,z0=.25,z1=1.22,verts=[],uv=[],indices=[],steps=12;
 for(let z=0;z<=steps;z++)for(let x=0;x<=steps;x++){
  const u=x/steps,v=z/steps,px=x0+(x1-x0)*u,pz=z0+(z1-z0)*v;
  const y=.91-.10*u-.06*Math.sin(u*Math.PI)+.014*Math.sin(v*Math.PI*5)*Math.sin(u*Math.PI);
  verts.push(px,y,pz);uv.push(u,v);
 }
 for(let z=0;z<steps;z++)for(let x=0;x<steps;x++){const a=z*(steps+1)+x,b=a+steps+1;indices.push(a,b,a+1,a+1,b,b+1);}
 const clothGeometry=new BufferGeometry();clothGeometry.setAttribute('position',new Float32BufferAttribute(verts,3));clothGeometry.setAttribute('uv',new Float32BufferAttribute(uv,2));clothGeometry.setIndex(indices);clothGeometry.computeVertexNormals();add(clothGeometry,canvasMat,'Open command dispatch canopy');
 for(const x of [x0,x1])for(const z of [z0,z1])add(rod([x,0,z],[x,x===x0?.91:.81,z],.014,10),timber,'Canopy support');
 for(const x of [x0,x1])add(rod([x,x===x0?.91:.81,z0],[x,x===x0?.91:.81,z1],.014,10),timber,'Canopy ridge tie');
 for(const z of [z0,z1])add(rod([x1,.76,z],[x1+.20,.015,z+(z===z0?-.12:.12)],.002,6),metal,'Shelter tension rope');
 // A compact dispatch desk with a field telephone and document case, not a freestanding map board.
 add(box([.56,.028,.27],[1.60,.37,.65]),timber,'Command dispatch desk');
 for(const x of [1.37,1.83])for(const z of [.55,.75])add(box([.025,.36,.025],[x,.18,z]),timber,'Desk leg');
 add(box([.095,.055,.065],[1.48,.411,.65],.005),green,'Field telephone');
 add(rod([1.44,.446,.65],[1.52,.446,.65],.010,8),metal,'Telephone handset');
 add(box([.15,.033,.11],[1.72,.407,.67],.004),green,'Closed dispatch document case');
 // Continue the existing centre approach with narrow, worn duckboards; leave the flanking routes open.
 for(let i=0;i<9;i++){const z=.68+i*.145;add(box([.64,.025,.11],[.008*Math.sin(i),.024,z],.003),timber,'HQ approach duckboard');}
}
export function yardGround(writer,bounds){
 const size=256,w=bounds.max.x-bounds.min.x,d=bounds.max.z-bounds.min.z,pixels=new Uint8Array(size*size*4);
 const paths=[[[0,.55],[0,2.12],.34],[[0,1.40],[-2.05,2.35],.27],[[0,1.40],[2.05,2.35],.27],[[.2,.75],[1.7,.75],.35],[[0,1.05],[-1.5,1.05],.35]];
 const distance=(x,z,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);};
 for(let row=0;row<size;row++)for(let col=0;col<size;col++){
  const x=bounds.min.x+col/(size-1)*w,z=bounds.min.z+row/(size-1)*d,n=(Math.sin(col*12.71+row*38.19)*43758.55)%1;let a=0;
  for(const [start,end,r]of paths)a=Math.max(a,Math.max(0,1-distance(x,z,start,end)/(r+.018*n)));
  const edge=Math.min((x-bounds.min.x)/.40,(bounds.max.x-x)/.40,(z-bounds.min.z)/.40,(bounds.max.z-z)/.40);
  const coverage=Math.max(0,Math.min(1,edge+.10*Math.sin(x*17+z*9)));
  const wear=.5+.5*Math.sin(x*5.1+z*2)*Math.sin(z*8.2-x);
  // Preserve grass across the plot; dirt is concentrated on the actual footpaths.
  const alpha=coverage*(10+wear*8+Math.pow(a,1.1)*65);
  const p=(row*size+col)*4;pixels.set([Math.round(128+n*6),Math.round(116+n*5),Math.round(87+n*4),Math.round(alpha)],p);
 }
 const tex=writer.image(png(size,size,pixels),'Worn HQ pedestrian routes'),mat=writer.doc.materials.length;
 writer.doc.materials.push({name:'HQ worn approach soil',pbrMetallicRoughness:{baseColorTexture:{index:tex}},alphaMode:'BLEND',extensions:{KHR_materials_unlit:{}}});
 const g=new PlaneGeometry(w,d);g.rotateX(-Math.PI/2);for(let i=0;i<g.attributes.uv.count;i++)g.attributes.uv.setY(i,1-g.attributes.uv.getY(i));g.translate((bounds.min.x+bounds.max.x)/2,.0005,(bounds.min.z+bounds.max.z)/2);return {g,material:mat};
}
