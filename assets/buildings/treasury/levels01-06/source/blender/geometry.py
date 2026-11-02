"""Small offline Blender modeling tools; metres, Z-up, entrance faces -Y."""
import bpy,math,random
from mathutils import Vector
random.seed(1945)
M={}
def material(name,color,rough=.8,metal=0):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Roughness'].default_value=rough;p.inputs['Metallic'].default_value=metal;M[name]=m;return m

def finish(o,name,mat,bevel=0):
 o.name=name;o.data.materials.clear();o.data.materials.append(M[mat] if isinstance(mat,str) else mat)
 if bevel:
  mod=o.modifiers.new('Soft manufactured edges','BEVEL');mod.width=bevel;mod.segments=2
  bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=mod.name)
 for p in o.data.polygons:p.use_smooth=True
 mod=o.modifiers.new('Weighted corner normals','WEIGHTED_NORMAL');mod.keep_sharp=True;mod.weight=30
 return o

def box(name,loc,size,mat='wood',bevel=.006):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.dimensions=size
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 # Grain follows the longest dimension; avoid repeating the same board crop.
 uv=o.data.uv_layers.active;offset=random.random();long=max(range(3),key=lambda i:size[i])
 for face in o.data.polygons:
  axis=max(range(3),key=lambda i:abs(face.normal[i]));axes=[i for i in range(3) if i!=axis]
  if long in axes:axes=[long]+[i for i in axes if i!=long]
  for li in face.loop_indices:
   v=o.data.vertices[o.data.loops[li].vertex_index].co
   uv.data[li].uv=(v[axes[0]]*.23+offset,v[axes[1]]*.65+offset)
 return finish(o,name,mat,bevel)

def mesh(name,verts,faces,mat,uvs=None):
 data=bpy.data.meshes.new(name);data.from_pydata(verts,[],faces);data.update();o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o)
 uv=data.uv_layers.new()
 for p in data.polygons:
  for li in p.loop_indices:
   i=data.loops[li].vertex_index;v=data.vertices[i].co;uv.data[li].uv=uvs[i] if uvs else (v.x*.4,v.y*.4)
 return finish(o,name,mat)

def rod(name,a,b,r,mat='steel',vertices=12):
 a,b=Vector(a),Vector(b);bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=r,depth=(b-a).length,location=(a+b)/2)
 o=bpy.context.object;o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return finish(o,name,mat,.004 if r>.025 else 0)

def beam(name,a,b,width,depth,mat='wood'):
 a,b=Vector(a),Vector(b);o=box(name,(a+b)/2,(width,depth,(b-a).length),mat,.008);o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o

def ring(name,loc,major,minor,mat='steel',axis='Y'):
 bpy.ops.mesh.primitive_torus_add(major_segments=32,minor_segments=6,location=loc,major_radius=major,minor_radius=minor)
 o=bpy.context.object
 if axis=='Y':o.rotation_euler.x=math.pi/2
 elif axis=='X':o.rotation_euler.y=math.pi/2
 return finish(o,name,mat)

def curve(name,points,r,mat):
 data=bpy.data.curves.new(name,'CURVE');data.dimensions='3D';data.resolution_u=1;data.bevel_depth=r;data.bevel_resolution=1
 s=data.splines.new('POLY');s.points.add(len(points)-1)
 for p,co in zip(s.points,points):p.co=(*co,1)
 o=bpy.data.objects.new(name,data);bpy.context.collection.objects.link(o);data.materials.append(M[mat]);return o

def bolt(loc,axis='Y',r=.022):
 d={'X':(r,0,0),'Y':(0,r,0),'Z':(0,0,r)}[axis];return rod('Hex fastener',Vector(loc)-Vector(d)*.35,Vector(loc)+Vector(d)*.35,r,'edge',6)
