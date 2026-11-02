"""
S62: shrink every unit GLB's baseColorTexture from its native 2048x2048
down to a mobile-sane size — the S61 enemy-paint work doubled the number
of unique unit GLBs needed at boot (one green set + one blue set), and at
~4-5MB each (almost entirely one or two full 2048x2048 PNG textures) that
pushed total boot payload past 100MB, reproducing the exact "loads then
fails on real phone WiFi" bug S58 fixed for the GLB-count side of this
same problem. A texture this size was always overkill for how small a
unit renders on screen; downsizing costs no visible quality in play.

Overwrites each GLB IN PLACE (not another `_smaller` sibling — these are
the same runtime asset, not a new variant). Run once against the full set
below; safe to re-run (idempotent once already-small).
"""
from pathlib import Path
import trimesh
from PIL import Image

TARGET_PX = 512

FILES = [
    'm4_sherman/tier01/m4_sherman_hull.glb',
    'm4_sherman/tier01/m4_sherman_turret.glb',
    'm4_sherman/tier01/m4_sherman_hull_enemy.glb',
    'm4_sherman/tier01/m4_sherman_turret_enemy.glb',
    'm24_chaffee/tier01/m24_chaffee_hull.glb',
    'm24_chaffee/tier01/m24_chaffee_turret.glb',
    'm24_chaffee/tier01/m24_chaffee_hull_enemy.glb',
    'm24_chaffee/tier01/m24_chaffee_turret_enemy.glb',
    'm26_pershing/tier01/m26_pershing_hull.glb',
    'm26_pershing/tier01/m26_pershing_turret.glb',
    'm26_pershing/tier01/m26_pershing_hull_enemy.glb',
    'm26_pershing/tier01/m26_pershing_turret_enemy.glb',
    'm18_hellcat/tier01/m18_hellcat.glb',
    'm18_hellcat/tier01/m18_hellcat_enemy.glb',
    'm12_gmc/tier01/howitzer.glb',
    'm12_gmc/tier01/howitzer_enemy.glb',
    'us_infantry/tier01/soldier.glb',
    'us_infantry/tier01/torso.glb',
    'us_infantry/tier01/leg_l.glb',
    'us_infantry/tier01/leg_r.glb',
    'us_infantry/tier01/torso_enemy.glb',
    'us_infantry/tier01/leg_l_enemy.glb',
    'us_infantry/tier01/leg_r_enemy.glb',
]


def downsize(path):
    scene = trimesh.load(path, process=False)
    seen = set()
    changed = False
    for geom in scene.geometry.values():
        mat = geom.visual.material
        if id(mat) in seen:
            continue
        seen.add(id(mat))
        tex = mat.baseColorTexture
        if tex is not None and max(tex.size) > TARGET_PX:
            mat.baseColorTexture = tex.resize((TARGET_PX, TARGET_PX), Image.LANCZOS)
            changed = True
    if not changed:
        return None
    data = scene.export(file_type='glb')
    path.write_bytes(data)
    return len(data)


if __name__ == '__main__':
    root = Path(__file__).resolve().parent.parent
    total_before = total_after = 0
    for rel in FILES:
        p = root / rel
        before = p.stat().st_size
        after = downsize(p)
        total_before += before
        total_after += after if after else before
        status = f'{before/1e6:.1f}MB -> {after/1e6:.1f}MB' if after else f'{before/1e6:.1f}MB (already small)'
        print(f'{rel}: {status}')
    print(f'\nTOTAL: {total_before/1e6:.1f}MB -> {total_after/1e6:.1f}MB')
