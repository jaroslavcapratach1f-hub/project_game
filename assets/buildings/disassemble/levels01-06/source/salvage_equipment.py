"""Open reclamation yard: lattice derrick, stripped tracked chassis and sorting line."""
import bpy,math
from mathutils import Vector
from geometry import box,beam,rod,ring,curve,mesh

def salvage_equipment(root):
 chassis();derrick();conveyor();stock()

def chassis():
 # Exposed twin frame rails and crossmembers; no complete tank hull or turret.
 x,y=-1.0,-.78
 for xx in [x-.61,x+.61]:
  beam('Stripped chassis rail',(xx,y-1.20,.89),(xx,y+1.20,.89),.085,.18,'Oxidized steel')
  for z in [.79,.99]:box('Frame rail flange',(xx,y,z),(.15,2.42,.025),'steel')
 for yy in [y-1.04,y-.45,y+.26,y+1.07]:box('Bare frame crossmember',(x,yy,.89),(1.30,.10,.14),'steel')
 for xx in [x-.55,x+.55]:
  for yy in [y-.88,y+.89]:
   box('Chassis trestle saddle',(xx,yy,.64),(.26,.32,.12),'olive')
   for dx in [-.18,.18]:beam('Trestle support',(xx+dx,yy,.03),(xx,yy,.59),.065,.08,'steel')
 # One surviving bogie side and one stripped side show progressive dismantling.
 for yy in [y-.74,y,y+.74]:
  rod('Exposed wheel axle',(x-.95,yy,.67),(x+.84,yy,.67),.050,'Bare alloy',16)
  rod('Surviving road wheel',(x-.99,yy,.67),(x-.77,yy,.67),.32,'steel',24)
  rod('Recessed wheel dish',(x-1.006,yy,.67),(x-.99,yy,.67),.245,'olive',24)
  rod('Wheel bearing',(x-1.03,yy,.67),(x-1.006,yy,.67),.077,'Bare alloy',16)
  for i in range(6):
   a=i*math.pi/3;rod('Wheel bolt',(x-1.04,yy+.17*math.cos(a),.67+.17*math.sin(a)),(x-1.02,yy+.17*math.cos(a),.67+.17*math.sin(a)),.020,'edge',6)
 box('Exposed gearbox',(x,y+.60,1.03),(.48,.52,.34),'Bare alloy',.065)
 rod('Drive shaft',(x,y-.92,1.01),(x,y+.33,1.01),.051,'steel',16)
 # Removed armor plates lean against a rack rather than rebuilding an intact tank.
 for i in range(3):
  o=box('Salvaged armor panel',(-2.95+i*.14,-.34,.60),(.045,1.15,.98),'olive',.008);o.rotation_euler.y=.24+i*.05
 for yy in [-.83,.17]:box('Armor rack bearer',(-2.88,yy,.07),(.68,.12,.14),'darkwood')


def derrick():
 base=Vector((.48,.80,.0));tip=Vector((-.90,-1.24,3.66))
 for x in [-.06,1.02]:
  for y in [.27,1.33]:box('Derrick anchor shoe',(x,y,.065),(.24,.26,.13),'steel')
 for y in [.31,1.29]:beam('Derrick base crossbar',(-.10,y,.15),(1.06,y,.15),.13,.14,'olive')
 rod('Derrick kingpost',(.48,.80,.17),(.48,.80,3.79),.097,'olive',20)
 for a in [(.0,.32,.15),(.96,.32,.15),(.0,1.28,.15),(.96,1.28,.15)]:beam('Mast foot brace',a,(.48,.80,1.15),.055,.07,'steel')
 heel=Vector((.48,.80,.77));axis=tip-heel;side=Vector((axis.y,-axis.x,0)).normalized()*.145
 # Four-chord lattice boom, with diagonal webbing along both faces.
 for sign in [-1,1]:
  for dz in [-.115,.115]:beam('Derrick boom chord',heel+side*sign+Vector((0,0,dz)),tip+side*sign+Vector((0,0,dz*.45)),.032,.04,'olive')
 for i in range(6):
  a=heel.lerp(tip,i/6);b=heel.lerp(tip,(i+1)/6)
  for sign in [-1,1]:beam('Lattice boom diagonal',a+side*sign+Vector((0,0,-.11)),b+side*sign+Vector((0,0,.11)),.022,.024,'steel')
  beam('Boom cross tie',a-side,a+side,.027,.03,'olive')
 for sign in [-1,1]:rod('Boom support cable',(.48+sign*.09,.80,3.72),tip+side*sign,.013,'steel')
 rod('Winch drum spindle',(.12,.59,.56),(.84,.59,.56),.036,'steel')
 rod('Winch winding drum',(.25,.59,.56),(.71,.59,.56),.19,'steel',24)
 for x in [.21,.75]:rod('Winch cheek',(x-.024,.59,.56),(x+.024,.59,.56),.23,'olive',24)
 box('Winch gearbox',(.94,.59,.52),(.27,.35,.41),'olive',.04)
 for x in [.85,1.08]:rod('Gearbox bolt',(x,.399,.60),(x,.42,.60),.021,'edge',6)
 # Connected cable reaches the tip sheave and a visible lifted engine block.
 curve('Derrick hoist cable',[(.48,.46,.65),(.48,.80,3.70),tuple(tip+Vector((0,0,.08))),tuple(tip+Vector((0,0,-1.55)))],.012,'steel')
 ring('Boom head sheave',tip,.10,.018,'edge','Y')
 engine(tip.x,tip.y,1.55)


def engine(x,y,z):
 box('Lifted engine crankcase',(x,y,z),(.48,.77,.31),'Bare alloy',.065)
 for side in [-1,1]:
  for i in range(4):rod('Engine cylinder casting',(x+side*.12,y-.27+i*.18,z+.12),(x+side*.29,y-.27+i*.18,z+.36),.090,'Bare alloy',16)
  box('Removed engine valve cover',(x+side*.28,y,z+.41),(.22,.85,.095),'olive',.028)
  curve('Lifting sling',[(x+side*.27,y-.25,z+.43),(x,y,z+.57),(x+side*.27,y+.25,z+.43)],.016,'steel')
 rod('Engine flywheel',(x,y+.39,z),(x,y+.51,z),.23,'steel',24)
 ring('Engine lifting eye',(x,y,z+.57),.061,.017,'edge','Y')


def conveyor():
 # Inclined roller sorting bed ends over component bins in the foreground.
 for x in [1.84,2.77]:
  beam('Conveyor side channel',(x,-2.39,.75),(x,1.54,1.24),.055,.14,'olive')
  for y,z in [(-2.14,.70),(1.21,1.14)]:
   beam('Conveyor leg',(x,y,0),(x,y,z),.055,.065,'steel')
   box('Conveyor foot',(x,y,.035),(.21,.28,.07),'steel')
 for i in range(20):
  y=-2.31+i*.195;z=.77+(y+2.39)*.125
  rod('Sorting roller',(1.89,y,z),(2.72,y,z),.052,'steel',16)
 for y in [-1.67,-.79,.43]:
  z=.88+(y+2.39)*.125;rod('Recovered gear on rollers',(2.30,y,z),(2.30,y,z+.075),.16,'Bare alloy',20)
  ring('Gear outer teeth',(2.30,y,z+.04),.155,.02,'steel','Z')
 box('Conveyor drive casing',(2.94,1.26,1.18),(.25,.38,.31),'olive',.037)
 for x in [1.70,2.88]:
  box('Component bin floor',(x,-3.00,.07),(1.00,.83,.14),'olive')
  for y in [-3.42,-2.58]:box('Component bin side',(x,y,.27),(1.00,.04,.40),'olive')
  for xx in [x-.50,x+.50]:box('Component bin end',(xx,-3.00,.27),(.04,.83,.40),'olive')
  box('Parts classification tag',(x,-3.45,.29),(.26,.012,.095),'paper')
 for x in [1.48,1.81,2.67,3.0]:rod('Sorted salvaged bearing',(x,-3.03,.16),(x,-3.03,.30),.13,'steel',20)


def stock():
 for row in range(3):
  for i in range(5):
   x=-3.46+i*.23;box('Recovered track link',(x,-2.55,.09+row*.12),(.21,.57,.078),'steel')
   box('Track guide tooth',(x,-2.55,.16+row*.12),(.10,.13,.06),'edge')
 for x in [-3.72,-3.43]:
  rod('Workshop gas cylinder',(x,.75,.035),(x,.75,.97),.10,'olive',20)
  rod('Cylinder valve',(x,.75,.97),(x,.75,1.10),.025,'edge',12)
 curve('Cutting torch hose',[(-3.43,.75,1.04),(-3.22,.60,.10),(-3.27,.13,.07),(-3.70,.01,.07),(-3.95,.31,.09),(-3.72,.75,1.03)],.014,'Rubber')
