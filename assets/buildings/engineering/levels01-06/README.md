# Factory — shared levels 1–6

Blender-authored construction-materials workshop for runtime id `engineering`.
Compact timber block with two glazed sawtooth roof bays, attached timber boiler
room and tapered brick chimney with individual courses and an open flue.
Low material stacks replace the front shed. A compact left-side truss jib crane
includes a manual winch, sheave, cable and hook. Material deliveries
and a handcart identify construction production. No open-front shed or large
single warehouse volume. In-game full-model height is 61% of HQ’s; main roof lower.

Industrial references (original model, not copied geometry/textures):
https://www.lombardiabeniculturali.it/architetture/schede/BS320-00037/
https://architectona.wordpress.com/category/realisations-en-province/ateliers-voirin-marinoni-a-montataire/

The existing 3×4 footprint, initial position and yaw 90 are preserved. Authored
front is +Z; the game rotation faces the loading entrance lower-right. No floor, terrain
slab or paving is included. Supports sit on the shared base grass.

- engineering.glb: current runtime model.
- engineering_preview.png / engineering_turntable.webm: actual-model media.
- source/engineering.blend: packed editable master.
- source/*.py: reproducible build; manifest.json: current dimensions/hash/budget.

From the repository root, rebuild with Blender --background --factory-startup
--python assets/buildings/engineering/levels01-06/source/build.py.
Reuses treasury geometry/material/AO/pivot helpers and HQ texture library.
Only current assets and required source are retained; no backup/model variants.

Production machinery is decorative static geometry. Existing production queues,
craft durations, recipes, building placement and battlefield combat are unchanged.

Verified actual WorldScene loading, visibility restoration and relocation, plus
portrait/landscape Chrome emulation. 43 tests and production build pass. Physical
mobile hardware, Safari and sustained FPS remain unverified.
