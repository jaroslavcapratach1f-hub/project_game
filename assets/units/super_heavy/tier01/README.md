# German Maus — starting 5-star super-heavy

Runtime: `maus_hull.glb` and `maus_turret.glb`, registered only for
`germany:superHeavyTank`. Museum-referenced Maus silhouette, neutral German grey,
basic WWII equipment. Five stars is the class's lowest rating, not an advanced
upgrade. Hull length is 160 world pixels versus the heavy tank's 115.

- `maus_preview.png`: actual assembled game mesh under gameplay lighting.
- `maus_turntable.webm`: full rotation followed by an independent turret sweep.
- `manifest.json`: dimensions, pivots, files and provenance.
- `source/original.glb`: immutable TRELLIS output required to repeat the split.
- `source/concept.png`: generated reference used for this specific mesh.
- `source/generation.json`: compact reproducible generation settings.
- `source/prepare_maus.py`: UV-preserving split, matte paint and closed cut faces.
- `source/ART_DIRECTION.md`: research links and the basic five-star brief.

Rebuild: `python3 assets/units/super_heavy/tier01/source/prepare_maus.py`.
Requires numpy, trimesh and scipy. No external 3D editor. The raw original is a
rebuild input, not a duplicate runtime model. Rejected blockout and heavy-shaped
iterations were deleted at the user's request. No full combined runtime GLB is
needed: the shared UnitMeshFactory assembles the two pieces.

Current WorldScene checks: independent turret, heading changes, German-only
registration and larger dimensions than Pershing pass. Source has 13,212 faces.
This is generated game art; unseen details are reconstructed, not a surveyed
historical replica. Physical mobile performance has not been benchmarked.
