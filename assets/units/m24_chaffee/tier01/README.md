# M24 Chaffee — Tier 1 USA light tank

User-supplied TRELLIS model, prediction `bet54x8vhxrna0d0rknr55szqg`.
The downloaded source GLB is preserved byte-for-byte in `../source/original.glb`;
`provenance.json` records its SHA-256 and original filename. No regeneration,
recoloring of existing surfaces, or replacement of the supplied silhouette.

## Files and wiring

- `m24_chaffee_hull.glb`: hull, deck, tracks, rear/side stowage and deck closure.
- `m24_chaffee_turret.glb`: turret, gun/mantlet and underside closure.
- `m24_chaffee_turntable.mp4`: supplied generation preview, before articulation.
- `../source/`: original model, split/verification scripts, pivot report and provenance.

`Unit3DConfig['usa:lightTank']` supplies these parts to the existing
`EntityView → Unit3DBody → Unit3DLayer` path. Existing `M24Chaffee`, stats,
50°/s hull turn and 44°/s turret slew are unchanged. Hull length is 39.1 world
pixels (85% of Sherman's 46), matching the light/medium class size ratio.
The Chaffee occupies the first of the five starting squad slots; the displaced
Springfield rifle unit remains on the bench. Sherman remains in slot three.

## Split and coordinates

Inspected the model's side/front profiles and supplied turntable. Cut at the
actual turret skirt, source Y=0.075. Rear geometry beyond Z=0.27 remains fixed
with the hull, including storage whose top rises above the cut. UVs are
interpolated at the cut; original surface area and assembled bounds are kept.
New deck and underside closures prevent an exposed hole during rotation.
Their small olive sRGB texture and metallic material match the surrounding
source finish under the game's light rig, avoiding a bright diffuse seam.

Ring pivot in the hull's RAW source frame:
`(0.001376673983, 0.075, 0.080184950065)`.
The turret export is centered on that ring. Source nose is -Z, so registry
`rotationYDeg: -90` normalizes it to shared +X forward. The already-corrected
`headingToSceneY` maps both hull heading and absolute gun aim to scene space;
the turret gets aim minus hull rotation. Only the turret/gun rotates.

Rebuild/check from the project root (numpy, scipy, trimesh and Pillow):

```sh
python3 assets/units/m24_chaffee/source/split_turret.py
python3 assets/units/m24_chaffee/source/verify_split.py
node --test tests/unit3d-heading.test.mjs
```

If changing the split, synchronize the registry pivot with `split-report.json`.
No runtime mesh cutting occurs.

## Verification — 2026-09-21

Loaded in the actual Chrome world-map scene and inspected forward and
quarter-turned poses. Twelve turret headings preserved hull position/matrix
and aligned the gun to aim. Three ORDER_MOVE paths completed through the live
hex pathfinder; forward/travel dot stayed >=0.9999999999999997. One impassable
destination was skipped. Also drove with the full world loop active.
Mesh checks pass (hull/stowage membership, UVs, closures, original surface area
and bounds); 72-heading/288 hull-aim regression checks pass. Build passes;
lint: zero errors, one existing unrelated AttackTowers3D warning.

No physical-phone test. Tracks remain static; there is no separate 3D barrel
recoil, matching the current Sherman renderer. Both parts carry the original
texture data (about 10.54 MB total); source and preview are not runtime imports.
