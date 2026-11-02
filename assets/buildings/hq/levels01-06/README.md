# Headquarters — shared levels 1–6 design

Active asset: `timber_headquarters.glb`; embedded textures, ground-centred pivot.
Runtime yaw +90°, existing 7x8 footprint. Two-storey timber command house with
terrace wings, four decorative gun crews, checkpoints and dressed courtyard.
Placement, camera, combat and upgrade statistics are unchanged.

`timber_headquarters_preview.png` and `timber_headquarters_turntable.webm` show
the current mesh. `timber_headquarters_manifest.json` records its dimensions and
verification. This one art packet covers levels 1–6 without six mesh copies.
Higher distinct visual sets have not been authored.

Rebuild: `node assets/buildings/hq/levels01-06/source/refinement/refine.mjs`.
Keep `source/refinement/structure.glb`, the shared helpers and texture inputs:
the current refinement reads them. See its README and texture provenance.
Historical Python authoring code is retained as editable source; it is not the
current finishing command. Old command-tent model and its media were removed.
