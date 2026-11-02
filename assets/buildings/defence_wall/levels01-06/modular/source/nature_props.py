"""Reusable asymmetric conifers and restrained field clutter."""
from mesh_tools import *
from pine_foliage import needle_cluster, pine_uv

def pine(seed):
    r=random.Random(seed)
    tiers, spread, step, base = {1:(10,.60,.32,.55), 2:(9,.92,.28,.42), 3:(7,.77,.29,.46)}[seed]
    height=base+(tiers-1)*step+.45
    cyl('Pine trunk',(0,0,(height-.16)/2),.07+seed*.009,height-.16,wooddark,7)
    # Uneven radial boughs with serrated, drooping needle fans, not stacked cones.
    for tier in range(tiers):
        z=base+tier*step+r.uniform(-.055,.055); radius=(1-tier/(tiers+1))*spread
        branches=6+(tier+seed)%3
        for branch in range(branches):
            if seed==3 and (tier+branch)%7==0: continue
            a=branch*math.tau/branches+tier*.73+r.uniform(-.26,.26)
            length=radius*r.uniform(.62,1.22)
            tip=(math.cos(a)*length,math.sin(a)*length,z-.13)
            beam('Woody bough',(0,0,z+.1),tip,.025,material=wooddark)
            # Staggered overlapping sprays follow each drooping woody bough.
            for tuft in range(3):
                t=.30+tuft*.26
                sideways=r.uniform(-.09,.09)*(1-t)
                center=(math.cos(a)*length*t-math.sin(a)*sideways,
                        math.sin(a)*length*t+math.cos(a)*sideways,z+.08-t*.19)
                needle_cluster(center,length*(.75-t*.34),length*(.57-t*.27),
                               a+r.uniform(-.2,.2),r,foliage if (branch+tier+tuft)%4 else leaflight)
    for i in range(3):
        needle_cluster((0,0,height-.38+i*.13),.28-i*.05,.24-i*.04,i*2,r,leaflight)
    pine_uv()

def crate():
    cube('Crate box',(0,0,.2),(.42,.4,.4),wood,.015)
    for i in range(4):
        for side in [-1,1]:
            cube('Crate boards',(side*.217,0,.045+i*.1),(.025,.4,.085),woodlight,.004)
            cube('Crate boards',(0,side*.207,.045+i*.1),(.4,.025,.085),woodlight,.004)
    for side in [-1,1]:
        beam('Crate diagonal',(-.19,side*.225,.04),(.19,side*.225,.36),.045,.035,woodlight)
        for x in [-.18,.18]: cube('Crate edge strap',(x,side*.225,.2),(.045,.025,.4),wooddark,.002)

def drum():
    cyl('Painted oil drum',(0,0,.22),.16,.44,barrel,12)
    for z in [.025,.13,.31,.435]: cyl('Drum hoop',(0,0,z),.167,.02,wooddark,12)
    cyl('Drum lid',(0,0,.449),.147,.013,barrel,12)
    cyl('Filler cap',(.06,0,.459),.025,.015,metal,8)

def wire_post():
    beam('Single intermediate wire support',(0,0,0),(0,0,.46),.045,material=metal)

def wire():
    # Wire only: placement owns exactly one post between two hedgehogs.
    # Both ends meet the steel crossing at 0.35 cell above ground.
    points=[(0,-.5+i*.125,.35-.065*math.sin(i*math.pi/8)) for i in range(9)]
    cable('Continuous sagging barbed wire',points,.008)
    for i in range(7):
        y=-.4+i*.13; z=.35-.065*math.cos(y*math.pi)
        beam('Wire barb',(-.035,y-.025,z-.035),(.035,y+.025,z+.035),.008,material=metal)


def bridge():
    for i in range(6): cube('Crossing plank',(-.29+i*.116,0,.20),(.11,.92,.055),woodlight)
    for y in [-.32,.32]: cube('Bridge bearer',(0,y,.145),(.76,.07,.09),wooddark)
