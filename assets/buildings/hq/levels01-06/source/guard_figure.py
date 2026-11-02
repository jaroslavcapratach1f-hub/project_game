"""Original faction-neutral field sentry, modelled at the HQ doorway scale.
Clothed anatomical volumes, planted boots and hands posed at fixed gun grips.
No national badges, flags, source troop mesh or borrowed character textures.
"""
from mesh_tools import *
from mathutils import Vector
uniform=mat('Guard olive field wool',(.19,.235,.105))
trousers=mat('Guard khaki trousers',(.19,.18,.11))
skin=mat('Guard face and hands',(.43,.28,.17))
leather=mat('Guard dark leather',(.055,.042,.026))
webbing=mat('Guard canvas equipment',(.27,.27,.14))
helmet=mat('Guard matte helmet steel',(.10,.14,.065))
face_dark=mat('Guard face recesses',(.045,.030,.020))


def volume(name,center,scale,material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=12,ring_count=8,location=center)
    o=bpy.context.object;o.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    finish(o,name,material)
    for f in o.data.polygons:f.use_smooth=True
    return o


def limb(name,a,b,r1,r2,material):
    direction=Vector(b)-Vector(a)
    bpy.ops.mesh.primitive_cone_add(vertices=12,radius1=r1,radius2=r2,depth=direction.length,location=(Vector(a)+Vector(b))/2)
    o=bpy.context.object;o.rotation_mode='QUATERNION';o.rotation_quaternion=direction.to_track_quat('Z','Y')
    finish(o,name,material)
    for f in o.data.polygons:f.use_smooth=True
    return o


def helmet_shell():
    verts=[];faces=[];rings=6;segments=20
    for row in range(rings+1):
        t=(row+.15)/(rings+.15)*math.pi/2
        for i in range(segments):
            a=i*math.tau/segments
            verts.append((math.sin(t)*math.cos(a)*.072,math.sin(t)*math.sin(a)*.066+.006,.798+math.cos(t)*.069))
    for row in range(rings):
        for i in range(segments):
            a=row*segments+i;b=row*segments+(i+1)%segments;faces.append((a,b,b+segments,a+segments))
    faces.append(tuple(reversed(range(segments))))
    mesh=bpy.data.meshes.new('Pressed helmet shell');mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new('Plain steel helmet shell',mesh);bpy.context.collection.objects.link(o);finish(o,o.name,helmet)
    for f in mesh.polygons:f.use_smooth=True
    rim=cyl('Helmet rolled brim',(0,.006,.798),.074,.011,helmet,20);rim.scale.y=.94


def build_guard():
    for side in [-1,1]:
        x=side*.063;y=.012+side*.015
        volume('Planted leather boot',(x,y-.022,.045),(.037,.079,.044),leather)
        cube('Boot sole',(x,y-.028,.014),(.070,.137,.024),leather,.012)
        limb('Boot upper',(x,y,.048),(x,y,.118),.033,.030,leather)
        limb('Trouser lower leg',(x,y,.103),(side*.065,.015,.274),.029,.040,trousers)
        volume('Trouser knee',(side*.065,.005,.283),(.041,.043,.045),trousers)
        limb('Trouser upper leg',(side*.065,.015,.28),(side*.049,.025,.447),.041,.050,trousers)
        for h in [.14,.23,.31]:
            volume('Folded trouser cloth',(x,y-.015,h),(.035,.025,.009),trousers)
        for h in [.05,.07,.09]:cube('Boot lacing',(x,y-.061,h),(.035,.007,.004),webbing,0)
    volume('Jacket covered pelvis',(0,.019,.445),(.103,.064,.074),uniform)
    volume('Field jacket torso',(0,.022,.554),(.112,.070,.124),uniform)
    volume('Jacket shoulders',(0,.018,.625),(.135,.064,.053),uniform)
    cyl('Uniform neck',(0,.005,.683),.027,.045,skin,12)
    for side in [-1,1]:
        collar=cube('Jacket collar',(side*.032,-.034,.663),(.045,.025,.050),uniform,.007);collar.rotation_euler.y=side*.35
        upper=(side*.118,.006,.626);elbow=(side*.139,-.026,.524);wrist=(side*.053,-.121,.523)
        volume('Sleeve shoulder',upper,(.039,.043,.046),uniform)
        limb('Jacket upper sleeve',upper,elbow,.036,.028,uniform)
        volume('Bent sleeve elbow',elbow,(.031,.034,.033),uniform)
        limb('Jacket forearm',elbow,wrist,.028,.021,uniform)
        volume('Hand on gun grip',(side*.054,-.121,.522),(.019,.025,.024),skin)
        for finger in range(3):
            volume('Curled gunner finger',(side*.05,-.139,.509+finger*.009),(.017,.009,.005),skin)
        cube('Chest pocket',(side*.052,-.045,.586),(.060,.018,.060),uniform,.006)
        cube('Pocket flap',(side*.052,-.058,.609),(.064,.012,.015),webbing,.003)
        cube('Webbing shoulder strap',(side*.070,-.046,.577),(.014,.014,.150),webbing,.003)
        cube('Belt pouch',(side*.083,-.055,.454),(.048,.035,.063),webbing,.005)
    cube('Field belt',(0,-.047,.471),(.187,.027,.026),leather,.006)
    cube('Belt buckle',(0,-.065,.471),(.025,.008,.022),metal,.003)
    for h in [.512,.548,.58,.612]:volume('Jacket button',(0,-.052,h),(.005,.005,.005),wooddark)
    cube('Small field pack',(0,.089,.556),(.137,.061,.147),webbing,.016)
    # Human proportions: restrained brow/eyes/nose, no enlarged cartoon facial features.
    volume('Sentry head',(0,.002,.752),(.049,.047,.071),skin)
    volume('Sentry jaw',(0,-.007,.718),(.037,.037,.034),skin)
    volume('Nose bridge',(0,-.045,.753),(.010,.013,.025),skin)
    volume('Nose tip',(0,-.055,.740),(.013,.011,.012),skin)
    for side in [-1,1]:
        volume('Ear',(side*.046,.003,.747),(.010,.011,.020),skin)
        volume('Eye shadow',(side*.021,-.043,.765),(.010,.004,.004),face_dark)
        volume('Brow ridge',(side*.021,-.042,.774),(.017,.007,.006),skin)
        beam('Helmet chin strap',(side*.050,-.010,.797),(side*.030,-.018,.707),.008,material=leather)
    volume('Mouth shadow',(0,-.039,.718),(.014,.003,.003),face_dark)
    helmet_shell()
