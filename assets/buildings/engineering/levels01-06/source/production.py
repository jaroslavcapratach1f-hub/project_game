"""Low boiler annex and modest material delivery stock, without ground flooring."""
import bpy,math
from crane import crane
from geometry import box,rod,ring,curve,finish,material,mesh,beam

def production():
 boiler();stock();handcart();replacement_stock();crane()

def boiler():
 for row in range(8):
  z=.085+row*.17
  for y in [.24,1.76]:box('Service room timber siding',(2.16,y,z),(1.2,.10,.164),'wood')
  for x in [1.57,2.75]:box('Service room timber side',(x,1.0,z),(.10,1.52,.164),'wood')
 for x in [1.58,2.74]:
  for y in [.25,1.75]:box('Service room corner',(x,y,.68),(.10,.12,1.36),'trim')
 o=box('Boiler room roof',(2.16,1.0,1.46),(1.40,1.72,.05),'roof');o.rotation_euler.y=.12
 box('Boiler access door',(2.18,.21,.55),(.57,.06,.77),'steel',.035)
 for z in [.29,.80]:box('Door hinge',(2.45,.165,z),(.10,.035,.06),'edge')
 ring('Firebox door wheel',(2.20,.14,.58),.10,.012,'edge','Y')
 chimney()
 curve('Steam service pipe',[(1.65,.25,1.22),(1.95,.25,1.22),(2.04,.15,1.13),(2.04,-.22,.52),(1.32,-.22,.52)],.028,'steel')
 # Small extraction housing against the production wall.
 box('Extraction housing',(1.71,1.97,1.69),(.18,.52,.58),'olive',.04)
 rod('Extractor rim',(1.77,1.97,1.69),(1.88,1.97,1.69),.21,'edge',24)
 for i in range(5):box('Extractor grille',(1.885,1.81+i*.08,1.69),(.012,.016,.34),'steel',.002)


def stock():
 # Yard objects keep the building modest within its unchanged 3x4 plot.
 for x in [-3.64,-2.40]:box('Log crib',(x,-2.71,.09),(.14,.70,.18),'darkwood')
 for i in range(3):
  y=-2.94+i*.25;rod('Raw log',(-4.0,y,.31),(-2.10,y,.31),.125,'darkwood',14)
  rod('Cut log end',(-4.004,y,.31),(-3.995,y,.31),.119,'trim',14)
 for y in [-2.51,-1.45]:box('Finished timber bearer',(-1.25,y,.06),(.63,.12,.12),'darkwood')
 for j in range(3):
  for i in range(3):box('Timber bundle',(-1.47+i*.21,-2.0,.17+j*.115),(.192,1.57,.09),'wood')
 for y in [-2.55,-1.47]:
  box('Bundle band',(-1.26,y,.45),(.66,.025,.018),'steel',.002)
  for x in [-1.59,-.93]:box('Bundle band side',(x,y,.285),(.013,.025,.32),'steel',.002)
 for x in [1.0,1.94]:box('Brick pallet runner',(x,-2.19,.06),(.12,.71,.12),'wood')
 for i in range(5):box('Brick pallet deck',(1.00+i*.24,-2.19,.135),(.22,.71,.035),'trim')
 for row in range(4):
  for i in range(4):
   for j in range(3):box('Fired brick stock',(1.0+i*.28+(row%2)*.04,-2.43+j*.21,.205+row*.10),(.26,.18,.085),'brick',.008)
 # Attached low electrical/service cabinet beside the boiler room.
 box('Service cabinet',(3.20,1.02,.49),(.87,.75,.98),'olive',.025)
 box('Cabinet rain cap',(3.20,1.02,1.015),(.98,.87,.07),'roof')
 for x in [2.985,3.415]:
  box('Service cabinet panel',(x,.625,.50),(.40,.035,.83),'olive')
  box('Cabinet latch',(x+.10,.595,.52),(.025,.025,.10),'edge')


def handcart():
 x,y=.10,-2.55
 for i in range(5):box('Handcart deck',(x,y-.22+i*.11,.31),(1.00,.10,.055),'wood')
 rod('Cart axle',(x-.08,y-.40,.23),(x-.08,y+.40,.23),.03,'steel')
 for yy in [y-.38,y+.38]:
  ring('Steel cart wheel',(x-.08,yy,.23),.21,.025,'steel','Y')
  for i in range(6):
   a=i*math.pi/3;rod('Wheel spoke',(x-.08,yy,.23),(x-.08+.19*math.cos(a),yy,.23+.19*math.sin(a)),.009,'edge')
 for yy in [y-.23,y+.23]:rod('Cart handle',(x+.25,yy,.28),(x+.95,yy,.53),.025,'trim')
 for i in range(3):box('Cart material crate',(x-.10,y-.15+i*.16,.46),(.53,.14,.24),'wood')


def chimney():
 # Individual staggered radial bricks, recessed mortar and a deep open flue.
 material('Chimney mortar',(.037,.034,.027),.98)
 material('Chimney soot',(.003,.0025,.002),1)
 cx,cy,z0=2.35,1.18,1.46;course=.0775;rows=28;n=8
 bpy.ops.mesh.primitive_cone_add(end_fill_type='NOTHING',vertices=32,radius1=.265,radius2=.175,depth=rows*course,location=(cx,cy,z0+rows*course/2));finish(bpy.context.object,'Recessed chimney mortar','Chimney mortar')
 for row in range(rows):
  low=z0+row*course+.0015;high=low+course-.003
  rb=.27-.09*row/rows;rt=.27-.09*(row+1)/rows
  if row>25:rb+=.017;rt+=.017
  for k in range(n):
   start=(k+(row%2)*.5)*2*math.pi/n+.004;end=start+2*math.pi/n-.008
   verts=[]
   for z,r in [(low,rb),(high,rt),(low,rb-.055),(high,rt-.055)]:
    for j in range(4):
     a=start+(end-start)*j/3;verts.append((cx+r*math.cos(a),cy+r*math.sin(a),z))
   faces=[]
   for j in range(3):faces.extend([(j,j+1,j+5,j+4),(j+8,j+12,j+13,j+9),(j+4,j+5,j+13,j+12),(j,j+8,j+9,j+1)])
   faces.extend([(0,4,12,8),(3,11,15,7)])
   o=mesh('Radial fired chimney brick',verts,faces,'brick')
   for poly in o.data.polygons:
    for li in poly.loop_indices:
     v=o.data.vertices[o.data.loops[li].vertex_index].co;o.data.uv_layers.active.data[li].uv=(.018+((li%4)/3)*.084,.018+(v.z-low)/(high-low)*.058)
   o.modifiers.clear()
 bpy.ops.mesh.primitive_cylinder_add(end_fill_type='NOTHING',vertices=32,radius=.121,depth=.30,location=(cx,cy,z0+rows*course-.15));finish(bpy.context.object,'Sooted inner flue','Chimney soot')
 rod('Deep chimney darkness',(cx,cy,3.30),(cx,cy,3.305),.122,'Chimney soot',32)
 for z,r in [(1.56,.267),(2.51,.226),(3.40,.189)]:ring('Chimney iron tie',(cx,cy,z),r,.009,'steel','Z')


def replacement_stock():
 # The former front shed is now a low, accessible material storage area.
 for x in [-3.52,-2.28]:box('Timber stack ground bearer',(x,-1.30,.065),(.15,1.02,.13),'darkwood')
 for row in range(5):
  for j in range(5):box('Seasoned construction board',(-2.91,-1.70+j*.185,.19+row*.123),(1.90-(row%2)*.10,.17,.093),'wood')
  for x in [-3.52,-2.28]:box('Stack drying spacer',(x,-1.33,.125+row*.123),(.065,.94,.035),'trim')
 for x in [-3.51,-2.29]:
  box('Lumber binding band',(x,-1.33,.737),(.026,.93,.018),'steel',.002)
  for y in [-1.79,-.86]:box('Stack strap end',(x,y,.415),(.026,.013,.64),'steel',.002)
 # A short stack of reusable timber formwork panels beside the boards.
 for row in range(3):
  for j in range(4):box('Formwork panel',(-2.77+j*.15,-2.05,.07+row*.083),(.14,.43,.063),'trim')

