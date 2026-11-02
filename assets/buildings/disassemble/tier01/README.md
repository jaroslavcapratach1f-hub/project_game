# Disassemble Factory — Tier 1 production packet

The Disassemble Factory, Tier 1 (GDD 04 `disassemble` — the only building
that breaks troops down into Troop Components; also clears a troop's
Modify). Original design — no Warpath assets. Never had any real art
before this — it was the procedural placeholder (`BuildingPlaceholder`)
since the day it was added to `BuildingConfig.js`. Live 3D from the start,
same conversion pattern as parts_workshop/armory/research_center/
engineering/treasury/steelworks/crude_oil.

Source: the user's own `firtoz/trellis` run via the Replicate web
playground (prediction `d63jy1f0nhrnc0d0qxebxd2dtg`), handed over as a
prediction URL — same pattern as every other mesh swap this session.

## Files

| file | what |
|---|---|
| `disassemble_concept.jpeg` | the source concept: a claw crane grabbing scrap wheels/parts into a salvage bin (left), a lit tent hangar with a stripped-down vehicle chassis visible inside (centre), and a lean-to with tire stacks and crates (right) |
| `disassemble.glb` | the 3D mesh — `firtoz/trellis` from the concept above, hole-patched (`trimesh.repair.fill_holes()`) |
| `disassemble_turntable.mp4` | TRELLIS's own colour+normal turntable of the shipped mesh |

## Facing — first pass, UNVERIFIED

`rotationYDeg: 0` — not yet confirmed in-browser against the compound gate.
Same empirical "guess, then correct from the user's own turn-N-degrees
feedback" pattern as every other building's facing.

## Footprint

3×3 (`BaseGridConfig.FOOTPRINT.disassemble`) — seeded at `(cx:2.5, cy:6.5)`
in `BaseConfig.STARTING_LAYOUT` (free slot between HQ and barracks;
grid-parity checked against `BaseGridConfig.isGridAligned`).

## Known issues

- **Mesh had real holes**: `is_watertight: False` both before (45,179
  boundary edges) and after (40,910) a `trimesh.repair.fill_holes()` pass —
  same TRELLIS characteristic as every building so far (see
  `assets/buildings/hq/levels01-06/README.md`'s "this mesh had real holes"
  section). Patched pre-emptively before wiring in.
- No Blender cleanup pass.
- Facing unverified (see above).
