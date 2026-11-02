/** Refine the existing connected timber components instead of replacing the HQ. */
import { Vector3, Float32BufferAttribute } from 'three';
import { oldPostPart } from './Posts.mjs';
export function refineComponent(g,material,roofMaterial,index){
 const b=g.boundingBox,c=b.getCenter(new Vector3()),s=b.getSize(new Vector3());
 if(oldPostPart(c,s,material))return null;
 // Replace the old sagging aerial after the house and detached mast are scaled.
 if(material==='Oxidized dark steel'&&c.y>2.8&&s.x>2&&s.y<.5&&c.z< -1.5)return null;
 const nearPost=(Math.abs(c.x)>1.1&&Math.abs(c.x)<2.9)&&((c.y>1.27&&c.y<1.99&&c.z<.3&&c.z>-1.7)||(c.y<.8&&c.z>2));
 if(material==='Dark endgrain'&&nearPost&&s.y<.028&&s.x+s.z<.5)return null;
 // Pull the old rectangular floor inside the curved front sandbag footprint.
 if(material==='Dark endgrain'&&c.y<.08&&c.z>2.5&&s.z>.9&&s.y<.08){
  const p=g.attributes.position,cx=Math.sign(c.x)*2.05;
  for(let i=0;i<p.count;i++){
   const dx=p.getX(i)-cx,dz=p.getZ(i)-2.85,k=Math.min(1,.53/Math.hypot(dx,dz));
   p.setXYZ(i,cx+dx*k,p.getY(i),2.85+dz*k);
  }
 }
 let roof=false;
 if(['Weathered timber','Timber worn edges','Dark endgrain'].includes(material)){
  roof=(c.y>2.35&&s.z>1)||(Math.abs(c.x)<.86&&c.z>.65&&c.y>1.26&&c.y<1.85&&s.z>.85&&s.y<.4);
  const p=g.attributes.position;
  for(let i=0;i<p.count;i++){
   let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
   // Structural posts and rails: retain their span, reduce excessive section thickness.
   if(s.y>.45&&s.x<.18&&s.z<.18){x=c.x+(x-c.x)*.68;z=c.z+(z-c.z)*.68;}
   if(nearPost&&s.y<.09&&Math.max(s.x,s.z)>.60){y=c.y+(y-c.y)*.62;if(s.x>s.z)z=c.z+(z-c.z)*.62;else x=c.x+(x-c.x)*.62;}
   // Increase usable door height within the existing wall and roof clearances.
   if(Math.abs(c.x)<.43&&c.z>.40&&c.z<.64&&c.y>.34&&c.y<1.12&&s.length()<1.3)y=.23+(y-.23)*1.19;
   if(Math.abs(c.x)>1.14&&Math.abs(c.x)<1.44&&c.z>-.57&&c.z<.08&&c.y>1.35&&c.y<2.2&&s.length()<1.15)y=1.28+(y-1.28)*1.08;
   p.setXYZ(i,x,y,z);
  }
 }
 const variation=.955+.035*Math.sin(index*7.71),colors=new Float32Array(g.attributes.position.count*3);colors.fill(variation);g.setAttribute('color',new Float32BufferAttribute(colors,3));
 g.computeVertexNormals();return {g,roof};
}
