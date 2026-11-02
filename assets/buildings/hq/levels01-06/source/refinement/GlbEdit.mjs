/** Direct GLB asset editing using the project's installed Three.js. No DCC dependency. */
import fs from 'node:fs';
import { BufferGeometry, BufferAttribute, Matrix4, Quaternion, Vector3 } from 'three';
export function readGlb(path) {
  const b=fs.readFileSync(path),size=b.readUInt32LE(12),doc=JSON.parse(b.subarray(20,20+size));
  return {doc,bin:b.subarray(28+size)};
}
const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4},types={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array};
export function attribute(file,id) {
  const a=file.doc.accessors[id],v=file.doc.bufferViews[a.bufferView],T=types[a.componentType],n=widths[a.type],out=new T(a.count*n);
  const offset=(v.byteOffset??0)+(a.byteOffset??0),stride=v.byteStride??n*T.BYTES_PER_ELEMENT;
  for(let i=0;i<a.count;i++)for(let j=0;j<n;j++){
    const p=offset+i*stride+j*T.BYTES_PER_ELEMENT;
    out[i*n+j]=a.componentType===5126?file.bin.readFloatLE(p):a.componentType===5125?file.bin.readUInt32LE(p):a.componentType===5123?file.bin.readUInt16LE(p):file.bin[p];
  }
  return new BufferAttribute(out,n,!!a.normalized);
}
export function geometry(file,primitive) {
  const g=new BufferGeometry(),names={POSITION:'position',NORMAL:'normal',TEXCOORD_0:'uv',COLOR_0:'color'};
  for(const [key,id] of Object.entries(primitive.attributes))if(names[key])g.setAttribute(names[key],attribute(file,id));
  if(primitive.indices!==undefined)g.setIndex(attribute(file,primitive.indices));
  if(!g.attributes.normal)g.computeVertexNormals();return g;
}
export function components(g) {
  const p=g.attributes.position,parent=Array.from({length:p.count},(_,i)=>i),points=new Map(),idx=g.index.array;
  const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;};
  const join=(a,b)=>{parent[find(a)]=find(b);};
  for(let i=0;i<p.count;i++){
    const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e5)).join(':');
    if(points.has(key))join(i,points.get(key));else points.set(key,i);
  }
  for(let i=0;i<idx.length;i+=3){join(idx[i],idx[i+1]);join(idx[i],idx[i+2]);}
  const groups=new Map();
  for(let i=0;i<idx.length;i+=3){const key=find(idx[i]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(idx[i],idx[i+1],idx[i+2]);}
  return [...groups.values()].map(ids=>subset(g,ids));
}
function subset(g,ids){
  const old=[...new Set(ids)],map=new Map(old.map((v,i)=>[v,i])),out=new BufferGeometry();
  for(const [name,a] of Object.entries(g.attributes)){
    const arr=new a.array.constructor(old.length*a.itemSize);
    old.forEach((v,i)=>{for(let k=0;k<a.itemSize;k++)arr[i*a.itemSize+k]=a.array[v*a.itemSize+k];});
    out.setAttribute(name,new BufferAttribute(arr,a.itemSize,a.normalized));
  }
  out.setIndex(ids.map(v=>map.get(v)));out.computeBoundingBox();return out;
}
export class GlbWriter {
  constructor(){this.doc={asset:{version:'2.0',generator:'Blitzmire direct HQ refinement'},scene:0,scenes:[{nodes:[]}],nodes:[],meshes:[],materials:[],textures:[],images:[],samplers:[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497}],accessors:[],bufferViews:[],buffers:[{byteLength:0}]};this.parts=[];this.bytes=0;}
  view(bytes){const buf=Buffer.from(bytes.buffer??bytes,bytes.byteOffset??0,bytes.byteLength??bytes.length),id=this.doc.bufferViews.length;this.doc.bufferViews.push({buffer:0,byteOffset:this.bytes,byteLength:buf.length});this.parts.push(buf);this.bytes+=buf.length;const pad=(4-this.bytes%4)%4;if(pad){this.parts.push(Buffer.alloc(pad));this.bytes+=pad;}return id;}
  image(bytes,name,mimeType='image/png'){const id=this.doc.images.length;this.doc.images.push({bufferView:this.view(bytes),mimeType,name});const t=this.doc.textures.length;this.doc.textures.push({source:id,sampler:0});return t;}
  copyMaterials(file){
    const textureMap=new Map();for(let i=0;i<(file.doc.textures?.length??0);i++){
      const img=file.doc.images[file.doc.textures[i].source],v=file.doc.bufferViews[img.bufferView];textureMap.set(i,this.image(file.bin.subarray(v.byteOffset??0,(v.byteOffset??0)+v.byteLength),img.name??'source texture'));
    }
    const first=this.doc.materials.length;
    for(const original of file.doc.materials){const mat=structuredClone(original);const remap=o=>{if(!o||typeof o!=='object')return;for(const [k,v]of Object.entries(o)){if(k.endsWith('Texture')&&v.index!==undefined)v.index=textureMap.get(v.index);else remap(v);}};remap(mat);this.doc.materials.push(mat);}return first;
  }
  accessor(a,position=false){const id=this.doc.accessors.length,componentType=a.array instanceof Float32Array?5126:a.array instanceof Uint32Array?5125:a.array instanceof Uint16Array?5123:5121;const info={bufferView:this.view(a.array),componentType,count:a.count,type:Object.keys(widths).find(k=>widths[k]===a.itemSize)};if(a.normalized)info.normalized=true;if(position){info.min=[Infinity,Infinity,Infinity];info.max=[-Infinity,-Infinity,-Infinity];for(let i=0;i<a.count;i++)for(let j=0;j<3;j++){const v=a.array[i*3+j];info.min[j]=Math.min(info.min[j],v);info.max[j]=Math.max(info.max[j],v);}}this.doc.accessors.push(info);return id;}
  mesh(g,material,name,transform){
    const attrs={},keys={position:'POSITION',normal:'NORMAL',uv:'TEXCOORD_0',color:'COLOR_0'};
    for(const [n,a]of Object.entries(g.attributes))if(keys[n]){const packed=n==='color'?new BufferAttribute(Uint8Array.from(a.array,v=>Math.round(Math.max(0,Math.min(1,v))*255)),3,true):a;attrs[keys[n]]=this.accessor(packed,n==='position');}
    const mesh=this.doc.meshes.length;this.doc.meshes.push({primitives:[{attributes:attrs,indices:this.accessor(g.index),material}]});return this.node(mesh,name,transform);
  }
  node(mesh,name,matrix){const id=this.doc.nodes.length;this.doc.nodes.push({name,mesh,...(matrix?{matrix:matrix.elements}: {})});this.doc.scenes[0].nodes.push(id);return id;}
  write(path){this.doc.buffers[0].byteLength=this.bytes;let j=Buffer.from(JSON.stringify(this.doc));j=Buffer.concat([j,Buffer.alloc((4-j.length%4)%4,32)]);const header=Buffer.alloc(20);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+j.length+this.bytes,8);header.writeUInt32LE(j.length,12);header.writeUInt32LE(0x4e4f534a,16);const bh=Buffer.alloc(8);bh.writeUInt32LE(this.bytes);bh.writeUInt32LE(0x004e4942,4);fs.writeFileSync(path,Buffer.concat([header,j,bh,...this.parts]));}
}
