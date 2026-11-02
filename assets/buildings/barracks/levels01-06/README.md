# Military barracks — shared levels 1–6 design

Active model: `reference_barracks.glb` (24,250 triangles). Compact timber hut,
four X-marked assembly bays, sandbags and stores. No lookout tower. Existing
4x4 footprint; yaw 0 puts the yard on the left and building on the right.
One shared packet covers levels 1–6; no duplicated level meshes.

Rebuild: `node assets/buildings/barracks/levels01-06/source/build.mjs`.
Uses the shared HQ textures/helpers and active defence props. Replaced generated
barracks and its old source/concept/video were removed.

BarracksYard uses the selected production class: 16 infantry in four ranks,
4 light/medium/tank hunter/howitzer, 2 heavy, or 1 German grey Maus super-heavy.
AT/launcher art is still missing; those markers stay empty. Troops inherit
building relocation and LOD. No new combat actors or gameplay reserve costs.

Preview: `reference_barracks_infantry.png`; video: `reference_barracks_turntable.webm`.
Class preview images are visual verification of the current troop layouts.
Manifest contains the layout contract; `dev/barracks/` reviews the same runtime
model and yard. Physical mobile performance is not benchmarked.

Infantry spacing: 0.76-cell columns / 0.56-cell rows. Display scale follows the
current CELL_PX relative to the authored 42-pixel reference; battlefield unit
scale is unaffected. Every available class stays inside the yard without overlap.
