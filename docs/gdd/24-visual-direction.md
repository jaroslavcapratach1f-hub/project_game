# Visual Direction — the Art Bible

The reference target is **Warpath's fidelity tier**: a 3/4 isometric base of
distinct, detailed, *animated*, **vividly colored** buildings — not a
desaturated realism diorama (see CLAUDE.md "VISUAL STYLE" / "BUILDING
VISUAL GUARDRAILS", which this file expands into the actual production
spec); a continuous zoom where the HQ shrinks in place as the rest of the
compound reveals around it (see LOD below); UI that reads as authored
military hardware, not text. Every asset in Blitzmire is **original work**
— we recreate the *design language and behaviour*, never a Warpath model,
texture, or icon.

Blitzmire renders in **PixiJS 8 (2D)** for the world map and HUD, with a
live **Three.js** layer composited into the same scene graph for base
buildings (`src/engine/Base3DLayer.js` + `Base3DConfig.js`, S54). Every
building is a real 3D model (GLB, modeled/lit at the locked camera below),
rendered live — **not** a pre-rendered isometric sprite baked to an atlas.
The two renderers stay in lockstep because `Base3DConfig.js`'s camera
(30° pitch, 45° azimuth, `1/√2` scale) is analytically derived to match
the exact same projection `utils/SquareGrid.js` encodes as flat 2D math —
a 1-grid-cell step in either produces the identical on-screen delta. This
supersedes the "pre-render to sprite atlases" approach this file used to
describe as the target: that pipeline still applies to any building not
yet converted (see STATUS below), but every building's end state is a
live 3D model, not a sprite atlas.

**STATUS (2026-09-23):** the live registry now contains
<!-- 2026-09-24 addition: USA level-1 howitzer now uses an intact live GLB
through DeployableView/Unit3DBody. Its material palette matches the existing
Sherman olive, reproduced by assets/units/m12_gmc/source/prepare.py. -->
13 tier-01 building types, including all five previously sprite-based types.
The base also loads 3D ground, wall segments, a gate, and attack towers.
USA medium (Sherman), light (M24 Chaffee), and heavy (M26 Pershing) tanks have separate hull/turret
models through `Unit3DLayer` / `Unit3DBody`, and USA infantry uses a separate
torso plus independently pivoted legs for every soldier through
`SoldierBody3D`. World terrain and other unit types remain 2D; the direction in CLAUDE.md extends live 3D to the
whole world. The registry currently uses fixed tier-01 GLBs; the tier ladder
below is a design specification, not implemented model swapping. Atlas/state
sections below are legacy guidance pending reconciliation with live 3D.

The original muted assets were rejected; retain the saturated shared kit and
cross-building tier consistency below. Existing guidance calls for explicit
design approval per building before starting the next, not batch generation.
Asset packets document manual Replicate TRELLIS runs and offline cleanup;
a repeatable description-to-integrated-asset pipeline is not yet present.
This status is based on source/build inspection, not fresh visual approval.

---

## THE LOCKED FRAME (identical across every asset)

- **Projection** — 3/4 view. Camera pitched **30° from horizontal**, weak
  perspective (~35 mm-equiv, near-orthographic). **Fixed — the camera never
  rotates.** Baked into every sprite; the engine only places and y-sorts them.
- **Light rig** — one warm **key from the upper-left** (~35° azimuth, ~45°
  elevation, ~5000 K) reading as **bright, clean daylight — not moody or
  gritty**, cool ambient fill at ~25 % key, **one** soft contact shadow cast
  down-right. Matches CLAUDE.md's lighting spec and is never re-lit per
  building.
- **Palette** — CLAUDE.md's *saturated*-military set is law (revised
  2026-09-13 — desaturated is explicitly not the goal). Greens `#4B6B1F
  #5C7A29 #6F8F35`, earth `#6B4423 #8B5A2B #A67C4E`, metal `#55595E #767C82
  #9AA0A6`, mandatory accent kit — hazard `#FFC72C` + `#1A1A1A`, tarp/canvas
  `#2E6E8E`, insignia white `#F2F2ED` — combat/warning `#FF6B35 #FF4500
  #FFD700`, UI gold `#C5A55A #D4AF37 #8B7332`. A building is identified by
  *form, material, AND at least one accent-color pop* — never by a
  monochrome material study.
- **Setting** — concept/reference renders sit in a grounded, colorful
  environment (grass, dirt road, foliage), not a flat grey studio
  background. Context sells the color as much as the palette does.
- **Ground contact** — anchor = **bottom-centre** of the footprint, sitting on
  the cell centre. Baked shadow included in the sprite; no separate shadow
  sprite for buildings.
- **Footprint & scale** — a building occupies whole hex build-cells
  (`BASE.grid.cellHexSize`). 1-cell sprite ≈ 140 px wide; height budget up to
  ~2.4× the footprint width (HQ is the tallest). Silhouette must stay inside
  its cells at ground level — no overhang onto neighbours. Height *within*
  this budget grows with level **tier** — see VISUAL TIER SYSTEM below.

---

## MATERIAL VOCABULARY (WWII industrial, saturated)

Poured/board-formed concrete · rusted corrugated steel · **true saturated**
olive-drab painted sheet metal (not grey-green mud) · sandbags & timber
earthworks · riveted plate · glass + instrument panels · brass/copper
accents · tar paper & asphalt · **plus the mandatory accent kit**:
hazard-striped edges, canvas/tarp panels, graphic insignia. Weathering is a
**light accent, not the dominant read** — a hint of rust bleed at fasteners,
a little edge-chipping, light mud at the base — enough to feel used, never
enough to drain the color or read as neglected. "Battle-worn" ≠ "colorless."

---

## Approved current packet range (2026-10-04)

HQ, military barracks and the complete timber defence kit share their current
appearance across **levels 1–6**, explicitly confirmed by the user. The
levels01-06 directories contain one reusable asset set each. This supersedes
the every-three-level remodel proposal below for these current assets. It does
not change upgrade statistics or claim later art exists. German Maus art starts
at five stars and must look like basic WWII equipment, not an advanced upgrade.

## VISUAL TIER SYSTEM (future design proposal, except approved range above)

The old improvised/established/reinforced/fortified 4-band split (levels
≤4/≤9/≤19/∞, one sprite set per band) is **superseded**. Buildings now get a
full visual remodel on a fixed **every-3-levels** cadence — a **tier** — and,
critically, **every building shares the same tier ladder**, so the whole
compound reads as one coherent power level at any zoom instead of 19
buildings each aging on their own arbitrary schedule.

### The ladder

`tier = ceil(level / 3)` — 12 tiers across headquarters' 1–35 range, grouped
into the same 4 eras as before, now an even 3 tiers per era:

| Era | Tiers | Levels | Read |
|---|---|---|---|
| **Improvised** | 1–3 | 1–9 | tents, timber, exposed pipework, minimal footprint |
| **Established** | 4–6 | 10–18 | concrete shell, proper roof, first heavy machinery |
| **Reinforced** | 7–9 | 19–27 | steel frame, blast walls, banners/insignia, active output |
| **Fortified** | 10–12 | 28–35 | multi-tier, AA nests, floodlights, dense machinery, faction crest |

A building capped below 35 (`docs/gdd/04-buildings.md`) simply stops
climbing — it never claims a tier past its own max level:

| Building(s) | Max level | Tiers reached |
|---|---|---|
| `black_market` | 15 | 1–5 |
| `airbase` (recon post) | 20 | 1–7 |
| `armory`, `alliance_hall`, `officer_barracks` | 25 | 1–9 |
| `disassemble` | 30 | 1–10 |
| everything else | 35 (`HQ.maxLevel`) | 1–12 |

### The cross-building kit  (the actual guardrail)

At a given tier, **every** building — regardless of type — shows the
matching entry below on top of its own per-building brief. This is what
makes a level-10 Treasury and a level-10 Barracks read as the same
fortification tier at a glance, instead of two buildings that happen to
share a number:

| Tier | Levels | Shared tell added at this tier |
|---|---|---|
| 1 | 1–3 | bare improvised construction: exposed timber frame or dug earthwork, tarp roofing, unlit, bare dirt pad, one hand-daubed insignia-white numeral |
| 2 | 4–6 | + sandbag apron at the base, + first supply crate/barrel cluster, + a taut tarp-blue canvas patch |
| 3 | 7–9 | + partial corrugated-steel cladding over the timber frame, + barbed wire, + first light fixture (single bulb/lantern), + one hazard yellow/black stripe |
| **4** | 10–12 | **era: Established begins** — full concrete/steel shell replaces improvised framing, + faction unit-crest stencil (a bigger insignia moment), + a proper mounted working light |
| 5 | 13–15 | + a second crate/barrel cluster (density up), + a painted tarp/canvas awning over an entry, + the building's signature moving element reads even at rest |
| 6 | 16–18 | + a perimeter fence/rail segment, + the hazard-stripe kit expands to a second edge, + weathering reads as "maintained," not "raw" |
| **7** | 19–21 | **era: Reinforced begins** — exposed steel-frame reinforcement (I-beams/gussets), + a blast-wall or revetment segment at the exposed face, + a banner/pennant pole, + a full painted faction crest (not just a stencil) |
| 8 | 22–24 | + the active-output tell runs always-on at idle (steam/smoke/spark loop, not just during `working`), + a second working light, + the full accent kit is present somewhere on the building |
| 9 | 25–27 | + a raised platform/catwalk or second story, + a searchlight/spotlight mount, + insignia gains a rank chevron |
| **10** | 28–30 | **era: Fortified begins** — visible multi-tier massing (a second/third structural tier), + an AA-nest or sandbagged gun-nest silhouette on the roofline, + floodlight(s) replace the single spotlight |
| 11 | 31–33 | + dense machinery cladding crowds the silhouette (pipes/tanks/gantries), + a full command banner, + a UI-gold trim accent on plating (a prestige cue) |
| 12 | 34–35 | full fortified kit: floodlights active, AA/searchlight elements fully dressed, faction crest at maximum size, densest machinery/prop kit, "veteran" wear — scarred but powerful, never neglected |

### Scale growth

Height within the footprint budget above grows with **tier**, not raw
level — roughly 55 % of a building's max height budget at tier 1, climbing
to 100 % at tier 12, so growth reads as steady across the whole ladder
rather than 4 sudden jumps. The exact per-tier curve is an implementation
detail for `BuildingArtConfig.js` — **DRAFT, not built yet**: the live
`LEVEL_BANDS` / `PLH.bandScale` / `bandOf()` in that file still reflect the
old 4-band system and need a tier-table rewrite before any new art is wired
in. Not done in this pass.

### Per-building brief + tier kit = the actual prompt

Generating art at a given tier means combining, every time: this tier's
shared kit entry above **+** the building's own signature brief (below)
**+** the CLAUDE.md palette/accent kit **+** the locked frame. None of the
three alone is enough — a brief without the tier kit drifts buildings out of
sync with each other; the tier kit without the brief makes every building
look the same.

---

## STATE GRAMMAR

| State | Read |
|---|---|
| `idle` | ambient life only — a wisp of smoke, one lit window, a slow-turning part |
| `working` | full machinery animation, brighter FX, visible output (crates, sparks, steam) |
| `upgrading` | scaffold + crane + dust + a progress collar; the tier sprite swaps on completion |
| `offline` | unpowered — desaturated, FX off, parts stopped (future: power system) |
| `damaged` | smoke column, fire licks, a collapsed section (future: base HP) |

`idle`↔`working` is driven by whether the building is producing. Economy
buildings default `working`; the rest `idle` until acted on. `offline` is
the one state where the palette intentionally desaturates — everywhere else,
color stays saturated per CLAUDE.md.

---

## ANIMATION SPEC

- **idle loop** — 24–48 frames @ 15 fps, seamless.
- **working loop** — separate clip, same cadence; the "real action in there":
  moving cranes, turning dishes, pumping arms, drilling crews.
- **FX layers rendered separately and composited additively** in-engine
  (smoke, glow, sparks, steam) so intensity/tint can be driven by state.
- **one-shots** — upgrade-complete, produce-complete: 18–36 frames, played once.
- Until an atlas exists a building runs a **procedural placeholder** (faux-3D
  block + one animated signature element + `BuildingFx` smoke/glow) so it is
  never a static rectangle.

---

## LIVE 3D UNIT ARTICULATION

A turreted tank's hull includes its deck, fenders and hull-mounted stowage.
Only the turret assembly and gun rotate about the turret ring. Deliver the
ring pivot in the hull's raw source frame and the turret centered on that
pivot; close newly exposed surfaces so turning does not reveal a hollow hull.
Normalize each model's nose to +X before applying runtime heading. Hull and
gun directions must project along simulated travel and aim at every bearing.
Both USA tank packets contain reproducible split and verification scripts;
their source -Z noses use a -90-degree Y correction. Each model has its own
inspected ring pivot and fixed-stowage boundary. New Chaffee seam closures
use a small olive texture and the source metal finish to match live lighting. Existing simulation turn
rates and independent turret slew remain authoritative. Static tracks and
lack of separate 3D barrel recoil remain current limitations.

## ASSET DELIVERY

- PNG frame sequences → a Pixi **hash atlas** (`.json` + page PNGs), trimmed,
  premultiplied alpha, pages ≤ 2048².
- Naming: `bld_<id>__t<tier, 2-digit>__<state>__####.png`
  (e.g. `bld_engineering__t07__working__0007.png`) — **tier number, not
  band name** (supersedes the old `bld_<id>__<band>__<state>__####.png`
  contract).
- `BuildingArtConfig.BUILDING_ART[id]` declares which tiers/states/fps/anchor
  ship; `BuildingSprite` loads what's present and falls back to placeholder for
  the rest. Adding art is data-only — no code change.

---

## PER-BUILDING BRIEFS  (signature "something is happening in there")

Same template for all 19 (`BuildingConfig.BUILDINGS`); the 8 seeded first.
**Always combine with the current tier's shared kit above** — a brief is a
per-building delta on top of the tier kit, never a substitute for it.

- **headquarters** — existing 7×8 command compound. Normally scaled two-storey
  timber command house borders the rear plot edge; two attached habitable
  wings have shallow terrace roofs, access doors and rounded sandbag guard
  positions. One front window per wing. Two sandbag checkpoints guard the
  open front approach, with crates, drums and olive cases. No detached
  buildings, freestanding map board, flag or star. BASE COMMAND / HQ signs
  sit above windows. Use current timber wall/tower materials and daylight.
- **defence_wall** — perimeter, not a cell: reinforced concrete curtain with
  guard towers, firing slits, sandbag aprons, an AT-gun emplacement per span.
  *Working (base-fury):* searchlights sweep, gun crews man the slits.
- **attack_towers** — 1×1 ×N: lattice or concrete towers with a traversing
  autocannon/AA mount. *Working:* barrels track, muzzle flash + shell casings
  on fire; *idle:* slow scan.
- **treasury** — 1×1: a walled strongroom, barbed wire, a loading dock.
  *Working:* an armoured truck reverses to the dock, crates hauled in, vault
  strobe.
- **steelworks** — 2×1: blast furnace + rolling shed, slag heap, gantry.
  *Working:* furnace glow pulses, ladle pours (ember shower), overhead crane
  tracks ingots, black smoke.
- **crude_oil** — 1×1: derrick + storage tanks + a gas flare stack.
  *Working:* nodding pumpjack, flare flicker, a tanker fills.
- **engineering** — 2×1: fabrication hall, parts racks, a sliding roof crane.
  *Working:* gantry crane slides on rails, weld-spark bursts, slag smoke, a
  finished part rolls out on a trolley.
- **barracks** (Dynamic — militaryBarracks / tankFactory / artilleryFactory):
  drill yard + billets + vehicle sheds. *Working:* a squad drills in the yard
  / a tank rolls out of the shed / a gun is towed clear — the variant sets
  which. Roller doors cycle; tint per `BARRACKS_VARIANTS`.

Remaining (armory, parts_workshop, disassemble, assembly, research_center,
airbase→**recon post** [ground only], hospital, alliance_hall,
reserves_barracks, officer_barracks, black_market) follow the same template
— each gets a brief when its render is scheduled.

---

## MENU CHROME  (one kit, reused for every building)

- Panel = a **9-slice riveted-plate frame**, UI-gold trim, stencilled
  military type, subtle inner vignette. Same frame for Info / Produce /
  Upgrade / Research etc. — only the content differs.
- The building context action is a **hex radial**: Info · Upgrade · Produce
  (or Research / Heal / Train per type), gold hex buttons, back-chevron.
- **Resources are art**, not glyphs: a money crate, a steel billet, an oil
  drum, a gold bar — each a small rendered icon + value pill in the top bar.
- Timers show a **filling collar/arc**, not just text.

---

## BASE TERRITORY / AIRLIFT / BUILD  (2D overlay, engine-agnostic)

- **Buildable area** — an amber diagonal-hatch hex fill over valid ground.
- **Placement validity** — green hex fill = ok, red = blocked/overlap.
- **Move base** — the compound collapses to a single-hex **mobile-HQ marker**
  (a command truck) with four green directional drag-arrows.
- **World-map** — max zoom-out: flat top-down, our base a gold pin, other
  bases neutral pins, resource nodes as small crates, roads, a radar minimap.
- The *interaction grammar* matches the reference; the art is ours.

---

## LOD  (the "base reacts" feel)

Continuous, camera-zoom-driven (`BaseSite._syncLod`), no threshold snap — and
critically, **the compound's footprint never rescales**: it is drawn at one
true, fixed world size always (`BaseConfig.PLATFORM_SPAN_PX`), the exact same
plot the Airlift flow claims. Only the camera's own zoom makes it bigger on
screen, same as terrain or a unit — the base "does not expand or shrink";
only how much of it is revealed changes (Base Zoom reference video):

1. **far** — only the Headquarters is visible, oversized (`HqView`,
   `lod.hqFarScale`), standing in for the whole base, on bare ground inside a
   dotted `TerritoryRing` outlining the same fixed plot the walls will
   occupy.
2. **shrink + reveal** — as you zoom in across `lod.buildingBand`: the HQ
   itself shrinks in place from `hqFarScale` down to its true, in-compound
   size (1) — it is the one building that rescales, because it is standing in
   for the footprint before the footprint reveals itself; the walls solidify
   early (`wallRevealFrac`) as the territory ring fades out (`ringFadeFrac`);
   the other buildings stagger-fade in one after another across the rest of
   the band (`buildingStart`.."+buildingSpread"), each spring-popping once on
   first reveal, then FX spin up.
3. **near** — full compound at true scale, every building revealed. Reverse
   smoothly on zoom-out — nothing here is one-way.

Below the whole band (world-map zoom), the base is a gold pin like any other
(unbuilt tier, `WORLDMAP.plot` / `MarkerDraw` — only neighbour bases use this
today, since the player's own HQ art now covers that range itself).

---

## HARD CONSTRAINTS (echo CLAUDE.md — assets must never imply otherwise)

Ground war only — **no aircraft, no naval, no scout planes** (the recon
building is a ground radar post). One persistent shared map — **no menu
backdrop, no loading arena, no separate battlefield**. **No pause screen.**
The base is a place on the map. **Vivid, saturated color is required** — a
flat, desaturated render fails review regardless of how accurate it is
otherwise (CLAUDE.md BUILDING VISUAL GUARDRAILS).

## Ground-contact trails (implemented 2026-09-26)
Vehicles leave two separated contact bands aligned with their current
running gear, including during turns. GroundTrailConfig controls gauge,
width and longitudinal contact offset. Live 3D vehicles use the same
isometric projection as their model; existing 2D placeholders use world
heading directly. Tank tread widths increase by class; wheeled units use
narrow tire bands; infantry leaves individual alternating footprints.
Trails share the bounded decal pool with scorch/craters and age out by
oldest-first recycling. No gameplay visibility or terrain costs change.
Pershing's turret-skirt cut is closed on both sides, in the approved olive
palette, with its deck props fixed to the hull. Its original generation
image/video remain references for the unsplit source.

## Troop damage presentation (implemented 2026-09-26)
Living troops retain their original paint/material colors throughout combat.
Vehicles show damage with rising smoke: light at 25% health lost (75% HP
remaining), denser at 50% lost, heaviest at 75% lost. Smoke follows the hull
and decreases/stops as health recovers. Infantry retain their colors without
vehicle smoke. Only destruction blackens the model and triggers the existing
explosion animation plus one slight 180ms screen shake. Ordinary hits do not
shake. Existing wreck fade is retained. Smoke uses the shared bounded particle
pool, preserving capacity for short explosion effects.

## Turret cleanup and mobile orientation verification (2026-09-26)
Medium-tank closure surfaces must remain olive at every turret bearing.
Sherman's linear material factors now match this; its source silhouette and
pivot are retained. Heavy Pershing's connected turret/gun is isolated from
all disconnected upper deck props, which remain fixed. Light art is unchanged.
On rotation, both 3D composite layers recreate their canvas texture source;
models, smoke and health overlays stay aligned in portrait and landscape.
Resource fields wrap at narrow viewport widths. Verified with Chrome touch
and viewport emulation at 390x844 / 844x390; actual device/Safari validation
and mobile FPS measurements remain outstanding.

## Bot appearance (updated 2026-09-26)
Enemy-team bot units use steel-blue derivatives of the current established
meshes, with softer saturation and a slight brightness lift. Team identity
is baked into the blue asset textures; it is not a damage tint. Every source
split/pivot change must be followed by regenerating its blue derivatives.
Bot light, medium and heavy turrets use the same independent hull/turret
structure; fixed-gun tank hunters retain their class behavior.

## Building selection reference (2026-09-26)
The user's Building Menu.jpeg governs all building selection UI: silver
bevelled point-up hexagons, black info/binoculars icons, amber upgrade
arrow, white condensed bold labels with dark outlines, a soft dark
translucent crescent and a white level/name plate. Four filled white move
arrows sit at plot-edge midpoints, following the isometric grid axes.
The shared implementation uses native Pixi vectors and a selected-menu
blur filter; no new raster asset or building-model change is required.

## Approved L1 perimeter reference and uniform corners (2026-09-27)
The supplied LVL-1 Defence Wall.jpeg supersedes the older concrete-wall
brief for Level 1. Use six-course weathered timber with thick posts, olive
sandbags, open timber watchtowers with pitched roofs, inside conifers,
shallow outside trenches with traverses/bridges, sparse crates/barrels,
steel hedgehogs and wooden utility poles with sagging cables. All four
corners share the same chamfer and paired towers. Extra grid space is
approved for the defensive belt; existing interior buildings do not move.
Outer barrier sequence: X-shaped steel obstacle, wire, one intermediate
post, wire, next X obstacle. No duplicated posts at repeated mesh joins.
Use the original camera and restrained earth/olive materials, with clear
foreground and no added decorative collision. Runtime uses modelled GLBs;
art refinement remains possible module by module. This does not claim
pixel-identical reproduction or measured mobile hardware performance.


### Trench refinement approved 2026-09-27
Keep the reference's modeled bank and timber details. Use continuous open
corner passages, eight bank-cut side entrances and ten plank crossings
(half the previous twenty). Instanced revetments retain individual timber
courses, stakes, worn coping and rounded irregular soil. Smooth generic
strips are not acceptable final bank art. Earth underlay only closes seams.
Use richer brown timber and stronger olive/green accents across the kit,
without changing global lighting. The external belt may extend four cells;
construction-grid and existing compound collision rules remain unchanged.
This is visual access geometry; troop trench-cover AI is not implemented.


### Tower access and vegetation update — 2026-09-27
All tower ladder entrances face the interior. The user now explicitly requests
pines on BOTH sides of the wall, superseding inside-only dressing. Use distinct
narrow, broad and irregular crowns with varied height, width, yaw and uneven
spacing. Exterior trees occupy the wall/trench belt with clear access routes;
the distant foreground remains open. Seeded placement stays stable on rebuild.


### Vegetation density refinement — 2026-09-29
Reduce interior count and instance dimensions by 25% from the preceding layout;
round count to whole trees (HQ3: 19 -> 14). Double exterior count (5 -> 10 at HQ3),
retaining entrance/gate/tower clearances. Use textured overlapping thin needle
sprays with irregular edges and varied silhouettes, not large triangular fans.
`source/pine_foliage.py` supplies the shared foliage modeling and packed texture.

### HQ visual refinement — 2026-10-02
The existing rear-edge timber HQ and terrace wings retain their footprint and
roles. Rounded fabric bags, infantry-derived static crews, detailed mounted
guns, embedded weathered wood PBR maps and baked contact shading improve
presentation. The front checkpoints move inward; an open canvas dispatch
shelter with telephone desk and a duckboard approach occupy the forecourt.
Keep circulation open and props at field-infantry scale (1.78m reference).
No additional building role, firing AI, pathfinding obstacle or camera change.
The current asset rebuild uses Node/Three; no external modelling application.

The yard dressing extends around the whole HQ: a canvas-covered supply pallet,
grouped cases, front receiving crates, side/rear service stores and short low
sandbag runs sit on a worn compound surface. The middle approach remains clear.
The roof aerial is a straight span fixed to the final mast attachments.

HQ finishing correction: ground wear is now faint outside the footpaths, preserving
grass across the plot. Front checkpoint floorboards are trimmed within the
sandbag footprint. The supply tarp has a continuous top and hanging skirts
with clearance over all crate battens, preventing wood from protruding.

### Approved ground presentation (2026-10-03)
Grass inside the base and around its defence structures uses one continuous,
healthier green treatment. Wear is concentrated in broad, irregular gate-origin
roads, with narrower pedestrian wear; avoid two clean tank-tread lines. Roads are
permanent terrain decoration independent of building locations, including future
player relocation. Do not regenerate them from current building positions.
Preserve rounded trench banks, recessed brown floors, open entrances and cleared
gate approach. Fuller irregular pine crowns retain varied size and placement.

### Barracks reference art
Use the user's reference composition with the approved timber palette: one compact
hut and a broad four-X dirt yard. No tower. Yard screen-left, building screen-right.
Infantry should read as an enlarged, aligned sixteen-person squad, not scattered
miniature groups. Reuse established troop art and preserve consistent placement
through building relocation and LOD. The previous barracks asset is retained.

## Approved treasury levels 1–6
The timber treasury follows its retained source/concept.png, with an open printing
bay, visible press and shelves, secure door and canvas awning. User accepted the
Blender structure; only the roof was subsequently changed to darker olive-charcoal.
Existing 2×2 footprint and gameplay camera remain. The current packed Blender
source and GLB live in assets/buildings/treasury/levels01-06/.

## Steelworks levels 1–6
User-approved steelworks_preview.png is the preserved concept reference.
The Blender model follows its connected timber workshop, masonry furnace/chimney,
pouring ladle, hot casting molds, coal lean-to and blacksmith station composition.
HQ/treasury materials and a dark olive roof keep the shared base palette.
The model remains 2×2 with lower-right frontage. Production/economy is unchanged.
User correction: omit the concept’s paving/terrain slab; show shared base grass.
Retain only structural furnace/ladle bases and grounded equipment supports.
The preview is concept art; steelworks_turntable.webm shows the actual runtime model.

## Oil pumping plant levels 1–6
Metal pumpjack remains the dominant silhouette: curved horsehead, walking beam,
counterweight drive and A-frame, with connected tanks and a timber service shed.
HQ timber/olive materials match the base. No flooring or terrain tile is included;
narrow supports sit directly on shared base grass, as requested by the user.
Current model media and packed Blender source live in crude_oil/levels01-06.

## Factory levels 1–6
The user rejected both the open shed and the bulky enclosed warehouse. Current
art uses a compact timber block with two glazed sawtooth roof bays, an attached
timber boiler room and tapered brick chimney. Timber matches the rest of the base.
The front shed is removed in favor of low material stacks. A small left-side
riveted truss jib crane has a manual winch, pulley, cable and forged hook. Separate lower
volumes and industrial roof profiles replace the single large rectangular mass.
The building body must stay smaller/lower than HQ, while the 3×4 plot is unchanged.
Logs, finished boards/bricks and a handcart provide restrained production context.
No floor/paving. Closed loading doors and industrial windows keep the factory enclosed.
Reference research: Lombardy heritage inventory, Campione del Garda cotton mill
(https://www.lombardiabeniculturali.it/architetture/schede/BS320-00037/) and historic
Ateliers Voirin-Marinoni workshop photographs (Institut Auguste Perret).
These guide the industrial vocabulary; the game model is original, not a replica.

## Armory levels 1–6 — approved 2026-10-11
Timber military assembly warehouse, oval corrugated olive roof and open sliding
doors. A detailed tank hull and suspended turret communicate unfinished assembly;
side rocket/ammunition cases leave the central rollout lane clear. Existing 3×3
plot and camera retained, no terrain slab. Troop-acquisition systems are unchanged.
Tank texture multiplier is calibrated independently from untextured closure
plates so the tank stays olive and the exposed surfaces do not turn white.

## Academy / Research Center levels 1–6
Military research facility, not a shop or domestic cottage: stepped low industrial
roofs, shared timber walls, continuous steel-framed lab windows, framed rooflights,
round ventilation duct and lattice measurement aerial. The open test annex has
a tank-engine development stand, radiator, connected gauges and blueprints.
No storefront porch or outdoor chalkboard. Existing 3×3 plot and yaw 90 retained;
no ground slab or new research mechanics. Static art uses the shared HQ material kit.

## Officers’ Barracks levels 1–6
The officer-acquisition building should be a recognizable daily destination,
visually distinct from a simple troop barracks. Current art uses an octagonal
recruitment hall, brass rank/laurel crest, formal double entrance, enclosed
personnel/dossier wing and covered map-table briefing veranda. Two textured
sentries stand at rest with both feet grounded beside the entrance. Shared HQ timber/olive kit, human-scale details,
no flags/stars/national emblem, no separate terrain slab. Existing 3×3 plot;
authored +Z entrance/yaw 90 faces lower-right. Equipment and guards are static
visuals and do not add combat units or modify officer acquisition/progression.
