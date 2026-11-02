"""Opaque lobed needle clusters: curved volumes and fine needle shading, no alpha cards."""
from mesh_tools import *

def needle_cluster(center, length, width, angle, rng, material):
    verts=[]; sides=10
    # Two irregular rings give rounded depth instead of a large triangular fan.
    for ring in range(2):
        for j in range(sides):
            t=j*math.tau/sides
            along=math.cos(t)*length*.5*rng.uniform(.82,1.12)
            across=math.sin(t)*width*.5*(1.15 if j%2 else .68)*rng.uniform(.8,1.15)
            verts.append((center[0]+math.cos(angle)*along-math.sin(angle)*across,
                          center[1]+math.sin(angle)*along+math.cos(angle)*across,
                          center[2]+(-.018 if ring==0 else .022)+rng.uniform(-.012,.012)))
    verts.extend([(center[0],center[1],center[2]-.038),(center[0],center[1],center[2]+.062)])
    faces=[]
    for j in range(sides):
        k=(j+1)%sides
        faces.extend([(20,k,j),(21,j+10,k+10),(j,k,k+10,j+10)])
    mesh=bpy.data.meshes.new('Lobed needle spray');mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new('Overlapping irregular needle tuft',mesh);bpy.context.collection.objects.link(o)
    o.data.materials.append(material)
    for polygon in mesh.polygons: polygon.use_smooth=True

# Packed needle mottling, shared between every tree and exported in the GLBs.
def foliage_texture(material, seed):
    rng=random.Random(seed);size=128;image=bpy.data.images.new('Pine needle mottling '+str(seed),width=size,height=size)
    base=material.diffuse_color[:3];pixels=[]
    for y in range(size):
        for x in range(size):
            grain=rng.random();needles=math.sin(x*1.9+y*.7)*.10
            factor=.73+grain*.29+needles+.09*math.sin(x*.14+y*.09)
            pixels.extend([min(1,c**(1/2.2)*factor) for c in base]+[1])
    image.pixels=pixels;image.pack()
    nodes=material.node_tree.nodes;tex=nodes.new('ShaderNodeTexImage');tex.image=image
    # Generated UVs are assigned below, preserving coherent opaque foliage.
    material.node_tree.links.new(tex.outputs['Color'],nodes.get('Principled BSDF').inputs['Base Color'])

def pine_uv():
    for o in bpy.context.scene.objects:
        if o.type!='MESH' or not o.data.materials or o.data.materials[0] not in [foliage,leaflight]: continue
        uv=o.data.uv_layers.new(name='Needle UV')
        for loop in o.data.loops:
            v=o.data.vertices[loop.vertex_index].co
            uv.data[loop.index].uv=(v.x*2+v.z*.3,v.y*2+v.z)

foliage_texture(foliage,17)
foliage_texture(leaflight,29)
