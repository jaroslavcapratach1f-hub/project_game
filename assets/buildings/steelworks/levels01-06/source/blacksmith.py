"""Visible, correctly scaled hand-forging station in the open workshop yard."""
import bpy,math
from geometry import *

def station():
 material('Forged steel face',(.065,.073,.069),.52,.48)
 x,y=-.72,-1.68
 rod('Heavy oak anvil block',(x,y,.02),(x,y,.59),.34,'darkwood',18)
 for z in [.14,.48]:ring('Stump binding hoop',(x,y,z),.345,.017,'steel','Z')
 box('Anvil feet',(x,y,.64),(.69,.44,.13),'steel',.025)
 # Tapered waist and shoulders, with a horn and distinct heel.
 verts=[(x+sx*w,y+sy*d,z) for z,w,d in [(.70,.27,.16),(.82,.17,.12),(.96,.36,.20)] for sx,sy in [(-1,-1),(1,-1),(1,1),(-1,1)]]
 faces=[(0,3,2,1),(8,9,10,11)]+[(j*4+i,j*4+(i+1)%4,(j+1)*4+(i+1)%4,(j+1)*4+i) for j in range(2) for i in range(4)]
 mesh('Forged anvil shoulders',verts,faces,'steel')
 box('Polished anvil working face',(x,y,1.005),(.82,.40,.095),'Forged steel face',.010)
 bpy.ops.mesh.primitive_cone_add(vertices=20,radius1=.14,radius2=.022,depth=.44,location=(x+.62,y,.98),rotation=(0,math.pi/2,0));finish(bpy.context.object,'Forged tapered horn','Forged steel face')
 box('Hardy socket',(x-.29,y+.07,1.057),(.057,.055,.003),'coal',0)
 # One cross-peen hammer rests on the face; its handle hangs over the near edge.
 head=(x-.08,y-.03,1.115)
 box('Cross-peen hammer head',head,(.23,.115,.12),'Forged steel face',.017)
 beam('Ash hammer handle',(head[0],head[1],1.095),(x+.18,y-.51,1.03),.037,.045,'trim')
 box('Hammer striking face',(head[0]-.12,head[1],head[2]),(.018,.10,.105),'edge',.004)
 # A longer sledge leans against the block, head resting on the ground.
 box('Sledgehammer head',(x-.43,y-.28,.105),(.28,.16,.16),'Forged steel face',.018)
 beam('Sledge handle',(x-.43,y-.28,.17),(x-.25,y+.01,.84),.044,.048,'trim')
 # Pivoted forging tongs grip a short workpiece on the anvil.
 for side in [-1,1]:
  curve('Forging tongs',[(x+.26,y+.11+side*.06,1.07),(x+.04,y+.09,1.075),(x-.28,y+.17+side*.04,1.07)],.012,'Forged steel face')
 rod('Tongs pivot',(x+.04,y+.09,1.055),(x+.04,y+.09,1.09),.025,'edge',10)
 box('Workpiece on anvil',(x+.28,y+.12,1.073),(.37,.062,.035),'steel',.004)
 box('Hot workpiece tip',(x+.46,y+.12,1.075),(.08,.06,.034),'embers',.004)
 # Open quench tub, not a capped cylinder; kept clear of the approach.
 cx,cy=x+.87,y+.54;r=.21
 for i in range(14):
  a=i*2*math.pi/14;o=box('Quench tub stave',(cx+r*math.cos(a),cy+r*math.sin(a),.21),(.096,.035,.40),'wood',.004);o.rotation_euler.z=a+math.pi/2
 for z in [.08,.34]:ring('Tub hoop',(cx,cy,z),r+.023,.011,'steel','Z')
 rod('Quench water',(cx,cy,.24),(cx,cy,.246),r-.018,'glass',24)
