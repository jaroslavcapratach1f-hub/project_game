"""
S61: the Legion's (enemy team) steel-blue paint job. Recolors every
material in a GLB to a fixed blue hue while preserving lightness/detail
(HSV hue-lock with reduced saturation and a slight value lift) — the same shading /
panel-line / weathering pattern the source's green paint already has,
just blue instead of olive. A first attempt tinted this at RUNTIME via a
flat multiply (`material.color`), which cannot work: blue is the WEAKEST
channel in every one of these all-olive source textures (~40/255 vs red/
green's ~80/255), so any multiply that makes blue dominate is capped at
that same low ceiling — read as "no lines visible, nothing" (the user's
own words). This script bakes the recolor into the texture itself instead,
rendered through the exact same lit pipeline as the original green paint.

A texture's own `baseColorFactor` multiply (if non-neutral) is baked into
the texture pixels FIRST (simple sRGB-space multiply — precision doesn't
matter here since hue gets fully replaced next), then reset to neutral so
the recolor is the texture's own, not a runtime multiply. A material with
NO texture (a flat baseColorFactor only, e.g. an unseen closure plate) has
that flat color hue-locked directly, the same way.

Usage: python3 recolor_enemy.py --all
   or: python3 recolor_enemy.py <source.glb> <dest_enemy.glb>

Run once per source file (geometry/UVs pass through byte-identical —
verified via a bounds round-trip on every output) to produce this
session's `*_enemy.glb` siblings, each alongside its source:
  m4_sherman/tier01/{m4_sherman_hull,m4_sherman_turret}_enemy.glb
  m24_chaffee/tier01/{m24_chaffee_hull,m24_chaffee_turret}_enemy.glb
  m26_pershing/tier01/{m26_pershing_hull,m26_pershing_turret}_enemy.glb
  m18_hellcat/tier01/m18_hellcat_enemy.glb
  m12_gmc/tier01/howitzer_enemy.glb
  us_infantry/tier01/{torso,leg_l,leg_r}_enemy.glb
Wired up in src/config/Unit3DConfig.js's `enemy:*` entries.
"""
import sys
import json
import hashlib
from pathlib import Path
import numpy as np
import trimesh
from PIL import Image

HUE_TARGET = 0.62  # ~223 degrees — dark navy/steel blue
SAT_MULT = 0.80    # softer steel blue; reduce the previous saturated navy
VALUE_MULT = 1.10  # slight lift without losing panel shading


def colorize_array(rgb_u8, hue_target, sat_mult):
    """@param rgb_u8: HxWx3 (or 1x1x3) uint8 array @returns same-shape uint8 array, hue-locked"""
    img = Image.fromarray(rgb_u8)
    hsv = img.convert('HSV')
    h, s, v = hsv.split()
    h_arr = np.full(np.array(h).shape, int(round(hue_target * 255)), dtype=np.uint8)
    s_arr = np.clip(np.array(s).astype(np.float32) * sat_mult, 0, 255).astype(np.uint8)
    v_arr = np.clip(np.array(v).astype(np.float32) * VALUE_MULT, 0, 255).astype(np.uint8)
    merged = Image.merge('HSV', (Image.fromarray(h_arr), Image.fromarray(s_arr), Image.fromarray(v_arr)))
    return np.array(merged.convert('RGB'))


def recolor_glb(src_path, dst_path):
    scene = trimesh.load(src_path, process=False)
    seen = set()
    for geom in scene.geometry.values():
        mat = geom.visual.material
        if id(mat) in seen:
            continue
        seen.add(id(mat))
        factor = mat.baseColorFactor  # uint8 [R,G,B,A]
        tex = mat.baseColorTexture
        if tex is not None:
            arr = np.array(tex.convert('RGB')).astype(np.float32)
            if not (factor[0] == 255 and factor[1] == 255 and factor[2] == 255):
                arr = np.clip(arr * (factor[:3].astype(np.float32) / 255.0), 0, 255)
            new_arr = colorize_array(arr.astype(np.uint8), HUE_TARGET, SAT_MULT)
            mat.baseColorTexture = Image.fromarray(new_arr)
            mat.baseColorFactor = np.array([255, 255, 255, factor[3]], dtype=np.uint8)
        else:
            flat = factor[:3].reshape(1, 1, 3).astype(np.uint8)
            new_flat = colorize_array(flat, HUE_TARGET, SAT_MULT)
            mat.baseColorFactor = np.array([*new_flat[0, 0], factor[3]], dtype=np.uint8)
    with open(dst_path, 'wb') as f:
        f.write(scene.export(file_type='glb'))
    print(f'wrote {dst_path}')


if __name__ == '__main__':
    if sys.argv[1:] == ['--all']:
        root = Path(__file__).resolve().parent.parent
        records = []
        for output in sorted(root.glob('*/tier01/*_enemy.glb')):
            source = output.with_name(output.name.replace('_enemy.glb', '.glb'))
            recolor_glb(source, output)
            records.append({'source': str(source.relative_to(root)), 'enemy': str(output.relative_to(root)),
                            'sourceSha256': hashlib.sha256(source.read_bytes()).hexdigest(),
                            'enemySha256': hashlib.sha256(output.read_bytes()).hexdigest()})
        (root / '_enemy_tint/generated-manifest.json').write_text(json.dumps(records, indent=2) + '\n')
    else:
        recolor_glb(sys.argv[1], sys.argv[2])
