"""Timber command compound modules. Blender XY ground / Z up; entrance faces -Y."""
from mesh_tools import *

def window(x,y,z,w=.48,h=.54):
    cube('Recessed window',(x,y,z),(w,.045,h),boxgreen,0)
    for side in [-1,1]:
        cube('Window jamb',(x+side*w/2,y-.036,z),(.055,.08,h+.09),woodlight,.006)
        cube('Window rail',(x,y-.038,z+side*h/2),(w+.10,.08,.055),woodlight,.005)
    cube('Window mullion',(x,y-.044,z),(.035,.035,h),wooddark,0)
    cube('Window transom',(x,y-.044,z),(w,.035,.033),wooddark,0)
    for side in [-1,1]:
        cube('Timber window shutter',(x+side*(w/2+.14),y-.015,z),(.16,.045,h+.04),boxgreen,.008)
        for dz in [-h*.3,h*.3]:cube('Shutter strap',(x+side*(w/2+.14),y-.043,z+dz),(.15,.018,.025),wooddark,0)
    cube('Window sill',(x,y-.073,z-h/2-.025),(w+.16,.16,.06),woodlight,.008)

def roof(cx,cy,w,d,base,rise):
    run=w/2+.18; count=max(7,round(run/.17));step=run/count
    for side in [-1,1]:
        deck=cube('Continuous sealed roof deck',(cx+side*run/2,cy,base+rise/2-.045),
                  (math.hypot(run,rise),d+.40,.055),wooddark,0)
        deck.rotation_euler.y=side*math.atan2(rise,run)
        for i in range(count):
            x=(i+.5)*step; z=base+rise*(1-x/run)
            o=cube('Individual overlapping roof board',(cx+side*x,cy,z),(step+.015,d+.42,.065),woodlight if i%3 else wood,.007)
            o.rotation_euler.y=side*math.atan2(rise,run)
    beam('Roof ridge cap',(cx,cy-d/2-.23,base+rise+.045),(cx,cy+d/2+.23,base+rise+.045),.105,material=wooddark)
    for side in [-1,1]:
        for end in [-1,1]:beam('Gable bargeboard',(cx,cy+end*(d/2+.2),base+rise),(cx+side*run,cy+end*(d/2+.2),base),.105,material=wood)
    # Solid triangular gables, no open roof holes.
    for end in [-1,1]:
        for i in range(int(rise/.15)):
            z=base+i*.15+.06; width=w*(1-(z-base)/rise)
            if width>0: cube('Gable timber course',(cx,cy+end*d/2,z),(width,.11,.14),wood,.008)

def cabin(cx,cy,w,d,h,floors=1,front_windows=2,side_upper=True,roofed=True):
    cube('Raised timber foundation',(cx,cy,.12),(w+.13,d+.13,.24),wooddark,.025)
    # Closed solid core, with detailed outer weatherboards on all four sides.
    cube('Closed timber building shell',(cx,cy,h/2+.2),(w,d,h),wooddark,0)
    courses=round(h/.16)
    for row in range(courses):
        z=.25+row*h/courses
        for side in [-1,1]:
            cube('Horizontal facade course',(cx,cy+side*d/2,z),(w,.115,h/courses-.012),wood if row%4 else woodlight,.009)
            cube('Horizontal side course',(cx+side*w/2,cy,z),(.115,d,h/courses-.012),wood if row%4 else woodlight,.009)
    for x in [-w/2,w/2]:
        for y in [-d/2,d/2]:cube('Thick corner timber',(cx+x,cy+y,h/2+.17),(.15,.15,h+.12),woodlight,.012)
    for level in range(floors):
        z=.82+level*(h/floors)
        for x in ([-w*.3,w*.3] if front_windows==2 else [0]):window(cx+x,cy-d/2-.075,z,w*.19,.52)
    for level in range(1,floors):
        for side in [-1,1]:cube('Storey belt beam',(cx,cy+side*d/2-.015,.19+h*level/floors),(w+.18,.17,.14),wooddark,.012)
    for side in [-1,1]:
        for level in range(floors):
            if level and not side_upper: continue
            for offset in ([-.26,.26] if floors>1 else [0]):
                before=set(bpy.context.scene.objects)
                window(0,0,.82+level*(h/floors),.48,.52)
                angle=side*math.pi/2
                for o in set(bpy.context.scene.objects)-before:
                    x,y=o.location.x,o.location.y
                    o.location.x=cx+side*(w/2+.08)+x*math.cos(angle)-y*math.sin(angle)
                    o.location.y=cy+offset*d+x*math.sin(angle)+y*math.cos(angle)
                    o.rotation_euler.z+=angle
    if roofed: roof(cx,cy,w,d,h+.19,.64 if floors==1 else .95)

def door(cx,front,z=.56,w=.65):
    cube('Main doorway dark reveal',(cx,front,z),(w+.14,.10,1.04),wooddark,.012)
    for i in range(6):cube('Door vertical plank',(cx-w/2+(i+.5)*w/6,front-.062,z),(w/6-.009,.04,.96),wood,.006)
    for side in [-1,1]:cube('Entrance jamb',(cx+side*(w/2+.06),front-.04,z),(.09,.13,1.13),woodlight,.008)
    cube('Entrance lintel',(cx,front-.04,z+.54),(w+.24,.15,.12),woodlight,.009)
    cube('Iron door handle',(cx+w*.3,front-.102,z),(.023,.038,.13),metal,.003)
