# M4 Sherman — Tier 1 unit packet

USA medium tank, registered as `UNIT_3D['usa:mediumTank']` and deployed by
the current world-map roster. The approved model and original texture are
preserved. Source: user's `firtoz/trellis` playground prediction
`5r6b60cezdrne0d0qygastksyw`. USA green / Germany gray / Russia red remains
the project's faction paint convention.

## Delivered parts

- `m4_sherman_hull.glb`: running gear, lower AND upper hull, deck, rear
  stowage, and a closure plate beneath the turret.
- `m4_sherman_turret.glb`: turret skirt, turret, mantlet and gun only,
  centered on the turret ring; underside closed for independent rotation.
- `m4_sherman_concept.jpeg`: original concept.
- `m4_sherman_turntable.mp4`: original generated model's preview, before
  the articulation repair; not proof of the current runtime animation.

## Reproducible repair

The previous cut at source Y=0.015 put much of the upper hull in the
rotating part. Its pivot config also mixed source coordinates with a
floor-relative offset, lifting and displacing the turret. Both are fixed.

`../source/reassembled.glb` restores the original geometry from the prior
hull/turret files. The shared seam's 521 vertices recover the old turret
translation as approximately `(-0.0070934, 0.015, 0.22171453)`; the model
was not regenerated. `../source/split_turret.py` cuts at the actual skirt
(Y=0.075), retains rear stowage (Z>0.30) on the hull, interpolates UVs at
the cut, and adds separate olive deck/underside closure meshes. Separate
materials preserve the original texture without repacking its atlas.

Run from the repository root (Python with numpy, scipy and trimesh):

```sh
python3 assets/units/m4_sherman/source/split_turret.py
python3 assets/units/m4_sherman/source/verify_split.py
node --test tests/unit3d-heading.test.mjs
```

`split-report.json` records the exported ring pivot and mesh counts.
If the split changes, update `Unit3DConfig.turretPivotLocal` from that
report. The pivot is in the source hull's raw coordinates, before any
runtime rotation, scale or floor/center offset. The turret GLB's own
origin is already translated onto that pivot.

## Facing and articulation

Source hull/gun front is -Z. `rotationYDeg: -90` normalizes it to +X.
`Unit3DLayer.headingToSceneY` maps world headings through the same
projection as position, then uses `atan2(-z, x)` because Three's positive
Y rotation turns +X toward -Z. The old sign and +90-degree baseline
caused the sideways appearance. Hull heading follows the existing motor;
turret relative heading is transformed absolute aim minus hull heading.
No movement, pathfinding, targeting, or turn-rate rules were changed.

## Verification (2026-09-20)

- Real `Game → WorldScene → EntityView → Unit3DBody` loaded in Chrome.
- Viewed aligned and quarter-turned turret poses: deck, stowage and hull
  stay fixed; no exposed hole under the turret.
- Full-circle 12-heading turret sweep through `BaseTank.update`: hull
  world matrix and position unchanged; gun direction matches aim.
- Three actual ORDER_MOVE paths completed; moving samples' rendered hull
  forward matched travel (dot >= 0.9999999999999998). A fourth requested
  destination was impassable and excluded. Also exercised movement with
  the full world loop running in real time.
- Regression tests cover 72 world headings and 288 hull/aim combinations.
- Mesh verification checks fixed/rotating bounds, UVs, closure meshes,
  original surface area and reassembled bounds.
- Production build passes; lint has zero errors and one unrelated existing
  AttackTowers3D magic-number warning. No physical-phone test.

## Remaining limitations

This is still a reconstructed AI mesh, not an authored mechanical model.
The new skirt closures do not repair every pre-existing mesh defect.
Tracks are static geometry; gun recoil is still not a separate 3D barrel
animation. Hull and turret still carry duplicate source texture data.

2026-09-26 closure-color correction: the deck and turret underside use
linear-RGB olive factors [0.093, 0.084, 0.021, 1] rather than sRGB byte
values interpreted as linear factors (which appeared pale/white in game).
Regenerated both GLBs with source/split_turret.py; original textured surfaces,
pivot and separation are unchanged. Inspected exposed surfaces with turret
at 90/180/270 degrees, including portrait/landscape mobile emulation.
The light-tank asset packet was not modified.
