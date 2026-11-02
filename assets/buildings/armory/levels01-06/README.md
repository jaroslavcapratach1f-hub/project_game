# Armory — shared levels 1–6

Current troop-acquisition building: a timber military assembly warehouse with
an oval corrugated olive roof, fully open sliding doors and a clear central
rollout lane. A detailed Sherman hull and suspended turret illustrate unfinished
assembly; the chain hoist, workbenches and ammunition/rocket crates are static
visual props. They do not manufacture units or change the acquisition system.

Existing 3×3 plot, yaw 90, +Z authored entrance and lower-right frontage preserved.
No terrain slab; footings, equipment and stores sit on the game's shared grass.
Timber/metal materials and contact-AO tooling reuse the HQ/treasury pipeline.
Tank geometry comes from the existing M4 Sherman hull/turret source packets,
with a reduced static hull mesh; the deployed troop assets remain unchanged.

- `armory.glb`: current runtime mesh, embedded textures/contact AO.
- `armory_preview.png`, `armory_turntable.webm`: actual current model.
- `source/armory.blend`: packed editable source.
- `source/build.py`, `warehouse.py`, `assembly.py`, `export.py`: rebuild recipe.
- `manifest.json`: dimensions, hash and current mesh/media details.

Rebuild from the repository root with Blender --background --factory-startup
--python assets/buildings/armory/levels01-06/source/build.py.
Visual levels 1–6 share this model; future upgrade art remains separate work.

Verification: actual WorldScene model load, visibility restoration and relocation
passed; four asset angles and portrait/landscape Chrome emulation inspected.
All 46 repository tests and production build pass (existing bundle-size advisory).
