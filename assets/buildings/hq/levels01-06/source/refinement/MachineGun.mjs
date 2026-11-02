/** Compact WWII belt-fed gun: machined receiver, open cooling jacket and pintle cradle. */
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { box,rod } from './Shapes.mjs';
function jacket(){
 const around=24,along=24,r=.022,inner=.018,length=.225,start=.184,verts=[],indices=[],uv=[];
 for(const radius of [r,inner])for(let j=0;j<=along;j++)for(let i=0;i<=around;i++){
  const a=i/around*Math.PI*2;verts.push(radius*Math.cos(a),.50+radius*Math.sin(a),start+j/along*length);uv.push(i/around,j/along);
 }
 const layer=(around+1)*(along+1),open=(i,j)=>{if(j<2||j>21)return false;const u=((i+.5)%6)-3,v=((j+.5-2)%4)-2;return (u/1.4)**2+(v/1.25)**2<1;};
 const face=(a,b,c,d)=>indices.push(a,b,c,a,c,d);
 for(let j=0;j<along;j++)for(let i=0;i<around;i++){
  if(open(i,j))continue;const a=j*(around+1)+i,b=a+1,c=b+around+1,d=a+around+1;
  face(a,b,c,d);face(d+layer,c+layer,b+layer,a+layer);
  if(j===0||open(i,j-1))face(b,a,a+layer,b+layer);
  if(j===along-1||open(i,j+1))face(d,c,c+layer,d+layer);
  if(open((i+around-1)%around,j))face(a,d,d+layer,a+layer);
  if(open((i+1)%around,j))face(c,b,b+layer,c+layer);
 }
 const g=new BufferGeometry();g.setAttribute('position',new Float32BufferAttribute(verts,3));g.setAttribute('uv',new Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function machineGun(materials){
 const parts=[],metal=g=>parts.push([g,materials.metal]),dark=g=>parts.push([g,materials.wood]);
 // A slim receiver/feed cover, not an oversized block sitting above the hands.
 metal(box([.058,.060,.211],[0,.515,.078],.005));
 metal(box([.061,.010,.192],[0,.549,.078],.003));
 metal(box([.004,.034,.113],[.033,.506,.115],.001));
 for(const z of [.071,.113,.151])metal(rod([.035,.511,z],[.038,.511,z],.0035,8));
 metal(rod([.034,.518,.08],[.055,.518,.08],.004,8));metal(rod([.055,.514,.08],[.055,.530,.08],.005,8));
 metal(jacket());metal(rod([0,.50,.18],[0,.50,.438],.009,12));
 metal(rod([0,.50,.432],[0,.50,.448],.015,16));
 dark(rod([0,.50,.448],[0,.50,.449],.007,12));
 metal(rod([0,.50,.396],[0,.541,.396],.004,8));metal(box([.020,.009,.009],[0,.542,.396],.002));
 metal(box([.009,.037,.013],[0,.55,.08],.002));
 // Pistol grip and the forked elevation cradle beneath the receiver.
 const grip=box([.019,.061,.024],[0,0,0],.005);grip.rotateX(-.20);grip.translate(0,.467,.024);metal(grip);
 for(const side of [-1,1])metal(rod([side*.027,.469,.13],[side*.027,.432,.13],.006,8));
 metal(rod([-.035,.465,.13],[.035,.465,.13],.010,10));
 metal(rod([0,.04,.13],[0,.437,.13],.012,10));
 for(const [x,z]of [[-.13,.015],[.13,.015],[0,.335]])metal(rod([0,.245,.13],[x,.025,z],.008,8));
 parts.push([box([.095,.083,.120],[-.098,.443,.124],.005),materials.green]);
 metal(rod([-.143,.453,.08],[-.143,.453,.17],.004,8));
 for(let i=0;i<6;i++)parts.push([rod([-.108+i*.014,.500,.11],[-.108+i*.014,.500,.14],.0035,6),materials.brass]);
 for(const [g] of parts)g.translate(-.045,0,0);
 return parts;
}
