"""Distinctive octagonal officer recruitment hall with administrative wings."""
import bpy,math
from mathutils import Vector
from geometry import box,beam,rod,mesh,material,M

OUTLINE=[(-1.15,-1.20),(1.15,-1.20),(2.05,-.30),(2.05,2.0),(1.15,2.90),(-1.15,2.90),(-2.05,2.0),(-2.05,-.30)]
def officer_hall():
 material('Officers glass',(.022,.043,.046),.35,.20)
 material('Aged brass',(.19,.135,.045),.66,.4)
 material('Map cloth',(.10,.145,.095),.94)
 hall();crown();entrance();dossier_wing();forward_veranda()

def panel(name,a,b,u,z,w,h,mat,depth=.08,offset=0):
 a,b=Vector(a),Vector(b);t=(b-a).normalized();n=Vector((t.y,-t.x));p=(a+b)/2+t*u+n*offset
 o=box(name,(p.x,p.y,z),(w,depth,h),mat,.006);o.rotation_euler.z=math.atan2(t.y,t.x);return o

def hall():
 for i,a in enumerate(OUTLINE):
  b=OUTLINE[(i+1)%8];length=(Vector(b)-Vector(a)).length
  opening=.76 if i==0 else .58;low=.32 if i==0 else 1.08;high=2.58 if i==0 else 2.52
  for row in range(16):
   z=.40+row*.18;spans=[(-length/2,length/2)]
   if low-.08<z<high+.08:spans=[(-length/2,-opening),(opening,length/2)]
   for l,r in spans:
    if r>l:panel('Octagonal hall weatherboard',a,b,(l+r)/2,z,r-l,.171,'wood',.12)
  if i!=0:
   panel('Tall officers window',a,b,0,1.80,1.16,1.44,'Officers glass',.027,.07)
   for u in [-.60,0,.60]:panel('Window upright',a,b,u,1.80,.040,1.52,'trim',.10,.09)
   for z in [1.06,1.55,2.03,2.54]:panel('Window crosspiece',a,b,0,z,1.28,.04,'trim',.10,.09)
   panel('Window sill',a,b,0,1.01,1.37,.08,'trim',.20,.11)
  for z in [.28,3.25]:panel('Hall belt timber',a,b,0,z,length+.06,.12,'trim',.17)
 for x,y in OUTLINE:box('Octagonal corner upright',(x,y,1.75),(.095,.095,3.06),'trim')
 # The hall is raised only on short timber supports, never a terrain platform.
 for x,y in OUTLINE:box('Hall footing',(x,y,.13),(.22,.22,.26),'darkwood')


def crown():
 center=Vector((0,.85));verts=[]
 for x,y in OUTLINE:
  p=center+(Vector((x,y))-center)*1.095;verts.append((p.x,p.y,3.33))
 verts.append((0,.85,4.78))
 o=mesh('Eight-sided command hall roof',verts,[(i,(i+1)%8,8) for i in range(8)],'roof');o.modifiers.clear();o.modifiers.new('Roof edge thickness','SOLIDIFY').thickness=.045
 for f in o.data.polygons:f.use_smooth=False
 for i in range(8):
  a=Vector(verts[i]);b=Vector(verts[(i+1)%8]);peak=Vector(verts[8])
  rod('Octagonal eave',a,b,.038,'olive')
  rod('Roof hip flashing',a,peak,.025,'edge')
  for frac in [.25,.5,.75]:
   start=a.lerp(b,frac);end=peak.lerp(start,.12)
   beam('Tapered roof standing seam',start+Vector((0,0,.018)),end+Vector((0,0,.018)),.012,.018,'olive')
 rod('Roof crown cap',(0,.85,4.75),(0,.85,4.86),.085,'olive',16)


def entrance():
 for x in [-.80,.80]:box('Double-door frame',(x,-1.29,1.46),(.095,.16,2.36),'trim')
 for sign in [-1,1]:
  x=sign*.375;box('Officer reception door',(x,-1.285,1.46),(.735,.075,2.24),'olive',.013)
  box('Door glazed panel',(x,-1.329,1.92),(.48,.019,.82),'Officers glass')
  box('Door lower raised panel',(x,-1.334,.79),(.51,.03,.64),'trim')
  box('Reception door brass pull',(sign*.12,-1.37,1.30),(.030,.045,.21),'Aged brass')
 for i in range(3):box('Broad reception stair',(0,-2.0+i*.25,.05+i*.10),(2.36,.28,.10+i*.20),'wood',.014)
 for i in range(11):box('Entrance landing board',(-1.21+i*.242,-1.48,.34),(.232,.53,.074),'wood')
 for sign in [-1,1]:
  for y,z in [(-2.09,.84),(-1.39,1.03)]:box('Entry handrail post',(sign*1.15,y,z/2),(.05,.05,z),'steel')
  beam('Entry handrail',(sign*1.15,-2.14,.84),(sign*1.15,-1.36,1.05),.034,.04,'Aged brass')
 box('Officers entrance nameplate',(0,-1.315,2.89),(2.14,.055,.28),'olive',.018)
 bpy.ops.object.text_add(location=(0,-1.349,2.797),rotation=(math.pi/2,0,0));o=bpy.context.object;o.data.body='OFFICERS';o.data.align_x='CENTER';o.data.size=.237;o.data.extrude=.001;o.data.materials.append(M['letter'])
 # Short gabled lintel makes a strong military entrance without a shop awning.
 for sign in [-1,1]:beam('Entrance pediment',(-1.20*sign,-1.38,3.16),(0,-1.38,3.52),.09,.10,'trim')


def dossier_wing():
 # Low enclosed recruiting office on the left, visibly subordinate to the hall.
 for row in range(12):
  z=.15+row*.18
  for y in [-.15,2.57]:box('Dossier wing weatherboard',(-2.95,y,z),(1.85,.115,.172),'wood')
  spans=[(-.15,2.57)] if z<.89 or z>1.80 else [(-.15,.17),(2.25,2.57)]
  for a,b in spans:box('Dossier wing side',(-3.87,(a+b)/2,z),(.12,b-a,.172),'wood')
 panel('Dossier room glazing',(-3.88,2.26),(-3.88,.16),0,1.35,2.08,.92,'Officers glass',.025,.02)
 for y in [.17,.69,1.21,1.73,2.25]:box('Dossier window mullion',(-3.95,y,1.35),(.09,.035,1.02),'trim')
 for z in [.85,1.35,1.85]:box('Dossier window transom',(-3.95,1.21,z),(.09,2.18,.035),'trim')
 o=box('Recruitment wing metal roof',(-3.00,1.21,2.34),(2.19,3.05,.065),'roof');o.rotation_euler.y=-.13
 for y in [-.27+i*.37 for i in range(9)]:beam('Wing standing seam',(-4.09,y,2.22),(-1.91,y,2.50),.013,.018,'edge')
 for x in [-3.90,-2.05]:
  for y in [-.18,2.59]:box('Wing corner trim',(x,y,1.06 if x < -3 else 1.15),(.09,.09,2.12 if x < -3 else 2.27),'trim')


def briefing_veranda():
 for x in [2.0,3.67]:
  for y in [-.16,2.45]:box('Briefing veranda post',(x,y,(2.58-(x-2.84)*.12-.06)/2),(.085,.085,2.58-(x-2.84)*.12-.06),'trim')
 for i in range(10):box('Briefing deck board',(2.03+i*.18,1.15,.22),(.173,2.78,.06),'wood')
 o=box('Briefing roof',(2.84,1.15,2.58),(2.09,3.01,.055),'roof');o.rotation_euler.y=.12
 for y in [-.32+i*.37 for i in range(9)]:beam('Briefing roof seam',(1.795,y,2.72),(3.885,y,2.47),.013,.018,'edge')
 for z in [.67,1.10]:beam('Briefing rear rail',(2.02,2.45,z),(3.67,2.45,z),.045,.05,'trim')
 for y in [1.0,2.45]:box('Side rail upright',(3.67,y,.71),(.055,.055,1.07),'trim')
 for z in [.67,1.10]:beam('Briefing side rail',(3.67,1.0,z),(3.67,2.45,z),.045,.05,'trim')
 box('Briefing step',(2.84,-.42,.07),(1.14,.28,.14),'wood')


def forward_veranda():
 before=set(bpy.data.objects);briefing_veranda()
 for o in set(bpy.data.objects)-before:o.location.y-=.85
