# USA level-1 howitzer

Companion generation outputs: `howitzer_turntable.mp4` and
`howitzer_preview.png`, copied byte-for-byte from the same prediction.
These show the original generation color, before the runtime olive correction.

User-supplied TRELLIS prediction `rneq4tdzsxrnc0d0tknsm6c1yw`, imported
2026-09-24 from the downloaded `replicate-prediction-…-0.glb`.
The untouched download is retained in `../source/original.glb`.
Source SHA-256: `89d7d361d31348e465cfb272f3499b2162e7581dbb8b07014b20aa7aca963fed`.
Run `python3 assets/units/m12_gmc/source/prepare.py` to reproduce the runtime
GLB. Only the material base-color factor changes; mesh and texture bytes are
preserved. The factor maps the supplied olive median (85,87,60) to the current
Sherman hull olive median (80,72,39) in linear color space. This is a palette
match; lighting and surface normals still vary naturally between models.
`preserveMaterialColor` keeps this factor through runtime damage tint updates.

The wheeled howitzer supplies the tier01 appearance of the existing `m12_gmc`
USA howitzer roster entry; the gameplay name and statistics are retained.
Source is Y-up, muzzle toward -X, trails toward +X. `usa:howitzer` in
Unit3DConfig fits the complete X extent to 80 world pixels and rotates 180°
to the shared +X-forward convention. UnitMeshFactory grounds it uniformly.

DeployableView mounts the intact mesh through Unit3DBody and retains crew,
health/progress UI, muzzle flash, deployment, and wreck handling. The supplied
static mesh has no separate wheel, recoil, elevation, or folding animations.
The squad portrait uses this same model. No higher-level art switching exists.

Verified in the current world-map browser runtime: model and portrait load,
three movement directions finish within the existing 3-pixel arrival tolerance,
facing aligns with travel, floor is Y=0, setup/firing/packing up work.
No physical mobile-device performance test.

2026-09-26: living model colors are now preserved unconditionally by
Unit3DBody. Damage uses three smoke stages instead of material tints; the
previous preserveMaterialColor opt-in is retired. Blackening is death-only.
