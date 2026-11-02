"""Prepare TRELLIS Maus: matte paint, UV-preserving skirt cut, fixed deck fittings.
Original generated file stays untouched. No gameplay geometry or primitive art.
"""
import json
from pathlib import Path
import numpy as np
import trimesh
from scipy.spatial import ConvexHull, cKDTree
ROOT=Path(__file__).resolve().parent.parent
SKIRT_Y=.035

def smooth(mesh):
    welded=mesh.copy()
    welded.merge_vertices(merge_tex=True,merge_norm=True)
    _,ids=cKDTree(welded.vertices).query(mesh.vertices)
    mesh.vertex_normals=welded.vertex_normals[ids]
    return mesh

def closure(points,upward):
    ring=points[ConvexHull(points[:,[0,2]]).vertices]
    vertices=np.vstack([ring.mean(axis=0),ring])
    faces=[[0,i+1,(i+1)%len(ring)+1] for i in range(len(ring))]
    mesh=trimesh.Trimesh(vertices=vertices,faces=faces,process=False)
    if (mesh.face_normals[0,1]>0)!=upward:mesh.invert()
    material=trimesh.visual.material.PBRMaterial(name='grey_painted_steel_closure',baseColorFactor=[.025,.025,.024,1],metallicFactor=0,roughnessFactor=.88)
    mesh.visual=trimesh.visual.TextureVisuals(uv=np.zeros((len(vertices),2)),material=material)
    return mesh

source=trimesh.load(ROOT/'source/original.glb',force='mesh')
source.visual.material.baseColorFactor=[.24,.24,.24,1]
source.visual.material.metallicFactor=0
source.visual.material.roughnessFactor=.86
source.visual.material.name='Maus_starting_five_star_grey'
smooth(source)
upper=source.slice_plane([0,SKIRT_Y,0],[0,1,0])
lower=source.slice_plane([0,SKIRT_Y,0],[0,-1,0])
welded=upper.copy();welded.merge_vertices(merge_tex=True,merge_norm=True)
groups=trimesh.graph.connected_components(welded.face_adjacency,nodes=np.arange(len(welded.faces)),min_len=1)
# The connected turret plus any detached high gun fragments rotate together.
rotating=np.concatenate([g for g in groups if len(g)==max(map(len,groups)) or upper.submesh([g],append=True).bounds[0,1]>.06])
fixed=np.setdiff1d(np.arange(len(upper.faces)),rotating)
turret=upper.submesh([rotating],append=True);props=upper.submesh([fixed],append=True)
seam=turret.vertices[np.isclose(turret.vertices[:,1],SKIRT_Y)]
pivot=(seam.min(axis=0)+seam.max(axis=0))/2
hull=trimesh.Scene({'fixed_hull':smooth(lower),'fixed_deck_fittings':smooth(props),'sealed_deck':closure(seam,True)})
rotating_scene=trimesh.Scene({'rotating_turret':smooth(turret),'sealed_underside':closure(seam,False)})
rotating_scene.apply_translation(-pivot)
hull.export(ROOT/'maus_hull.glb');rotating_scene.export(ROOT/'maus_turret.glb')
report={'source':'source/original.glb','pivot':dict(zip('xyz',pivot.tolist())),'skirtY':SKIRT_Y,'fixedUpperFaces':len(fixed),'rotatingFaces':len(rotating),'sourceFaces':len(source.faces),'sourceBounds':source.bounds.tolist(),'hullBounds':hull.bounds.tolist(),'turretBounds':rotating_scene.bounds.tolist(),'surfaceAreaError':abs(source.area-lower.area-props.area-turret.area)}
(ROOT/'source/split-report.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
