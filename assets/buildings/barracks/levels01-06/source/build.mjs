/** Barracks visual rebuild. Existing 4x4 footprint; Node/Three only. */
import fs from 'node:fs';
import { BufferGeometry, Float32BufferAttribute, PlaneGeometry, Box3, Vector3 } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { GlbWriter, readGlb, geometry } from '../../../hq/levels01-06/source/refinement/GlbEdit.mjs';
import { box, rod, pillow, tint } from '../../../hq/levels01-06/source/refinement/Shapes.mjs';
import { refineMaterials, png } from '../../../hq/levels01-06/source/refinement/Textures.mjs';
import { bakeLighting, groundShadow } from '../../../hq/levels01-06/source/refinement/Lighting.mjs';
const writer=new GlbWriter(),parts=[];
const names=['Weathered timber','Timber worn edges','Dark endgrain','Olive canvas','Oxidized dark steel'];
for(const name of names)writer.doc.materials.push({name,pbrMetallicRoughness:{baseColorFactor:[.3,.3,.3,1]}});
const roof=refineMaterials(writer);
const glass=writer.doc.materials.length;writer.doc.materials.push({name:'Recessed blue grey glass',pbrMetallicRoughness:{baseColorFactor:[.019,.031,.034,1],roughnessFactor:.42,metallicFactor:.12}});
const chalk=writer.doc.materials.length;writer.doc.materials.push({name:'Worn assembly chalk',pbrMetallicRoughness:{baseColorFactor:[.46,.43,.34,1],roughnessFactor:1}});
function add(g,material,name=''){if(!g.index)g.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));if(!g.attributes.color)tint(g,.93);parts.push({g,material,name});}
// A timber hut with actual lap-board joints, framed door/window recesses and foundation.
add(box([3.36,.075,1.14],[0,.05,-1.33]),2);
add(box([3.26,.70,1.04],[0,.43,-1.33]),2);
for(let row=0;row<10;row++){
 const y=.135+row*.067;
 for(const z of [-1.865,-.795])add(box([3.30,.061,.034],[0,y,z],.003),row%3===0?1:0);
 for(const x of [-1.65,1.65])add(box([.034,.061,1.08],[x,y,-1.33],.003),0);
}
for(const x of [-1.66,1.66])for(const z of [-1.87,-.79])add(box([.052,.75,.052],[x,.43,z]),1);
function windowAt(x){
 add(box([.40,.37,.037],[x,.48,-.762]),2);
 add(box([.32,.29,.022],[x,.48,-.738]),glass);
 for(const dx of [-.18,0,.18])add(box([.024,.35,.032],[x+dx,.48,-.718]),1);
 for(const dy of [-.17,0,.17])add(box([.38,.021,.032],[x,.48+dy,-.718]),1);
 add(box([.45,.028,.095],[x,.293,-.715]),1);
 for(const dx of [-.285,.285]){add(box([.15,.35,.025],[x+dx,.48,-.77]),0);for(let i=0;i<5;i++)add(box([.145,.015,.014],[x+dx,.35+i*.064,-.748]),2);}
}
windowAt(-.99);windowAt(.99);
add(box([.44,.62,.04],[0,.397,-.758]),2);
for(let i=0;i<6;i++)add(box([.057,.57,.026],[-.158+i*.063,.37,-.73]),0);
for(const x of [-.225,.225])add(box([.039,.64,.045],[x,.40,-.71]),1);
add(box([.49,.038,.05],[0,.718,-.71]),1);
add(rod([.13,.36,-.708],[.13,.41,-.708],.009,8),4);
// Low entrance stoop; access stays clear of all four assembly positions.
for(let i=0;i<3;i++)add(box([.63,.04,.15],[0,.10-i*.027,-.69+i*.13]),0);
// Pitched, thin roof with covered gables and individually spaced standing seams.
const rise=.38,run=.64,slope=Math.atan2(rise,run),length=Math.hypot(rise,run);
for(const side of [-1,1]){
 const g=box([3.55,.043,length],[0,0,0]);g.rotateX(side*slope);g.translate(0,.98,-1.33+side*run/2);add(g,roof);
 for(let x=-1.7;x<=1.71;x+=.14){const seam=box([.012,.017,length],[0,0,0]);seam.rotateX(side*slope);seam.translate(x,1.009,-1.33+side*run/2);add(seam,4);}
 add(rod([-1.78,.80,-1.33+side*run],[1.78,.80,-1.33+side*run],.022,8),2);
}
add(rod([-1.79,1.185,-1.33],[1.79,1.185,-1.33],.025,10),4);
for(const x of [-1.64,1.64]){
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute([x,.77,-1.91,x,.77,-.75,x,1.16,-1.33],3));g.setAttribute('uv',new Float32BufferAttribute([0,0,1,0,.5,1],2));g.setIndex(x<0?[0,2,1]:[0,1,2]);g.computeVertexNormals();add(g,0);
}
// Reference composition: compact rear building and a broad four-bay yard; no tower.
// These are newly authored parts; no geometry from the previous barracks is used.
for(const part of parts)part.g.scale(.66,1,1).translate(.48,0,0);
// Four marked troop bays; pale crosses and open corners like the reference yard.
for(const x of [-.86,.86])for(const z of [.05,1.23]){
 for(const yaw of [-Math.PI/4,Math.PI/4]){const g=box([.27,.004,.026],[0,0,0],.001);g.rotateY(yaw);g.translate(x,.011,z);add(g,chalk);}
 for(const sx of [-1,1])for(const sz of [-1,1]){
  add(box([.17,.003,.018],[x+sx*.49,.01,z+sz*.47],.001),chalk);
  add(box([.018,.003,.17],[x+sx*.565,.01,z+sz*.395],.001),chalk);
 }
}
for(const x of [-1.87,1.87])for(let i=0;i<5;i++){const g=pillow(i);g.scale(.74,.9,.9);g.rotateY(Math.PI/2+(i%2)*.04);g.translate(x,.04,-.3+i*.29);add(g,3);}
// Reuse the established perimeter crates and barrels, kept clear of troop bays.
for(const [name,pos,scale]of [['crate',[-1.85,0,-1.25],.48],['barrel',[1.83,0,-1.24],.50]]){
 const input=readGlb(new URL('../../../defence_wall/levels01-06/modular/'+name+'.glb',import.meta.url)),offset=writer.copyMaterials(input);
 for(const mesh of input.doc.meshes)for(const p of mesh.primitives){const g=geometry(input,p);g.scale(scale,scale,scale).translate(...pos);add(g,offset+p.material);}
}
console.log('Baking barracks',parts.length);const bvh=bakeLighting(parts);
for(const material of new Set(parts.map(p=>p.material))){const g=mergeGeometries(parts.filter(p=>p.material===material).map(p=>p.g));writer.mesh(g,material,writer.doc.materials[material].name);}
const bounds=new Box3(new Vector3(-2,0,-2),new Vector3(2,1.3,2));const shadow=groundShadow(writer,bvh,bounds);writer.mesh(shadow.g,shadow.material,'Baked barracks contact shadow');
// Feathered earth yard: no raised slab, concrete foundation or opaque grass patch.
const pixels=new Uint8Array(128*128*4);
for(let y=0;y<128;y++)for(let x=0;x<128;x++){const n=Math.sin(x*12.98+y*78.23)*43758.54,f=n-Math.floor(n),edge=Math.min(1,x/8,y/8,(127-x)/8,(127-y)/8);pixels.set([115+f*15,104+f*12,78+f*10,Math.round(edge*150)],(y*128+x)*4);}
const tex=writer.image(png(128,128,pixels),'Compacted assembly earth'),mat=writer.doc.materials.length;
writer.doc.materials.push({name:'Feathered dirt assembly yard',alphaMode:'BLEND',doubleSided:true,pbrMetallicRoughness:{baseColorTexture:{index:tex},roughnessFactor:1},extensions:{KHR_materials_unlit:{}}});
const yard=new PlaneGeometry(4,4);yard.rotateX(-Math.PI/2);yard.translate(0,-.003,0);writer.mesh(yard,mat,'4x4 yard footprint');
writer.doc.asset.extras={barracks:1,footprint:[4,4],assemblyBays:4,front:'+Z',pipeline:'Node/Three'};
writer.write(new URL('../reference_barracks.glb',import.meta.url));
fs.writeFileSync(new URL('../reference_barracks_manifest.json',import.meta.url),JSON.stringify({footprint:[4,4],bays:4,triangles:writer.doc.meshes.reduce((n,m)=>n+writer.doc.accessors[m.primitives[0].indices].count/3,0),source:'source/build.mjs',status:'awaiting gameplay visual verification'},null,2));
