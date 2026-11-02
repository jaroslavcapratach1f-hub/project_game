# Unit hero photos (TroopDetailScreen)

Each `<unit>/tier01/<name>_hero.png` is a background-removed, downsized copy of
that unit's own `_concept.jpeg` (or `_preview.png`) render, used by
`TroopDetailScreen`'s big hero image (`src/config/UnitHeroConfig.js`) —
composited over the unit's faction background photo at runtime.

## Regenerating

```
python3 assets/units/_hero/bg_remove.py <src.jpeg> <dst_hero.png> <bg_r,bg_g,bg_b> <tol> <feather>
```

- White-studio-background concept renders (m4_sherman, m18_hellcat,
  m26_pershing, us_infantry/soldier): `255,255,255 15 35` — clean cutout,
  no visible fringe.
- Black-background renders (m12_gmc's `howitzer_preview.png`): `0,0,0 15 35`
  — leaves a faint dark rim (the render's own edge shading is close to true
  black) but is still the real asset, per the player's own explicit call
  ("use the image already in files, not a 3D model") — shipped as-is
  rather than falling back to the 3D snapshot.
- `m24_chaffee` has no concept art at all — only the GLB + turntable video
  (`m24_chaffee_turntable.mp4`, a side-by-side colour/normal-map compare).
  Extracted one frame with OpenCV (no ffmpeg available in this env —
  `cv2.VideoCapture`), cropped to the LEFT half (the colour render; the
  right half is the normal-map pass), then background-removed the same
  `0,0,0 15 35` way. Lower native res (512x512) than the concept-art units
  since it's a video frame, not a dedicated render, but still the real
  asset rather than the live 3D snapshot.

After generating, downsize to a 700px long edge (mobile payload — see the
S61 lesson in docs/SESSION_LOG.md):

```
python3 -c "from PIL import Image; im=Image.open('X.png'); s=700/max(im.size); im.resize([round(d*s) for d in im.size]).save('X.png', optimize=True)"
```
