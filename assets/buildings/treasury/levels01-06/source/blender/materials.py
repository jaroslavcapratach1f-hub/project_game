"""Reuse the HQ's embedded maps rather than adding another downloaded texture kit."""
import bpy
from geometry import M,material

def setup(root):
 bpy.ops.import_scene.gltf(filepath=str(root.parent.parent/'hq/levels01-06/timber_headquarters.glb'))
 names={'wood':'Weathered timber','trim':'Timber worn edges','darkwood':'Dark endgrain','canvas':'Olive canvas','roof':'Weathered roof covering'}
 for key,name in names.items():M[key]=bpy.data.materials.get(name)
 for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
 material('steel',(.010,.012,.009),.7,.35)
 material('edge',(.031,.029,.020),.65,.5)
 material('olive',(.011,.014,.007),.82,.1)
 material('paper',(.26,.235,.16),.95)
 material('paperedge',(.10,.094,.055),.95)
 material('ink',(.027,.037,.018),.9)
 material('letter',(.29,.28,.23),.85)
 material('glass',(.006,.009,.008),.3,.15)
 material('lamp',(.28,.18,.052),.5,.1)
 # Retain wood atlas and its roughness/normal response. Explicit shared textures
 # survive glTF export; no shader-only procedural noise is relied on in-game.
 for key in ['wood','trim','darkwood','canvas','roof']:
  if M[key] is None:raise RuntimeError('Missing shared HQ material '+key)
 coated('olive',(.17,.19,.115));coated('steel',(.10,.12,.095));coated('edge',(.38,.34,.23))

def coated(name,tint):
 original=M['roof'];m=M[name];nodes=m.node_tree.nodes;links=m.node_tree.links;p=nodes.get('Principled BSDF')
 image=next(n.image for n in original.node_tree.nodes if n.type=='TEX_IMAGE' and n.image.colorspace_settings.name=='sRGB')
 tex=nodes.new('ShaderNodeTexImage');tex.image=image
 mix=nodes.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(*tint,1)
 links.new(tex.outputs['Color'],mix.inputs[1]);links.new(mix.outputs[0],p.inputs['Base Color'])
