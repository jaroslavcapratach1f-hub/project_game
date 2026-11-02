# Academy / Research Center — shared levels 1–6

Military R&D laboratory for existing runtime id `research_center`. A stepped,
low-pitch olive roof and long steel-framed window bands sit over shared base
wooden walls. Rooflights, round extraction ducts, a grounded lattice measurement
aerial and open engine-test annex distinguish it from the HQ and factories.
The annex contains a modeled V-engine, connected radiator, analog test gauges
and a technical drawing tray. No shop porch, domestic hipped roof or chalkboard.

Existing 3×3 grid footprint and yaw 90 are preserved; authored +Z entrance faces
lower-right. No terrain slab is included. Research branches, costs, timers,
upgrades, unlocks and combat are unchanged. All lab equipment is static dressing.

- `research_center.glb`: embedded-texture runtime model with contact AO.
- `research_center_preview.png` / `research_center_turntable.webm`: actual model.
- `source/research_center.blend`: packed editable source.
- `source/build.py`, `academy.py`, `research_props.py`, `export.py`: rebuild recipe.
- `manifest.json`: footprint, current budget/hash and superseded-file record.

Run Blender --background --factory-startup --python
assets/buildings/research_center/levels01-06/source/build.py from the repository
root. Reuses HQ texture library and treasury geometry/material/AO/pivot helpers.
Physical mobile hardware, Safari and sustained FPS are not certified by desktop
Chrome viewport emulation.

Verification: actual WorldScene model load, visibility restoration and relocation
passed; four asset angles and portrait/landscape Chrome emulation inspected.
All 46 repository tests and production build pass (existing bundle-size advisory).
