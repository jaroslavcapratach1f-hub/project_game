"""Static assembly vignette using the existing detailed tank, plus loading stores."""
import bpy,math
from mathutils import Vector,Matrix
from geometry import box,beam,rod,ring,curve,mesh

def assembly(root):
 pivot=tank(root);gantry(pivot);stores();benches()

def import_part(path,name):
 before=set(bpy.data.objects);bpy.ops.import_scene.gltf(filepath=str(path));bpy.context.view_layer.update()
 new=set(bpy.data.objects)-before;parts=[o for o in new if o.type=='MESH']
 for o in parts:
  world=o.matrix_world.copy();o.parent=None;o.matrix_world=Matrix.Identity(4);o.data.transform(world);o.name=name
  # Keep fine silhouette and original textures; reduce invisible reconstruction noise.
  bpy.context.view_layer.objects.active=o
  if len(o.data.polygons)>10000:
   mod=o.modifiers.new('Static prop reduction','DECIMATE');mod.ratio=.45;bpy.ops.object.modifier_apply(modifier=mod.name)
 for o in new:
  if o.type!='MESH':bpy.data.objects.remove(o,do_unlink=True)
 return parts

def tank(root):
 units=root.parents[2]/'units/m4_sherman/tier01'
 hull=import_part(units/'m4_sherman_hull.glb','Tank under assembly — hull')
 pts=[v.co.copy() for o in hull for v in o.data.vertices]
 lo=Vector([min(p[i] for p in pts) for i in range(3)]);hi=Vector([max(p[i] for p in pts) for i in range(3)])
 scale=4.65/(hi.y-lo.y);cx=(lo.x+hi.x)/2;cy=(lo.y+hi.y)/2
 # Imported GLB -Z forward becomes Blender +Y; rotate onto the open -Y exit.
 transform=Matrix.Translation(Vector((0,-1.05,-lo.z*scale)))@Matrix.Rotation(math.pi,4,'Z')@Matrix.Scale(scale,4)@Matrix.Translation(Vector((-cx,-cy,0)))
 for o in hull:o.data.transform(transform)
 # Source turret-ring pivot expressed in Blender's Z-up coordinates.
 pivot=transform@Vector((-.000169,-.0703675,.075));deck=pivot.z
 ring('Exposed turret bearing',(pivot.x,pivot.y,deck+.024),.69,.027,'edge','Z')
 turret=import_part(units/'m4_sherman_turret.glb','Suspended turret awaiting installation')
 lift=Vector((pivot.x,pivot.y,deck+.62))
 for o in turret:o.data.transform(Matrix.Translation(lift)@Matrix.Rotation(math.pi,4,'Z')@Matrix.Scale(scale,4))
 # Four lifting slings link the turret corners to a central hook under the gantry.
 top=(pivot.x,pivot.y,3.18)
 for x in [-.42,.42]:
  for y in [-.33,.33]:curve('Turret lifting sling',[(pivot.x+x,pivot.y+y,deck+.91),top],.016,'steel')
 ring('Crane lifting eye',top,.07,.018,'edge','Y')
 # A removed armor cover and small tool trolley make the assembly stage legible.
 o=box('Unfitted armor plate',(1.65,-.45,.48),(.08,.78,.68),'Primer',.014);o.rotation_euler.y=-.18
 return pivot


def gantry(pivot):
 y=pivot.y
 for x in [-1.87,1.87]:
  box('Assembly crane rail foot',(x,y,.075),(.32,1.15,.15),'steel',.016)
  beam('Assembly gantry column',(x,y,.15),(x,y,3.38),.09,.14,'olive')
  for dy in [-.45,.45]:beam('Gantry foot brace',(x,y+dy,.15),(x,y,.77),.045,.05,'steel')
 box('Overhead hoist beam',(0,y,3.39),(3.97,.17,.16),'olive',.014)
 for z in [3.30,3.48]:box('Hoist beam flange',(0,y,z),(4.02,.29,.028),'edge')
 box('Chain hoist trolley',(0,y,3.28),(.30,.30,.14),'steel',.025)
 curve('Hoist chain',[(0,y,3.26),(0,y,3.18)],.014,'edge')

def crate(x,y,z,w=1.0,d=.60,h=.47,opened=False):
 box('Ammunition crate bottom',(x,y,z+.035),(w,d,.07),'darkwood')
 for yy in [-d/2,d/2]:
  for row in range(3):box('Crate side plank',(x,y+yy,z+.12+row*(h-.12)/3),(w,.044,(h-.12)/3-.007),'wood')
 for xx in [-w/2,w/2]:box('Crate end',(x+xx,y,z+h/2),(.047,d,h),'trim')
 for xx in [-w*.34,w*.34]:
  for yy in [-d/2-.026,d/2+.026]:box('Crate retaining strap',(x+xx,y+yy,z+h/2),(.038,.021,h+.02),'steel')
 if not opened:
  for i in range(3):box('Closed crate lid',(x,y-d/3+i*d/3,z+h),(w,d/3-.008,.045),'wood')


def stores():
 # All ammunition is beside the rollout corridor, never across the exit.
 for side in [-1,1]:
  x=side*3.35
  for y in [-3.77,-2.94]:
   crate(x,y,.06,1.25,.67,.47)
  crate(x,-3.34,.56,1.14,.67,.45)
  for yy in [-3.93,-2.74]:box('Crate ground bearer',(x,yy,.04),(1.40,.10,.08),'darkwood')
 crate(3.35,-1.98,.075,1.47,.57,.39,True)
 for i in range(3):rocket(2.87+i*.46,-1.98,.32)
 # Removed crate lid rests beside the open rocket box, with timber cross battens.
 o=box('Open crate lid',(4.25,-2.02,.37),(.07,.65,.65),'wood');o.rotation_euler.y=.22
 for z in [.18,.55]:box('Lid cross batten',(4.20,-2.02,z),(.04,.61,.05),'trim')


def rocket(x,y,z):
 # Small inert warehouse props; recognizable finned projectiles in transport cradles.
 rod('Rocket body',(x,y-.27,z),(x,y+.27,z),.066,'olive',16)
 rod('Rocket identification band',(x,y-.17,z),(x,y-.13,z),.069,'Safety yellow',16)
 bpy.ops.mesh.primitive_cone_add(vertices=16,radius1=.066,radius2=.006,depth=.15,location=(x,y-.345,z),rotation=(math.pi/2,0,0))
 from geometry import finish
 finish(bpy.context.object,'Rocket nose','olive')
 for angle in [0,math.pi/2]:
  o=box('Rocket tail fin',(x,y+.20,z),(.21,.16,.013),'edge',.002);o.rotation_euler.y=angle


def benches():
 for x in [-3.20,3.20]:
  box('Assembly workbench',(x,1.0,.84),(1.07,2.12,.095),'wood')
  for dx in [-.41,.41]:
   for y in [.13,1.87]:box('Bench leg',(x+dx,y,.42),(.07,.07,.84),'steel')
  crate(x,1.35,.92,.68,.47,.33)
  box('Tool case',(x,.42,.98),(.44,.41,.18),'olive',.026)
  box('Tool case handle',(x,.42,1.10),(.16,.035,.04),'edge')
 for x in [-3.5,3.5]:
  rod('Workshop oil drum',(x,3.5,.02),(x,3.5,.91),.30,'olive',24)
  for z in [.08,.29,.68,.87]:ring('Drum rolled hoop',(x,3.5,z),.30,.017,'steel','Z')
