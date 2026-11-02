"""Shaped canvas, stitched bags, cash chests and restrained field accessories."""
import bpy,math,random
from geometry import *

def awning_point(u,v):
 return (-.61+3.85*u,-2.07-1.48*v,3.03-.34*v-.14*math.sin(math.pi*v)*math.sin(math.pi*u)+.018*math.sin(u*35)*math.sin(math.pi*v))

def awning():
 nu,nv=28,12;verts=[awning_point(i/nu,j/nv) for j in range(nv+1) for i in range(nu+1)]
 faces=[(j*(nu+1)+i,j*(nu+1)+i+1,(j+1)*(nu+1)+i+1,(j+1)*(nu+1)+i) for j in range(nv) for i in range(nu)]
 uv=[(i/nu*2,j/nv) for j in range(nv+1) for i in range(nu+1)]
 o=mesh('Tensioned canvas canopy',verts,faces,'canvas',uv);mod=o.modifiers.new('Canvas thickness','SOLIDIFY');mod.thickness=.008
 for v in [0,.96]:curve('Canvas sewn hem',[(x,y,z+.008) for x,y,z in [awning_point(i/28,v) for i in range(29)]],.007,'paperedge')
 for u in [0,.50,1]:curve('Canvas panel seam',[(x,y,z+.008) for x,y,z in [awning_point(u,j/12) for j in range(13)]],.005,'paperedge')
 pts=[awning_point(i/28,1) for i in range(29)];hem=mesh('Hanging canvas valance',pts+[(x,y+.006,z-.105-.012*math.sin(i*1.2)) for i,(x,y,z) in enumerate(pts)],[(i,i+1,i+30,i+29) for i in range(28)],'canvas')
 for x in [-.57,3.20]:
  ring('Canvas corner eyelet',(x,-3.553,2.65),.025,.008,'edge')
  rod('Canopy crossbar',(x,-2.03,3.00),(x,-3.42,2.69),.023,'steel')


def chest(x,y,z,w,d,h,wooden=False):
 mat='wood' if wooden else 'olive';box('Timber case' if wooden else 'Army cash chest',(x,y,z+h/2),(w,d,h),mat,.025)
 box('Overlapping fitted lid',(x,y,z+h+.012),(w+.025,d+.025,.045),mat,.018)
 for xx in [x-w*.34,x+w*.34]:
  box('Chest retaining strap',(xx,y,z+h+.040),(.035,d+.02,.018),'steel',.004)
  box('Chest strap front',(xx,y-d/2-.008,z+h*.58),(.035,.018,h*.82),'steel',.004)
  box('Chest latch',(xx,y-d/2-.035,z+h*.77),(.07,.026,.14),'edge',.008)
 for yy in [y-d*.30,y+d*.30]:bolt((x+w/2+.012,yy,z+h*.7),'X',.014)
 # Hinged carrying handle on visible front.
 curve('Folding carry handle',[(x-.1,y-d/2-.025,z+h*.5),(x-.1,y-d/2-.060,z+h*.36),(x+.1,y-d/2-.060,z+h*.36),(x+.1,y-d/2-.025,z+h*.5)],.013,'edge')
 if wooden:
  for i in [-1,0,1]:box('Case board joint',(x+i*w/4,y-d/2-.002,z+h*.5),(.005,.006,h*.85),'darkwood',0)


def sandbag(loc,angle=0):
 verts=[];uv=[];rings,steps=8,16
 for j in range(rings+1):
  t=math.pi*j/rings;h=math.cos(t);r=math.sin(t)**.50
  for i in range(steps):
   a=2*math.pi*i/steps;c=math.cos(a);s=math.sin(a)
   x=.43*math.copysign(abs(c)**.48,c)*r;y=.23*math.copysign(abs(s)**.60,s)*r;z=.135*h
   z+=.012*math.sin(a*5+.3)*math.sin(t)**2
   verts.append((loc[0]+x*math.cos(angle)-y*math.sin(angle),loc[1]+x*math.sin(angle)+y*math.cos(angle),loc[2]+z));uv.append((i/steps*2,j/rings))
 faces=[(j*steps+i,j*steps+(i+1)%steps,(j+1)*steps+(i+1)%steps,(j+1)*steps+i) for j in range(rings) for i in range(steps)]
 mesh('Compressed fabric sandbag',verts,faces,'canvas',uv)
 seam=[]
 for i in range(33):
  a=i/32*2*math.pi;x=.433*math.copysign(abs(math.cos(a))**.48,math.cos(a));y=.234*math.copysign(abs(math.sin(a))**.60,math.sin(a))
  seam.append((loc[0]+x*math.cos(angle)-y*math.sin(angle),loc[1]+x*math.sin(angle)+y*math.cos(angle),loc[2]))
 curve('Sandbag sewn edge',seam,.004,'paperedge')


def props():
 awning()
 chest(.22,-2.99,.32,.92,.55,.42);chest(1.28,-2.97,.32,1.03,.59,.47)
 chest(2.62,-2.99,.32,.73,.56,.47,True);chest(2.62,-2.99,.86,.67,.51,.39,True)
 for row in range(3):
  for i in range(3 if row<2 else 2):sandbag((-3.34+random.uniform(-.04,.04),-1.13+i*.69+row*.19,.17+row*.235),math.pi/2+random.uniform(-.22,.22))
 # Small caged wall lamp next to vault, no oversized light bloom.
 x=-2.78;y=-2.28
 rod('Lamp bracket',(x,-2.07,2.61),(x,y,2.61),.022)
 rod('Glass lamp',(x,y,2.40),(x,y,2.59),.073,'lamp',12)
 for z in [2.4,2.59]:ring('Lamp cage band',(x,y,z),.084,.012,'steel','Z')
 for i in range(4):
  a=i*math.pi/2;rod('Lamp cage rib',(x+math.cos(a)*.083,y+math.sin(a)*.083,2.39),(x+math.cos(a)*.083,y+math.sin(a)*.083,2.61),.008)
