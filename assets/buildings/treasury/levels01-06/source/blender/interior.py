"""Open cashier room: modeled press, shelves, paper stacks and ledger."""
import math
from geometry import *

def bundle(x,y,z,w=.34,d=.27,h=.17):
 box('Bundled notes',(x,y,z+h/2),(w,d,h),'paper',.008)
 for i in range(1,7):
  zi=z+h*i/7
  box('Paper edge lines',(x,y-d/2-.001,zi),(w-.014,.002,.002),'paperedge',0)
 box('Note retaining band',(x,y,z+h+.002),(w*.16,d+.004,.008),'letter',.001)
 # Restrained currency engraving on the exposed top sheet.
 for xx in [-1,1]:box('Printed note border',(x+xx*w*.39,y,z+h+.007),(.008,d*.76,.002),'ink',0)
 for yy in [-1,1]:box('Printed note border',(x,y+yy*d*.38,z+h+.007),(w*.8,.008,.002),'ink',0)
 ring('Banknote crest',(x,y,z+h+.008),min(w,d)*.14,.006,'ink',axis='Z')

def cashier():
 # Counter front is low; there is no upper wall or glazing across the bay.
 for i in range(4):box('Counter front boards',(1.22,-2.03,.43+i*.205),(3.53,.13,.19),'wood',.008)
 box('Cashier counter',(1.22,-2.17,1.23),(3.68,.50,.12),'trim',.013)
 for x in [-.47,2.94]:
  rod('Bay security side bar',(x,-2.05,1.28),(x,-2.05,2.95),.018)
  box('Counter knee brace',(x,-2,1.00),(.12,.24,.33),'trim')
 # A shallow set of shelves immediately behind the machine, readable under the awning.
 for x in [-.43,2.90]:box('Shelf upright',(x,-.67,1.86),(.095,.45,2.11),'trim')
 for z in [1.0,1.78,2.53]:box('Money shelf',(1.23,-.65,z),(3.42,.55,.08),'trim',.007)
 for z in [1.06,1.83,2.58]:
  for x in [-.16,.27,1.94,2.43,2.78]:bundle(x,-.73,z,.32,.30,.22+(x%1)*.13)
 for x,y,z,w,d,h in [(2.18,-1.68,1.30,.42,.34,.42),(2.63,-1.77,1.30,.32,.3,.23),(-.24,-2.17,1.30,.38,.29,.23)]:bundle(x,y,z,w,d,h)
 press();ledger()

def press():
 cx=.98;cy=-1.40
 box('Cast press bed',(cx,cy,1.34),(1.37,.99,.14),'steel',.025)
 for x in [cx-.52,cx+.52]:
  for y in [cy-.34,cy+.34]:beam('Cast press foot',(x,y,.28),(x,y,1.33),.085,.09,'steel')
  # Cast side frames with open arch, not a solid block.
  for y in [cy-.35,cy+.32]:beam('Press upright',(x,y,1.37),(x,y,1.94),.075,.10,'steel')
  beam('Press upper cheek',(x,cy-.35,1.98),(x,cy+.32,1.98),.10,.10,'steel')
 for y,z,r in [(cy-.22,1.82,.16),(cy+.26,1.90,.13),(cy-.40,1.49,.11)]:
  rod('Printing roller',(cx-.55,y,z),(cx+.55,y,z),r,'steel',24)
  for x in [cx-.58,cx+.58]:rod('Roller bearing',(x-.055,y,z),(x+.055,y,z),r*.5,'edge',16)
 x=cx-.71;y=cy-.17;z=1.80
 ring('Press flywheel',(x,y,z),.38,.035,'edge','X')
 for i in range(6):
  a=i*math.pi/3;rod('Flywheel spoke',(x,y,z),(x,y+math.cos(a)*.35,z+math.sin(a)*.35),.019,'edge')
 rod('Flywheel axle',(x-.04,y,z),(cx-.45,y,z),.055,'steel')
 rod('Crank grip',(x-.16,y-.25,z+.13),(x,y-.25,z+.13),.03,'wood')
 # Curved printed sheet feeds over the front roller and into the output tray.
 verts=[];uv=[]
 for j in range(13):
  t=j/12;yy=cy-.15-.60*t;zz=1.94-.45*t+.08*math.sin(math.pi*t)
  for side in [-1,1]:verts.append((cx+side*.42,yy,zz));uv.append(((side+1)/2,t))
 sheet=mesh('Visible paper web',verts,[(i*2,i*2+1,i*2+3,i*2+2) for i in range(12)],'paper',uv)
 mod=sheet.modifiers.new('Paper thickness','SOLIDIFY');mod.thickness=.003
 for j in range(4):
  t=(j+.4)/4;yy=cy-.15-.60*t;zz=1.94-.45*t+.08*math.sin(math.pi*t)+.004
  for side in [-1,1]:
   x=cx+side*.21;box('Printed web denomination',(x,yy,zz),(.24,.018,.005),'ink',0)
 box('Output feed tray',(cx,cy-.59,1.45),(1.04,.39,.045),'steel',.007)
 bundle(cx,cy-.62,1.48,.75,.27,.06)

def ledger():
 box('Ledger cover',(1.46,-2.28,1.315),(.67,.36,.035),'darkwood',.008)
 for x in [1.30,1.62]:
  o=box('Open ledger page',(x,-2.28,1.343),(.30,.33,.025),'paper',.004);o.rotation_euler.y=(1 if x<1.5 else -1)*.08
  for i in range(5):box('Ledger ruling',(x,-2.40+i*.05,1.36),(.24,.003,.001),'paperedge',0)
 box('Inkstand',(2.10,-2.23,1.32),(.17,.14,.04),'steel',.006)
 rod('Ink bottle',(2.10,-2.23,1.33),(2.10,-2.23,1.42),.039,'glass')
 rod('Dip pen',(2.1,-2.23,1.4),(2.18,-2.16,1.62),.007,'wood',8)
