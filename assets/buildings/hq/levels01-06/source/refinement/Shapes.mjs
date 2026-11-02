import { SphereGeometry, CylinderGeometry, BoxGeometry, Vector3, Quaternion, Matrix4, Float32BufferAttribute } from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export function box(size,position,radius=.004){const g=new RoundedBoxGeometry(...size,1,Math.min(radius,Math.min(...size)*.2));g.translate(...position);return g;}
export function rod(a,b,radius,segments=10){const av=new Vector3(...a),bv=new Vector3(...b),v=bv.clone().sub(av);const g=new CylinderGeometry(radius,radius,v.length(),segments);g.applyQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0,1,0),v.normalize()));g.translate(...av.add(bv).multiplyScalar(.5).toArray());return g;}
export function pillow(seed,segments=14,rings=8){
 const g=new SphereGeometry(1,segments,rings),p=g.attributes.position;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),y=p.getY(i),z=p.getZ(i),r=Math.hypot(x,z),angle=Math.atan2(z,x);
  const px=.139*Math.sign(x)*Math.pow(Math.abs(x),.58),pz=.071*Math.sign(z)*Math.pow(Math.abs(z),.65);
  const py=Math.max(-.033,.042*Math.sign(y)*Math.pow(Math.abs(y),.76)+.004*Math.sin(angle*5+seed)*r*r);
  p.setXYZ(i,px*(1+.025*Math.sin(seed*3+angle)),py,pz*(1+.03*Math.cos(seed+angle*3)));
 }
 g.computeVertexNormals();return g;
}
export function tint(g,value){const p=g.attributes.position,a=new Float32Array(p.count*3);for(let i=0;i<a.length;i++)a[i]=value;g.setAttribute('color',new Float32BufferAttribute(a,3));return g;}
export function pose(g,position,yaw){return g.applyMatrix4(new Matrix4().makeRotationY(yaw)).translate(...position);}
