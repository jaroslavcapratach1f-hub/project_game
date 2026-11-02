"""Run Blender --background --factory-startup --python this_file. Reproducible L1 kit."""
import sys, json
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from mesh_tools import *
from structures import wall,tower,trench,hedgehog,pole,gate
from trench_detail import trench_revetment
from nature_props import pine,crate,drum,wire,wire_post,bridge
manifest={}
for name,mask in [('post',0),('end',1),('straight',17),('corner',5),('junction',21),('cross',85)]:
    reset();wall(mask);manifest['wall_'+name]=export('wall_'+name)
for mask in [2,8,32,128,34,136,144,72,9,18,36,33,66,129,132]:
    reset();wall(mask);manifest['wall_mask_'+str(mask)]=export('wall_mask_'+str(mask))
for name,mask in [('straight',5),('corner',3),('end',1),('junction',7),('crossing',15)]:
    reset();trench(mask);manifest['trench_'+name]=export('trench_'+name)
for name,fn in [('trench_revetment',trench_revetment),('gate',gate),('watchtower',tower),('hedgehog',hedgehog),('power_pole',pole),('crate',crate),
                ('barrel',drum),('barbed_wire',wire),('wire_post',wire_post),('trench_bridge',bridge),
                ('pine_a',lambda:pine(1)),('pine_b',lambda:pine(2)),('pine_c',lambda:pine(3)),
                ('sandbag',lambda:bag((0,0,.065))),
                ('storage_box',lambda:cube('Steel case',(0,0,.13),(.45,.28,.26),boxgreen,.018))]:
    reset();fn();manifest[name]=export(name)
(ROOT/'manifest.json').write_text(json.dumps({'version':1,'assets':manifest},indent=2))
print('DEFENCE_KIT_READY',len(manifest))
