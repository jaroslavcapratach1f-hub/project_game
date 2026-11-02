/** HQ art view using the same authored GLB, lighting and gameplay camera orientation. */
import { Scene, OrthographicCamera, WebGLRenderer, AmbientLight, DirectionalLight,
  Vector3, ACESFilmicToneMapping, Mesh, PlaneGeometry, MeshBasicMaterial } from 'three';
import { BASE3D as C } from '../../src/config/Base3DConfig.js';
import { loadGltfCached } from '../../src/engine/GltfCache.js';
import { buildDefenceGround } from '../../src/engine/DefenceGround.js';
import url from '../../assets/buildings/hq/levels01-06/timber_headquarters.glb';
const scene=new Scene(),renderer=new WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=C.toneMappingExposure;
document.body.appendChild(renderer.domElement);
const camera=new OrthographicCamera(-8,8,6,-6,.1,100);
const rad=Math.PI/180,dir=new Vector3(Math.cos(C.pitchDeg*rad)*Math.cos(C.azimuthDeg*rad),Math.sin(C.pitchDeg*rad),Math.cos(C.pitchDeg*rad)*Math.sin(C.azimuthDeg*rad));
const target=new Vector3(0,1.4,0);camera.position.copy(target).addScaledVector(dir,30);camera.lookAt(target);
const light=new DirectionalLight(C.lightColor,C.lightIntensity);
light.position.set(Math.cos(C.lightElevationDeg*rad)*Math.cos(C.lightAzimuthDeg*rad),Math.sin(C.lightElevationDeg*rad),Math.cos(C.lightElevationDeg*rad)*Math.sin(C.lightAzimuthDeg*rad)).multiplyScalar(30);
scene.add(light,new AmbientLight(C.ambientColor,C.ambientIntensity));
const model=(await loadGltfCached(url)).scene.clone();model.rotation.y=Math.PI/2;scene.add(model);
const ground=new Mesh(new PlaneGeometry(100,100),new MeshBasicMaterial({map:buildDefenceGround(3).material.map}));
ground.rotation.x=-Math.PI/2;ground.position.y=-.005;scene.add(ground);
function render(){renderer.render(scene,camera);}
function resize(){renderer.setSize(innerWidth,innerHeight);camera.left=-4.5*innerWidth/innerHeight;camera.right=-camera.left;camera.top=4.5;camera.bottom=-4.5;camera.updateProjectionMatrix();render();}
window.hqReview={scene,renderer,camera,model,render};window.addEventListener('resize',resize);resize();
