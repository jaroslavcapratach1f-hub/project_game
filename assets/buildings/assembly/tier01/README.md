# Assembly Workshop — Tier 1 production packet

The Assembly Workshop, Tier 1 (GDD 04 `assembly` — assembles 4★+ troops
from Troop Parts, tracks Camp Prestige which drives the Nation Bonus).
Original design — no Warpath assets. Never had any real art before this —
it was the procedural placeholder (`BuildingPlaceholder`) since the day it
was added to `BuildingConfig.js`. Live 3D from the start, same conversion
pattern as disassemble/parts_workshop/armory/research_center/engineering/
treasury/steelworks/crude_oil.

Source: the user's own `firtoz/trellis` run via the Replicate web
playground (prediction `mght5v1mtsrnc0d0qxjtctwnp8`), handed over as a
prediction URL — same pattern as every other mesh swap this session.

## Files

| file | what |
|---|---|
| `assembly_concept.jpeg` | the source concept: a lit tent hangar with a crane hoist lowering a turret onto a tank chassis mid-assembly, flanked by two lean-to awnings of parts/crates, and a cable-spool winch rig out front |
| `assembly.glb` | the 3D mesh — `firtoz/trellis` from the concept above, hole-patched (`trimesh.repair.fill_holes()`) |
| `assembly_turntable.mp4` | TRELLIS's own colour+normal turntable of the shipped mesh |

## Facing

`rotationYDeg: 0` — the user tried "turn 90 degrees" then "turn back",
landing back on the original starting guess. Same empirical
guess-then-correct pattern as every other building's facing.

## Footprint

3×3 (`BaseGridConfig.FOOTPRINT.assembly`) — seeded at `(cx:-1.5, cy:8.5)`
in `BaseConfig.STARTING_LAYOUT` (free slot below HQ, between crude_oil and
disassemble; grid-parity checked against `BaseGridConfig.isGridAligned`).

## Known issues

- **Mesh had real holes**: `is_watertight: False` both before (30,754
  boundary edges) and after (28,891) a `trimesh.repair.fill_holes()` pass —
  same TRELLIS characteristic as every building so far (see
  `assets/buildings/hq/levels01-06/README.md`'s "this mesh had real holes"
  section). Patched pre-emptively before wiring in.
- No Blender cleanup pass.
