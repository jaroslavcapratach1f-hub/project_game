/** Rebuild the SAME runtime HQ directly from its authored structure, using Node/Three. */
import fs from 'node:fs';
import { BufferAttribute, Box3, Vector3, Matrix4, Float32BufferAttribute } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { readGlb,geometry,components,GlbWriter } from './GlbEdit.mjs';
import { refineMaterials } from './Textures.mjs';
import { refineComponent } from './Architecture.mjs';
import { addPosts,detailedGuard,POSTS } from './Posts.mjs';
import { pose,rod } from './Shapes.mjs';
import { addCourtyard,yardGround } from './Courtyard.mjs';
import { bakeLighting,groundShadow } from './Lighting.mjs';
const here=new URL('.',import.meta.url),root=new URL('../../../../../../',here),out=new URL('../../timber_headquarters.glb',here);
const input=readGlb(new URL('structure.glb',here)),writer=new GlbWriter(),parts=[],originalBounds=new Box3();
writer.copyMaterials(input);const roof=refineMaterials(writer);
const glass=writer.doc.materials.length;writer.doc.materials.push({name:'Recessed dark window glass',pbrMetallicRoughness:{baseColorFactor:[.018,.028,.030,1],metallicFactor:0,roughnessFactor:.48}});
const material=name=>writer.doc.materials.findIndex(m=>m.name===name);
const normalize=g=>{if(!g.index)g.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));if(!g.attributes.uv)g.setAttribute('uv',new Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));return g;};
const add=(g,mat,name)=>parts.push({g:normalize(g),material:mat,name});
let count=0;
for(const mesh of input.doc.meshes)for(const p of mesh.primitives){
 const base=geometry(input,p);base.computeBoundingBox();originalBounds.union(base.boundingBox);
 const name=input.doc.materials[p.material].name;
 if(name.startsWith('Guard ')||name==='Olive canvas')continue;
 for(const component of components(base)){
   const result=refineComponent(component,name,roof,count++);if(result){const sz=component.boundingBox.getSize(new Vector3()),c=component.boundingBox.getCenter(new Vector3());const pane=name==='Military green cases'&&c.y>.4&&c.y<2&&Math.abs(c.x)<2.8&&c.z<.7&&Math.min(sz.x,sz.z)<.055&&Math.max(sz.x,sz.z)>.23;add(result.g,result.roof?roof:pane?glass:p.material,name);}
 }
}
console.log('Retained refined structural components',parts.length);
const gunMetal=writer.doc.materials.length;writer.doc.materials.push({name:'Parkerized field gun steel',pbrMetallicRoughness:{baseColorFactor:[.009,.011,.012,1],metallicFactor:.32,roughnessFactor:.82}});
addPosts(add,{sand:material('Olive canvas'),metal:gunMetal,wood:material('Dark endgrain'),green:material('Military green cases'),brass:material('Timber worn edges')});
const {source,g:guard}=await detailedGuard(new URL('assets/units/us_infantry/tier01/soldier.glb',root));
const guardMat=writer.copyMaterials(source);writer.doc.materials[guardMat].name='HQ shared textured field guard';writer.doc.materials[guardMat].pbrMetallicRoughness.baseColorFactor=[.53,.53,.49,1];writer.doc.materials[guardMat].pbrMetallicRoughness.roughnessFactor=.94;writer.doc.materials[guardMat].pbrMetallicRoughness.metallicFactor=0;
for(const post of POSTS)add(pose(guard.clone(),post.p,post.yaw),guardMat,'Stationary detailed gunner');
// Match the 28px existing infantry height under the unchanged 7x8 building fit.
const raw=originalBounds.getSize(new Vector3()),fit=(8*42/Math.SQRT2/raw.x+7*42/Math.SQRT2/raw.z)/2;
const scale=(28/Math.SQRT2)/(.8*fit),rear=originalBounds.min.z;
console.log('Scale reference',{soldierMetres:1.78,authoredScale:scale,fieldHeightScene:28/Math.SQRT2});
for(const part of parts){
 part.g.computeBoundingBox();const c=part.g.boundingBox.getCenter(new Vector3());
 let anchor=new Vector3(0,0,rear);
 const propRoots=[[-3.18,.65],[-3.16,1.18],[3.18,-.15],[3.20,.40],[-1.3,1.58],[1.45,1.72],[3.23,-1.15],[3.20,-.75],[-3.20,1.85],[-2.85,1.85],[-1.5,2.1],[1.45,2.15],[2.98,1.65],[-2.95,-1.38]];
 const size=part.g.boundingBox.getSize(new Vector3());
 const prop=propRoots.find(([x,z])=>Math.abs(c.x-x)<.255&&Math.abs(c.z-z)<.25&&c.y<.95&&size.x<.6&&size.z<.6);
 if(prop)anchor=new Vector3(prop[0],0,prop[1]);
 else
 if(c.z>1.72&&Math.abs(c.x)>1.12&&Math.abs(c.x)<2.95)anchor=new Vector3(Math.sign(c.x)*2.05,.065,2.85);
 else if(c.x< -2.65&&c.z< -1.35)anchor=new Vector3(-2.95,0,-1.7);
 part.g.translate(-anchor.x,-anchor.y,-anchor.z).scale(scale,scale,scale).translate(anchor.x,anchor.y,anchor.z);
 if(!prop&&anchor.z===2.85)part.g.translate(0,0,-.50);
}
// Anchor a taut aerial to the final mast positions, not independently scaled cable segments.
add(rod([-2.95,3.55*scale,-1.7],[0,3.52*scale,rear+(-1.9-rear)*scale],.004,8),material('Oxidized dark steel'),'Straight HQ roof aerial');
addCourtyard(add,writer,material);
console.log('Baking contact/occlusion into vertex colors',parts.length);
for(const {g} of parts)if(![...g.attributes.position.array].every(Number.isFinite))throw Error('Non-finite geometry before bake');
const bvh=bakeLighting(parts),shadow=groundShadow(writer,bvh,originalBounds);
const groups=new Map();for(const part of parts){if(!groups.has(part.material))groups.set(part.material,[]);groups.get(part.material).push(part.g);}
let triangles=0;
for(const [mat,geometries] of groups){
 const g=mergeGeometries(geometries,false);if(!g)throw Error('Incompatible material geometry '+mat);triangles+=g.index.count/3;writer.mesh(g,mat,writer.doc.materials[mat].name);
}
const ground=yardGround(writer,originalBounds);writer.mesh(ground.g,ground.material,'Command-yard worn paths');
writer.mesh(shadow.g,shadow.material,'Baked daylight contact shadow');
writer.doc.asset.extras={hqRefinement:1,guards:4,machineGuns:4,soldierMetres:1.78,fieldTroopScaleMatched:true,authoredScale:scale};
writer.write(out);
const manifest=JSON.parse(fs.readFileSync(new URL('../../timber_headquarters_manifest.json',here)));
delete manifest.mainHouseScale;delete manifest.balconyDeckHeight;delete manifest.upperWindowSill;
Object.assign(manifest,{units:'authored coordinates fitted to the existing 7x8 plot',authoredScale:scale,courtyard:'dispatch shelter, supply pallet, distributed stores, low bag edging and worn ground',roofAerial:'single taut span between final mast anchors',triangles,guards:4,fixedMachineGuns:4,guardIdentity:'shared unmarked textured field guard, derived from existing infantry',refinement:'source/refinement/refine.mjs; Node/Three only',soldierHeightMetres:1.78,scaleMatchedToFieldInfantry:true,materials:'packed wood/fabric PBR maps and static AO/daylight contact shading',status:'refined; visual verification pending'});
fs.writeFileSync(new URL('../../timber_headquarters_manifest.json',here),JSON.stringify(manifest,null,2));console.log('HQ_REFINED',{triangles,draws:groups.size+1,bytes:fs.statSync(out).size});
