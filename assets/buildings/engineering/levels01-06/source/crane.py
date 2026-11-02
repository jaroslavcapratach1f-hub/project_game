"""Compact riveted workshop jib crane, with connected manual hoist hardware."""
import math
from geometry import box,rod,beam,curve
from mathutils import Vector

# Local X follows the jib; Y is across the jib, Z is vertical.
ORIGIN=Vector((-3.55,.60,0))
FORWARD=Vector((.55,-2.0,0)).normalized()
SIDE=Vector((-FORWARD.y,FORWARD.x,0))
def p(x,y,z):return ORIGIN+FORWARD*x+SIDE*y+Vector((0,0,z))
def bar(name,a,b,r,mat='steel',n=12):return rod(name,p(*a),p(*b),r,mat,n)
def plate(name,loc,size,mat='olive'):
 o=box(name,p(*loc),size,mat,.005);o.rotation_euler.z=math.atan2(FORWARD.y,FORWARD.x);return o

def crane():
 plate('Bolted crane soleplate',(0,0,.05),(.54,.54,.10),'steel')
 bar('Stationary kingpost',(0,0,.10),(0,0,2.42),.095,'olive',20)
 for z in [.22,1.65,2.32]:bar('Slewing bearing collar',(0,0,z-.045),(0,0,z+.045),.128,'steel',20)
 for x in [-.20,.20]:
  for y in [-.20,.20]:
   bar('Foundation hex nut',(x,y,.10),(x,y,.145),.031,'edge',6)
   beam('Tapered foot brace',p(x,y,.13),p(0,0,.58),.043,.065,'olive')
 # Two tapered truss cheeks, joined by crossbars; no unsupported boom ends.
 for side in [-.095,.095]:
  beam('Jib lower chord',p(0,side,1.72),p(2.08,side,2.16),.045,.065,'olive')
  beam('Jib upper chord',p(0,side,2.32),p(2.08,side,2.16),.045,.065,'olive')
  for i in range(4):
   x=i*.52;z=1.72+.44*x/2.08;top=2.32-.16*x/2.08
   beam('Jib diagonal web',p(x,side,z),p(x+.52,side,2.32-.16*(x+.52)/2.08),.026,.032,'olive')
   bar('Jib rivet',(x,side-.012,top),(x,side+.012,top),.021,'edge',8)
  for x in [.0,.52,1.04,1.56,2.08]:
   z=1.72+.44*x/2.08;bar('Jib cross tie',(x,-.095,z),(x,.095,z),.024,'olive')
 winch();hoist()

def winch():
 for side in [-.15,.15]:plate('Winch bearing cheek',(.14,side,.93),(.31,.045,.34))
 bar('Winch axle',(.14,-.25,.94),(.14,.25,.94),.032)
 bar('Wire drum',(.14,-.12,.94),(.14,.12,.94),.098,'steel',20)
 for side in [-.135,.135]:bar('Drum flange',(.14,side-.014,.94),(.14,side+.014,.94),.14,'olive',20)
 for j in range(9):
  pts=[p(.14+.106*math.cos(a*math.pi/8),-.10+j*.025,.94+.106*math.sin(a*math.pi/8)) for a in range(17)]
  curve('Wound steel cable',pts,.007,'edge')
 bar('Hand winch gear',(.14,-.225,.94),(.14,-.195,.94),.14,'steel',20)
 for i in range(12):
  a=i*math.pi/6;plate('Gear tooth',(.14+.14*math.cos(a),-.21,.94+.14*math.sin(a)),(.038,.04,.038),'steel')
 beam('Crank arm',p(.14,-.26,.94),p(-.035,-.26,.81),.027,.035,'edge')
 bar('Wooden crank grip',(-.035,-.26,.81),(-.035,-.40,.81),.028,'trim')

def hoist():
 # Sheave runs in the jib's vertical plane, with flanges and axle supports.
 x,z=2.08,2.16;r=.10
 for side in [-.06,.06]:
  bar('Sheave flange',(x,side-.012,z),(x,side+.012,z),r+.015,'edge',20)
  plate('Pulley fork',(x,side,z),(.22,.025,.24))
 bar('Sheave groove',(x,-.047,z),(x,.047,z),r,'steel',20)
 bar('Sheave axle',(x,-.13,z),(x,.13,z),.026,'edge')
 # Cable passes from drum through a mast guide, over the sheave, then vertically.
 curve('Hoist feed',[p(.24,0,.94),p(.13,0,2.20),p(x,0,z+r)],.009,'steel')
 arc=[p(x+r*math.sin(i*math.pi/16),0,z+r*math.cos(i*math.pi/16)) for i in range(9)]
 curve('Cable over sheave',arc+[p(x+r,0,1.12)],.009,'steel')
 plate('Hook weight',(x+r,0,1.10),(.075,.075,.13),'steel')
 bar('Hook swivel',(x+r,0,1.04),(x+r,0,1.00),.027,'edge')
 pts=[p(x+r+.055*(1-math.cos(i*math.pi/8)),0,1.00-.065*math.sin(i*math.pi/8)) for i in range(13)]
 curve('Forged lifting hook',pts,.019,'edge')
