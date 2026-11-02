"""Continuous rest-pose deformation of the existing textured infantry mesh.
Works in the imported mesh's Z-up source coordinates; no cuts or replacement legs.
Only the static building copy is changed. Upper body and held rifle stay intact.
"""
import math
from mathutils import Vector,Matrix

def smooth(a,b,value):
 t=max(0,min(1,(value-a)/(b-a)));return t*t*(3-2*t)

def stand_at_rest(parts):
 # Original pose: +X leg strides forward; -X leg trails behind.
 rotations={1:Matrix.Rotation(math.radians(-34),3,'X'),-1:Matrix.Rotation(math.radians(38),3,'X')}
 feet={1:Matrix.Rotation(math.radians(-7),3,'X'),-1:Matrix.Rotation(math.radians(-24),3,'X')}
 boot_vertices={1:[],-1:[]};records=[]
 for o in parts:
  for v in o.data.vertices:
   source=v.co.copy();side=1 if source.x>=0 else -1
   weight=1-smooth(-.15,-.025,source.z)
   if weight==0:continue
   hip=Vector((side*.085,-.030,-.055))
   ankle=Vector((side*.080,.205 if side==1 else -.335,-.397))
   foot_weight=1-smooth(-.40,-.315,source.z)
   foot=source.lerp(ankle+feet[side]@(source-ankle),foot_weight)
   v.co=source.lerp(hip+rotations[side]@(foot-hip),weight)
   records.append((v,side,source.z))
   if source.z<-.40:boot_vertices[side].append(v)
 # Plant both soles at one plane without moving the torso or opening a seam.
 floor={side:min(v.co.z for v in vertices) for side,vertices in boot_vertices.items()}
 ground=min(floor.values())
 for v,side,z in records:
  v.co.z+=(ground-floor[side])*(1-smooth(-.32,-.10,z))
 for o in parts:o.data.update()
 print('SENTRY_REST_POSE',{'ground':ground,'soles':[min(v.co.z for v in boot_vertices[s]) for s in [-1,1]]})
