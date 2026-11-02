# Steelworks — shared levels 1–6

Blender-authored timber workshop with masonry furnace/chimney, tilted pouring
ladle, glowing ingot molds, coal lean-to and anvil/hammer station. Uses shared
HQ/treasury materials, baked contact shading and a dark olive roof.
Existing 2×2 footprint, steel income/storage and interactions are unchanged.
No ground slab or paving: the shared base grass shows through. Furnace/ladle
structural bases remain part of their equipment; supports extend to the ground.
The approved concept retains its original floor, superseded by this user correction.
Local +X front / runtime yaw 0 faces lower-right. Initial plot: (0,-7).
Smelting is decorative geometry/emissive material, not a simulated process.

- steelworks.glb: current runtime model.
- steelworks_preview.png: user-approved concept, preserved unchanged.
- steelworks_turntable.webm: current model, full rotation.
- source/steelworks.blend: packed editable Blender master.
- source/*.py: modular rebuild source; manifest.json: dimensions/hash/mesh budget.

From the repository root, run Blender --background --factory-startup --python
assets/buildings/steelworks/levels01-06/source/build.py.
Reuses treasury/levels01-06/source/blender geometry, materials, AO and pivot
helpers plus the HQ material library. These shared inputs are required.
No duplicate concepts, Blender backups or Python caches are retained here.

Verified in current WorldScene: loading, visibility restoration and relocation;
portrait/landscape Chrome emulation. Physical devices, Safari and FPS untested.
The concept is a visual reference; the modeled asset is not pixel-identical.
