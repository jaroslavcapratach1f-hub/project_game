"""Split the supplied USA light tank, preserving UVs and fixed hull stowage.
Source: user-provided TRELLIS prediction bet54x8vhxrna0d0rknr55szqg.
Requires numpy, scipy and trimesh; run this file from any working directory.
"""
from pathlib import Path
import json
import numpy as np
import trimesh
from scipy.spatial import ConvexHull
from PIL import Image

ROOT = Path(__file__).resolve().parent
DECK_Y = 0.075  # inspected skirt plane, above hull deck and side stowage
REAR_Z = 0.27  # rear deck stowage stays with hull, even above the skirt plane


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
    source = trimesh.load(ROOT / 'original.glb', force='mesh')
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
    # Match the source metal material and use sRGB texture color. A bright
    # untextured diffuse cap washes white under the game lighting.
    olive = trimesh.visual.material.PBRMaterial(
        baseColorTexture=Image.new('RGB', (2, 2), (56, 63, 29)),
        baseColorFactor=[255, 255, 255, 255], metallicFactor=1, roughnessFactor=1)
    hull = trimesh.Scene({'hull': lower, 'rear_stowage': rear,
                          'deck_closure': cap_mesh(boundary, olive, True)})
    turret = trimesh.Scene({'turret': turret,
                            'underside': cap_mesh(boundary, olive, False)})
    turret.apply_translation(-pivot)
    output = ROOT.parent / 'tier01'
    hull.export(output / 'm24_chaffee_hull.glb')
    turret.export(output / 'm24_chaffee_turret.glb')
    report = {'pivot': dict(zip('xyz', pivot.tolist())),
              'deckY': DECK_Y, 'rearFixedZ': REAR_Z,
              'hullFaces': sum(len(m.faces) for m in hull.geometry.values()), 'turretFaces': sum(len(m.faces) for m in turret.geometry.values()),
              'sourceFaces': len(source.faces),
              'turretBoundsLocal': turret.bounds.tolist()}
    (ROOT / 'split-report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
