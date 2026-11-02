"""Validate the exported tank split without a renderer (numpy + trimesh)."""
import json
from pathlib import Path
import numpy as np
import trimesh

ROOT = Path(__file__).resolve().parent
report = json.loads((ROOT / 'split-report.json').read_text())
source = trimesh.load(ROOT / 'reassembled.glb', force='mesh')
hull = trimesh.load(ROOT.parent / 'tier01/m4_sherman_hull.glb', force='scene')
turret = trimesh.load(ROOT.parent / 'tier01/m4_sherman_turret.glb', force='scene')
pivot = np.array([report['pivot'][a] for a in 'xyz'])
turret.apply_translation(pivot)
rotating = turret.to_geometry()
assert rotating.bounds[0, 1] >= report['deckY'] - 1e-7, 'Hull geometry in turret'
assert rotating.bounds[1, 2] < report['rearFixedZ'], 'Rear stowage in turret'
parts = list(hull.geometry.values()) + list(turret.geometry.values())
textured = [m for m in parts if m.visual.material.baseColorTexture is not None]
assert len(textured) == 3, 'Hull, stowage and turret must retain texture maps'
for mesh in textured:
    assert len(mesh.visual.uv) == len(mesh.vertices), 'UVs lost during split'
closures = [m for m in parts if m.visual.material.baseColorTexture is None]
assert len(closures) == 2, 'Both exposed surfaces must be closed'
# Splitting must not delete or alter the original visible surface area.
assert abs(sum(m.area for m in textured) - source.area) < 1e-6
reassembled = trimesh.util.concatenate([hull.to_geometry(), rotating])
assert np.allclose(reassembled.bounds, source.bounds, atol=1e-7)
print('PASS: fixed hull/stowage, turret-only mesh, UVs, closures, original surface/bounds')
