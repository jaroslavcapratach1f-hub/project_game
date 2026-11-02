/** Actual runtime tank assembly, same camera/light settings; asset media only. */
import { Scene, OrthographicCamera, WebGLRenderer, AmbientLight, DirectionalLight,
  Vector3, Box3, Mesh, PlaneGeometry, MeshBasicMaterial, CanvasTexture, ACESFilmicToneMapping } from 'three';
import { BASE3D as C } from '../../src/config/Base3DConfig.js';
import { UNIT_3D } from '../../src/config/Unit3DConfig.js';
import { assembleUnitMesh } from '../../src/entities/UnitMeshFactory.js';
import { baseGrassMaterial } from '../../src/engine/BaseGrassMaterial.js';
const scene=new Scene(),renderer=new WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
renderer.setSize(innerWidth,innerHeight);renderer.toneMapping=ACESFilmicToneMapping;renderer.toneMappingExposure=C.toneMappingExposure;document.body.appendChild(renderer.domElement);
const raw = new URLSearchParams(location.search).has('source');
const cfg = raw ? { hullUrl: '/assets/units/super_heavy/tier01/source/original.glb', rotationYDeg: 90, fitAxis: 'z', hullLengthWorldPx: 180 } : UNIT_3D['germany:superHeavyTank'];
const model=await assembleUnitMesh(cfg);scene.add(model.root);
const size=new Box3().setFromObject(model.root).getSize(new Vector3()),target=new Box3().setFromObject(model.root).getCenter(new Vector3());
const rad=Math.PI/180,camera=new OrthographicCamera(-100,100,80,-80,.1,3000),dir=new Vector3(Math.cos(C.pitchDeg*rad)*Math.cos(C.azimuthDeg*rad),Math.sin(C.pitchDeg*rad),Math.cos(C.pitchDeg*rad)*Math.sin(C.azimuthDeg*rad));
camera.position.copy(target).addScaledVector(dir,1000);camera.lookAt(target);
const light=new DirectionalLight(C.lightColor,C.lightIntensity);light.position.set(Math.cos(C.lightElevationDeg*rad)*Math.cos(C.lightAzimuthDeg*rad),Math.sin(C.lightElevationDeg*rad),Math.cos(C.lightElevationDeg*rad)*Math.sin(C.lightAzimuthDeg*rad)).multiplyScalar(1000);
scene.add(light,new AmbientLight(C.ambientColor,C.ambientIntensity));
const ground=new Mesh(new PlaneGeometry(1000,1000),baseGrassMaterial());ground.rotation.x=-Math.PI/2;ground.position.y=-.05;ground.geometry.attributes.uv.array.forEach((v,i,a)=>a[i]=v*8);scene.add(ground);
const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,10,64,64,64);gradient.addColorStop(0,'rgba(10,12,8,0.48)');gradient.addColorStop(1,'rgba(10,12,8,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128);
const shadow=new Mesh(new PlaneGeometry(size.x*1.1,size.z*1.5),new MeshBasicMaterial({map:new CanvasTexture(canvas),transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.01;scene.add(shadow);
function render(){shadow.rotation.z=-model.root.rotation.y;renderer.render(scene,camera);}
function resize(){renderer.setSize(innerWidth,innerHeight);const span=size.x*.65;camera.left=-span*innerWidth/innerHeight;camera.right=-camera.left;camera.top=span;camera.bottom=-span;camera.updateProjectionMatrix();render();}
window.shReview={scene,model,camera,renderer,render};window.addEventListener('resize',resize);resize();renderer.setAnimationLoop(render);
