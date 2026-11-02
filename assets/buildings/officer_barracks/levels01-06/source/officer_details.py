"""Officer hall rank crest, reception details, briefing table and textured sentries."""
import bpy,math
from mathutils import Vector,Matrix
from geometry import box,beam,rod,ring,curve,mesh,M

def officer_details(root):
 crest();reception();sentries(root)
 before=set(bpy.data.objects);briefing()
 for o in set(bpy.data.objects)-before:o.location.y-=.85

def crest():
 # Original rank shield and laurel: no national insignia, stars or flags.
 verts=[(-.32,-1.42,3.66),(.32,-1.42,3.66),(.32,-1.42,3.28),(0,-1.42,3.08),(-.32,-1.42,3.28)]
 o=mesh('Officer rank shield',verts,[(0,1,2,3,4)],'olive');o.modifiers.new('Shield thickness','SOLIDIFY').thickness=.036
 for i in range(5):rod('Shield brass rim',verts[i],verts[(i+1)%5],.014,'Aged brass')
 for z in [3.29,3.40,3.51]:
  curve('Officer rank chevron',[(-.21,-1.465,z+.08),(0,-1.465,z),(.21,-1.465,z+.08)],.019,'Aged brass')
 for sign in [-1,1]:
  points=[(sign*(.25+.22*math.sin(i*math.pi/12)),-1.445,3.13+i*.048) for i in range(13)]
  curve('Laurel branch',points,.011,'Aged brass')
  for i in range(1,12,2):
   x,y,z=points[i]
   o=box('Laurel leaf',(x+sign*.032,y-.01,z+.025),(.095,.018,.029),'Aged brass',.013);o.rotation_euler.y=-sign*.58


def briefing():
 # A staff map table and dossier cases, visible from the veranda's open front.
 x,y=2.79,.33
 for dx in [-.48,.48]:
  for dy in [-.27,.27]:box('Map table leg',(x+dx,y+dy,.62),(.055,.055,.80),'trim')
 box('Staff map table',(x,y,1.05),(1.24,.77,.085),'wood',.013)
 box('Operational map',(x-.08,y,1.097),(.93,.65,.007),'Map cloth',.001)
 # Terrain contour lines and restrained unit blocks communicate briefing work.
 for i in range(4):
  pts=[(x-.48+j*.055,y-.23+i*.12+.025*math.sin(j*.7+i),1.104) for j in range(16)]
  curve('Map contour',pts,.0025,'paperedge')
 curve('Map main road',[(x-.45,y-.30,1.107),(x-.27,y-.17,1.107),(x-.03,y-.12,1.107),(x+.12,y+.03,1.107),(x+.29,y+.27,1.107)],.006,'paper')
 for xx,yy in [(-.25,.12),(.14,-.21),(.21,.14)]:box('Briefing map marker',(x+xx,y+yy,1.123),(.065,.043,.029),'olive',.005)
 box('Officer dossier',(x+.48,y+.03,1.107),(.16,.24,.026),'darkwood')
 box('Dossier papers',(x+.48,y+.03,1.123),(.135,.215,.008),'paper')
 for yy in [1.21,1.85]:
  box('Briefing chair seat',(2.80,yy,.69),(.46,.44,.052),'wood')
  for xx in [2.63,2.97]:
   for dy in [-.16,.16]:box('Chair leg',(xx,yy+dy,.47),(.035,.035,.47),'trim')
  box('Chair back',(2.80,yy+.17,.98),(.44,.044,.45),'wood')


def reception():
 # Slim lanterns frame the entry, rather than a clutter of oversized military props.
 for x,y in [(-1.43,-1.0),(1.43,-1.0)]:
  curve('Entrance lamp bracket',[(x,y,2.56),(x,y-.22,2.56),(x,y-.27,2.46)],.016,'steel')
  box('Lantern cap',(x,y-.27,2.43),(.20,.20,.045),'olive',.012)
  box('Lantern glass',(x,y-.27,2.30),(.13,.13,.22),'lamp',.013)
  for dx in [-.071,.071]:
   for dy in [-.071,.071]:rod('Lantern frame',(x+dx,y-.27+dy,2.19),(x+dx,y-.27+dy,2.42),.007,'steel')
 # A protected personnel cabinet on the wing, with bound files and dispatch case.
 box('Personnel archive cabinet',(-2.88,-.25,.82),(1.19,.22,1.38),'olive',.018)
 for x in [-3.14,-2.62]:
  box('Archive glass panel',(x,-.378,.88),(.43,.022,.87),'Officers glass')
  for j in range(4):box('Bound officer file',(x-.15+j*.10,-.402,.86),(.055,.017,.54),'darkwood',.004)
 box('Archive nameplate',(-2.88,-.387,1.42),(.67,.018,.095),'Aged brass',.003)
 box('Dispatch briefcase',(-3.04,-.47,.17),(.62,.20,.34),'darkwood',.025)
 curve('Briefcase handle',[(-3.17,-.47,.34),(-3.17,-.47,.39),(-2.91,-.47,.39),(-2.91,-.47,.34)],.013,'edge')


def sentries(root):
 path=root.parents[2]/'units/us_infantry/tier01/soldier.glb'
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(path));bpy.context.view_layer.update()
 new=set(bpy.data.objects)-before;parts=[o for o in new if o.type=='MESH']
 for o in parts:
  world=o.matrix_world.copy();o.parent=None;o.matrix_world=Matrix.Identity(4);o.data.transform(world)
 for o in new:
  if o.type!='MESH':bpy.data.objects.remove(o,do_unlink=True)
 from sentry_pose import stand_at_rest
 stand_at_rest(parts)
 pts=[v.co.copy() for o in parts for v in o.data.vertices]
 lo=Vector([min(p[i] for p in pts) for i in range(3)]);hi=Vector([max(p[i] for p in pts) for i in range(3)])
 scale=1.78/(hi.z-lo.z);center=Vector(((lo.x+hi.x)/2,(lo.y+hi.y)/2,lo.z))
 for o in parts:
  bpy.context.view_layer.objects.active=o
  if len(o.data.polygons)>6000:
   mod=o.modifiers.new('Static sentry detail reduction','DECIMATE');mod.ratio=.45;bpy.ops.object.modifier_apply(modifier=mod.name)
  original=o.data.copy()
  for i,x in enumerate([-1.68,1.68]):
   target=o if i==0 else bpy.data.objects.new('Second entrance sentry',original.copy())
   if i:bpy.context.collection.objects.link(target)
   target.data.transform(Matrix.Translation(Vector((x,-1.83,0)))@Matrix.Rotation(math.pi,4,'Z')@Matrix.Scale(scale,4)@Matrix.Translation(-center))
   target.name='Textured entrance sentry'
