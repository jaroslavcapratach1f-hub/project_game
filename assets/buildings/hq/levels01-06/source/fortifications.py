"""Habitable roof-terrace wings and open-backed HQ checkpoint posts."""
from mesh_tools import *
from architecture import cabin,door,window
from nature_props import crate,drum


def rotated_room_detail(side,cy,fn):
    before=set(bpy.context.scene.objects);fn()
    angle=side*math.pi/2
    for o in set(bpy.context.scene.objects)-before:
        x,y=o.location.x,o.location.y
        o.location.x=side*1.265+x*math.cos(angle)-y*math.sin(angle)
        o.location.y=cy+x*math.sin(angle)+y*math.cos(angle)
        o.rotation_euler.z+=angle


def sandbag_arc(cx,cy,z,radius,start,end,courses=2):
    count=max(4,round(abs(end-start)*radius/.30))
    for row in range(courses):
        for i in range(count):
            a=start+(end-start)*(i+.5+(row%2)*.22)/count
            x=cx+math.cos(a)*radius;y=cy+math.sin(a)*radius
            # Rotate complete bag and stitching as one assembly.
            before=set(bpy.context.scene.objects);bag((0,0,0))
            for o in set(bpy.context.scene.objects)-before:
                ox,oy=o.location.x,o.location.y;t=a+math.pi/2
                o.location.x=x+ox*math.cos(t)-oy*math.sin(t)
                o.location.y=y+ox*math.sin(t)+oy*math.cos(t)
                o.location.z+=z+row*.105;o.rotation_euler.z+=t


def balcony_door():
    before=set(bpy.context.scene.objects);door(0,0,0,.47)
    for o in set(bpy.context.scene.objects)-before:
        o.location.z=1.68+o.location.z*.82;o.scale.z*=.82


def wings():
    for side in [-1,1]:
        cx=side*1.85;cy=.70
        cabin(cx,cy,1.40,2.15,1.02,front_windows=1,roofed=False)
        # Weatherproof shallow roof with usable level timber terrace above it.
        cube('Sealed shallow wing roof',(cx,cy,1.215),(1.57,2.32,.075),wooddark,.012)
        for i in range(12):
            cube('Balcony walking deck',(cx,cy-1.05+i*.19,1.25),(1.48,.18,.055),woodlight,.008)
        for end in [-1,1]:
            eave=cube('Shallow sloping roof end',(cx,cy+end*1.16,1.195),(1.62,.24,.055),wood,.009)
            eave.rotation_euler.x=-end*.18
        outer=cube('Shallow outboard roof eave',(side*2.63,cy,1.19),(.24,2.34,.055),wood,.009)
        outer.rotation_euler.y=side*.18
        rotated_room_detail(side,.24,balcony_door)
        rotated_room_detail(side,1.25,lambda:window(0,0,1.78,.37,.44))
        cube('Balcony door threshold',(side*1.32,.24,1.28),(.28,.68,.07),woodlight,.008)
        # Rounded fighting position at the outboard end; inner route stays open.
        sandbag_arc(cx,cy,1.335,.62,-math.pi/2,math.pi/2,4) if side>0 else sandbag_arc(cx,cy,1.335,.62,math.pi/2,math.pi*1.5,4)
        for end in [-1,1]:
            beam('Balcony end rail',(side*1.36,cy+end*.94,1.68),(side*2.48,cy+end*.94,1.68),.065,material=wooddark)
            for x in [side*1.36,side*2.48]:cube('Balcony rail post',(x,cy+end*.94,1.47),(.065,.065,.45),woodlight,.006)


def checkpoints():
    # Both horseshoe positions open into the HQ yard, leaving a broad central approach.
    for side in [-1,1]:
        cx=side*2.05;cy=-2.90
        sandbag_arc(cx,cy,.105,.79,math.pi*.88,math.pi*2.12,4)
        for i in range(6):cube('Checkpoint timber floor',(cx-.48+i*.19,cy,.035),(.18,1.03,.05),wooddark,.005)
        beam('Checkpoint firing ledge',(cx-.52,cy-.49,.48),(cx+.52,cy-.49,.48),.14,.23,woodlight)
        # Open rear passage has no crossbar, wall or decorative collision.


def supplies():
    for index,(x,y,z) in enumerate([(-3.18,-.65,0),(-3.16,-1.18,0),(-3.18,-.65,.37),
                                  (3.18,.15,0),(3.20,-.40,0),(3.18,.15,.37),
                                  (-1.3,-1.58,0),(1.45,-1.72,0)]):
        before=set(bpy.context.scene.objects);crate()
        for o in set(bpy.context.scene.objects)-before:
            o.location.x+=x;o.location.y+=y;o.location.z+=z
    for x,y in [(3.23,1.15),(3.20,.75),(-3.20,-1.85),(-2.85,-1.85)]:
        before=set(bpy.context.scene.objects);drum()
        for o in set(bpy.context.scene.objects)-before:o.location.x+=x;o.location.y+=y
    for x,y in [(-1.5,-2.1),(1.45,-2.15),(2.98,-1.65)]:
        cube('Olive command equipment case',(x,y,.18),(.43,.30,.34),boxgreen,.025)
        for dx in [-.13,.13]:cube('Case reinforcing strap',(x+dx,y,.19),(.035,.32,.35),metal,.003)
