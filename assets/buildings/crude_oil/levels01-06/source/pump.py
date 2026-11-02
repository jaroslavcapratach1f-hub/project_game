"""Field pumpjack: fabricated steel frame, beam, horsehead and drive linkage."""
import math
from geometry import box,rod,beam,mesh,ring,bolt

def ibeam(name,a,b,width=.18,depth=.24):
 beam(name+' web',a,b,.055,depth,'olive')
 from mathutils import Vector
 a,b=Vector(a),Vector(b);offset=(b-a).normalized().cross(Vector((0,1,0)))*depth*.5
 for sign in [-1,1]:beam(name+' flange',a+offset*sign,b+offset*sign,width,.035,'olive')

def horsehead():
 # Curved front edge concentric with the walking-beam saddle, not a flat paddle.
 points=[(-2.22,4.48),(-2.10,4.47),(-2.03,3.98),(-2.13,3.34),(-2.37,2.90)]
 points += [(-.52-2.0*math.cos(t),3.57+2.0*math.sin(t)) for t in [-.32,-.18,0,.18,.36,.48]]
 verts=[(x,y,z) for y in [-.25,.25] for x,z in points];n=len(points)
 faces=[tuple(range(n-1,-1,-1)),tuple(range(n,n*2))]+[(i,(i+1)%n,(i+1)%n+n,i+n) for i in range(n)]
 mesh('Curved horsehead',verts,faces,'olive')
 for y in [-.275,.275]:
  for i in range(n):
   a,b=points[i],points[(i+1)%n];beam('Horsehead rolled rim',(a[0],y,a[1]),(b[0],y,b[1]),.038,.045,'edge')
 for y in [-.18,.18]:rod('Bridle cable',(-2.46,y,3.25),(-2.46,y,1.07),.011,'steel')
 rod('Polished sucker rod',(-2.46,0,.40),(-2.46,0,1.1),.027,'bright')
 rod('Bridle carrier',(-2.46,-.23,1.07),(-2.46,.23,1.07),.035)

def pumpjack():
 for y in [-.66,.66]:box('Steel skid runner',(-.35,y,.17),(5.05,.19,.34),'steel',.018)
 for y in [-.66,.66]:
  for x in [-1.45,.45]:
   box('Base plate',(x,y,.33),(.36,.31,.07),'steel')
   ibeam('A-frame leg',(x,y,.37),(-.5,y,3.25),.17,.18)
   for dx in [-.12,.12]:bolt((x+dx,y,.375),'Z',.024)
  beam('Cross brace',(-1.38,y,.69),(.21,y,1.24),.07,.055,'olive')
 rod('Main saddle bearing',(-.5,-.81,3.32),(-.5,.81,3.32),.19,'steel',24)
 ibeam('Walking beam',(-2.14,0,3.97),(1.22,0,3.31),.44,.28)
 for x in [-1.65,-.92,-.19,.54]:
  z=3.97-(x+2.14)*.196;beam('Beam stiffener',(x,-.23,z-.1),(x,.23,z+.10),.05,.032,'edge')
 horsehead();drive()
 # Service ladder reaches the saddle, with realistic rung spacing.
 for y in [-.30,.30]:rod('Ladder rail',(-.23,y,.35),(-.23,y,3.35),.021,'steel')
 for i in range(11):rod('Ladder rung',(-.23,-.30,.44+i*.265),(-.23,.30,.44+i*.265),.016,'edge')
 wellhead()

def drive():
 rod('Equalizer cross shaft',(1.22,-.79,3.31),(1.22,.79,3.31),.075,'steel',20)
 box('Gearbox',(1.04,0,.73),(.63,.8,.77),'olive',.065)
 rod('Crank axle',(1.04,-.70,1.12),(1.04,.70,1.12),.085,'bright')
 for y in [-.64,.64]:
  rod('Counterweight disc',(1.04,y-.065,1.12),(1.04,y+.065,1.12),.43,'olive',32)
  beam('Crank arm',(1.04,y,1.12),(1.39,y,1.66),.14,.10,'olive')
  beam('Pitman connecting rod',(1.39,y,1.66),(1.22,y,3.31),.10,.075,'olive')
  rod('Pitman pin',(1.22,y-.09,3.31),(1.22,y+.09,3.31),.10,'edge',20)
 box('Motor foot',(1.80,0,.39),(.76,.81,.13),'steel')
 rod('Electric drive motor',(1.8,-.34,.71),(1.8,.26,.71),.24,'olive',24)
 for y in [-.26,-.16,-.06,.04,.14]:ring('Motor cooling rib',(1.8,y,.71),.235,.018,'edge','Y')
 box('Belt guard',(1.46,-.48,.71),(1.02,.12,.52),'olive',.055)

def wellhead():
 box('Wellhead mounting plate',(-2.46,0,.035),(.38,.42,.07),'steel',.01)
 rod('Well casing',(-2.46,0,.05),(-2.46,0,.85),.09,'steel')
 for z in [.43,.68]:rod('Well flange',(-2.46,0,z-.035),(-2.46,0,z+.035),.15,'edge',16)
 rod('Outlet valve',(-2.46,0,.52),(-2.46,-.53,.52),.065,'olive')
 ring('Valve handwheel',(-2.46,-.57,.52),.135,.017,'valve','Y')
 for a in [0,math.pi/2]:
  rod('Valve spoke',(-2.46-.13*math.cos(a),-.57,.52-.13*math.sin(a)),(-2.46+.13*math.cos(a),-.57,.52+.13*math.sin(a)),.009,'valve')
