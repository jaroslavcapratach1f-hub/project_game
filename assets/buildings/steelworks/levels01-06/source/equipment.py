"""Approved masonry furnace annex, brick chimney and workshop furnishings."""
import bpy,math,random
from geometry import *

def furnace():
 for i,c in enumerate([(.054,.030,.018),(.067,.036,.020),(.047,.033,.023)]):material('Brick '+str(i),c,.96)
 M['fired brick']=M['Brick 0'];material('firebrick',(.037,.029,.017),.98)
 material('coal',(.008,.009,.008),1);m=material('embers',(.045,.002,.0001),.8)
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Emission Color'].default_value=(1,.035,.001,1);p.inputs['Emission Strength'].default_value=.55
 # Hearth annex, masonry base and a real arched opening on the visible front.
 box('Furnace stone footing',(1.72,1.33,.355),(2.26,2.26,.71),'firebrick',.035)
 for row in range(10):
  z=.83+row*.235;offset=(row%2)*.15
  for x in [.68,2.76]:
   for j in range(7):brick((x,.43+j*.31,z),(.28,.30,.224))
  for j in range(7):brick((.81+j*.30,2.32,z),(.29,.26,.224))
  # Door jambs flank the furnace mouth; infill begins above its arch.
  for x in [.85,2.56]:brick((x,.33,z),(.42,.29,.224))
  if z>2.40:
   for j in range(5):brick((1.10+j*.30,.33,z),(.29,.29,.224))
 for i in range(11):
  a=i*math.pi/10;o=brick((1.71+math.cos(a)*.71,.245,1.79+math.sin(a)*.53),(.23,.35,.29));o.rotation_euler.y=math.pi/2-a
 box('Furnace recess',(1.71,1.50,1.78),(1.20,.06,1.30),'coal',.01)
 box('Incandescent furnace bed',(1.71,.79,1.285),(1.18,1.04,.12),'embers',.025)
 for i in range(12):
  bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=.085,location=(1.23+(i%4)*.30,.40+(i//4)*.21,1.40));finish(bpy.context.object,'Hot furnace charge','embers')
 box('Stone hearth sill',(1.71,.16,1.20),(1.46,.45,.18),'firebrick',.025)
 # Riveted iron reinforcement around the furnace mouth.
 for x in [1.03,2.39]:
  box('Furnace iron jamb',(x,.064,1.70),(.085,.05,1.02),'steel',.005)
  for z in [1.27,1.55,1.83,2.10]:bolt((x,.028,z),r=.023)
 chimney();annex_roof()

def brick(loc,size):
 return box('Weathered masonry',loc,size,'Brick '+str(random.randrange(3)),.014)

def chimney():
 for row in range(9):
  z=3.19+row*.205
  for x,y,w,d in [(2.03,1.83,.16,.73),(2.74,1.83,.16,.73),(2.385,1.47,.57,.16),(2.385,2.19,.57,.16)]:brick((x,y,z),(w,d,.194))
 for x,y,w,d in [(1.99,1.83,.24,.96),(2.78,1.83,.24,.96),(2.385,1.35,.56,.23),(2.385,2.30,.56,.23)]:box('Stone chimney coping',(x,y,5.0),(w,d,.16),'firebrick',.025)
 for z in [3.61,4.44]:
  for y in [1.35,2.31]:box('Chimney band',(2.385,y,z),(.96,.035,.065),'steel',.004)

def annex_roof():
 # Low lean-to roof abuts the main workshop; chimney passes through a fitted hole.
 for xa,xb in [(.42,1.88),(1.88,2.87),(2.87,3.02)]:
  for ya,yb in [(.06,1.33),(1.33,2.31),(2.31,2.59)]:
   if xa==1.88 and ya==1.33:continue
   z=lambda x:3.50-(x-.42)*.16
   o=mesh('Furnace annex roof',[(xa,ya,z(xa)),(xb,ya,z(xb)),(xb,yb,z(xb)),(xa,yb,z(xa))],[(0,1,2,3)],'roof');o.modifiers.clear();o.modifiers.new('Sheet thickness','SOLIDIFY').thickness=.035
 for y in [.10,.55,1,2.5]:beam('Annex standing seam',(.42,y,3.53),(3.01,y,3.12),.025,.022,'edge')

def tools():
 from blacksmith import station
 before=set(bpy.context.scene.objects);station()
 for o in set(bpy.context.scene.objects)-before:o.location.x-=1.04;o.location.y-=.23
 box('Carpentered tool bench',(-1.61,1.12,1.00),(2.03,.70,.12),'trim')
 for x in [-2.43,-.80]:
  for y in [.89,1.37]:box('Bench trestle',(x,y,.5025),(.09,.09,1.005),'wood')
 box('Bench vise',(-.94,.86,1.16),(.23,.25,.22),'steel',.02)
 box('Tool hanging rail',(-1.66,2.22,1.89),(2.24,.10,.12),'trim')
 for i in range(6):
  x=-2.52+i*.32;ring('Hanging tool eye',(x,2.11,1.83),.059,.012,'edge')
  rod('Hanging forged tool',(x,2.10,1.76),(x+.04,2.10,1.20),.017,'steel')
  if i%2:rod('Tongs second jaw',(x+.07,2.1,1.72),(x+.02,2.1,1.19),.016,'steel')
 rod('Workshop lamp',(-1.65,1.25,2.28),(-1.65,1.25,2.44),.083,'lamp',16)
 box('Shelf',(-1.70,1.45,.41),(1.89,.39,.07),'wood')
 for i in range(4):box('Tool box',(-2.35+i*.43,1.42,.59),(.35,.31,.27),'olive',.018)
