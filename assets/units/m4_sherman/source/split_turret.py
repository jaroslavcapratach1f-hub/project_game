"""Rebuild the approved tank's textured hull/turret; requires numpy/scipy/trimesh.
Source restores the old split by matching 521 shared seam vertices, translation
(-0.0070934, 0.015, 0.22171453). No new AI generation or silhouette replacement.
"""
from pathlib import Path
import json
import numpy as np
import trimesh
from scipy.spatial import ConvexHull

ROOT = Path(__file__).resolve().parent
DECK_Y = 0.075  # turret skirt above hull deck; old 0.015 cut through the hull
REAR_Z = 0.30  # rear deck stowage stays with hull, even above the skirt plane


def cap_mesh(points, material, upward):
    """Close the turret opening with an olive textured plate, retaining UVs."""
    ring = points[ConvexHull(points[:, [0, 2]]).vertices]
    centre = ring.mean(axis=0)
    vertices = np.vstack([centre, ring])
    faces = [[0, i + 1, (i + 1) % len(ring) + 1] for i in range(len(ring))]
    cap = trimesh.Trimesh(vertices=vertices, faces=faces, process=False)
    if (cap.face_normals[0, 1] > 0) != upward:
        cap.invert()
    # A small solid olive material avoids stretching the source's atlas over
    # newly exposed deck. Surface detail everywhere else retains original UVs.
    cap.visual = trimesh.visual.TextureVisuals(
        uv=np.zeros((len(vertices), 2)), material=material)
    return cap


def main():
    """Partition at the actual skirt, preserve rear props, cap both new surfaces."""
    source = trimesh.load(ROOT / 'reassembled.glb', force='mesh')
    rear_mask = source.triangles_center[:, 2] > REAR_Z
    rear = source.submesh([np.flatnonzero(rear_mask)], append=True)
    body = source.submesh([np.flatnonzero(~rear_mask)], append=True)
    origin = [0, DECK_Y, 0]
    turret = body.slice_plane(origin, [0, 1, 0], cap=False)
    lower = body.slice_plane(origin, [0, -1, 0], cap=False)
    turret.remove_unreferenced_vertices()
    lower.remove_unreferenced_vertices()
    boundary = turret.vertices[np.isclose(turret.vertices[:, 1], DECK_Y)]
    # Pivot at the ring's centre, excluding no barrel mass: the barrel is
    # entirely above this plane and therefore cannot skew the ring bounds.
    pivot = (boundary.min(axis=0) + boundary.max(axis=0)) / 2
    # glTF material factors are LINEAR RGB; byte sRGB values looked white.
    olive = trimesh.visual.material.PBRMaterial(
        baseColorFactor=[0.093, 0.084, 0.021, 1.0], metallicFactor=0, roughnessFactor=0.9)
    hull = trimesh.Scene({'hull': lower, 'rear_stowage': rear,
                          'deck_closure': cap_mesh(boundary, olive, True)})
    turret = trimesh.Scene({'turret': turret,
                            'underside': cap_mesh(boundary, olive, False)})
    turret.apply_translation(-pivot)
    output = ROOT.parent / 'tier01'
    hull.export(output / 'm4_sherman_hull.glb')
    turret.export(output / 'm4_sherman_turret.glb')
    report = {'pivot': dict(zip('xyz', pivot.tolist())),
              'deckY': DECK_Y, 'rearFixedZ': REAR_Z,
              'hullFaces': sum(len(m.faces) for m in hull.geometry.values()), 'turretFaces': sum(len(m.faces) for m in turret.geometry.values()),
              'sourceFaces': len(source.faces),
              'turretBoundsLocal': turret.bounds.tolist()}
    (ROOT / 'split-report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
