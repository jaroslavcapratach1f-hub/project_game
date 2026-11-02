"""Export the mobile GLB and calibrate material factors to the existing game light."""
import bpy,json,struct

def export_model(root):
 bpy.ops.export_scene.gltf(filepath=str(root/'treasury.glb'),export_format='GLB',export_yup=True,export_apply=True,export_cameras=False,export_lights=False,export_image_format='JPEG',export_image_quality=94)
 p=root/'treasury.glb';b=p.read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);d['asset']['extras']={'visualLevels':[1,6],'footprintCells':[2,2],'front':'+X','pivot':'ground center','authoring':'Blender','openCashierBay':True,'printingPress':True}
 for m in d['materials']:
  if m['name'] in ['olive','steel','edge']:m['pbrMetallicRoughness']['baseColorFactor']={'olive':[.12,.14,.08,1],'steel':[.1,.11,.09,1],'edge':[.16,.15,.11,1]}[m['name']]
  if m['name'] in ['Weathered timber','Timber worn edges']:
   m['normalTexture']['scale']=.15
   f=m['pbrMetallicRoughness']['baseColorFactor'];m['pbrMetallicRoughness']['baseColorFactor']=[x*1.12 for x in f[:3]]+[1]
  if m['name']=='Weathered roof covering':m['pbrMetallicRoughness']['baseColorFactor']=[.12,.135,.105,1]
  if 'occlusionTexture'in m:m['occlusionTexture']['strength']=.65
 j=json.dumps(d,separators=(',',':')).encode();j+=b' '*(-len(j)%4);tail=b[20+n:];p.write_bytes(struct.pack('<III',0x46546c67,2,20+len(j)+len(tail))+struct.pack('<II',len(j),0x4e4f534a)+j+tail)
 from pivot import ground_pivot
 ground_pivot(p)
 print('BAKED',len(p.read_bytes()),[(m['name'],m.get('occlusionTexture')) for m in d['materials']])
