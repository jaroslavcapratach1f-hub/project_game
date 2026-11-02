"""Timber joinery, field towers, trenches and obstacles; all dimensions in grid cells."""
from mesh_tools import *

def wall(mask):
    cyl('Rough hewn support',(0,0,.69),.085,1.38,woodlight,7)
    cyl('Cut post crown',(0,0,1.385),.078,.015,wooddark,7)
    for i,(dx,dy) in enumerate([(0,-1),(1,-1),(1,0),(1,1),(0,1),(-1,1),(-1,0),(-1,-1)]): # GLB +Z maps Blender -Y
        if not mask & (1<<i): continue
        for row in range(6):
            z=.19+row*.175
            a=(dx*.065,dy*.065,z); b=(dx*.505,dy*.505,z+random.uniform(-.008,.008))
            length=math.hypot(dx,dy)*.45
            o=cube('Horizontal timber course',((a[0]+b[0])/2,(a[1]+b[1])/2,z),(length+.035,.14,.16),wood if row%3 else woodlight,.012)
            o.rotation_euler.z=math.atan2(dy,dx)
            # Deliberate fine split/grain relief on exposed timber face.
            for sign in [-1,1]:
                p=(dx*.13+dy*.06*sign,dy*.13-dx*.06*sign,z-.033)
                q=(dx*.46+dy*.06*sign,dy*.46-dx*.06*sign,z-.027)
                beam('Weathered grain split',p,q,.006,.008,wooddark)


def tower():
    for x in [-.76,.76]:
        for y in [-.76,.76]:
            beam('Splayed tower leg',(x,y,0),(x*.8,y*.8,2.7),.125,material=woodlight)
    for z in [.15,1.1,2.05]:
        for side in [-1,1]:
            beam('Frame tie',(-.73,side*.73,z),(.73,side*.73,z),.105)
            beam('Frame tie',(side*.73,-.73,z),(side*.73,.73,z),.105)
    for side in [-1,1]:
        for low,high in [(0.18,1.1),(1.1,2.05)]:
            beam('Diagonal cross brace',(-.71,side*.71,low),(.71,side*.71,high),.075,material=woodlight)
            beam('Diagonal cross brace',(.71,side*.71,low),(-.71,side*.71,high),.075,material=woodlight)
            beam('Diagonal cross brace',(side*.71,-.71,low),(side*.71,.71,high),.075,material=woodlight)
    for i in range(9): cube('Platform floor',(-.8+i*.2,0,2.13),(.19,1.8,.10),woodlight)
    for side in [-1,1]:
        for i in range(5):
            bag((-.65+i*.32,side*.73,2.28))
            bag((side*.73,-.65+i*.32,2.28),math.pi/2)
        for i in range(4): bag((-.49+i*.32,side*.73,2.39))
    for side in [-1,1]:
        for i in range(10):
            x=side*(.045+i*.105); z=3.33-abs(x)*.32
            o=cube('Individual roof shingle',(x,0,z),(.115,2.06,.065),woodlight if i%3 else wood)
            o.rotation_euler.y=side*.31
    beam('Roof ridge',(0,-1.04,3.35),(0,1.04,3.35),.085,material=wooddark)
    for side in [-1,1]: beam('Roof edge',(side*1.05,-1.03,2.99),(side*1.05,1.03,2.99),.09)
    # Ladder is integrated inside the open frame.
    for x in [-.18,.18]: beam('Ladder rail',(x,.6,.05),(x,.25,2.12),.048)
    for i in range(10): beam('Ladder rung',(-.19,.58-i*.033,.17+i*.19),(.19,.58-i*.033,.17+i*.19),.035)


def trench(mask=5):
    # Raised revetment creates visible shallow depth on the uncut map plane.
    cube('Trench floor',(0,0,.014),(.49,.49,.025),floor,0)
    dirs=[(0,-1),(1,0),(0,1),(-1,0)]
    for i,(dx,dy) in enumerate(dirs):
        if mask & (1<<i):
            cube('Trench channel',(dx*.35,dy*.35,.014),(.5 if dy else .3,.5 if dx else .3,.025),floor,0)
            for side in [-1,1]:
                x=dx*.3+dy*side*.32; y=dy*.3-dx*side*.32
                cube('Earthen bank',(x,y,.09),(.18 if dy else .62,.18 if dx else .62,.18),dirt,.07)
                beam('Timber revetment',(dx*.04+dy*side*.24,dy*.04-dx*side*.24,.09),
                     (dx*.53+dy*side*.24,dy*.53-dx*side*.24,.09),.065,material=woodlight)
        else:
            cube('Closed trench rim',(dx*.32,dy*.32,.09),(.18 if dx else .65,.18 if dy else .65,.18),dirt,.06)


def hedgehog():
    for a,b in [((-.35,0,.04),(.35,0,.67)),((.35,0,.04),(-.35,0,.67)),((0,-.42,.33),(0,.42,.33))]:
        beam('Steel web',a,b,.065,.08,metal)
        for off in [-.045,.045]:
            beam('Steel flange',(a[0],a[1]+off,a[2]),(b[0],b[1]+off,b[2]),.1,.022,metal)
    cyl('Central rivet',(0,0,.39),.04,.10,metal)


def pole():
    cyl('Timber utility pole',(0,0,2.12),.085,4.24,woodlight)
    cube('Cross arm',(0,0,4.03),(1.25,.12,.12),wood)
    for x in [-.49,0,.49]:
        cyl('Insulator pin',(x,0,4.16),.025,.18,metal)
        for z in [4.18,4.23]: cyl('Ceramic ring',(x,0,z),.055,.035,ceramic)
    for x in [-.2,.2]: cube('Transformer',(x,.14,3.15),(.23,.25,.48),wooddark,.025)
    for z in [2.7,3.4]: cube('Utility brace',(0,0,z),(.75,.13,.07),metal)

def gate():
    # Closed wooden double gate fills three adjacent wall cells; long axis Blender Y / GLB Z.
    for y in [-1.45,0,1.45]: cyl('Gate post',(0,y,.7),.11,1.4,woodlight)
    for i in range(18): cube('Gate boards',(0,-1.36+i*.16,.65),(.12,.15,1.13),woodlight,.012)
    for side in [-1,1]:
        for z in [.25,1.03]: beam('Gate rail',(.09,side*.08,z),(.09,side*1.37,z),.08,material=wooddark)
        beam('Gate diagonal',(.1,side*.1,.25),(.1,side*1.36,1.03),.09,material=wooddark)
