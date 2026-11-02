/** Asset review uses the runtime barracks GLB, troop owner and established camera angle. */
import { Scene, Group, OrthographicCamera, WebGLRenderer, AmbientLight, DirectionalLight,
  Vector3, Mesh, PlaneGeometry, ACESFilmicToneMapping } from 'three';
import { BASE3D as C } from '../../src/config/Base3DConfig.js';
import { CELL_PX } from '../../src/config/BaseGridConfig.js';
import { BUILDING_3D } from '../../src/config/Building3DConfig.js';
import { loadGltfCached } from '../../src/engine/GltfCache.js';
import { BarracksYard } from '../../src/worldmap/BarracksYard.js';
import { baseGrassMaterial } from '../../src/engine/BaseGrassMaterial.js';
const unit=CELL_PX*C.cameraScale,rad=Math.PI/180,scene=new Scene(),root=new Group();
const renderer=new WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setSize(innerWidth,innerHeight);
renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=C.toneMappingExposure;document.body.appendChild(renderer.domElement);
const camera=new OrthographicCamera(-100,100,80,-80,.1,2000),target=new Vector3(0,unit/3,0);
const direction=new Vector3(Math.cos(C.pitchDeg*rad)*Math.cos(C.azimuthDeg*rad),Math.sin(C.pitchDeg*rad),Math.cos(C.pitchDeg*rad)*Math.sin(C.azimuthDeg*rad));
camera.position.copy(target).addScaledVector(direction,500);camera.lookAt(target);
const light=new DirectionalLight(C.lightColor,C.lightIntensity);light.position.set(Math.cos(C.lightElevationDeg*rad)*Math.cos(C.lightAzimuthDeg*rad),Math.sin(C.lightElevationDeg*rad),Math.cos(C.lightElevationDeg*rad)*Math.sin(C.lightAzimuthDeg*rad)).multiplyScalar(500);
scene.add(light,new AmbientLight(C.ambientColor,C.ambientIntensity),root);
const model=(await loadGltfCached(BUILDING_3D.barracks.url)).scene.clone();model.scale.setScalar(unit);root.add(model);
const yard=new BarracksYard();yard.attach(root);
const ground=new Mesh(new PlaneGeometry(1000,1000),baseGrassMaterial());ground.rotation.x=-Math.PI/2;ground.position.y=-.15;
ground.geometry.attributes.uv.array.forEach((v,i,a)=>{a[i]=v*1000/(unit*4);});scene.add(ground);
function render(){renderer.render(scene,camera);}
function resize(){renderer.setSize(innerWidth,innerHeight);const span=unit*2.63;camera.left=-span*innerWidth/innerHeight;camera.right=-camera.left;camera.top=span;camera.bottom=-span;camera.updateProjectionMatrix();render();}
window.barracksReview={scene,root,camera,renderer,yard,render};window.addEventListener('resize',resize);resize();
renderer.setAnimationLoop(render);
