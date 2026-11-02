"""WWII field R&D laboratory: stepped instrument hall and an attached test bay."""
import bpy,math
from geometry import box,beam,rod,ring,mesh,curve,material,M

def academy():
 material('Academy glass',(.022,.040,.043),.34,.22)
 material('Blueprint',(.024,.095,.12),.93)
 material('Chalk',(.42,.43,.34),.96)
 material('Blackboard',(.013,.029,.021),.94)
 material('Engine alloy',(.105,.115,.108),.62,.55)
 material('Rubber',(.009,.011,.010),.94)
 laboratory();roof_monitor();test_bay();entrance();ventilation()

def wall(a,b,fixed,height,side=False,holes=()):
 for row in range(math.ceil(height/.175)):
  z0=row*.175;z1=min(z0+.168,height);spans=[(a,b)]
  for u,v,lo,hi in holes:
   if z1<=lo or z0>=hi:continue
   result=[]
   for l,r in spans:
    if u>=r or v<=l:result.append((l,r));continue
    if u>l:result.append((l,u))
    if v<r:result.append((v,r))
   spans=result
  for l,r in spans:box('Laboratory timber siding',(fixed,(l+r)/2,(z0+z1)/2) if side else ((l+r)/2,fixed,(z0+z1)/2),(.12,r-l,z1-z0) if side else (r-l,.12,z1-z0),'wood')

def windows(a,b,fixed,z,h,side=False):
 box('Laboratory glazing',(fixed,(a+b)/2,z) if side else ((a+b)/2,fixed,z),(.03,b-a,h) if side else (b-a,.03,h),'Academy glass')
 n=math.ceil((b-a)/.43)
 for i in range(n+1):
  u=a+(b-a)*i/n
  box('Steel laboratory sash',(fixed,u,z) if side else (u,fixed,z),(.073,.026,h+.06) if side else (.026,.073,h+.06),'steel')
 for zz in [z-h/2,z,z+h/2]:box('Laboratory transom',(fixed,(a+b)/2,zz) if side else ((a+b)/2,fixed,zz),(.078,b-a+.12,.036) if side else (b-a+.12,.078,.036),'edge')

def laboratory():
 # Solid timber walls interrupted by long technical-workroom window bands.
 wall(-3.7,.7,-.55,2.49,holes=[(-3.35,-1.18,.94,2.02),(-.81,.25,0,2.12)])
 wall(-3.7,.7,3.62,2.49,holes=[(-3.35,.35,.94,2.02)])
 for x in [-3.7,.7]:wall(-.55,3.62,x,2.49,True,[(.0,3.18,.94,2.02)])
 windows(-3.35,-1.18,-.63,1.48,1.08);windows(-3.35,.35,3.70,1.48,1.08)
 for x in [-3.78,.78]:windows(0,3.18,x,1.48,1.08,True)
 for x in [-3.72,.72]:
  for y in [-.57,1.53,3.64]:box('Laboratory structural post',(x,y,1.25),(.11,.13,2.50),'trim')
 roof_panel(-3.90,.88,-.72,3.79,2.52)
 # Rear instrument room rises above the low main laboratory roof.
 for y in [1.83,3.48]:wall(-2.90,-.10,y,3.29)
 for x in [-2.90,-.10]:wall(1.83,3.48,x,3.29,True)
 for y in [1.75,3.56]:windows(-2.65,-.36,y,2.91,.43)
 roof_panel(-3.03,.03,1.70,3.61,3.35)

def roof_panel(x0,x1,y0,y1,z):
 # Shallow industrial roof; exposed folded edges, no domestic pitched gable.
 o=box('Low pitch olive roof',((x0+x1)/2,(y0+y1)/2,z),(x1-x0,y1-y0,.065),'roof');o.rotation_euler.x=.027
 for x in [x0,x1]:beam('Folded roof edge',(x,y0,z-.035),(x,y1,z+.08),.044,.06,'olive')
 for i in range(math.ceil((x1-x0)/.40)):
  x=x0+.16+i*.40
  beam('Roof standing seam',(x,y0,z-.02),(x,y1,z+.10),.013,.018,'edge')


def roof_monitor():
 # Large rooflight over the drawing tables; steel frames make the use technical.
 for x in [-3.26,-1.92]:
  box('Rooflight sill',(x,.52,2.64),(1.12,1.39,.13),'olive')
  o=box('Technical drafting rooflight',(x,.52,2.78),(1.03,1.30,.035),'Academy glass');o.rotation_euler.x=.13
  for xx in [x-.54,x+.54]:beam('Raised rooflight edge',(xx,-.13,2.735),(xx,1.17,2.905),.035,.04,'olive')
  for y in [-.05,.34,.74,1.12]:beam('Rooflight crossbar',(x-.54,y,2.81+(y-.52)*.13),(x+.54,y,2.81+(y-.52)*.13),.03,.034,'steel')


def test_bay():
 # Attached bay has a wide unobstructed equipment opening, not a retail awning.
 wall(.77,3.65,2.83,2.12)
 wall(-.66,2.83,3.65,2.12,True,[(.55,2.18,.9,1.79)])
 windows(.55,2.18,3.73,1.345,.89,True)
 for x in [.84,3.61]:
  box('Test bay front column',(x,-.70,1.11),(.115,.15,2.22),'steel')
  beam('Test bay bracket',(x,-.70,1.84),(x+(.32 if x<2 else -.32),-.70,2.17),.05,.065,'steel')
 box('Test bay lintel',(2.225,-.70,2.22),(2.94,.15,.18),'olive')
 roof_panel(.70,3.83,-.89,3.02,2.35)
 # Raised workshop door is folded into the lintel, leaving the machinery visible.
 for z in [2.04,2.11,2.18]:box('Folded test bay shutter',(2.225,-.80,z),(2.61,.045,.054),'olive')


def entrance():
 for x in [-.86,.30]:box('Recessed door jamb',(x,-.62,1.09),(.08,.16,2.18),'trim')
 box('Laboratory entrance door',(-.28,-.62,1.06),(1.06,.07,2.10),'olive')
 box('Door inspection window',(-.28,-.666,1.54),(.65,.012,.55),'Academy glass')
 box('Door pull',(.12,-.72,1.0),(.028,.055,.20),'edge')
 box('Entrance threshold',(-.28,-.81,.075),(1.28,.34,.15),'darkwood')
 box('Research identification plate',(-1.57,-.65,2.28),(3.37,.055,.26),'olive')
 bpy.ops.object.text_add(location=(-1.57,-.684,2.20),rotation=(math.pi/2,0,0));o=bpy.context.object;o.data.body='RESEARCH & DEVELOPMENT';o.data.align_x='CENTER';o.data.size=.164;o.data.extrude=.001;o.data.materials.append(M['letter'])


def ventilation():
 for x,y in [(-3.12,3.17),(-.47,3.09)]:
  rod('Laboratory exhaust stack',(x,y,3.30),(x,y,3.92),.10,'olive',20)
  rod('Exhaust weather cap',(x,y,3.92),(x,y,3.98),.18,'olive',20)
  for dx in [-.12,.12]:rod('Vent cap bracket',(x+dx,y,3.85),(x+dx,y,3.94),.012,'steel')
 # Connected rectangular extraction duct from the engine test room.
 rod('Round extraction riser',(3.20,2.33,2.31),(3.20,2.33,3.10),.12,'olive',20)
 curve('Swept extraction elbow',[(2.96+.24*math.cos(i*math.pi/16),2.33,3.10+.24*math.sin(i*math.pi/16)) for i in range(9)],.12,'olive')
 rod('Horizontal exhaust duct',(2.17,2.33,3.34),(2.96,2.33,3.34),.12,'olive',20)
 for x in [2.21,2.85]:ring('Duct circular flange',(x,2.33,3.34),.128,.017,'edge','X')
 for z in [2.52,2.85]:ring('Riser strap',(3.20,2.33,z),.124,.011,'steel','Z')
 rod('Dark exhaust opening',(2.16,2.33,3.34),(2.17,2.33,3.34),.105,'Blackboard',20)
