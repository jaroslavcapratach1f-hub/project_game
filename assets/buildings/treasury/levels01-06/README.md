# Treasury — shared levels 1–6

Editable Blender model matching `source/concept.png`: timber shell, open cashier
bay with modeled printing press and cash shelves, secure steel door, canvas
awning, sandbags and chests. User accepted the structure; the final requested
adjustment is the darker olive-charcoal roof. No Replicate geometry is retained.

- Runtime: `treasury.glb`, 2×2 cells, ground-centred pivot, +X front, yaw 0°.
- Source: `source/blender/treasury.blend` with packed textures and baked contact AO.
- Rebuild: Blender --background --factory-startup --python source/blender/build.py
  (run from the repository; shared HQ material packet is required).
- Modules separate shell, interior, props, materials, baking and export.
- `export.py` calibrates material factors to existing game lighting; use it for
  re-export after editing the .blend. Existing UV0 materials and UV1 AO preserved.
- `treasury_preview.png` and `treasury_turntable.webm` show the actual game mesh.
- Economy, levels, placement, camera and building footprint are unchanged.

Current WorldScene loading, drag restoration, LOD hide and relocation/restore
were checked. Portrait/landscape Chrome emulation checked; physical-device FPS
and Safari not tested. This is a game-scale interpretation of the concept,
not a pixel-identical recreation of the source illustration.
