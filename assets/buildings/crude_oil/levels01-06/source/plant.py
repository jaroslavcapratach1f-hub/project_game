"""Connected storage vessels, pipe manifold and modest timber service hut."""
import bpy,math
from geometry import box,rod,beam,ring,curve,finish,M,material,mesh

def tank(x,y,r=.62,h=1.80):
 ring('Tank foot ring',(x,y,.045),r,.035,'steel','Z')
 rod('Welded storage shell',(x,y,.045),(x,y,h),r,'olive',40)
 for z in [.29,.88,h-.06]:ring('Tank rolled seam',(x,y,z),r,.022,'edge','Z')
 bpy.ops.mesh.primitive_uv_sphere_add(segments=32,ring_count=12,location=(x,y,h));o=bpy.context.object;o.scale=(r,r,.15);finish(o,'Dished tank crown','olive')
 rod('Inspection hatch',(x,y,h+.11),(x,y,h+.19),.20,'steel',24)
 rod('Tank vent',(x+.18,y+.15,h+.05),(x+.18,y+.15,h+.43),.04,'steel')
 rod('Vent hood',(x+.18,y+.15,h+.41),(x+.18,y+.15,h+.46),.075,'edge')
 for z in [.4,.85,1.30]:box('Painted tank measure',(x+r+.006,y,z),(.009,.055,.21),'letter',0)

def pipework():
 curve('Well to collection manifold',[(-2.46,-.53,.52),(-2.46,-1.12,.52),(-2.35,-1.23,.40),(.85,-1.23,.40),(1.0,-1.38,.40),(1.0,-2.06,.40),(1.7,-2.06,.40)],.052,'steel')
 curve('Tank delivery pipe',[(1.7,-2.06,.42),(2.48,-2.06,.42),(2.6,-1.90,.42),(2.6,-.45,.42)],.052,'steel')
 for x in [-1.9,-.7,.5]:
  box('Pipe shoe',(x,-1.23,.025),(.15,.16,.05),'steel')
  rod('Pipe support',(x,-1.23,.05),(x,-1.23,.4),.024)
 for y in [-1.72,-.76]:
  rod('Manifold valve',(2.6,y,.42),(2.6,y,.66),.04,'edge')
  ring('Manifold handwheel',(2.6,y,.67),.11,.015,'valve','Z')
  for a in [0,math.pi/2]:rod('Valve spoke',(2.6-.1*math.cos(a),y-.1*math.sin(a),.67),(2.6+.1*math.cos(a),y+.1*math.sin(a),.67),.008,'valve')

def hut():
 x0,x1=-2.66,-.06;y0,y1=1.08,2.77
 for y in [1.18,2.67]:box('Timber shed sill',(-1.36,y,.17),(2.70,.17,.34),'darkwood',.015)
 for i in range(11):
  z=.40+i*.17
  box('Rear weatherboard',(-1.36,y1,z),(2.6,.11,.16),'wood')
  for x in [x0,x1]:box('Side weatherboard',(x,1.925,z),(.11,1.69,.16),'wood')
  # Door left and glazed workshop window right.
  if z>1.99:box('Front header',(-1.36,y0,z),(2.6,.11,.16),'wood')
  else:
   box('Door left boards',(-2.52,y0,z),(.27,.11,.16),'wood')
   box('Front pier',(-1.38,y0,z),(.37,.11,.16),'wood')
   if z<1.12 or z>1.79:box('Window sill boards',(-.59,y0,z),(1.18,.11,.16),'wood')
 for x in [x0,x1]:box('Corner upright',(x,y0-.04,1.22),(.13,.13,1.9),'trim')
 box('Door',(-1.98,y0-.02,1.16),(.74,.09,1.75),'darkwood')
 for i in range(6):box('Door boards',(-2.30+i*.128,y0-.085,1.16),(.119,.035,1.7),'wood')
 for z in [.51,1.79]:box('Door strap',(-1.98,y0-.11,z),(.65,.03,.045),'steel')
 box('Latch',(-1.70,y0-.145,1.11),(.045,.035,.19),'steel')
 box('Window glass',(-.60,y0-.025,1.46),(1.00,.04,.65),'glass')
 for x in [-1.11,-.60,-.09]:box('Window upright',(x,y0-.09,1.46),(.045,.09,.73),'trim')
 for z in [1.10,1.82]:box('Window frame',(-.60,y0-.09,z),(1.10,.12,.07),'trim')
 box('Timber entry step',(-1.98,.82,.13),(.90,.40,.26),'wood',.018)
 box('Rear upper weatherboard',(-1.36,y1,2.29),(2.6,.11,.25),'wood')
 for x in [x0,x1]:
  mesh('Sloped eave closure',[(x-.05,y0,2.16),(x-.05,y1,2.16),(x-.05,y1,2.46),(x+.05,y0,2.16),(x+.05,y1,2.16),(x+.05,y1,2.46)],[(0,2,1),(3,4,5),(0,3,5,2),(1,2,5,4),(0,1,4,3)],'wood')
 for y,z in [(1.0,2.22),(2.87,2.48)]:box('Roof fascia',(-1.36,y,z),(2.99,.08,.14),'trim')
 for i in range(10):
  x=-2.8+i*.316;o=box('Olive roof sheet',(x,1.935,2.36),(.317,2.02,.047),'roof');o.rotation_euler.x=.138
  beam('Standing seam',(x, .94,2.23),(x,2.94,2.51),.015,.018,'edge')

def plant():
 material('bright',(.16,.18,.18),.4,.7)
 material('valve',(.075,.015,.008),.72,.3)
 tank(2.85,-.58,.49,1.80);tank(2.85,-2.05,.49,1.49)
 hut();pipework();separator()

def separator():
 tank(1.20,1.74,.42,2.05)
 curve('Collection line',[(2.85,-.58,.49),(2.85,.69,.49),(1.2,.69,.49),(1.2,1.74,.49)],.06,'steel')
 curve('Gas vent',[(1.2,1.74,2.05),(1.2,1.74,2.35),(2.78,1.74,2.35),(2.92,1.74,2.52),(2.92,1.74,3.75)],.057,'steel')
 box('Vent mounting plate',(2.92,1.74,.035),(.30,.30,.07),'steel')
 rod('Vent support',(2.92,1.74,.05),(2.92,1.74,3.76),.09,'steel')
 ring('Vent cap',(2.92,1.74,3.78),.11,.025,'edge','Z')
 for x in [2.57,3.17]:
  rod('Oil drum',(x,.91,.025),(x,.91,.82),.25,'olive',24)
  for z in [.13,.29,.64,.80]:ring('Drum rolled rim',(x,.91,z),.25,.014,'edge','Z')
