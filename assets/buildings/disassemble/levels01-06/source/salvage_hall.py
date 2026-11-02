"""Low reclamation workshop supporting an open machinery-dismantling yard."""
import bpy,math
from geometry import box,beam,rod,mesh,curve,material,M

def salvage_hall():
 material('Salvage glass',(.024,.045,.047),.35,.20)
 material('Bare alloy',(.07,.077,.064),.74,.45)
 material('Rubber',(.008,.01,.008),.95)
 material('Warning yellow',(.39,.24,.025),.86)
 material('Oxidized steel',(.055,.039,.023),.94,.2)
 workshop();shelving();sign()

def workshop():
 # A low back-corner toolhouse leaves the crane and stripped chassis exposed.
 for row in range(12):
  z=.09+row*.173
  for y in [1.31,3.42]:box('Sorting workshop timber',(-2.25,y,z),(3.12,.115,.165),'wood')
  for x in [-3.81,-.69]:box('Sorting workshop side',(x,2.365,z),(.115,2.11,.165),'wood')
 for x in [-3.84,-.66]:
  for y in [1.29,3.44]:box('Workshop corner',(x,y,1.08),(.09,.09,2.16),'trim')
 # Only a personnel door; this is a parts store, not another vehicle hangar.
 box('Toolhouse door',(-1.33,1.235,.96),(.79,.065,1.89),'olive',.013)
 box('Door handle',(-1.04,1.19,.97),(.025,.04,.15),'edge')
 box('Stores window',(-2.81,1.239,1.31),(1.12,.025,.70),'Salvage glass')
 for x in [-3.4,-2.81,-2.22]:box('Window sash',(x,1.21,1.31),(.034,.053,.78),'steel')
 for z in [.92,1.31,1.70]:box('Window transom',(-2.81,1.21,z),(1.23,.053,.034),'trim')
 o=box('Low weathered lean roof',(-2.25,2.365,2.22),(3.45,2.47,.055),'roof');o.rotation_euler.x=.09
 for x in [-3.92+i*.39 for i in range(9)]:beam('Roof standing seam',(x,1.13,2.14),(x,3.60,2.36),.013,.018,'edge')
 rod('Workshop flue',(-3.40,3.00,2.28),(-3.40,3.00,2.91),.075,'steel',16)
 rod('Flue rain cap',(-3.40,3.00,2.91),(-3.40,3.00,2.94),.13,'olive',16)


def shelving():
 # Open rack holds reclaimed stock beside the compact sorting workshop.
 for x in [-.30,1.36]:
  for y in [2.33,3.37]:box('Recovery rack upright',(x,y,1.14),(.064,.064,2.28),'steel')
 for z in [.18,.83,1.48]:
  box('Recovered parts shelf',(.53,2.85,z),(1.81,1.14,.055),'wood')
  for i in range(3):
   box('Recovered parts container',(-.01+i*.52,2.88,z+.20),(.43,.65,.33),'olive',.017)
   box('Inventory tag',(-.01+i*.52,2.54,z+.23),(.16,.014,.07),'paper',.002)
 o=box('Rack weather hood',(.53,2.85,2.33),(1.99,1.32,.045),'roof');o.rotation_euler.x=.06


def sign():
 box('Reclamation workshop nameplate',(-2.25,1.20,1.93),(2.20,.055,.20),'olive',.012)
 bpy.ops.object.text_add(location=(-2.25,1.164,1.865),rotation=(math.pi/2,0,0));o=bpy.context.object;o.data.body='COMPONENT RECOVERY';o.data.align_x='CENTER';o.data.size=.137;o.data.extrude=.001;o.data.materials.append(M['letter'])
