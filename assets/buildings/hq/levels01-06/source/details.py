"""HQ-specific entrance, signals equipment and command-yard details."""
from mesh_tools import *
from architecture import roof,door

def label(text,location,size,material):
    curve=bpy.data.curves.new('Command lettering','FONT');curve.body=text;curve.align_x='CENTER';curve.size=size;curve.extrude=.002
    o=bpy.data.objects.new('Headquarters identifier',curve);bpy.context.collection.objects.link(o);o.location=location;o.rotation_euler=(math.pi/2,0,0);o.data.materials.append(material)
    bpy.context.view_layer.objects.active=o;o.select_set(True);bpy.ops.object.convert(target='MESH');o.select_set(False)

def entrance():
    for i in range(3):cube('Broad entrance step',(0,-1.82-i*.18,.22-i*.06),(1.65,.26,.12),woodlight,.018)
    for i in range(10):cube('Porch deck plank',(-.86+i*.19,-1.34,.31),(.18,1.02,.085),woodlight,.01)
    for x in [-.88,.88]:
        cube('Porch support post',(x,-1.74,.99),(.12,.12,1.48),woodlight,.014)
        beam('Porch knee brace',(x,-1.74,1.28),(x*.56,-1.74,1.7),.075,material=wood)
    roof(0,-1.25,2.06,1.2,1.73,.36)
    door(0,-.88,.78,.82)
    cube('Command name board',(0,-.887,3.36),(1.75,.10,.30),wooddark,.01)
    label('BASE COMMAND',(0,-.947,3.29),.16,ceramic)
    cube('Olive command designation board',(0,-.925,2.91),(.81,.06,.42),boxgreen,.008)
    label('HQ',(0,-.969,2.79),.32,ceramic)

def signals():
    cyl('Timber radio mast',(-2.95,1.70,1.9),.055,3.8,woodlight,8)
    beam('Radio crossarm',(-3.38,1.70,3.5),(-2.52,1.70,3.5),.045,material=wooddark)
    for side in [-1,1]:
        cable('Radio guy cable',[(-2.95,1.70,3.2),(-2.95+side*.30,1.95,.04)],.008)
    cyl('Aerial receiving timber mast',(0,1.90,1.76),.045,3.52,woodlight,8)
    cable('Field telephone aerial',[(-2.95,1.70,3.55),(-1.48,1.80,3.20),(0,1.90,3.52)],.008)
    cube('Radio equipment box',(-2.95,1.38,.36),(.38,.32,.64),boxgreen,.025)

def yard():
    # Separate narrow paths avoid a large floating rectangular terrain plate.
    for y in [-2.25,-2.6,-2.95]:cube('Entrance timber walkway',(0,y,.035),(1.26,.30,.055),woodlight,.018)


def command_identity():
    for x in [-.62,.62]:
        beam('Door lamp bracket',(x,-.9,1.48),(x,-1.08,1.48),.025,material=metal)
        cube('Entrance lamp glass',(x,-1.08,1.36),(.10,.09,.16),ceramic,.012)
        for z in [1.26,1.46]:cube('Lamp metal cap',(x,-1.08,z),(.14,.13,.035),metal,.006)
