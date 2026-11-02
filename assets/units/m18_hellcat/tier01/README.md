# USA level-1 M18 Hellcat (tank hunter)

Companion generation outputs: `m18_hellcat_turntable.mp4` (TRELLIS's
combined color+normal render) and `m18_hellcat_concept.jpeg` (the supplied
concept art), copied byte-for-byte from the same prediction. These show the
original generation color, before the runtime olive correction below.

User-supplied TRELLIS prediction `kf7wpvfcpsrnc0d0vnmrqa6br8`, imported
2026-09-26. The untouched download is retained in `../source/original.glb`.
Source SHA-256: `990b5cbba6fc9035e5d08f719b72d2ff5f02fdde6424716cb01a4eabc3343a9a`.
Run `python3 assets/units/m18_hellcat/source/prepare.py` to reproduce the
runtime GLB. Only the material base-color factor changes; mesh and texture
bytes are preserved. The factor maps this texture's own flat-panel paint
color (median of every low-variance 32x32 atlas block, same method used for
`m26_pershing`) — (71,71,37) — to the current Sherman hull atlas's own
(86,82,40) in linear color space. This is a palette match; lighting and
surface normals still vary naturally between models. `preserveMaterialColor`
keeps this factor through runtime damage tint updates.

The single fused mesh (`geometry_0`, one rigid casemate hull + fixed gun
piece, not watertight — normal for an unsplit TRELLIS export) supplies the
tier01 appearance of the existing `m18_hellcat` USA tank-hunter roster
entry; the gameplay name and statistics are retained. Source is Y-up,
muzzle toward +Z; `usa:tankHunter` in Unit3DConfig fits the hull's own Z
extent to 101 world px and rotates 90° to the shared +X-forward convention.
UnitMeshFactory grounds it uniformly.

**No turret split, no independent turret tracking — this class's gun IS a
fixed casemate mount**, not a simplification: `unitRoles.js`'s own
`noTurret: true` (already driving `M18Hellcat.js`'s simulation, same as
`Jagdpanther`/`SU100`) has the whole hull aim at the target; there is no
turret to separate. `UnitMeshFactory.assembleUnitMesh` already hands back a
harmless empty turret pivot whenever `turretUrl` is omitted (the same path
`usa:howitzer` uses), so no shared code changed. EntityView/Unit3DBody mount
it exactly like every other live-3D unit — health bar, reload countdown,
damage tint, wreck fade, muzzle flash (from `e.rotation`, the existing
`e.noTurret` branch) all work unmodified.

Verified in the current world-map browser runtime: model loads with no
console errors, SquadBar portrait renders the same mesh, facing reads
correctly when marched, hull color matches the Sherman's. No physical
mobile-device performance test.
