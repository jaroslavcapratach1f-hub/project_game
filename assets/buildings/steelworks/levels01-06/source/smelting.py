"""Approved tilting ladle, furnace feed channel, hot stream and three ingot molds."""
import bpy,math
from mathutils import Matrix
from geometry import *

def smelting_station():
 before=set(bpy.context.scene.objects)
 m=material('Molten steel',(.024,.001,.0001),.60,.02)
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(1,.018,.0005,1);p.inputs['Emission Strength'].default_value=.6
 # Refractory plinth supports a geared iron tipping frame.
 box('Ladle masonry plinth',(.93,-.09,.405),(1.63,1.40,.81),'firebrick',.045)
 for x in [.15,1.70]:
  box('Trunnion foot',(x,-.04,.87),(.34,.55,.13),'steel',.018)
  box('Ladle trunnion upright',(x,-.04,1.53),(.19,.31,1.30),'steel',.022)
  for z in [1.04,1.40,1.93]:bolt((x,-.211,z),r=.032)
 box('Ladle frame crossbeam',(.925,.08,2.34),(1.77,.27,.24),'steel',.025)
 for x in [.19,1.66]:bolt((x,-.075,2.34),r=.035)
 # Thick tapered vessel tipped toward the visible front; the lip is genuinely open.
 origin=Vector((.925,-.22,1.75));rot=Matrix.Rotation(math.radians(58),3,'X')
 rings=[(.30,-.63),(.46,-.35),(.51,.18),(.44,.18),(.38,-.28),(.25,-.52)]
 verts=[tuple(origin+rot@Vector((r*math.cos(i*math.pi/20),r*math.sin(i*math.pi/20),z))) for r,z in rings for i in range(40)]
 faces=[(j*40+i,j*40+(i+1)%40,(j+1)*40+(i+1)%40,(j+1)*40+i) for j in range(5) for i in range(40)]
 mesh('Tilting refractory-lined ladle',verts,faces,'steel')
 rim=ring('Ladle mouth rim',origin+rot@Vector((0,0,.18)),.475,.037,'edge','Z');rim.rotation_euler.x=math.radians(58)
 # Radiant inner bath visible through the tipped mouth, below the rim.
 a=origin+rot@Vector((0,0,-.07));b=origin+rot@Vector((0,0,-.055));rod('Incandescent molten bath',a,b,.387,'Molten steel',40)
 for z in [-.43,.04]:
  band=ring('Riveted ladle band',origin+rot@Vector((0,0,z)),.42 if z<0 else .50,.026,'edge','Z');band.rotation_euler.x=math.radians(58)
 rod('Ladle pivot',(.07,-.01,1.74),(1.79,-.01,1.74),.075,'steel',20)
 ring('Hand tipping wheel',(-.01,-.02,1.71),.27,.025,'edge','X')
 for i in range(5):
  a=i*math.pi*2/5;rod('Wheel spoke',(-.01,-.02,1.71),(-.01,-.02+math.cos(a)*.25,1.71+math.sin(a)*.25),.013,'edge')
 # Feed race slopes down from the furnace into the ladle, not through the frame.
 a=(1.71,.08,1.97);b=(1.95,-.80,1.88)
 channel('Furnace feed race',a,b,.13)
 rod('Hot furnace tap',Vector(a)+Vector((0,0,.023)),Vector(b)+Vector((0,0,.023)),.023,'Molten steel',12)
 # Lip stream curves forward and falls into the central mold.
 lip=origin+rot@Vector((0,-.40,.18))
 curve('Pouring incandescent steel',[tuple(lip),(.925,-.77,1.40),(.925,-.93,1.21),(.925,-1.29,.88),(.925,-1.32,.74)],.027,'Molten steel')
 for o in set(bpy.context.scene.objects)-before:
  if o.name not in ['Furnace feed race','Hot furnace tap']:o.location.x+=.65;o.location.y-=.50
 before=set(bpy.context.scene.objects);molds()
 for o in set(bpy.context.scene.objects)-before:o.location.x+=.65;o.location.y-=.30
 dressing()

def channel(name,a,b,width):
 side=Vector((-(b[1]-a[1]),b[0]-a[0],0)).normalized()*width
 verts=[tuple(Vector(pt)+side*s+Vector((0,0,h))) for pt in [a,b] for s,h in [(-1,.07),(0,0),(1,.07)]]
 mesh(name,verts,[(0,1,4,3),(1,2,5,4)],'steel')

def molds():
 box('Casting platform',(.925,-1.48,.48),(1.98,1.25,.12),'steel',.025)
 for x in [.06,1.79]:
  for y in [-1.99,-.99]:box('Casting stand leg',(x,y,.2475),(.14,.16,.495),'steel',.012)
 for i in range(3):
  x=.29+i*.635
  box('Ingot mold base',(x,-1.48,.60),(.52,.99,.13),'steel',.018)
  for dx in [-.244,.244]:box('Mold longitudinal side',(x+dx,-1.48,.70),(.055,1.00,.16),'edge',.008)
  for y in [-1.94,-1.01]:box('Mold end',(x,y,.70),(.49,.065,.16),'edge',.008)
  box('Glowing red-hot steel ingot',(x,-1.48,.71),(.41,.85,.09),'Molten steel',.015)
  for y in [-1.84,-1.12]:bolt((x+.30,y,.66),'X',.025)

def dressing():
 # Coal shelter attached to the furnace, as in the approved image.
 for x in [2.97,3.65]:
  for y in [.09,1.52]:box('Coal shed post',(x,y,.84),(.09,.10,1.68),'trim')
 for row in range(4):
  box('Coal bin front',(3.31,.09,.25+row*.16),(.81,.07,.15),'wood')
  box('Coal bin side',(3.66,.82,.25+row*.16),(.07,1.46,.15),'wood')
 o=mesh('Coal shed lean-to',[(2.82,-.02,2.12),(3.79,-.02,1.91),(3.79,1.66,1.91),(2.82,1.66,2.12)],[(0,1,2,3)],'roof');o.modifiers.clear();o.modifiers.new('Roof thickness','SOLIDIFY').thickness=.035
 for i in range(36):
  bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.095,location=(3.06+(i%4)*.15,.27+(i//4)*.13,.56+random.uniform(0,.13)));finish(bpy.context.object,'Coal supply','coal')
 for row in range(3):
  for i in range(4-row):box('Cooled ingot stock',(-2.85+i*.33+row*.14,-1.01,.28+row*.17),(.29,.75,.16),'Forged steel face',.025)
 for y in [-1.27,-.76]:box('Ingot pallet bearer',(-2.35,y,.1125),(1.63,.12,.225),'wood')
