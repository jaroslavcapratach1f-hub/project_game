# Oil pumping plant — shared levels 1–6

Metal pumpjack following the existing curved-head design, with walking beam,
A-frame, counterweights, gearbox, motor, ladder, wellhead and connected oil tanks.
A small timber service shed uses the shared HQ timber and olive roof materials.
No terrain slab or flooring: the base grass remains visible. Only narrow steel
skids, mounting plates and timber shed sills contact the ground.

- crude_oil.glb: current runtime model, grounded pivot, local +X frontage.
- crude_oil_preview.png / crude_oil_turntable.webm: actual model media.
- source/crude_oil.blend: packed editable source.
- source/*.py: reproducible Blender build; manifest.json: current hash/budget.

Rebuild from the repository root with:
Blender --background --factory-startup --python
assets/buildings/crude_oil/levels01-06/source/build.py

Uses existing treasury geometry/material/AO/pivot helpers and HQ texture library.
These dependencies are retained; duplicate images and Blender backups are not.
Existing 2×2 grid footprint, oil economy and building interactions are unchanged.
The pump linkage is modeled in a static pose; no pumping animation is claimed.
