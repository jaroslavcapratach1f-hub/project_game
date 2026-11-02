"""Bake contact occlusion to a shared atlas; retained .blend stays editable."""
import bpy

def bake_occlusion():
 objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join();o=bpy.context.object
 # All material textures keep the authored first UV set; only contact AO uses UV1.
 original=o.data.uv_layers[0].name
 for mat in o.data.materials:
  node=mat.node_tree.nodes.new('ShaderNodeUVMap');node.uv_map=original
  for tex in [n for n in mat.node_tree.nodes if n.type=='TEX_IMAGE']:
   if not tex.inputs['Vector'].is_linked:mat.node_tree.links.new(node.outputs['UV'],tex.inputs['Vector'])
 uv=o.data.uv_layers.new(name='ContactUV');o.data.uv_layers.active=uv
 bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.003);bpy.ops.object.mode_set(mode='OBJECT')
 image=bpy.data.images.new('Treasury contact occlusion',width=1024,height=1024,alpha=False);image.colorspace_settings.name='Non-Color'
 for mat in o.data.materials:
  n=mat.node_tree.nodes.new('ShaderNodeTexImage');n.image=image;n.name='Baked contact';mat.node_tree.nodes.active=n
 scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=16;scene.render.bake.margin=3
 bpy.ops.object.bake(type='AO')
 image.pack()
 group=bpy.data.node_groups.get('glTF Material Output') or bpy.data.node_groups.new('glTF Material Output','ShaderNodeTree')
 if not group.interface.items_tree:group.interface.new_socket(name='Occlusion',in_out='INPUT',socket_type='NodeSocketFloat')
 for mat in o.data.materials:
  nodes=mat.node_tree.nodes;links=mat.node_tree.links;ao=nodes.get('Baked contact');uvnode=nodes.new('ShaderNodeUVMap');uvnode.uv_map='ContactUV';links.new(uvnode.outputs['UV'],ao.inputs['Vector']);g=nodes.new('ShaderNodeGroup');g.node_tree=group;links.new(ao.outputs['Color'],g.inputs['Occlusion'])
 # Avoid multiplying the old coarse vertex bake and the new atlas together.
 for color in list(o.data.color_attributes):o.data.color_attributes.remove(color)
 o.data.uv_layers.active_index=0
 return o
