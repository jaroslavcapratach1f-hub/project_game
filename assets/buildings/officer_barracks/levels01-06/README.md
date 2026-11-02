# Officers' Barracks — shared levels 1–6

Officer recruitment and briefing hall for existing id `officer_barracks`.
An octagonal central hall/standing-seam roof, original brass rank-and-laurel crest,
double reception doors and broad entrance steps distinguish it from ordinary
barracks. The low enclosed dossier wing and sheltered briefing veranda carry
personnel files, a detailed map table and chairs. Two textured infantry-derived
sentries flank the entrance at a 1.78 m reference height, with continuously posed
standing legs and both boot soles grounded; these are static guards,
not acquired/assigned officers and not additional combat units.

Shared HQ timber/olive materials and treasury build/bake tools preserve the base
palette. No flags, national emblems, stars or separate terrain slab are included.
The existing 3×3 grid plot is retained. Authored +Z entrance uses yaw 90 to face
lower-right through the unchanged game camera. Officer recruitment, roster,
assignment, bonuses, skills and training retain their existing implementation;
this model does not add a daily reward or alter acquisition odds.

- `officer_barracks.glb`: active runtime mesh with embedded textures/contact AO.
- `officer_barracks_preview.png`, `officer_barracks_turntable.webm`: actual model.
- `source/officer_barracks.blend`: packed editable master.
- `source/build.py`, `officer_hall.py`, `officer_details.py`, `sentry_pose.py`, `export.py`: rebuild.
- `manifest.json`: footprint, hash/budget, source dependencies and replaced files.

Rebuild from the repository root with Blender --background --factory-startup
--python assets/buildings/officer_barracks/levels01-06/source/build.py.
The source uses HQ textures and the existing infantry soldier GLB; deployed troop
files are unchanged. Future officer-building upgrades should replace this packet's
visual set without changing roster/assignment logic.

Verified actual WorldScene load, visibility/drag restoration and relocation, plus
portrait/landscape Chrome emulation and four asset angles. All 47 tests and the
production build pass; physical devices, Safari and sustained FPS remain untested.
