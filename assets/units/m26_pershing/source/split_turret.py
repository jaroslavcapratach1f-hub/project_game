"""Split the color-prepared Pershing at its skirt; keep deck stowage fixed."""
import json
import struct
from pathlib import Path
import numpy as np
import trimesh
from scipy.spatial import ConvexHull

ROOT = Path(__file__).resolve().parent
OUT = ROOT.parent / 'tier01'
SKIRT_Y = 0.055

def restore_paint(path, factor):
    # trimesh clamps HDR material factors to 1; preserve the approved palette.
    data = path.read_bytes()
    length, kind = struct.unpack_from('<II', data, 12)
    doc = json.loads(data[20:20 + length])
    doc['materials'][0]['pbrMetallicRoughness']['baseColorFactor'] = factor
    encoded = json.dumps(doc, separators=(',', ':')).encode()
    encoded += b' ' * (-len(encoded) % 4)
    tail = data[20 + length:]
    path.write_bytes(struct.pack('<III', 0x46546C67, 2, 20 + len(encoded) + len(tail))
                     + struct.pack('<II', len(encoded), kind) + encoded + tail)

def closure(points, material, upward):
    ring = points[ConvexHull(points[:, [0, 2]]).vertices]
    vertices = np.vstack([ring.mean(axis=0), ring])
    faces = [[0, i + 1, (i + 1) % len(ring) + 1] for i in range(len(ring))]
    cap = trimesh.Trimesh(vertices=vertices, faces=faces, process=False)
    if (cap.face_normals[0, 1] > 0) != upward:
        cap.invert()
    cap.visual = trimesh.visual.TextureVisuals(uv=np.zeros((len(vertices), 2)), material=material)
    return cap

def main():
    source = trimesh.load(OUT / 'm26_pershing.glb', force='mesh')
    # Cut first, then classify connected upper surfaces. A height/box mask
    # sliced fender boxes and lamps in half and carried their inner ends along.
    upper = source.slice_plane([0, SKIRT_Y, 0], [0, 1, 0])
    lower = source.slice_plane([0, SKIRT_Y, 0], [0, -1, 0])
    welded = upper.copy()
    welded.merge_vertices(merge_tex=True, merge_norm=True)
    groups = trimesh.graph.connected_components(
        welded.face_adjacency, nodes=np.arange(len(welded.faces)), min_len=1)
    rotating_faces = max(groups, key=len)
    fixed_faces = np.setdiff1d(np.arange(len(upper.faces)), rotating_faces)
    # Select from the untouched UV mesh: welding is for topology detection only.
    turret = upper.submesh([rotating_faces], append=True)
    props = upper.submesh([fixed_faces], append=True)
    seam = turret.vertices[np.isclose(turret.vertices[:, 1], SKIRT_Y)]
    pivot = (seam.min(axis=0) + seam.max(axis=0)) / 2
    olive = trimesh.visual.material.PBRMaterial(baseColorFactor=[0.093, 0.084, 0.021, 1.0], roughnessFactor=1)
    hull = trimesh.Scene({'hull': lower, 'fixed_stowage': props, 'deck_closure': closure(seam, olive, True)})
    rotating = trimesh.Scene({'turret': turret, 'underside': closure(seam, olive, False)})
    rotating.apply_translation(-pivot)
    hull.export(OUT / 'm26_pershing_hull.glb')
    rotating.export(OUT / 'm26_pershing_turret.glb')
    data = (OUT / 'm26_pershing.glb').read_bytes()
    doc = json.loads(data[20:20 + struct.unpack_from('<I', data, 12)[0]])
    factor = doc['materials'][0]['pbrMetallicRoughness']['baseColorFactor']
    for name in ['m26_pershing_hull.glb', 'm26_pershing_turret.glb']:
        restore_paint(OUT / name, factor)
    report = {'pivot': dict(zip('xyz', pivot.tolist())), 'skirtY': SKIRT_Y,
              'upperComponents': len(groups), 'fixedUpperFaces': len(fixed_faces),
              'sourceBounds': source.bounds.tolist(), 'hullBounds': hull.bounds.tolist(),
              'surfaceAreaError': abs(source.area - props.area - turret.area - lower.area)}
    (ROOT / 'split-report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    main()
