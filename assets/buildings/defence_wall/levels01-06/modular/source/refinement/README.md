# Existing defence kit refinement
Run from repository root, using Node and the installed Three.js dependency:

```sh
node assets/buildings/defence_wall/levels01-06/modular/source/refinement/refine.mjs
node assets/buildings/defence_wall/levels01-06/modular/source/refinement/Trees.mjs
```

The immutable `original/` snapshots are inputs, never overwrite them with output.
Shared HQ GLB/geometry/lighting helpers are imported from its refinement folder.
Outputs replace the existing kit files; placement/gameplay keys remain unchanged.
This pipeline does not require Blender. Runtime material compensation is in
DefenceMaterialConfig/DefenceMaterials; terrain and roads are runtime geometry.
Pine triangles: A 23978, B 21612, C 14176; instanced but still require physical
mobile profiling. Preview images are visual evidence, not a mobile FPS benchmark.
