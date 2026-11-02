/** Small packed PBR textures, generated offline; no runtime procedural shaders. */
import fs from 'node:fs';
import { deflateSync } from 'node:zlib';
const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function chunk(type,data){const t=Buffer.from(type),body=Buffer.concat([t,data]);let crc=0xffffffff;for(const b of body)crc=crcTable[(crc^b)&255]^(crc>>>8);const head=Buffer.alloc(4),tail=Buffer.alloc(4);head.writeUInt32BE(data.length);tail.writeUInt32BE((crc^0xffffffff)>>>0);return Buffer.concat([head,body,tail]);}
export function png(width,height,pixels){const h=Buffer.alloc(13);h.writeUInt32BE(width);h.writeUInt32BE(height,4);h[8]=8;h[9]=6;const rows=Buffer.alloc(height*(width*4+1));for(let y=0;y<height;y++)Buffer.from(pixels.buffer,pixels.byteOffset+y*width*4,width*4).copy(rows,y*(width*4+1)+1);return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',h),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);}
const fract=n=>n-Math.floor(n),hash=(x,y)=>fract(Math.sin(x*127.1+y*311.7)*43758.5453),mix=(a,b,t)=>a*(1-t)+b*t;
function noise(x,y){const ix=Math.floor(x),iy=Math.floor(y),fx=fract(x),fy=fract(y),u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return mix(mix(hash(ix,iy),hash(ix+1,iy),u),mix(hash(ix,iy+1),hash(ix+1,iy+1),u),v);}
export function surface(writer,name,color,kind='wood'){
 const size=256,height=new Float32Array(size*size),albedo=new Uint8Array(size*size*4),rough=new Uint8Array(size*size*4),normal=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const fine=hash(x+23,y+53),cloud=noise(x/32,y/32),long=noise(x/4,y/65),grain=Math.sin(x*.82+noise(x/18,y/90)*8);
   const weave=(x%3===0||y%3===0)?-.06:.03;
   const h=kind==='cloth'?.45+weave+fine*.08:kind==='roof'?.35+cloud*.22+fine*.16:.35+long*.25+grain*.055+fine*.045;
   height[y*size+x]=h;const variation=kind==='wood'?.78+long*.26+grain*.055:.84+cloud*.19+fine*.07;
   const p=(y*size+x)*4;for(let c=0;c<3;c++)albedo[p+c]=Math.min(255,color[c]*variation);albedo[p+3]=255;
   rough.set([255,Math.round(210+cloud*33),0,255],p);
 }
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const dx=(height[y*size+(x+1)%size]-height[y*size+(x+size-1)%size])*.9,dy=(height[((y+1)%size)*size+x]-height[((y+size-1)%size)*size+x])*.9;
   const p=(y*size+x)*4;normal.set([Math.round(128-dx*127),Math.round(128-dy*127),252,255],p);
 }
 return {baseColorTexture:{index:writer.image(png(size,size,albedo),name+' color')},metallicRoughnessTexture:{index:writer.image(png(size,size,rough),name+' roughness')},normalTexture:{index:writer.image(png(size,size,normal),name+' grain normal'),scale:kind==='cloth'?.35:.4}};
}
export function refineMaterials(writer){
 const woodMaps=Object.fromEntries(['diff','nor_gl','rough'].map(k=>[k,writer.image(fs.readFileSync(new URL('textures/wood_'+k+'.jpg',import.meta.url)),'CC0 photographed worn wood '+k,'image/jpeg')]));
 const palettes={'Weathered timber':[117,103,82],'Timber worn edges':[133,118,96],'Dark endgrain':[72,63,50],'Olive canvas':[132,124,91],'Military green cases':[74,83,61],'Oxide red drums':[104,71,55]};
 for(const mat of writer.doc.materials){
   const p=mat.pbrMetallicRoughness??={};p.roughnessFactor=.92;p.metallicFactor=0;
   if(palettes[mat.name]){const texture=surface(writer,mat.name,palettes[mat.name],mat.name==='Olive canvas'?'cloth':mat.name.includes('timber')||mat.name.includes('Timber')||mat.name.includes('endgrain')?'wood':'roof');Object.assign(p,texture);mat.normalTexture=p.normalTexture;delete p.normalTexture;p.baseColorFactor=[.30,.30,.30,1];}
   if(['Weathered timber','Timber worn edges','Dark endgrain'].includes(mat.name)){p.baseColorTexture={index:woodMaps.diff};p.metallicRoughnessTexture={index:woodMaps.rough};p.baseColorFactor=mat.name==='Dark endgrain'?[.12,.20,.30,1]:mat.name==='Timber worn edges'?[.36,.57,.80,1]:[.29,.46,.66,1];mat.normalTexture={index:woodMaps.nor_gl,scale:.32};}
   if(mat.name==='Oxidized dark steel'){p.baseColorFactor=[.024,.028,.025,1];p.metallicFactor=.32;p.roughnessFactor=.76;}
 }
 const roof=surface(writer,'Weathered bituminous roof',[75,77,72],'roof');const normalTexture=roof.normalTexture;delete roof.normalTexture;
 const id=writer.doc.materials.length;writer.doc.materials.push({name:'Weathered roof covering',pbrMetallicRoughness:{...roof,baseColorFactor:[.32,.32,.32,1],metallicFactor:0,roughnessFactor:.92},normalTexture});return id;
}
