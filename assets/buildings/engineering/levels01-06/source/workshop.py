"""Compact two-bay sawtooth factory inspired by early industrial buildings."""
import bpy,math,random
from geometry import box,beam,rod,mesh,material,M

def brick_material():
 material('brick',(.06,.025,.012),.88)
 im=bpy.data.images.new('Factory weathered brick',width=512,height=256,alpha=False)
 im.colorspace_settings.name='sRGB';pixels=[];rng=random.Random(1945)
 for y in range(256):
  row=y//26
  for x in range(512):
   xx=(x+(32 if row%2 else 0))%64;mortar=xx<3 or y%26<2
   seed=((x+(32 if row%2 else 0))//64+row*13)*.71
   tone=.90+.10*math.sin(seed)+rng.random()*.12
   color=(.245,.218,.172) if mortar else (.32*tone,.17*tone,.105*tone)
   pixels.extend((*color,1))
 im.pixels=pixels;im.pack();m=M['brick'];n=m.node_tree.nodes.new('ShaderNodeTexImage');n.image=im
 m.node_tree.links.new(n.outputs['Color'],m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'])
 material('Factory glass',(.025,.046,.047),.34,.25)
 material('stone',(.065,.065,.050),.95)
 material('clay',(.09,.052,.027),.92)


def wall(start,end,fixed,holes,side=False):
 for z0,z1 in [(r*.1933,r*.1933+.188) for r in range(12)]:
  parts=[(start,end)]
  for a,b,lo,hi in holes:
   if z1<=lo or z0>=hi:continue
   out=[]
   for c,d in parts:
    if a>=d or b<=c:out.append((c,d));continue
    if c<a:out.append((c,a))
    if b<d:out.append((b,d))
   parts=out
  for a,b in parts:
   loc=(fixed,(a+b)/2,(z0+z1)/2) if side else ((a+b)/2,fixed,(z0+z1)/2)
   size=(.18,b-a,z1-z0) if side else (b-a,.18,z1-z0)
   box('Weathered factory weatherboard',loc,size,'wood',.006)

def window(center,fixed,w=.9,side=False):
 def part(name,u,z,width,h,mat,depth=.05):
  box(name,(fixed,u,z) if side else (u,fixed,z),(depth,width,h) if side else (width,depth,h),mat,.003)
 part('Factory window',center,1.265,w,1.33,'Factory glass',.025)
 for u in [center-w/2,center,center+w/2]:part('Steel sash',u,1.265,.025,1.36,'steel')
 for z in [.60,.93,1.27,1.60,1.93]:part('Window crossbar',center,z,w+.055,.024,'steel')
 for z in [.56,1.99]:part('Timber window trim',center,z,w+.18,.075,'trim',.16)

def workshop():
 brick_material()
 wall(-2.15,1.55,-.6,[(-1.85,-.70,.6,1.93),(.10,1.32,0,1.93)])
 wall(-2.15,1.55,2.35,[(-1.8,-.85,.6,1.93),(.15,1.1,.6,1.93)])
 for x in [-2.15,1.55]:wall(-.6,2.35,x,[(.05,.95,.6,1.93),(1.2,2.1,.6,1.93)],True)
 window(-1.275,-.705,1.15)
 for x in [-2.26,1.66]:
  for y in [.5,1.65]:window(y,x,.9,True)
 for x in [-1.325,.625]:window(x,2.455,.95)
 for x in [-2.17,-.30,1.57]:
  for y in [-.65,2.40]:box('Factory timber upright',(x,y,1.16),(.13,.20,2.32),'trim')
 doors();sawtooth()

def doors():
 for x in [.05,1.38]:box('Loading door jamb',(x,-.65,.98),(.13,.24,1.96),'trim')
 box('Door head',(.715,-.68,2.04),(1.50,.23,.16),'trim')
 for cx in [.35,1.10]:
  for i in range(4):box('Olive loading door',(cx-.27+i*.18,-.74,.95),(.171,.06,1.86),'olive')
  for z in [.19,1.71]:box('Door strap',(cx,-.78,z),(.67,.028,.045),'steel')
  box('Door pull',(cx,-.82,.92),(.025,.04,.17),'edge')
 box('Door rain hood',(.71,-.89,2.17),(1.60,.58,.04),'roof')


def sawtooth():
 for a in [-2.20,-.30]:
  peak=a+.38;b=a+1.90
  for verts,mat in [([(a,-.77,2.34),(peak,-.77,3.04),(peak,2.52,3.04),(a,2.52,2.34)],'Factory glass'), ([(peak,-.77,3.04),(b,-.77,2.34),(b,2.52,2.34),(peak,2.52,3.04)],'roof')]:
   o=mesh('Sawtooth skylight' if mat=='Factory glass' else 'Sawtooth metal roof',verts,[(0,1,2,3)],mat);o.modifiers.clear();o.modifiers.new('Roof thickness','SOLIDIFY').thickness=.035
   for f in o.data.polygons:f.use_smooth=False
  for y in [-.78,2.53]:
   o=mesh('Timber sawtooth end',[(a,y,2.30),(peak,y,3.02),(b,y,2.30)],[(0,1,2)],'wood');o.modifiers.new('Gable thickness','SOLIDIFY').thickness=.1
   for li in range(len(o.data.loops)):
    v=o.data.vertices[o.data.loops[li].vertex_index].co;o.data.uv_layers.active.data[li].uv=(v.x*.23,v.z*.65)
   beam('Sawtooth edge',(a,y,2.37),(peak,y,3.07),.05,.055,'edge');beam('Roof edge',(peak,y,3.07),(b,y,2.37),.05,.055,'edge')
  for i in range(9):
   y=-.76+i*.409;beam('Skylight sash',(a,y,2.37),(peak,y,3.07),.028,.032,'steel');beam('Roof seam',(peak,y,3.07),(b,y,2.37),.018,.018,'edge')
  rod('Valley gutter',(b,-.81,2.32),(b,2.55,2.32),.035,'steel')
 rod('Factory downpipe',(-2.24,-.71,.035),(-2.24,-.71,2.30),.03,'steel')
