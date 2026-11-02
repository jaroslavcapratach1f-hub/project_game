/** Keep the three existing crown layouts; replace solid lobes with fine radial needle sprays. */
import fs from 'node:fs';
import { Vector3,BufferGeometry,Float32BufferAttribute } from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { readGlb,geometry,components,GlbWriter } from '../../../../../hq/levels01-06/source/refinement/GlbEdit.mjs';
import { tint } from '../../../../../hq/levels01-06/source/refinement/Shapes.mjs';
function spray(bounds,seed){
 const c=bounds.getCenter(new Vector3()),s=bounds.getSize(new Vector3());
 const angle=Math.atan2(c.z,c.x)+Math.sin(seed*7.2)*.3,axis=new Vector3(Math.cos(angle),-.12,Math.sin(angle)).normalize();
 const side=new Vector3(-axis.z,0,axis.x).normalize(),up=new Vector3().crossVectors(axis,side).normalize();
 const len=Math.max(s.x,s.z),radius=Math.min(s.x,s.z)*.55,verts=[],uv=[],indices=[],colors=[];
 for(let row=0;row<7;row++)for(let ring=0;ring<7;ring++){
  const t=(row+.25)/7,a=ring*Math.PI*2/7+row*.71+seed;
  const radial=side.clone().multiplyScalar(Math.cos(a)).addScaledVector(up,Math.sin(a));
  const start=c.clone().addScaledVector(axis,(t-.5)*len*.88);
  const reach=radius*(.72+.28*Math.sin(t*Math.PI))*(.83+.17*Math.sin(seed+row*4+ring));
  const tip=start.clone().addScaledVector(radial,reach).addScaledVector(axis,len*.12);
  const mid=start.clone().lerp(tip,.44),width=new Vector3().crossVectors(tip.clone().sub(start),axis).normalize().multiplyScalar(.027);
  const base=verts.length/3;
  for(const p of [start,mid.clone().add(width),tip,mid.clone().sub(width)]){verts.push(...p.toArray());uv.push(p.x*2+p.y*.3,p.z*2+p.y);const shade=.74+.20*Math.sin(row*7+ring+seed);colors.push(shade,shade,shade);}
  indices.push(base,base+1,base+2,base,base+2,base+3);
 }
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(verts,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setAttribute('color',new Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
const here=new URL('.',import.meta.url),root=new URL('../../',here),report=[];
for(const [index,name]of ['pine_a','pine_b','pine_c'].entries()){
 const input=readGlb(new URL('original/'+name+'.glb',here)),writer=new GlbWriter();writer.copyMaterials(input);let triangles=0;
 for(const mesh of input.doc.meshes)for(const p of mesh.primitives){
  const name=input.doc.materials[p.material].name,foliage=name.includes('pine')||name.includes('Pine');
  const parts=components(geometry(input,p)).map((g,i)=>foliage?spray(g.boundingBox,i+index*41):tint(g,.90));
  const g=mergeGeometries(parts,false);writer.doc.materials[p.material].doubleSided=foliage;triangles+=g.index.count/3;writer.mesh(g,p.material,name);
 }
 writer.doc.asset.extras={defenceRefinement:1,foliage:'individual tapered opaque needles; existing crown layout'};writer.write(new URL(name+'.glb',root));report.push({name,triangles});
}
fs.writeFileSync(new URL('tree_refinement_manifest.json',root),JSON.stringify(report,null,2));console.log(report);
