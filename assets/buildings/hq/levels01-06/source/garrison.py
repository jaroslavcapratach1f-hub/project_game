"""Four shared HQ guards with fixed machine guns; no gameplay troop entities."""
from mesh_tools import *
from mathutils import Matrix
from guard_figure import build_guard
POSTS=[(-1.85,.70,1.28,-math.pi/2),(1.85,.70,1.28,math.pi/2),
       (-2.05,-2.85,.065,0),(2.05,-2.85,.065,0)]


def gun():
    # A fixed belt-fed field machine gun with receiver, cooling jacket and pintle.
    z=.56
    cube('Fixed gun receiver',(0,-.29,z),(.115,.25,.095),metal,.012)
    cube('Receiver lid',(0,-.29,z+.056),(.12,.25,.025),metal,.006)
    beam('Gun cooling jacket',(0,-.41,z),(0,-.74,z),.065,material=metal)
    beam('Machine gun barrel',(0,-.73,z),(0,-.89,z),.028,material=metal)
    for i in range(5):
        for side in [-1,1]:cube('Jacket cooling slot',(side*.034,-.45-i*.055,z),(.008,.028,.026),wooddark,0)
    cube('Muzzle opening',(0,-.90,z),(.021,.008,.018),wooddark,0)
    beam('Gun front sight',(0,-.79,z),(0,-.79,z+.065),.013,material=metal)
    beam('Gun rear sight',(0,-.20,z+.045),(0,-.20,z+.08),.02,material=metal)
    for side in [-1,1]:beam('Gun rear grip',(side*.055,-.13,z),(side*.055,-.11,z-.08),.025,material=wooddark)
    cyl('Fixed gun pintle',(0,-.33,.30),.029,.48,metal,8)
    for x,y in [(-.21,-.13),(.21,-.13),(0,-.62)]:beam('Pintle anchored tripod',(0,-.33,.28),(x,y,.035),.027,material=metal)
    cube('Gun ammunition box',(-.16,-.30,.46),(.15,.21,.17),boxgreen,.015)
    for i in range(5):cube('Linked ammunition belt',(-.14+i*.025,-.275,.55),(.02,.055,.025),woodlight,.004)


def garrison():
    before=set(bpy.context.scene.objects);build_guard();gun()
    templates=list(set(bpy.context.scene.objects)-before)
    for index,(x,y,z,angle) in enumerate(POSTS):
        transform=Matrix.Translation((x,y,z))@Matrix.Rotation(angle,4,'Z')
        for template in templates:
            o=template.copy();o.data=template.data;bpy.context.collection.objects.link(o)
            o.matrix_world=transform@template.matrix_world
            o.name='Post '+str(index+1)+' '+template.name
    for o in templates:bpy.data.objects.remove(o,do_unlink=True)
