"""Concept-matched timber shell with an unobstructed cashier bay."""
import bpy,math
from geometry import *

def shell():
 # Rear wall, left wall with a real barred-window opening, and right wall.
 for i in range(12):
  z=.33+i*.237+random.uniform(-.003,.003)
  box('Rear horizontal siding',(0,2,z),(6.2,.13,.231))
  box('Right horizontal siding',(3.05,0,z),(.13,4,.231))
  if 1.1<z<2.25:
   for y,dy in [(-1.60,.8),(1.2,1.6)]:box('Left window surround siding',(-3.05,y,z),(.13,dy,.231))
  else:box('Left horizontal siding',(-3.05,0,z),(.13,4,.231))
  # Vault side of facade only. The right 3.65 m stays genuinely open.
  if z<2.65:
   for x,dx in [(-2.88,.36),(-.83,.30)]:box('Vault jamb infill',(x,-2.03,z),(dx,.14,.226))
  else:box('Door lintel siding',(-1.88,-2.03,z),(2.35,.14,.226))
 for x in [-3.08,-.62,3.08]:box('Front structural post',(x,-2.03,1.63),(.16,.19,3.0),'trim')
 for x in [-3.08,3.08]:box('Rear corner post',(x,2.02,1.63),(.16,.19,3),'trim')
 box('Front header',(0,-2.04,3.10),(6.36,.20,.22),'trim')
 box('Open room rear shading',(1.2,1.86,1.62),(3.5,.06,2.55),'darkwood')
 box('Vault partition',(-.69,.0,1.6),(.12,3.95,2.8),'darkwood')
 for y in [i*.24-1.9 for i in range(17)]:box('Interior floorboards',(0,y,.18),(6.2,.232,.10),'wood',.006)
 # Front gable follows the off-centre roof ridge in the reference.
 for y in [-2.06,2.05]:
  for i in range(5):
   z=3.23+i*.21;t=(z-3.16)/1.08;left=-3.2+3.85*t;right=3.2-2.55*t
   if right>left:box('Gable infill',((left+right)/2,y,z),(right-left,.12,.20),'wood',.008)
 window();roof();porch();door()

def window():
 box('Recessed side window',(-3.058,-.45,1.68),(.04,1.47,1.26),'glass')
 for y in [-1.24,.34]:box('Window upright',(-3.15,y,1.68),(.14,.12,1.50),'trim')
 for z in [.96,2.39]:box('Window sill and lintel',(-3.15,-.45,z),(.15,1.70,.12),'trim')
 for y in [-1.03,-.66,-.29,.08]:rod('Window security bar',(-3.22,y,1.04),(-3.22,y,2.34),.018)
 rod('Window cross bar',(-3.23,-1.12,1.58),(-3.23,.20,1.58),.023)

def roof():
 for side,end in [('left',-3.40),('right',3.40)]:
  o=mesh('Seamed roof '+side,[(end,-2.28,3.17),(end,2.25,3.17),(.65,2.25,4.34),(.65,-2.28,4.34)],[(0,1,2,3)],'roof',[(0,0),(0,2),(1,2),(1,0)])
  mod=o.modifiers.new('Sheet thickness','SOLIDIFY');mod.thickness=.035
  for i in range(12):
   y=-2.22+i*.40;beam('Raised standing seam',(end,y,3.20),(.65,y,4.37),.025,.026,'edge')
  for y in [-2.29,2.26]:
   beam('Pitched fascia',(end,y,3.105),(.65,y,4.275),.14,.12,'trim')
   beam('Roof verge flashing',(end,y-.025,3.20),(.65,y-.025,4.37),.055,.045,'edge')
 beam('Ridge cap',(.65,-2.32,4.36),(.65,2.30,4.36),.17,.055,'roof')
 for x in [-3.35,3.35]:
  rod('Eave gutter',(x,-2.28,3.13),(x,2.25,3.13),.052,'steel',12)
  curve('Drainpipe',[(x,-1.86,3.13),(x,-1.94,2.98),(x,-1.94,.25),(x+.07,-2.02,.15)],.043,'steel')
  for z in [.5,2.7]:box('Pipe bracket',(x,-1.94,z),(.12,.10,.035),'edge',.004)

def porch():
 for i in range(7):box('Porch planks',(0,-2.2-i*.19,.23),(6.35,.18,.15),'trim',.009)
 for i in range(3):
  box('Entrance step',(-1.84,-3.70+i*.24,.045+i*.07),(1.84,.40,.09),'trim',.009)
 for x in [-.51,3.07]:
  box('Awning timber support',(x,-3.36,1.46),(.11,.12,2.73),'trim',.009)
  for z in [.41,2.57]:bolt((x,-3.43,z),r=.019)


def door():
 box('Steel vault frame',(-1.84,-2.14,1.46),(1.70,.12,2.63),'steel',.025)
 box('Strongroom recessed door',(-1.84,-2.23,1.46),(1.43,.10,2.39),'olive',.028)
 for x in [-2.51,-1.17]:
  for i in range(8):bolt((x,-2.30,.39+i*.305),r=.018)
 for z in [.53,1.52,2.38]:
  box('Door strap hinge',(-2.50,-2.33,z),(.24,.055,.095),'edge',.008)
  rod('Hinge pin',(-2.57,-2.34,z-.07),(-2.57,-2.34,z+.07),.035)
 ring('Vault wheel',(-1.52,-2.40,1.36),.22,.025,'edge')
 rod('Wheel spindle',(-1.52,-2.25,1.36),(-1.52,-2.45,1.36),.043)
 for i in range(4):
  a=i*math.pi/2;rod('Wheel spoke',(-1.52,-2.41,1.36),(-1.52+math.cos(a)*.205,-2.41,1.36+math.sin(a)*.205),.014,'edge')
 box('Vault lock',(-1.18,-2.33,1.50),(.11,.07,.17),'steel',.012)
 # Stencilled identity above door, clear of openings.
 bpy.ops.object.text_add(location=(-1.86,-2.155,2.92),rotation=(math.pi/2,0,0));o=bpy.context.object;o.name='TREASURY sign';o.data.body='TREASURY';o.data.align_x='CENTER';o.data.size=.215;o.data.extrude=.0005;o.data.materials.append(M['letter'])
