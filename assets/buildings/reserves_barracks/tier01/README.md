# Reserves Barracks — Tier 1 production packet

The Reserves Barracks, Tier 1 (GDD 04 `reserves_barracks` — separate from
Military Barracks, produces no troops; sets the Personnel pool cap and
recovery rate). Original design — no Warpath assets. Never had any real
art before this — it was the procedural placeholder (`BuildingPlaceholder`)
since the day it was added to `BuildingConfig.js`. Live 3D from the start,
same conversion pattern as officer_barracks/assembly/disassemble/
parts_workshop/armory/research_center/engineering/treasury/steelworks/
crude_oil.

Source: the user's own `firtoz/trellis` run via the Replicate web
playground (prediction `q0fmkez1vhrnc0d0qxwa5pdmzc`), handed over as a
prediction URL — same pattern as every other mesh swap this session.

## Files

| file | what |
|---|---|
| `reserves_barracks_concept.jpeg` | the source concept: a long billet tent with a row of shuttered windows along its side, lit entrance at the front corner with steps, sandbags, a barrel and a small awning |
| `reserves_barracks.glb` | the 3D mesh — `firtoz/trellis` from the concept above, hole-patched (`trimesh.repair.fill_holes()`) |
| `reserves_barracks_turntable.mp4` | TRELLIS's own colour+normal turntable of the shipped mesh |

## Facing — first pass, UNVERIFIED

`rotationYDeg: 0` — not yet confirmed in-browser against the compound gate.
Same empirical "guess, then correct from the user's own turn-N-degrees
feedback" pattern as every other building's facing.

## Footprint

2×2 (`BaseGridConfig.FOOTPRINT.reserves_barracks`) — seeded at
`(cx:-7, cy:8)` in `BaseConfig.STARTING_LAYOUT` (free slot below
crude_oil; grid-parity checked against `BaseGridConfig.isGridAligned`).

## Known issues

- **Mesh had real holes**: `is_watertight: False` both before (24,591
  boundary edges) and after (23,110) a `trimesh.repair.fill_holes()` pass —
  same TRELLIS characteristic as every building so far (see
  `assets/buildings/hq/levels01-06/README.md`'s "this mesh had real holes"
  section). Patched pre-emptively before wiring in.
- No Blender cleanup pass.
- Facing unverified (see above).
