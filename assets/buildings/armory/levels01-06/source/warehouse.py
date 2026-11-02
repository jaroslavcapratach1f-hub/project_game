"""Timber military assembly hall with an elliptical corrugated roof and open doors."""
import math
from geometry import box,beam,rod,mesh,curve,material

def warehouse():
 material('Armory window',(.025,.049,.052),.35,.25)
 material('Rubber',(.012,.014,.012),.96)
 material('Safety yellow',(.44,.28,.025),.82)
 material('Primer',(.075,.084,.055),.85)
 roof();walls();front();doors();fittings()

def roof():
 # The curve defines both visible skin and structural ribs, with real thickness.
 segments=48;bands=80;verts=[]
 for j in range(bands+1):
  y=-1.12+6.86*j/bands;ripple=.009*math.cos(j*math.pi/2)
  for i in range(segments+1):
   a=math.pi*i/segments
   verts.append(((4.06+ripple)*math.cos(a),y,1.72+(3.39+ripple)*math.sin(a)))
 faces=[]
 for j in range(bands):
  for i in range(segments):
   k=j*(segments+1)+i;faces.append((k,k+segments+1,k+segments+2,k+1))
 o=mesh('Continuous corrugated oval roof',verts,faces,'roof');o.modifiers.clear();o.modifiers.new('Sheet thickness','SOLIDIFY').thickness=.025
 for y in [-1.12,.59,2.30,4.01,5.74]:
  pts=[(4.085*math.cos(math.pi*i/48),y,1.72+3.415*math.sin(math.pi*i/48)) for i in range(49)]
  curve('Arched standing roof seam',pts,.018,'edge')
 for y in [-1.15,5.74]:
  curve('Curved roof fascia',[(4.075*math.cos(math.pi*i/48),y,1.72+3.4*math.sin(math.pi*i/48)) for i in range(49)],.06,'olive')
 for y in [-.95,1.20,3.35,5.5]:
  curve('Interior steel roof arch',[(3.94*math.cos(math.pi*i/32),y,1.70+3.28*math.sin(math.pi*i/32)) for i in range(33)],.053,'steel')
 for x in [-4.1,4.1]:
  rod('Rain gutter',(x,-1.16,1.68),(x,5.76,1.68),.064,'olive')
  rod('Downpipe',(x,5.57,.08),(x,5.57,1.68),.042,'steel')

def walls():
 for x in [-4,4]:
  for row in range(9):box('Side weatherboard',(x,2.27,.095+row*.184),(.13,6.64,.175),'wood')
  for y in [-1.03,.63,2.29,3.95,5.60]:box('Side timber post',(x,y,.84),(.15,.16,1.68),'trim')
 for y in [-1.055,5.60]:
  for row in range(27):
   z=.095+row*.182;half=4 if z<1.72 else 4*math.sqrt(max(0,1-((z+.09-1.72)/3.36)**2))
   if half<.05:continue
   spans=[(-half,half)] if y>0 or z>3.40 else [(-half,-2.36),(2.36,half)]
   for a,b in spans:
    if b>a:box('Timber end wall',((a+b)/2,y,z),(b-a,.13,.173),'wood')
 for x in [-3.18,3.18]:
  box('Front steel framed window',(x,-1.135,2.45),(1.03,.028,.69),'Armory window')
  for xx in [x-.52,x,x+.52]:box('Window mullion',(xx,-1.16,2.45),(.038,.048,.76),'steel')
  for z in [2.08,2.45,2.82]:box('Window sill',(x,-1.16,z),(1.10,.06,.035),'edge')

def front():
 for x in [-2.40,2.40]:box('Portal timber jamb',(x,-1.15,1.73),(.18,.24,3.46),'trim')
 box('Portal lintel',(0,-1.14,3.5),(5.04,.25,.22),'trim')
 # Compact military sign is above the doors, never covering a window.
 box('Armory nameplate',(0,-1.29,3.96),(2.45,.07,.43),'olive',.02)
 import bpy
 bpy.ops.object.text_add(location=(0,-1.338,3.82),rotation=(math.pi/2,0,0));o=bpy.context.object;o.data.body='ARMORY';o.data.align_x='CENTER';o.data.size=.31;o.data.extrude=.001
 from geometry import M
 o.data.materials.append(M['letter'])

def doors():
 box('Sliding door overhead rail',(0,-1.37,3.42),(8.50,.10,.12),'steel')
 for sign in [-1,1]:
  cx=sign*3.54
  for i in range(8):box('Open sliding door board',(cx-.85+i*.244,-1.40,1.61),(.232,.065,3.12),'olive')
  for z in [.18,1.58,3.10]:box('Door horizontal brace',(cx,-1.45,z),(1.99,.042,.075),'steel')
  beam('Door diagonal brace',(cx-.91,-1.45,.22),(cx+.91,-1.45,3.06),.056,.035,'steel')
  for x in [cx-.78,cx+.78]:
   rod('Door runner axle',(x,-1.49,3.34),(x,-1.31,3.34),.031,'steel')
   rod('Door runner wheel',(x,-1.44,3.38),(x,-1.38,3.38),.085,'edge',16)
  box('Door handle',(cx-sign*.72,-1.52,1.5),(.034,.07,.25),'edge')

def fittings():
 # No slab: only discrete sill footings and narrow equipment supports.
 for x in [-4,4]:
  for y in [-.9,2.3,5.5]:box('Timber ground shoe',(x,y,.055),(.28,.38,.11),'darkwood')
 for x in [-2.20,2.20]:
  rod('Portal protection bollard',(x,-1.92,.02),(x,-1.92,.65),.085,'olive',16)
  for z in [.37,.53]:rod('Bollard warning band',(x,-1.92,z),(x,-1.92,z+.055),.088,'Safety yellow',16)
 for x in [-2.1,2.1]:
  curve('Lamp gooseneck',[(x,-1.2,3.73),(x,-1.53,3.73),(x,-1.64,3.61)],.026,'steel')
  box('Portal lamp',(x,-1.64,3.59),(.23,.22,.06),'olive',.035)
  box('Lamp lens',(x,-1.64,3.55),(.16,.15,.012),'lamp')
