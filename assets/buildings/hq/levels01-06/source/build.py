"""Reproducible two-storey timber headquarters, using the live defence material library."""
import sys,json,re,struct
from pathlib import Path
HERE=Path(__file__).resolve().parent
REPO=HERE.parents[4]
sys.path[:0]=[str(HERE),str(REPO/'assets/buildings/defence_wall/levels01-06/modular/source')]
import mesh_tools as mesh_library
from mesh_tools import *
from architecture import cabin
from fortifications import wings,checkpoints,supplies
from garrison import garrison
from details import entrance,signals,yard,command_identity
mesh_library.ROOT=HERE.parent
bpy.context.preferences.edit.use_global_undo=False
reset()
cabin(0,.75,3.2,3.1,2.9,2,side_upper=False)
entrance();command_identity()
# More compound space, not oversized rooms: retain the house design at 75% scale.
for o in list(bpy.context.scene.objects):
    o.location.x*=.75;o.location.y=.75+(o.location.y-.75)*.75;o.location.z*=.75
    o.scale*=.75
# The command house forms the rear edge; the open forecourt holds guard posts.
wings();signals();yard();checkpoints();supplies();garrison()
info=export('timber_headquarters')
# Match DefenceInstances' material-specific tint/exposure exactly, baked into this GLB.
config=(REPO/'src/config/DefencePerimeterConfig.js').read_text()
exposure=float(re.search(r'diffuseFactor: ([\d.]+)',config).group(1))
tints={name:json.loads('['+values+']') for name,values in re.findall(r"'([^']+)': \[([^\]]+)\]",config)}
path=mesh_library.ROOT/'timber_headquarters.glb';data=path.read_bytes();size=struct.unpack_from('<I',data,12)[0]
doc=json.loads(data[20:20+size]);binary=data[20+size:]
for mat in doc['materials']:
    p=mat.setdefault('pbrMetallicRoughness',{});color=p.get('baseColorFactor',[1,1,1,1]);tint=tints.get(mat['name'],[1,1,1])
    p['baseColorFactor']=[color[i]*exposure*tint[i] for i in range(3)]+[color[3]]
    p['metallicFactor']=0;p['roughnessFactor']=1
payload=json.dumps(doc,separators=(',',':')).encode();payload+=b' '*((-len(payload))%4)
path.write_bytes(struct.pack('<III',0x46546c67,2,20+len(payload)+len(binary))+struct.pack('<II',len(payload),0x4e4f534a)+payload+binary)
info.update({'mainFloors':2,'annexes':0,'flags':False,'star':False,
 'signPanel':'front gable above second-floor windows','mainHouseScale':0.75,
 'attachedExtensions':2,'wingFrontWindows':1,'balconyDeckHeight':1.25,
 'upperWindowSill':1.5075,'balconyAccessDoors':2,'checkpointPosts':2,'guards':4,'fixedMachineGuns':4,'guardIdentity':'original unmarked shared field guard',
 'layout':'rear-edge command house; open guarded forecourt; no detached buildings',
 'entrance':'local +Z; runtime rotates to grid +X',
 'materials':'shared defence grain and baked current runtime tints'})
(mesh_library.ROOT/'timber_headquarters_manifest.json').write_text(json.dumps(info,indent=2))
print('TIMBER_HQ_READY',info)
