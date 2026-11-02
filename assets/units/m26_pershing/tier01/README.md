# USA level-1 M26 Pershing (heavy tank)

Companion generation outputs: `m26_pershing_turntable.mp4` (TRELLIS's
combined color+normal render) and `m26_pershing_concept.jpeg` (the supplied
concept art), copied byte-for-byte from the same prediction. These show the
original generation color, before the runtime olive correction below.

User-supplied TRELLIS prediction `03agb20grdrne0d0v8rb2c2snr`, imported
2026-09-26. The untouched download is retained in `../source/original.glb`.
Source SHA-256: `6b5f3ad52a2bed5967486417f5f7d2932e5465a6560c0cafdd78e6ff1a10f2ea`.
Run `python3 assets/units/m26_pershing/source/prepare.py` to reproduce the
runtime GLB. Only the material base-color factor changes; mesh and texture
bytes are preserved. The factor maps each texture's own flat-panel paint
color (median of every low-variance 32x32 atlas block — robust against the
large near-black UV-gap area every TRELLIS atlas has, unlike a naive
whole-image median, which read far too dark and then over-brightened the
render) from the supplied Pershing atlas (76,69,41) to the current Sherman
hull atlas (86,82,40) in linear color space. Verified against the actual
in-game render: both tanks' hull-panel pixels now sample to the same olive
(~74,92,35). This is a palette match; lighting and surface normals still
vary naturally between models. `preserveMaterialColor` keeps this factor
through runtime damage tint updates.

Runtime uses `m26_pershing_hull.glb` plus `m26_pershing_turret.glb`.
The color-prepared intact `m26_pershing.glb` remains the input to
`python3 assets/units/m26_pershing/source/split_turret.py` (numpy, scipy,
trimesh and Pillow). The latest user request supersedes the earlier intact
model instruction. No source or companion image/video was removed.

The split follows the turret skirt at source Y=0.055. Upper geometry is
classified by connected components after welding a disposable topology copy;
original UV geometry is used for export. Only the largest connected upper
component (turret/mantlet/barrel) rotates. All nine other upper components
(1,424 faces: rear log, complete fender stowage, lamps and small deck props)
remain on the hull. This replaces the earlier spatial mask, which cut some
props in half. Pivot is now (0.000706329534, 0.055, -0.106018742084). Both exposed cut
surfaces have olive closure plates; original textured surfaces and UVs are
retained. Source surface-area conservation error is ~2.2e-16; this does not
claim the original generated mesh is globally watertight. The exact raw
ring pivot and bounds are recorded in `../source/split-report.json`.
Material factors are restored after export so the approved textured paint
is preserved; closure colors use linear RGB.

Source is Y-up, muzzle +Z. `usa:heavyTank` fits the separated hull Z extent
to 115 world pixels and rotates 90 degrees to +X forward. UnitMeshFactory
applies that same transform to the pivot; Unit3DBody follows the existing
independent TankTurret simulation. The portrait uses the same assembly.
GroundTrailConfig supplies two projected tread contacts: 48-pixel gauge,
11-pixel band width, 41-pixel rear offset in model-fit coordinates.

Verified 2026-09-26 in the actual WorldScene: independent turret sweep
through 360 degrees leaves the hull matrix fixed; inspected forward and
sideways turret poses; completed up/down/left movement orders with paired
trails and curved turn marks. Production build, lint (one unrelated
AttackTowers3D warning), and all 10 tests pass. No physical mobile-device
performance test.

2026-09-26: living model colors are now preserved unconditionally by
Unit3DBody. Damage uses three smoke stages instead of material tints; the
previous preserveMaterialColor opt-in is retired. Blackening is death-only.

Refinement verification: inspected 0/90/180/270-degree turret poses in the
current game; hull matrices stay fixed and rotating textured geometry is one
connected component. Also checked the corrected model in portrait/landscape
Chrome mobile emulation. This is not a physical-device performance test.
