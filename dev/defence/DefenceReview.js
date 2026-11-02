/** Isolated art comparison using the CURRENT wall/tower owners, not a legacy harness. */
import { Scene, OrthographicCamera, WebGLRenderer, AmbientLight, DirectionalLight,
  Vector3, ACESFilmicToneMapping, Mesh, PlaneGeometry, MeshBasicMaterial } from 'three';
import { DefenceWall3D } from '../../src/worldmap/DefenceWall3D.js';
import { AttackTowers3D } from '../../src/worldmap/AttackTowers3D.js';
import { BASE3D as C } from '../../src/config/Base3DConfig.js';
import { baseGrassMaterial } from '../../src/engine/BaseGrassMaterial.js';
import { GROUND_3D } from '../../src/config/BaseGround3DConfig.js';
import { EventEmitter } from '../../src/utils/EventEmitter.js';

const scene = new Scene(), renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = ACESFilmicToneMapping;renderer.toneMappingExposure = C.toneMappingExposure;
document.body.appendChild(renderer.domElement);
const camera = new OrthographicCamera(-innerWidth/2,innerWidth/2,innerHeight/2,-innerHeight/2,C.nearPlane,C.farPlane);
const rad=Math.PI/180, dir=new Vector3(Math.cos(C.pitchDeg*rad)*Math.cos(C.azimuthDeg*rad),Math.sin(C.pitchDeg*rad),Math.cos(C.pitchDeg*rad)*Math.sin(C.azimuthDeg*rad));
const light=new DirectionalLight(C.lightColor,C.lightIntensity);
light.position.set(Math.cos(C.lightElevationDeg*rad)*Math.cos(C.lightAzimuthDeg*rad),Math.sin(C.lightElevationDeg*rad),Math.cos(C.lightElevationDeg*rad)*Math.sin(C.lightAzimuthDeg*rad)).multiplyScalar(C.lightDistance);
scene.add(light,new AmbientLight(C.ambientColor,C.ambientIntensity));
const adapter={addObject:o=>scene.add(o),removeObject:o=>scene.remove(o)},events=new EventEmitter();
const wall=new DefenceWall3D(adapter,events),towers=new AttackTowers3D(adapter,events);
await Promise.all([wall.enable(3),towers.enable(3)]);
const ground=new Mesh(new PlaneGeometry(3000,3000),baseGrassMaterial());
for(let i=0;i<ground.geometry.attributes.uv.count;i++){const uv=ground.geometry.attributes.uv;uv.setXY(i,uv.getX(i)*3000/(42/Math.SQRT2)/GROUND_3D.tileCells,uv.getY(i)*3000/(42/Math.SQRT2)/GROUND_3D.tileCells);}
ground.rotation.x=-Math.PI/2;ground.position.y=-12;scene.add(ground);
const target=new Vector3(0,15,0);
camera.position.copy(target).addScaledVector(dir,1000);camera.lookAt(target);camera.zoom=1.65;camera.updateProjectionMatrix();
function render(){renderer.render(scene,camera);}
window.defenceReview={scene,renderer,camera,wall,towers,render};render();
window.addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.left=-innerWidth/2;camera.right=innerWidth/2;camera.top=innerHeight/2;camera.bottom=-innerHeight/2;camera.updateProjectionMatrix();render();});
