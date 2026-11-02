# Legion steel-blue variants

Regenerate all registered blue variants from the current player-model GLBs:

```sh
python3 assets/units/_enemy_tint/recolor_enemy.py --all
node --test tests/enemy-assets.test.mjs
```

The source GLBs remain unchanged. The generated siblings retain source
geometry, UVs, hull/turret separation and pivots; only materials/textures
change. Enemy registry entries inherit the corresponding source transforms.
Tank hunters keep their existing fixed-gun behavior.

Palette: hue .62, saturation multiplier .80 (formerly 1.15), value multiplier
1.10. This produces a slightly lighter, less saturated steel blue with
surface shading and panel detail retained. Shared materials are recolored
only once. All 11 current siblings were rebuilt, including infantry and
artillery, to keep the bot army consistent.

`generated-manifest.json` records source/output SHA-256 values. The regression
test covers every registered enemy URL and fails when a source changes
without its bot variant being rebuilt. Regenerate after changing any source
split, cap color, or geometry; never copy a newly computed pivot onto an old
blue split. The 2026-09-26 Pershing bug was exactly such a stale derivative:
its bot turret retained old hull fragments while the registry used the new
pivot. Rebuilding applies the corrected connected-component split.

Verification: all 11 source/output variants have identical vertex/index/UV
arrays. In current WorldScene, light/medium/heavy aim to 90 degrees while
hulls stay fixed, then complete move orders with turrets recentered. Reviewed
blue paint and cut surfaces. No new physical-mobile test in this session.
