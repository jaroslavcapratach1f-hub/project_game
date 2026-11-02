# Parts Workshop — Tier 1 production packet

The Parts Workshop, Tier 1 (GDD 04 `parts_workshop` — consumes Components,
troop level-up/modify/equipment crafting, all Parts/Blueprints/Materials
storage). Original design — no Warpath assets. Never had any real art
before this — it was the procedural placeholder (`BuildingPlaceholder`)
since the day it was added to `BuildingConfig.js`. Live 3D from the start,
same conversion pattern as armory/research_center/engineering/treasury/
steelworks/crude_oil.

Source: the user's own `firtoz/trellis` run via the Replicate web
playground (prediction `r65sx261sxrne0d0qt092v51qg`), handed over as a
prediction URL — same pattern as every other mesh swap this session.

## Files

| file | what |
|---|---|
| `parts_workshop_concept.jpeg` | the source concept: a lit tent workshop with a visible interior workbench, flanked by a tarped tire/wheel stockpile (left) and a gantry crane + hoist hook over stacked engine parts and fuel drums (right) |
| `parts_workshop.glb` | the 3D mesh — `firtoz/trellis` from the concept above, hole-patched (`trimesh.repair.fill_holes()`) |
| `parts_workshop_turntable.mp4` | TRELLIS's own colour+normal turntable of the shipped mesh |

## Facing — first pass, UNVERIFIED

`rotationYDeg: 0` — not yet confirmed in-browser against the compound gate.
Same empirical "guess, then correct from the user's own turn-N-degrees
feedback" pattern as every other building's facing.

## Footprint

3×3 (`BaseGridConfig.FOOTPRINT.parts_workshop`) — seeded at
`(cx:-4.5, cy:3.5)` in `BaseConfig.STARTING_LAYOUT` (free slot between
engineering, crude_oil and HQ; grid-parity checked against
`BaseGridConfig.isGridAligned`).

## Known issues

- **Mesh had real holes**: `is_watertight: False` both before (33,871
  boundary edges) and after (31,775) a `trimesh.repair.fill_holes()` pass —
  same TRELLIS characteristic as every building so far (see
  `assets/buildings/hq/levels01-06/README.md`'s "this mesh had real holes"
  section). Patched pre-emptively before wiring in.
- No Blender cleanup pass.
- Facing unverified (see above).
