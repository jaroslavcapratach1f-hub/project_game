"""Field laboratory equipment: tank-engine test bench and radio measurement aerial."""
import math
from geometry import box,beam,rod,ring,curve,mesh

def research_props():
 engine_test();instrument_desk();aerial();stores()

def engine_test():
 x,y=2.20,-.53
 # Narrow stand rails leave shared grass visible below the engine test bench.
 for xx in [x-.52,x+.52]:
  box('Engine test skid',(xx,y,.075),(.13,1.79,.15),'steel',.014)
  for yy in [y-.54,y+.54]:box('Engine stand leg',(xx,yy,.38),(.09,.12,.64),'olive')
 for yy in [y-.58,y+.58]:box('Engine cradle crossbeam',(x,yy,.67),(1.25,.12,.13),'steel')
 box('Cast engine crankcase',(x,y,.87),(.66,1.25,.40),'Engine alloy',.075)
 for side in [-1,1]:
  # Two raked six-cylinder banks give the recognizable V-engine silhouette.
  for i in range(6):
   yy=y-.52+i*.205
   a=(x+side*.19,yy,1.01);b=(x+side*.43,yy,1.37)
   rod('Cylinder casting',a,b,.114,'Engine alloy',16)
   for zz in [.04,.09]:ring('Cylinder cooling detail',(b[0],yy,b[2]-zz),.112,.009,'steel','Z')
  o=box('Rocker cover',(x+side*.43,y,1.43),(.28,1.33,.14),'olive',.045);o.rotation_euler.y=-side*.28
  curve('Exhaust manifold',[(x+side*.54,y-.65,1.11),(x+side*.59,y-.45,1.16),(x+side*.59,y+.60,1.16)],.046,'steel')
  for i in range(4):rod('Manifold branch',(x+side*.39,y-.42+i*.28,1.25),(x+side*.59,y-.42+i*.28,1.16),.032,'steel')
 rod('Bell housing',(x,y+.62,.89),(x,y+.90,.89),.28,'Engine alloy',24)
 rod('Crank pulley',(x,y-.76,.90),(x,y-.64,.90),.18,'steel',24)
 rod('Generator pulley',(x+.34,y-.76,1.20),(x+.34,y-.70,1.20),.09,'steel',20)
 curve('Drive belt',[(x-.14,y-.77,.98),(x+.29,y-.77,1.28),(x+.41,y-.77,1.25),(x+.44,y-.77,1.15),(x+.10,y-.77,.74),(x-.10,y-.77,.75),(x-.14,y-.77,.98)],.021,'Rubber')
 # Connected coolant radiator stands behind the engine rather than blocking its view.
 box('Test radiator',(x,1.05,1.05),(1.02,.22,1.28),'olive',.045)
 for i in range(14):box('Radiator fin',(x-.44+i*.068,.928,1.04),(.027,.025,1.03),'steel',.002)
 curve('Coolant hose',[(x+.37,y+.50,1.44),(x+.48,.55,1.51),(x+.40,1.02,1.55)],.042,'Rubber')
 for xx in [x-.39,x+.39]:box('Radiator support',(xx,1.05,.22),(.09,.27,.44),'steel')


def instrument_desk():
 x,y=1.02,1.73
 box('Test equipment bench',(x,y,.84),(.67,1.26,.075),'wood')
 for dx in [-.25,.25]:
  for dy in [-.50,.50]:box('Bench leg',(x+dx,y+dy,.42),(.055,.055,.84),'steel')
 box('Analog instrument case',(x,y,1.12),(.61,.63,.48),'olive',.027)
 for xx in [x-.17,x+.17]:
  rod('Analog gauge bezel',(xx,y-.342,1.19),(xx,y-.314,1.19),.097,'edge',24)
  rod('Gauge ivory dial',(xx,y-.347,1.19),(xx,y-.343,1.19),.081,'paper',24)
  rod('Gauge needle',(xx,y-.353,1.19),(xx+.045,y-.353,1.23),.006,'steel')
  rod('Calibration knob',(xx,y-.36,.99),(xx,y-.32,.99),.033,'steel',16)
 curve('Engine test lead',[(x+.25,y-.20,.99),(x+.43,y-.32,.71),(1.70,.71,.18),(1.78,-.2,.85)],.018,'Rubber')
 # A technical drawing tray beside the apparatus keeps research legible.
 box('Plan tray',(3.17,-.55,.88),(.73,1.00,.075),'wood')
 for yy in [-.94,-.17]:
  for xx in [2.89,3.45]:box('Plan tray leg',(xx,yy,.44),(.04,.04,.88),'steel')
 box('Technical blueprint',(3.17,-.55,.923),(.63,.86,.006),'Blueprint',.001)
 for x0 in [2.96,3.17,3.38]:
  for yy in [-.78,-.51,-.24]:ring('Engine schematic cylinder',(x0,yy,.93),.07,.003,'Chalk','Z')
 for yy in [-.92,-.08]:rod('Blueprint scale',(2.89,yy,.93),(3.43,yy,.93),.003,'Chalk')


def aerial():
 # Grounded lattice mast and a restrained period directional test aerial.
 x,y=-4.13,1.57
 for dx in [-.17,.17]:
  for dy in [-.17,.17]:
   beam('Aerial mast chord',(x+dx,y+dy,.05),(x+dx*.40,y+dy*.40,4.5),.033,.038,'steel')
   box('Mast shoe',(x+dx,y+dy,.035),(.13,.13,.07),'olive')
 for i in range(7):
  z=.12+i*.61;r=.17*(1-z/7.5)
  for side in [-1,1]:
   beam('Lattice diagonal',(x-r,y+side*r,z),(x+r*.92,y+side*r*.92,z+.61),.018,.021,'olive')
   beam('Lattice side diagonal',(x+side*r,y-r,z),(x+side*r*.92,y+r*.92,z+.61),.018,.021,'olive')
 rod('Aerial swivel',(x,y,4.40),(x,y,4.74),.049,'edge',16)
 for z in [4.66,5.26]:beam('Aerial horizontal frame',(x-.83,y,z),(x+.83,y,z),.025,.032,'olive')
 for i in range(7):
  xx=x-.81+i*.27;rod('Directional aerial element',(xx,y,4.66),(xx,y,5.26),.011,'steel')
 beam('Aerial central spine',(x,y,4.65),(x,y,5.27),.03,.04,'olive')
 curve('Aerial feeder cable',[(x,y,4.68),(x+.05,y,3.5),(x+.10,y,.36),(-3.70,1.57,.36)],.011,'steel')


def stores():
 # Two instrument transit cases, no decorative grocery-like outdoor furnishings.
 for x,y in [(-3.13,-1.16),(-2.24,-1.17)]:
  box('Field instrument transit case',(x,y,.26),(.73,.52,.48),'olive',.023)
  for xx in [x-.26,x+.26]:box('Transit case strap',(xx,y,.505),(.034,.54,.018),'steel')
  box('Transit case handle',(x,y-.285,.27),(.18,.03,.045),'edge')
