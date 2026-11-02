"""Timber workshop and open porch, standing on the shared base terrain."""
import bpy,math,random
from geometry import *

def shelter():
 for i in range(11):
  z=.32+i*.25
  box('Rear timber siding',(-1.30,2.44,z),(3.48,.14,.242))
  # Window opening in the side wall.
  if 1.1<z<2.25:
   for y,d in [(-.12,.56),(1.79,1.30)]:box('Window-side boards',(-3.02,y,z),(.14,d,.242))
  else:box('Side timber siding',(-3.02,1.00,z),(.14,2.88,.242))
 for x in [-3.05,.47]:
  for y in [-.44,2.45]:box('Workshop corner beam',(x,y,1.59),(.16,.18,3.18),'trim')
 for x in [-2.94,.38]:
  box('Porch front column',(x,-1.03,1.4825),(.15,.17,2.965),'trim')
  beam('Porch knee brace',(x,-1.03,2.12),(x+(.43 if x<0 else -.43),-1.03,2.76),.10,.10,'trim')
 box('Porch lintel',(-1.28,-1.02,2.86),(3.51,.19,.21),'trim')
 roof();window()

def roof():
 for end in [-1.16,2.71]:
  verts=[(-3.26,.77,3.94),(.74,.77,3.94),(.74,end,3.10),(-3.26,end,3.10)]
  o=mesh('Workshop roof panel',verts,[(0,1,2,3)],'roof');o.modifiers.clear()
  for p in o.data.polygons:p.use_smooth=False
  o.modifiers.new('Metal roof thickness','SOLIDIFY').thickness=.045
  for i in range(11):
   x=-3.23+i*.394;beam('Roof standing seam',(x,.77,3.97),(x,end,3.13),.027,.03,'edge')
  for x in [-3.25,.73]:beam('Pitched timber fascia',(x,.77,3.87),(x,end,3.03),.12,.15,'trim')
 beam('Ridge cap',(-3.30,.77,3.96),(.78,.77,3.96),.16,.06,'roof')
 for y in [-1.17,2.71]:rod('Roof gutter',(-3.28,y,3.08),(.76,y,3.08),.043,'steel')
 curve('Downpipe',[(-3.21,-.30,3.08),(-3.21,-.41,2.91),(-3.21,-.41,.20)],.037,'steel')

def window():
 box('Side window glass',(-3.10,.80,1.69),(.036,1.20,1.12),'glass')
 for y in [.16,1.44]:box('Window frame',(-3.15,y,1.69),(.13,.10,1.31),'trim')
 for z in [1.06,2.31]:box('Window sill',(-3.15,.80,z),(.15,1.39,.10),'trim')
 for y in [.48,.80,1.12]:rod('Window mullion',(-3.19,y,1.10),(-3.19,y,2.26),.019,'steel')
 rod('Window transom',(-3.2,.22,1.63),(-3.2,1.38,1.63),.019,'steel')
