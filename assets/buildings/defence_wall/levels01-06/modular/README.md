# Defence kit — shared levels 1–6

`manifest.json` indexes every active GLB, with current hashes and triangle counts.
This is one shared levels 1–6 appearance: no duplicate meshes per building level.
Wall/corner masks, watchtowers, gate, trenches/bridges, wire/supports, hedgehogs,
wooden poles, pines, sandbags and field props all belong to this kit.

Preview: `perimeter_preview.png`. Rotating video: `perimeter_turntable.webm`.
`reference.jpeg` is the user's visual reference. Inspect `/dev/defence/` and the
actual WorldScene; the art review alone is not runtime integration proof.

## Rebuild

```sh
node assets/buildings/defence_wall/levels01-06/modular/source/refinement/refine.mjs
node assets/buildings/defence_wall/levels01-06/modular/source/refinement/Trees.mjs
python3 scripts/catalog-assets.py
```

Keep `source/refinement/original/*.glb`: these immutable geometry inputs are
required by the Node/Three finishing commands, not obsolete runtime copies.
Shared HQ geometry/lighting helpers and texture inputs are also required.
Historical Python files retain editable authoring source; they are not the
current finishing command and must not overwrite the refined kit inadvertently.
The current pipeline needs no external 3D editor.

## Geometry and gameplay contract

- Y-up; one authored unit equals one base cell. Runtime scales with CELL_PX
  (currently 22 projected pixels), preserving the existing grid and camera.
- Ground-centred pivots; straight sockets at local Z +/-0.5, diagonal sockets
  at +/-0.5 on both grid axes. Shared posts hide connections.
- Timber wall modules, chamfered corners and two towers per corner use existing
  placement data. The complete 42-module catalogue includes reusable connection
  pieces even when a particular piece is absent from the current perimeter.
- Wire spans use separate middle supports and three-beam hedgehogs. Gate apron
  and gaps follow the existing procedural layout; terrain and cables are runtime
  geometry rather than missing GLBs.
- Continuous trenches use recessed brown floors, rounded earth banks and
  passable corner joins. Ramps and crossings belong to the existing trench owner.
  Older modular trench shapes remain reusable resolver assets, not extra scene
  instances. Source geometry, material refinements and instancing are shared.
- Trees/props remain decorative; no new navigation obstacles or gameplay changes.
  Existing whole-base collision and closed gate behavior are preserved.
- Level selection is independent of layout. Gameplay tiers 1 and 2 share this
  levels 1–6 kit. Later unauthored visual tiers currently fall back to it.

## Verification and limits

Moved asset URLs load in the actual WorldScene; wall and tower instance groups
are populated. Portrait and landscape Chrome emulation were inspected. Current
images/video were refreshed after cleanup. No physical-mobile/Safari test or
FPS guarantee. The refined kit remains geometry-heavy and needs device profiling.
The game has no whole-base persistence backend or player wall editor; this asset
organization does not claim to implement either.
