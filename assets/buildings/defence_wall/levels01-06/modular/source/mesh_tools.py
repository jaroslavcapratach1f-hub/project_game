"""Shared modelling/export helpers. Blender coordinates X/Y ground, Z up; GLB is Y-up."""
import bpy, math, random
from mathutils import Vector
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
random.seed(1939)
MATS = {}

def mat(name, color):
    m = bpy.data.materials.new(name); m.diffuse_color = (*color, 1); m.use_nodes = True
    bs = m.node_tree.nodes.get('Principled BSDF'); bs.inputs['Base Color'].default_value = (*color, 1)
    bs.inputs['Roughness'].default_value = 1
    bs.inputs['Metallic'].default_value = 1
    MATS[name] = m
    return m

wood = mat('Weathered timber', (.23,.145,.082))
woodlight = mat('Timber worn edges', (.34,.25,.155))
wooddark = mat('Dark endgrain', (.11,.069,.038))
sand = mat('Olive canvas', (.235,.225,.115))
dirt = mat('Earth revetment', (.19,.115,.057))
floor = mat('Trench dark earth', (.068,.045,.026))
metal = mat('Oxidized dark steel', (.033,.038,.032))
foliage = mat('Pine needles', (.07,.13,.029))
leaflight = mat('Sunlit pine tips', (.12,.18,.042))
barrel = mat('Oxide red drums', (.19,.061,.038))
boxgreen = mat('Military green cases', (.055,.115,.079))
ceramic = mat('Porcelain insulators', (.48,.48,.40))

# Shared packed wood grain map, not one material/texture per timber.
def grain_texture(material, seed):
    rng=random.Random(seed); width,height=128,256
    img=bpy.data.images.new('Weathered wood grain '+str(seed),width=width,height=height)
    pixels=[]; base=material.diffuse_color[:3]
    for y in range(height):
        for x in range(width):
            streak=math.sin(x*.55+math.sin(y*.027)*.6)*.09+math.sin(x*2.9+y*.013)*.025
            knot=math.sin(math.hypot((x-44)*1.5,(y-140)*.27)*.8)*.03
            factor=.88+streak+knot+rng.uniform(-.035,.035)
            # Texture values are sRGB, whereas material factors above are linear.
            pixels.extend([max(0,min(1,(c**(1/2.2))*factor)) for c in base]+[1])
    img.pixels=pixels;img.pack()
    nodes=material.node_tree.nodes; tex=nodes.new('ShaderNodeTexImage');tex.image=img
    material.node_tree.links.new(tex.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])
for index,m in enumerate([wood,woodlight,wooddark]): grain_texture(m,100+index)

def finish(o, name, material, bevel=0):
    o.name=name; o.data.materials.append(material)
    if bevel:
        mod=o.modifiers.new('Worn eased edges','BEVEL'); mod.width=bevel; mod.segments=1
        bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=mod.name)
    return o

def cube(name, loc, size, material=wood, bevel=.014):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.dimensions=size
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    return finish(o,name,material,bevel)

def beam(name,a,b,width=.09,depth=None,material=wood):
    v=Vector(b)-Vector(a); o=cube(name,(Vector(a)+Vector(b))/2,(width,depth or width,v.length),material,.008)
    o.rotation_mode='QUATERNION'; o.rotation_quaternion=v.to_track_quat('Z','Y'); return o

def cyl(name, loc, radius, depth, material=wood, vertices=8):
    bpy.ops.mesh.primitive_cylinder_add(vertices=vertices,radius=radius,depth=depth,location=loc)
    return finish(bpy.context.object,name,material)

def bag(loc, rot=0):
    o=cube('Canvas sandbag',loc,(.33,.18,.115),sand,.042); o.rotation_euler.z=rot
    # seam remains visible at near strategy zoom without transparent textures
    beam('Stitched seam',(loc[0]-.13,loc[1],loc[2]+.055),(loc[0]+.13,loc[1],loc[2]+.055),.009,material=wooddark)
    return o

def cable(name, points, radius=.009, material=metal):
    for a,b in zip(points,points[1:]): beam(name,a,b,radius,radius,material)

def reset():
    bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)

def export(name):
    # Merge by material; instances in Three share each resulting geometry/material.
    for m in MATS.values():
        objects=[o for o in bpy.context.scene.objects if o.type=='MESH' and o.data.materials and o.data.materials[0]==m]
        if not objects: continue
        bpy.ops.object.select_all(action='DESELECT')
        for o in objects: o.select_set(True)
        bpy.context.view_layer.objects.active=objects[0]; bpy.ops.object.join(); o=bpy.context.object
        bpy.context.scene.cursor.location=(0,0,0); bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
        bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
        o.name=name+'__'+m.name.replace(' ','_')
    bpy.ops.export_scene.gltf(filepath=str(ROOT/(name+'.glb')),export_format='GLB',export_yup=True,export_extras=True)
    objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
    for o in objects: o.data.calc_loop_triangles()
    return {'file':name+'.glb','triangles':sum(len(o.data.loop_triangles) for o in objects),
            'pivot':'ground center','units':'one base grid cell','status':'modelled; visual review required'}
