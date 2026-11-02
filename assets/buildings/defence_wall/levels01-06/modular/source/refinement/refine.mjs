/** Refine the existing modular perimeter without changing runtime asset names or sockets. */
import fs from 'node:fs';
import { Vector3,Float32BufferAttribute } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { readGlb,geometry,components,GlbWriter } from '../../../../../hq/levels01-06/source/refinement/GlbEdit.mjs';
import { pillow,tint } from '../../../../../hq/levels01-06/source/refinement/Shapes.mjs';
import { bakeLighting } from '../../../../../hq/levels01-06/source/refinement/Lighting.mjs';
import { fittings,obstacle,wire,soilMounds } from './Details.mjs';
const here=new URL('.',import.meta.url),root=new URL('../../',here),manifest=[];
for(const filename of fs.readdirSync(new URL('original/',here)).filter(n=>n.endsWith('.glb'))){
 if(filename.startsWith('pine_'))continue;
 const name=filename.slice(0,-4),input=readGlb(new URL('original/'+filename,here)),writer=new GlbWriter(),parts=[];
 writer.copyMaterials(input);
 const mat=name=>{let id=writer.doc.materials.findIndex(m=>m.name===name);if(id<0){id=writer.doc.materials.length;writer.doc.materials.push({name,pbrMetallicRoughness:{baseColorFactor:[.1,.1,.1,1],roughnessFactor:1,metallicFactor:0}});}return id;};
 const add=(g,material)=>{if(!g.index)g.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));if(!g.attributes.uv)g.setAttribute('uv',new Float32BufferAttribute(new Float32Array(g.attributes.position.count*2),2));parts.push({g,material});};
 if(name==='hedgehog')obstacle(add,mat);
 else if(name==='barbed_wire')wire(add,mat);

 else for(const mesh of input.doc.meshes)for(const p of mesh.primitives){
  const label=input.doc.materials[p.material].name;
  if(name==='trench_revetment'&&label==='Earth revetment')continue;
  for(let [i,g]of components(geometry(input,p)).entries()){
   const size=g.boundingBox.getSize(new Vector3()),c=g.boundingBox.getCenter(new Vector3());
   // Remove oversized artificial grain grooves; photographed grain provides the surface detail.
   if(label==='Dark endgrain'&&Math.min(size.x,size.y,size.z)<.012&&size.length()>.15)continue;
   if(label==='Olive canvas'){
    g=pillow(i,12,7);g.computeBoundingBox();const raw=g.boundingBox.getSize(new Vector3());
    g.scale(size.x/raw.x,size.y/raw.y,size.z/raw.z);g.computeBoundingBox();g.translate(...c.clone().sub(g.boundingBox.getCenter(new Vector3())).toArray());
   }
   if(name==='trench_revetment')g.scale(1,1.05,1).translate(0,-.245,0);
   if(name==='trench_bridge')g.translate(0,-.175,0);
   add(tint(g,.95+.035*Math.sin(i*7.1)),p.material);
  }
 }
 if(name==='trench_revetment')soilMounds(add,mat);
 fittings(name,add,mat);bakeLighting(parts);
 const groups=new Map();for(const {g,material}of parts){if(!groups.has(material))groups.set(material,[]);groups.get(material).push(g);}
 let triangles=0;for(const [material,list]of groups){const g=mergeGeometries(list,false);triangles+=g.index.count/3;writer.mesh(g,material,writer.doc.materials[material].name);}
 writer.doc.asset.extras={defenceRefinement:1,source:'Node/Three',socketScale:'existing grid cells'};writer.write(new URL(filename,root));
 manifest.push({file:filename,triangles,draws:groups.size});console.log(filename,triangles);
}
fs.writeFileSync(new URL('refinement_manifest.json',root),JSON.stringify({assets:manifest,status:'awaiting visual verification'},null,2));
// A small timber checkpoint marker/hooded lamp, reused on both sides of the gate apron.
{
 const writer=new GlbWriter();writer.doc.materials=[
  {name:'Weathered timber',pbrMetallicRoughness:{baseColorFactor:[.2,.15,.1,1],roughnessFactor:1,metallicFactor:0}},
  {name:'Oxidized dark steel',pbrMetallicRoughness:{baseColorFactor:[.02,.02,.02,1],roughnessFactor:1,metallicFactor:0}},
  {name:'Porcelain insulators',pbrMetallicRoughness:{baseColorFactor:[.3,.29,.22,1],roughnessFactor:.8,metallicFactor:0}}];
 const {box,rod}=await import('../../../../../hq/levels01-06/source/refinement/Shapes.mjs');
 const parts=[{g:box([.09,.82,.09],[0,.41,0],.008),material:0},
  {g:box([.022,.17,.21],[.055,.58,0],.005),material:1},
  {g:box([.14,.025,.14],[0,.85,0],.005),material:1},
  {g:rod([0,.85,0],[0,.93,0],.040,10),material:2},
  {g:box([.16,.035,.16],[0,.947,0],.006),material:1}];
 for(const {g}of parts)if(!g.index)g.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));
 bakeLighting(parts);
 for(let i=0;i<3;i++){const list=parts.filter(p=>p.material===i).map(p=>p.g);writer.mesh(mergeGeometries(list,false),i,writer.doc.materials[i].name);}
 writer.write(new URL('gate_marker.glb',root));
}
