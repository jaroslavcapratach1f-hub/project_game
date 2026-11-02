/** Distributed command-yard stores and low boundaries; keep the central route clear. */
import { CylinderGeometry } from 'three';
import { box,rod,pillow,tint } from './Shapes.mjs';
export function addYardDressing(add,material){
 const wood=material('Weathered timber'),edge=material('Timber worn edges');
 const green=material('Military green cases'),steel=material('Oxidized dark steel');
 const sand=material('Olive canvas'),drum=material('Oxide red drums');
 const crate=(x,z,y=.13)=>{
  add(box([.31,.25,.28],[x,y,z],.008),wood,'Yard supply crate');
  for(const dx of [-.12,.12])add(box([.028,.26,.287],[x+dx,y,z],.003),edge,'Crate side batten');
  for(const dz of [-.10,.10])add(box([.32,.026,.026],[x,y+.125,z+dz]),edge,'Crate lid batten');
 };
 // Front receiving stores, with a wide entry opening between them.
 for(const [x,z]of [[-.76,2.72],[-1.09,2.72],[.80,2.86]])crate(x,z);
 crate(-.92,2.72,.385);
 // Rear-side service supplies make the whole compound feel occupied.
 for(const [x,z]of [[2.62,-1.47],[2.95,-1.47],[-2.72,-.45]])crate(x,z);
 for(const [x,z]of [[-2.73,-.88],[-2.98,-.67],[2.83,1.26]]){
  const g=new CylinderGeometry(.085,.086,.26,14,1);g.translate(x,.14,z);add(g,drum,'Service drum');
  for(const y of [.045,.235]){const rim=new CylinderGeometry(.089,.089,.012,14,1,true);rim.translate(x,y,z);add(rim,steel,'Drum rolling hoop');}
 }
 // Short low sandbag runs frame the plot, rather than sealing access behind a wall.
 const runs=[[-1.13,3.12,0,5],[.72,3.12,0,4],[-2.78,.28,Math.PI/2,5],[2.80,.44,Math.PI/2,4],[2.69,-1.88,0,4]];
 runs.forEach(([x,z,yaw,count],ri)=>{
  for(let i=0;i<count;i++){
   const bag=tint(pillow(310+ri*13+i,10,6),.91+.025*Math.sin(i*2));bag.scale(.79,.79,.79);bag.rotateY(yaw+.035*Math.sin(i));bag.translate(x+Math.cos(yaw)*i*.205,.031,z-Math.sin(yaw)*i*.205);add(bag,sand,'Low command yard boundary');
  }
 });
 // Rolled canvas packs by the dispatch area, restrained in size relative to the crew.
 for(let i=0;i<3;i++){
  add(rod([2.15,.065+i*.06,1.52],[2.48,.065+i*.06,1.52],.055,10),green,'Rolled field canvas');
 }
}
