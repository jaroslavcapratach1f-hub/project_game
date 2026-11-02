"""Build the editable crude_oil in Blender, then export the single live game GLB.
Blender --background --factory-startup --python path/to/build.py
"""
import bpy,sys,math,json,struct
from pathlib import Path
from mathutils import Vector
HERE=Path(__file__).resolve().parent;ROOT=HERE.parent;SHARED=ROOT.parent.parent/'treasury/levels01-06/source/blender';sys.path[:0]=[str(HERE),str(SHARED)]
sys.dont_write_bytecode=True
from materials import setup
from plant import plant
from pump import pumpjack
bpy.context.preferences.edit.use_global_undo=False
bpy.context.preferences.filepaths.save_version=0
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
setup(ROOT);plant();pumpjack()
# Apply real modeling modifiers and batch by material, preserving the open bay.
for o in list(bpy.context.scene.objects):
 if o.type not in {'MESH','CURVE','FONT'}:continue
 bpy.ops.object.select_all(action='DESELECT');o.select_set(True);bpy.context.view_layer.objects.active=o
 bpy.ops.object.convert(target='MESH')
 for mod in list(o.modifiers):bpy.ops.object.modifier_apply(modifier=mod.name)
objects=list(bpy.context.scene.objects);groups={}
for o in objects:
 if o.type=='MESH':groups.setdefault(o.data.materials[0].name,[]).append(o)
for mat,items in groups.items():
 bpy.ops.object.select_all(action='DESELECT')
 for o in items:o.select_set(True)
 bpy.context.view_layer.objects.active=items[0];bpy.ops.object.join();items[0].name='Oil plant '+mat
# Ground-centred, +X-facing normalized asset uses the existing 2x2 runtime fit.
objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
bpy.context.view_layer.update()
points=[o.matrix_world@Vector(c) for o in objects for c in o.bound_box]
lo=Vector([min(p[i] for p in points) for i in range(3)]);hi=Vector([max(p[i] for p in points) for i in range(3)])
center=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z));scale=2/max(hi.x-lo.x,hi.y-lo.y)
from mathutils import Matrix
transform=Matrix.Rotation(math.pi/2,4,'Z')@Matrix.Scale(scale,4)@Matrix.Translation(-center)
for o in objects:o.matrix_world=transform@o.matrix_world
bpy.ops.object.select_all(action='SELECT');bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
from bake import bake_occlusion
bake_occlusion()
bpy.ops.outliner.orphans_purge(do_recursive=True)
for image in bpy.data.images:
 if image.has_data:image.pack()
bpy.context.scene['visualLevels']='1–6';bpy.context.scene['oilPumpPlant']=True
bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'crude_oil.blend'),compress=True)
from export import export_model
export_model(ROOT)
