# ARCHITECTURE.md — Blitzmire

## Status: In Development — single-scene world map, Warpath-parity target
## Last Updated: 2026-10-11
## Current Phase
Barracks Detail Screen (`BarracksDetailScreen.js` + `BarracksHeroPreview`/
`BarracksOfficerSlots`/`BarracksUnitGrid`/`BarracksUnitStats`) and Research Center
screen (`ResearchScreen.js` + `ResearchHubView`/`ResearchTreeView`/
`ResearchNodeDetail`, `ResearchManager.js`) are both newly wired this session —
both full-screen `OVERLAY` building screens matching the Warpath reference
screenshots the player supplied. Research Center: the hex-menu's "Research"
action opens a hex hub (5 real tracks + 1 inert placeholder, all one uniform
size) themed per track, each hex tapping into a real connected node-graph tree
(`src/config/research/`, ~57 real nodes) with a tap-to-open node detail popup
(icon, plain-language effect description, real Power gain, cost, time, and a
real spend/timer/complete research flow via `TimedJob`). `ResearchManager` is
in-memory only (resets on reload), same honest pattern as every other
non-settings stateful system in this codebase. Only Development + Military are
open right now (`RESEARCH_HUB.openCategories`); Doctrine/Defense/Support are
fully wired but shown "Coming Soon" until opened up — a one-line config flip.
This screen carries its OWN live Money/Steel/Oil readout (`ResearchResourceBar`)
rather than the global HUD TopBar showing through a gap — present on every
page, and laid out two ways depending on device orientation (the player's own
reference screenshots, one per orientation): portrait gets a 1-2-1-2 hex
column with its own full-width resource strip above the back/title row;
landscape gets a 2-row honeycomb hex grid (even/odd index alternating top/
bottom row, tessellated) with resources folded into the SAME single header
row as back/title, right-aligned — `ResearchScreen._reflow` picks per
`w > h`, same convention `screenSidePad`/`navEdgePad` already use elsewhere.

Officers’ Barracks (`officer_barracks`) uses the timber recruitment hall in
assets/buildings/officer_barracks/levels01-06. Its octagonal roof and brass
rank/laurel crest identify the central reception; a dossier wing and covered
briefing veranda flank it. Two static textured sentries use existing infantry art with continuously reposed
standing legs and grounded boots; deployed infantry assets are unchanged.
Shared levels 1–6, existing 3×3 plot, +Z entrance/yaw 90 faces lower-right, no terrain slab.
Roster, recruitment, assignment, skills and training systems are unchanged.

Academy (`research_center`) uses the timber R&D laboratory in
assets/buildings/research_center/levels01-06. Stepped low roofs, industrial window
bands, framed rooflights, round extraction duct and a lattice test aerial frame
an open engine-test bay with radiator, gauges and blueprints. Shared levels 1–6,
existing 3×3 footprint/yaw 90, no terrain slab; research logic is unchanged.

Armory (`armory`) uses the approved timber warehouse in
assets/buildings/armory/levels01-06: oval corrugated roof, open sliding doors,
static tank assembly with suspended turret, side rocket/ammunition crates and
clear rollout lane. Shared levels 1–6, existing 3×3 plot/yaw 90. The detailed
Sherman-derived prop is independent of deployed troop art. No terrain slab.
Acquisition, coupons, pity and faction pools retain their existing behavior.

Factory (`engineering`) uses a Blender-authored construction-materials workshop
in assets/buildings/engineering/levels01-06. Shared levels 1–6 appearance retains
the existing 3×4 footprint and yaw 90; authored +Z frontage faces lower-right.
Compact timber production block with two glazed sawtooth roof bays, attached
timber boiler room and a tapered brick chimney with modeled courses/open flue.
The front shed is replaced by low material stacks; a small left-side riveted
truss jib crane has a manual winch, sheave, cable and hook. The main body occupies substantially less of the existing 3×4 plot;
full-model in-game height is 61% of HQ’s (30.11 vs 49.26 scene units).
No terrain slab/paving. Uses HQ textures/treasury helpers, embedded weathered
brick texture, calibrated UVs and baked contact AO.
Packed source, actual-model preview and turntable accompany the runtime mesh.
Machinery is static decoration; production queues, recipes and unlocks are unchanged.

Crude oil uses the Blender-authored metal pumpjack plant in
assets/buildings/crude_oil/levels01-06, shared levels 1–6, 2×2 footprint, yaw 0.
Walking beam, curved horsehead, counterweight linkage, gearbox/motor, wellhead,
piped storage tanks and timber service shed are decorative static geometry.
There is no terrain slab/floor: narrow machinery skids and shed sills sit on
existing base grass. HQ materials and treasury build helpers are reused.
Oil income/storage, placement and combat are unchanged.

Steelworks uses the Blender-authored approved-concept interpretation in
assets/buildings/steelworks/levels01-06: timber workshop, masonry furnace/chimney,
tilted pouring ladle, emissive red-hot ingot molds and blacksmith station.
Levels 1–6 share the existing 2×2 footprint, local +X/yaw 0 lower-right frontage,
and initial plot (0,-7). The GLB embeds materials/contact AO; no terrain slab or apron paving is included.
Packed Blender source reuses treasury helpers and HQ materials. Root preview is
the approved concept; turntable shows the current model. Smelting is decorative;
steel income/storage, interactions, camera, grid and combat are unchanged.

The treasury uses the Blender-authored timber/open-cashier model in
`assets/buildings/treasury/levels01-06/`, shared across levels 1–6. It retains
the 2×2 footprint and uses a +X entrance/yaw 0 in Building3DConfig. The packed
Blender source and modular rebuild scripts produce the GLB with shared HQ PBR
textures and baked contact AO. Money generation/storage and placement are unchanged.

The current HQ is a guarded two-storey timber command house with two
attached shallow-roof terrace wings, one front window per wing, upper access
doors and curved sandbag positions. Its rear roof edge defines the back of
its existing 7x8 plot; two front checkpoints and supplies form the forecourt.
There are no detached HQ buildings, flags, stars or courtyard map board.
Building3DConfig loads timber_headquarters.glb through the shared building
fit/selection/ghost/LOD pipeline at +90 degrees. No gameplay roles changed.
The current refinement rebuilds through source/refinement/refine.mjs in Node/Three
from an immutable structural snapshot. Embedded photographed wood PBR maps,
rounded fabric bags, four textured infantry-derived guards, perforated-jacket
fixed guns and baked contact shading replace the primitive presentation.
The front posts sit closer to the house; a canvas dispatch shelter, field
telephone desk and duckboards dress the approach. Guard scale matches field
infantry using a 1.78m reference. These remain decorative, without combat AI.
Historical Python sources are not the current final-asset rebuild entry.
See HEADQUARTERS_REDESIGN_PLAN for the contract and validation limits.


The yard dressing extends around the whole HQ: a canvas-covered supply pallet,
grouped cases, front receiving crates, side/rear service stores and short low
sandbag runs sit on a worn compound surface. The middle approach remains clear.
The roof aerial is a straight span fixed to the final mast attachments.

UnitsMenu and TroopDetailScreen share TroopMenuTheme / TroopMenuDraw olive
surfaces, brass tabs, live troop portraits and current-level nameplates.
ScreenSafeArea reads browser CSS insets; screenSidePad protects both sides
with a 44px landscape fallback or maximum inset +14px. TroopUpgradeDock
keeps the action outside the scrolling statistics, above the detail tabs.
The existing troopLevels map remains session-local and changes displayed
stats only; costs, persistence and combat stat integration remain unbuilt.
Promote / Modify / Parts remain placeholder content. Roster levels refresh
when returning from details. The four deleted root inspection PNGs have no
runtime references and are not required game assets.

The Level 1 perimeter uses a modelled modular timber kit with eight towers,
varied interior/exterior pine variants, sandbags, connected trench traverses, ten bridges,
eight side entrances, props,
poles/cables and a connected steel/barbed-wire barrier. All four corners
use identical chamfers and paired towers. DefenceFootprint supplies the
expanded polygon to visual placement and WorldScene collision; the existing
construction grid is enclosed and the muster gate anchor moves with it.
DefenceLayout/Connectivity support grid edits, automatic socket selection
and versioned JSON restore; there is no whole-base persistence backend.
DefenceInstances batches cached GLBs, retaining shared source resources and
applying material-specific richer timber/olive/earth tints. DefenceTrenches
owns the open path and shared miter joins; DefenceTrenchDressing instances
modeled timber/earth revetments including descending entrance banks.
DefenceTrenchMesh adds only continuous soil floors/seams under the GLBs.
No decorative trench navigation/cover behavior is added.
DefenceBarrier places exactly one intermediate post per hedgehog pair,
deduplicates corner supports and attaches wire ends at the support height.
The current wall/tower owners preserve selection, upgrades, pin LOD and
neighbour origins. Only L1 art exists; later tiers fall back explicitly.
Asset source/manifest/preview/video live in defence_wall/levels01-06/modular;
/dev/defence/ is the current-owner comparison page. 26 tests/build and lint pass;
portrait/landscape Chrome emulation checked, no physical-device FPS claim.
DefenceTrees deterministically varies spacing, height, crown width and rotation
across three separately shaped pine GLBs on both sides of the wall, clearing
entrances/towers/gate. Tower rotations point their local -Z ladder side inward.
DefenceTreeDensity retains 75% of the prior interior count, scales retained trees
by .75 in all axes and doubles exterior trees with existing access clearances.
Pine GLBs use textured, overlapping thin needle sprays with irregular outlines.
Current HQ3: 14 interior / 10 exterior trees. 28 tests/build/lint pass.

All buildings share the reference-style selection menu: a soft-edged dark
crescent, white level/full-name plate, silver point-up hex Info / Upgrade /
View buttons with outlined labels, and white block relocation arrows at
plot-edge midpoints. Menu/arrow sizes and vector artwork live in
BuildingMenuConfig; rendering stays in the existing WORLD_UI components.
Arrows render behind the glass. Walls/towers retain their non-relocatable
rules. Barracks View exposes the existing Change Production action; other
View buttons expose current building details. No new building systems are
implied. Upgrade costs, placement validation and combat are unchanged.

Legion bot variants now use the current corrected hull/turret source meshes
and inherited pivots, with lighter, less saturated steel-blue textures.
All 11 enemy GLBs were regenerated by `_enemy_tint/recolor_enemy.py --all`;
source geometry/UV identity was checked. A generated SHA manifest plus
`tests/enemy-assets.test.mjs` catches stale derived models after source
changes. Live bot light/medium/heavy turret aiming and movement/recentering
pass; fixed-gun hunters remain fixed. 18 tests/build pass, one existing lint
warning. Player paint and combat behavior are unchanged.

Sherman closure plates now use linear olive material factors, eliminating
white exposed surfaces when the turret turns. Pershing upper geometry is
split by connected components rather than spatial masks: only the connected
turret/mantlet/barrel rotates, and nine disconnected upper prop components
remain on the hull. Unit3DConfig uses the recomputed pivot from split-report.
The light-tank model is unchanged.
Mobile orientation checks reproduced stretched/misaligned 3D canvases.
CanvasSprite3D now creates an independent CanvasSource + Texture per resize
and disposes the old source, eliminating cached upload state across rotation
for both unit and building layers. TopBar wraps fields to viewport width and
reflows on changing coordinates/HQ values. Verified 390x844 portrait and
844x390 landscape with touch emulation, smoke stages, turret poses, black
wreck/explosion and one expiring shake. 17 tests and build pass; one existing
lint warning. Physical mobile devices/iOS simulator were unavailable; no
claim of mobile hardware performance or Safari verification.

Living troops keep their authored colors at every health level. Unit3DBody
and the 2D EntityView no longer apply damage tints; blackening happens only
through the existing death/wreck path. DamageSmoke, owned by WorldCombat,
emits rising vehicle smoke at 75%, 50% and 25% remaining HP (3/7/14 puffs
per second with increasing size/opacity). It follows current hull positions,
stops new emissions on healing/death/removal, excludes infantry, and leaves
120 slots in the shared 500-particle budget for bursts. DamageSmokeConfig
owns the thresholds and plume settings. ENTITY_DIED triggers the existing
explosion once plus one small 180ms shake (intensity .22); impacts do not
shake. Late-loaded vehicle models inherit their pending wreck appearance.
Verified live tank material colors at all three thresholds, destruction
explosion/blackening and exactly one shake; 15 tests and build pass, one
existing lint warning, no physical mobile-device test.

USA heavy Pershing now uses separate hull/turret GLBs, split at the skirt
with closed olive cut surfaces; rear log, deck equipment and running gear
remain on the hull. The recorded source pivot goes through UnitMeshFactory
and the existing independent Unit3DBody/TankTurret heading path. The intact
source, concept image and turntable remain in its asset packet.
`VehicleDust` now drives `GroundTrails`: two continuous wheel/tread bands
per vehicle, class-scaled light → medium/tank hunter → heavy → super-heavy,
model-specific projected contacts for the USA GLBs, narrow tire marks for
wheeled artillery/trucks, and alternating footprints per living soldier.
GroundTrailConfig owns dimensions; TrailProjection matches Unit3DLayer's
camera transform. WorldField.addGroundMark feeds copied quad coordinates to
DecalField's bounded 1,200-Graphics pool. Distance/turn sampling prevents
stationary stamping, handles pivots and resets on teleports. Infantry mesh
and gait are unchanged. Verified in the current WorldScene, not a legacy
harness; 10 tests/build pass, lint has one existing AttackTowers3D warning.
Physical-device performance remains unverified.

`Unit3DBody` preserves every living model's authored material color; its palette is matched to the Sherman via the asset
packet's reproducible `source/prepare.py` material-factor adjustment.
USA level-1 howitzer art is registered as `usa:howitzer` for the existing
`m12_gmc` roster entry. `DeployableView` accepts the shared `Unit3DLayer` and
mounts an intact `Unit3DBody`, preserving deploy UI, crew, firing, and wreck
fade. The supplied wheeled GLB is under `assets/units/m12_gmc/tier01`, fitted
uniformly to 80 world pixels along source X and rotated 180° (-X muzzle to
+X forward). Its squad portrait uses the same model. No wheel/folding/recoil
animation or higher-level art switching is implemented. Browser checks cover
model/portrait loading, ground contact, three completed movement directions,
deployment, firing and packing up. Physical-device performance is unverified.

The world-map combat and base interaction prototype is undergoing a live-3D
conversion. `Game` creates both `Base3DLayer` and `Unit3DLayer`, renders both
before Pixi, and passes them into the live `WorldScene`. `BaseSite` owns
`Buildings3D` (13 registered and seeded tier-01 building types), `BaseGround3D`,
`DefenceWall3D` (segments plus gate), and `AttackTowers3D`. `HqView.js` is
removed; `Building3DView` provides the shared building path. The base uses a
diamond-projected square placement grid; world movement remains hex-based.
Building menus, instant resource-paid upgrades, and drag relocation are wired.
`EntityView` uses `Unit3DBody` for `usa:mediumTank` (Sherman) and `usa:lightTank`
(M24 Chaffee), plus `usa:heavyTank` (Pershing): separate hull/turret GLBs follow the existing simulation. `InfantrySquadView` uses one `SoldierBody3D` per USA infantry soldier, with source-space torso/leg pieces and independent hip pivots. Each soldier follows its own formation slot, faces its own travel bearing, and advances an alternating leg cycle from distance travelled; corrected hip-relative transforms add a small inward crossover. The Sherman split follows the turret skirt (Y=0.075), keeping upper hull,
deck and stowage fixed, with closure meshes under the turret. Its source-space
ring pivot is recorded in the asset packet's `source/split-report.json`.
The source -Z front is normalized to +X with `rotationYDeg: -90`;
`Unit3DLayer.headingToSceneY` uses `atan2(-z,x)` for Three's Y-axis convention.
The Chaffee uses the user's supplied model with its own skirt split and raw
ring pivot, fixed rear stowage, textured closure plates and a 78.2-pixel hull
(85% of the Sherman's 92). Asset packets live under `assets/units/<key>/tier01`
with repeatable preparation under `source/`. The starting five-squad roster is
Chaffee, M1 Garand, Sherman, Pershing and M12; Springfield is retained on the
bench. Existing M24 stats, pathfinding, hull and turret slew remain unchanged.
Other unit types and the world terrain retain their existing 2D rendering. Whole-world 3D remains the
direction, not a completed conversion. Higher building tiers are specified in
GDD 24 but the current 3D registry loads fixed tier-01 assets.

Asset packets document user-run Replicate TRELLIS generations and offline
mesh repair/splitting; no repeatable Replicate generation script was found in
the repository. The working tree contains substantial uncommitted conversion
work beyond the latest Session 51 commit; preserve it. Older detailed rows
below still need reconciliation (particularly HqView and sprite-only claims).
`docs/BASE_REDESIGN_PLAN.md` contains the scoped current handoff.

Verification: production build passes; lint has zero errors and one existing
magic-number warning in `AttackTowers3D.js`. Build output includes approximately
120 MB of GLBs and a ~956 kB minified main JS chunk (chunk-size warning).
Chrome verification covers both USA tank meshes: each passed 12 turret aim
headings with fixed hull, three completed movement paths, and a real-time
world-loop drive. Node heading tests and Python mesh checks pass. No physical
device testing; mobile FPS and loading time remain unverified.

**Target: a Warpath clone** (Lilith Games' WWII persistent MMO strategy),
renamed/re-skinned as Blitzmire — full spec in `docs/gdd/` (rewritten Session
27, **24 files**). Load-bearing constraints: **ground war only** (no aircraft,
no naval, no scout planes, no shooter mode); **one persistent shared world map**
(no menu, no screen-swap, no separate battlefield — combat resolves in place on
the map); **no pause** (always-online; Settings is a world-map overlay); the
base is a **place on the map** that expands on zoom-in, collapses to a city
marker on zoom-out.

**Engine state.** One always-rendered scene — the world map, a **flat-top HEX
grid** (`src/utils/Hex.js`; axial coords, rectangular layout, 100×100
placeholder hexes drawn by `WorldTerrain`). Boot `LoadingScreen` → tap → the
map on the player's base hex. `Game` is a boot lifecycle only: `BOOT → LOADING →
RUNNING`. `src/worldmap/` is the live scene: `WorldScene` owns `WorldTerrain` +
`BaseSite` (Warpath zoom LOD: `HqView` (the HQ, every zoom) + `BaseGridView`
(walls + every other building) + `BaseTroops`) +
`BaseArmy` (the player platoon) + `WorldCombat` (AI + Fury + projectiles + FX +
damage numbers) + `OnslaughtDirector` (the wave event) + `Hud` (the GDD-23 HUD)
+ `PlotMarker`s. Base economy (`BaseManager` + `ResourceManager`) runs live
under `BaseSite`. **All world movement paths on the hex grid** — `Pathfinder`
(6-neighbour hex A*), `entityMotion` (6-direction slide) and `AIController` all
route through the same `findPath`, so marches, troops and AI move the same way.

**The battle stack is LIVE.** The post-audit rebuild (see `docs/CODE_AUDIT.md`)
wired the real entity stack — `BaseTank` + `TankTurret` (turret slew, recoil,
fire-arc gating), `InfantrySquad` + per-soldier sim, `DeployableWeapon`,
`RocketLauncher` — into the world map via `worldmap/unitRoster.js` (one key →
class + view table for all 24 combat units), replacing the placeholder
`MarchUnit` tokens. `DamageResolver` now runs the full `CombatConfig` pipeline
(type counters × penetration-vs-armour bands by facing × def mitigation ×
splash × variance). `WorldField` carries a base-footprint polygon so **Base
Fury** arms when a unit is hit inside the compound. `src/ui/hud/` is the new
GDD-23 HUD (top resource bar, 6-tab nav, Home/World buttons). `src/onslaught/`
is the alliance base-defense event (10 escalating Legion waves at the base,
`window.onslaught.start(levelId)`).

**Deleted / moved.** The old battle HUD family, the front-end screens ruled out
by the hard constraints, `src/skirmish/*`, and the square-arena world-gen
(`world/Battlefield` + `MapGenerator` + `passes/*` + `TerrainRenderer`) were
**deleted** — superseded, unreachable from `main.js`, recoverable from git and
documented in `docs/CODE_AUDIT.md`. The 9 dev harnesses moved to **`dev/`**
(out of the build; most reference deleted modules — reference only).

Full session-by-session history: **`docs/SESSION_LOG.md`**. This file is
CURRENT on-disk state only; update it in place.

## Build & Tooling
- Vite dev server on port 3000 (`npm run dev`), build to `dist/` (`npm run build`).
- ESLint flat config in `eslint.config.js` (ESLint 9+). Enforces CLAUDE.md
  rules: 150-line file cap, 50-line function cap, no default exports, no magic
  numbers outside `src/config/`. Run `npm run lint` (currently clean).
- `public/` — Vite static dir, copied verbatim to `dist/` root.
- `assets/` — source art/audio (Sessions 30-33), imported through Vite; `.glb` models (S54) via `vite.config.js`'s `assetsInclude: ['**/*.glb']`.
- `three` (S54, `package.json`) — the live-3D building layer's renderer. Adds ~900 kB (unminified) to the single main chunk — see Known Issues.

═══════════════════════════════════════════════════════════════
CURRENT — what exists on disk
═══════════════════════════════════════════════════════════════

### src/main.js
Entry point. Constructs `Game`, awaits `init()`, calls `start()`, exposes
`window.game` (dev console handle), and wires `window resize` +
`document visibilitychange` to the game. No game logic.

### src/utils/ — framework-free helpers  (all files < 150 lines)

| File | Purpose |
|---|---|
| MathUtils.js | pure lerp/clamp/distance/angle/normalize, RNG, deg⇄rad, 4 easing curves; `wrapAngle` (→(-π,π]) + `rotateToward(current,target,maxDelta)` (shortest-arc clamped slew — shared by TankMotor / TankTurret / entityMotion); out-param form on hot paths |
| ObjectPool.js | `ObjectPool` reuse container — acquire/release/getActiveCount/getTotalCount; pre-allocates, no alloc on non-empty acquire |
| EventEmitter.js | `EventEmitter` bus — on/off/once/emit/clear; emit iterates a snapshot so handlers can unsubscribe mid-dispatch |
| ScalarTween.js | `ScalarTween` — one eased (easeInOutQuad) number tween; start/step/cancel + active/value getters; alloc-free, self-deactivating. Used by Camera for move + zoom |
| Noise.js | seed-deterministic value noise for map gen — `makeRng` (mulberry32), `valueNoise2D` (bilinear + smoothstep, →[0,1]), `fbm` (normalised octave sum, →[0,1]). Pure, no Math.random |
| Hex.js | flat-top hex grid math for the WORLD MAP only (S52: the base's own build grid moved to `SquareGrid.js` — see below). Axial (q,r) storage, cube rounding. `axialToPixel`/`pixelToAxial` (out-param), `axialRound`, `axialDistance`, `axialKey` (Map key), `HEX_DIRS` + `HEX_PX_DIRS`, `HEX_CORNER_UNITS` + `hexPolygon(cx,cy,size,out12)` (for `Graphics.poly` — used by WorldTerrain + MarkerDraw), `rOffset(q)` + `axialRectPixelBounds` (rectangular world layout). Pure, no PixiJS |
| SquareGrid.js | (S52, +S53 helper) pure square-cell math for the base's OWN internal build grid (GDD 24 / GDD 18) — diamond-projected (`ISO_RATIO` 0.5 = sin(30°), matching the locked building-sprite camera pitch) so the plot visually faces the same oblique way every pre-rendered building sprite does, instead of a flat top-down rectangle under angled art. `cellCentreToPx`/`pxToCellCentre` (the projection + its inverse — hit-testing goes through the inverse, not raw px division), `plotCorners` (N/E/S/W diamond corners), `plotHalfExtents`, `gridLineSegments` (diamond lattice), `footprintInPlot`/`footprintsOverlap` (pure grid-unit bounds/overlap checks — deliberately NOT projected, so placement validation stays simple cartesian math), **`footprintFrontAnchor(w,h,cellPx)`** (S53 — a single `w`×`h` footprint's own E-to-W span + how far below its own centre the frontmost/S corner sits; drives `BuildingSprite`'s real-art sizing. No horizontal offset needed even for an oblong `w≠h` footprint — the diamond's E/W corners are always mirror-symmetric about the footprint's own centre x, `E.x === -W.x`, verified against `plotCorners`'s own corner formula). Pure, no PixiJS |

### src/engine/ — runtime core  (files < 150 code-lines per the eslint cap)

| File | Purpose |
|---|---|
| GameEvents.js | `EVENTS` string-constant registry. **Live:** state / loop / input gestures / `ORDER_*` / `ENTITY_SPAWNED` + `ENTITY_DAMAGED {id,amount,type,hp,facing,x,y,team,crit}` + `ENTITY_DIED {id,team,x,y,killerId}` + `COMBAT_SHOT {…,dmg,pen,attackerCls,aoePx,weapon,angle,targetX?,targetY?}` + `PROJECTILE_IMPACT` / `AI_STATE_CHANGED` / `FURY_FIELD_TRIGGERED` + `FURY_BASE_TRIGGERED` + `FURY_BASE_ENDED` / `ONSLAUGHT_STARTED` + `ONSLAUGHT_WAVE_INCOMING {number,total,boss,composition}` + `ONSLAUGHT_WAVE_CLEARED` + `ONSLAUGHT_BASE_HP {hp,maxHp,frac}` + `ONSLAUGHT_ENDED {wavesCleared,fullClear,score}` / `SETTINGS_CHANGED` + `LOADING_PROGRESS` + `LOADING_DISMISSED` / `RESOURCE_CHANGED` + `BUILDING_PLACED {id,q,r,level}` + `BUILDING_UPGRADED {id,level}` (instant, no timer — GDD 04) + `BARRACKS_TRANSFORMED`. **Live:** `PERSONNEL_CHANGED` → `TopBar`; `SQUAD_UNIT_STATE` / `ORDER_RECALL` / `ORDER_HOLD` drive `SquadManager`. **Emitted, no consumer yet:** `LOOP_TICK`, `AI_STATE_CHANGED`, `ORDER_FOLLOW`, `PERSONNEL_DENIED`, `SQUAD_UNIT_STATE` (fires, unread). The `SKIRMISH_*` / `MENU_*` / `RESULTS_*` / `GAME_PAUSE/RESUME/QUIT_REQUESTED` constants were removed in the step-7 sweep. No hard-coded event names elsewhere |
| GameLoop.js | fixed-timestep sim (20 Hz) + interpolated render; accumulator, 250 ms anti-spiral clamp, rolling 60-frame FPS, emits `LOOP_TICK` / `LOOP_FPS`; addSystem/removeSystem, start/stop/`pause`/`resume` (`pause` = the tab-hidden full stop). No `setSimPaused` — there is no pause (GDD 23) |
| Base3DLayer.js | (S54) the live-3D building layer — a Three.js `Scene` + orthographic `Camera` rendered into its OWN off-screen `<canvas>` (never attached to the DOM), pushed each frame into `renderer.buildingsSlot` as one Pixi `Sprite` (`Texture.from(canvas)` + `sprite.texture.source.update()`) — a screen-space slot in the single Pixi draw order between `worldRootBack` (ground/decals/shadows) and `worldRootFront` (units/other buildings/particles/UI), so 3D buildings get a real position relative to 2D content instead of an unoccludable DOM overlay (the rejected first cut). The camera direction is FIXED (GDD 24's locked 30°-pitch/45°-azimuth frame) and never tilts — an earlier "parallax" attempt tilted it with pan, which swung every building not exactly at the pan target out of sync with the linear-panning 2D grid (an orthographic-camera property, not a bug); removed outright. `update()` (called every `Game.render`, BEFORE `renderer.render()` — reversing this order caused a one-frame compositing lag) mirrors the 2D `Camera`'s pan/zoom by converting its world-px offset from the base's origin into a grid-cell delta via `SquareGrid.pxToCellCentre`, then into 3D scene units, so 3D buildings and the 2D grid/wall/neighbour sprites never drift apart. `setBuildingModel(id, url, cx, cy, {footprint, rotationYDeg})` loads a GLB, measures its natural bounding box (`Box3`), and **non-uniformly scales + re-centres it so that box exactly spans `footprint.w`×`footprint.h` grid cells** — the live-3D equivalent of `SquareGrid.footprintFrontAnchor`, since a DCC-exported mesh's own local units are arbitrary. The fitted mesh sits in an inner `Group`; an outer `Group` (`lod`) carries ONLY the LOD shrink multiplier (`setModelScale`) so the two scales can never clobber each other (a real S54 bug: one shared scale meant `HqView.setBlend`'s LOD call reset the footprint fit back to 1). One warm key `DirectionalLight` + cool `AmbientLight` (GDD 24 lighting spec), `ACESFilmicToneMapping`. `resize()` sets `sprite.scale.set(1/dpr,1/dpr)` directly rather than `sprite.width/height` (those bake in a scale relative to the texture's size AT ASSIGNMENT TIME, which drifted once `source.update()` read back a resized canvas — a real S54 bug that produced a runaway sprite size). `removeBuildingModel` disposes geometry/materials |
| Base3DConfig.js | (S54, in `src/config/`) the locked camera frame (GDD 24) as real 3D numbers — `pitchDeg: 30, azimuthDeg: 45` (the exact same projection `SquareGrid.ISO_RATIO = sin(30°)` encodes as flat 2D math; the two must never drift apart), `cameraScale = 1/√2` (the derived constant that makes a 1-grid-cell 3D step land exactly on a 1-grid-cell `SquareGrid` step on screen — see the file's own derivation comment), light color/intensity/azimuth/elevation, tone-mapping exposure |
| Renderer.js | owns the PixiJS `Application` (autoDensity); **(S54) `worldRoot` split into `worldRootBack`/`worldRootFront`**, sandwiching a screen-space `buildingsSlot` Container that `Base3DLayer` puts its composited Sprite into — stage order `[worldRootBack, buildingsSlot, worldRootFront, …screen layers]` (`_buildLayers` distributes each `LayerConfig` layer into back/front via `WORLD_BACK_LAYERS`/`WORLD_FRONT_LAYERS`); `render(_alpha)` folds camera position+zoom+shake into BOTH world roots identically each frame, screen layers never transformed. `layer(name)`, `setFps`. `resize()` is **one atomic `app.renderer.resize(innerW, innerH, resolution)`** (Pixi-v8 form) — not a bare `renderer.resolution =` mutation + separate `app.resize()`, which could leave autoDensity's canvas CSS box sized against a transient state (the "tall strip" bug). S22C: `_dprCap` (RENDER.maxResolution, overridden by `setDprCap(cap)` — graphicsQuality preset), `setFpsVisible(on)` (the `fpsCounter` setting; builds the debug `Text` lazily). `pickResolution(cap)` clamps to `RENDER.maxResolution` and floors at 1 |
| Camera.js | plain-data `{x,y,zoom}` world-px viewport + `{offsetX,offsetY}` shake (read by Renderer). `follow`/`moveTo`/`setZoom` (eased), `nudgeZoom` (focal-preserving), `panBy`, `shake`, world⇄screen conversions, `clampToWorld` (½-viewport inset), `setViewport`, `setWorldBounds(w,h)` (per-instance clamp extent), **`setZoomLimits(min,max)`** (S26 — widen the pinch/zoom clamp past `CAMERA.minZoom/maxZoom`; `WorldScene` sets the map's range). `update` priority: move → follow → pan-target → zoom → clamp → shake |
| CameraShake.js | `CameraShake` — additive shake-offset generator; pre-allocated source pool, per-source decay curve, directional (recoil) vs wandering; summed offset clamped to `CAMERA.shake.maxOffsetPx` (20). Owned by Camera |
| PointerPool.js | `PointerPool` — fixed-size alloc-free active-pointer registry; slots carry down pos/time + previous sample + EMA velocity (`updateKinematics`); add/get/remove + `firstTwo()` for pinch |
| GestureRecognizer.js | pure single-pointer classifier — `travel` / `dragArmed` / `longPressHolds`, and `classifyRelease` → tap / double-tap (owns last-tap memory) / swipe. Reused result object, no DOM |
| PinchRecognizer.js | pure two-pointer span classifier → `{delta, focalX, focalY}` once the span passes the drag threshold |
| GestureEmitter.js | owns every InputManager output payload + the `emit` calls (pan / zoom / drag start·move·end / tap·double-tap·swipe / long-press). Reused scratch objects. `setSensitivity(m)` (S22C) scales the `pan` + `dragMove` deltas (the `touchSensitivity` setting) |
| InputManager.js | pointer + wheel → gestures via the recognisers/emitter. `setSensitivity(m)` → the emitter. Emits `INPUT_TAP {x,y,pointers}`, `INPUT_DOUBLE_TAP {x,y}`, `INPUT_PAN {dx,dy}`, `INPUT_ZOOM {delta,focalX,focalY}`, `INPUT_LONGPRESS {x,y}`, `INPUT_DRAG_START {x,y}`, `INPUT_DRAG_MOVE {x,y,dx,dy}`, `INPUT_DRAG_END {x,y,startX,startY,vx,vy}`, `INPUT_SWIPE {dirX,dirY,speed}` — all SCREEN px. A single-finger gesture emits `INPUT_PAN` until it arms a drag (`orderDragArmPx`), then `INPUT_DRAG_*` only |
| OrderController.js | tactical-order brain (GDD 02). Subscribes to tap / double-tap / drag / long-press; screen→world, hit-tests a unit source, emits `ORDER_SELECT/DESELECT/MOVE/ATTACK/RECALL/HOLD/FOLLOW` + drives OrderIndicator + RadialMenu. `setHudHitTest(fn)` — a screen-point predicate the HUD registers so taps it consumes never reach the map. Every emit mirrored to `console.debug('[Order] …')`. `isDraggingUnit()` lets Game suppress camera-pan mid order-drag |
| Game.js | master object: owns bus + loop + renderer + camera + input + `settings` (`SettingsStore`) + `base3D` (S54, `Base3DLayer`) + `_world` (`WorldScene`) + `_loading` (`LoadingScreen`); a loop system. `GAME_STATES` is a boot lifecycle only — `BOOT → LOADING → RUNNING`. `init()` builds the settings store + `base3D.enable()` + `base3D.setVisible(false)` (hidden until RUNNING — never shows over the loading screen) + `WorldScene` (`.enable()` — the map warms up behind the loader) + `LoadingScreen`, `_wireEvents()`, `loop.addSystem(world)` + `(this)`, starts the loop, `await _load()` (`LOADING_PROGRESS {frac}` over `LOAD_STEPS` rAF yields, holds in LOADING). `_wireEvents` keeps only `LOOP_FPS`, `LOADING_DISMISSED → _enterWorld()` (→ RUNNING + `_loading.disable()` + `base3D.setVisible(true)`), `SETTINGS_CHANGED → _applySetting`. `_wireInput` forwards `INPUT_PAN` / `INPUT_ZOOM` / `INPUT_DRAG_MOVE` to the camera while `state === RUNNING` (a drag that grabbed a squad is an order-drag, not a pan). No `pause/resume/quit`. `render(alpha)` calls **`base3D.update()` BEFORE `renderer.render(alpha)`** — the reverse order caused a one-frame lag in the composited 3D texture under continuous panning (S54 bug). `update(dt)` = loader tip timer (while LOADING) + `camera.update(dt)`. `onResize()` also calls `base3D.resize()` |

**Dev harnesses moved to `dev/`** (Sessions 2–21 probes — camera, order,
battlefield, entity, AI, personnel, skirmish, screens + `devParade.js`). Out of
`src/` and the build; most import modules that were since deleted or rewritten.
Reference / partial-salvage only — see `dev/README.md`. `RENDER.dev*` flags in
`GameConfig` are now dead.

### src/worldmap/ — the single persistent scene  (Session 26; battle stack wired in the post-audit rebuild)

| File | Purpose |
|---|---|
| WorldScene.js | the one always-on scene, built in `Game.init()`, `loop.addSystem`ed. Owns `WorldTerrain` + `DecalField` + `BaseSite` + `BaseArmy` + `WorldCombat` + `OnslaughtDirector` + `Hud` + N `PlotMarker`s. Constructs `BaseArmy` with `_base.personnel`. `enable()` paints terrain + wires the decal sink + **`_blockObstacles`** (`field.blockDisc` the compound — a circle circumscribing the square plot, `Math.hypot(STARTING_PLOT_HALF.hw,hh)` — with a gate gap on the diamond's E→S bearing, `atan2(ISO_RATIO,1)` ≈ 26.57°, not due south — + each neighbour base) + a **territory dev-check** (`findTerritoryConflict` over the player + every `neighbourHexes` claim, `console.warn` on overlap), brings the **`Hud` up first** so `TopBar` catches the deploy-time `resource:changed` / `personnel:changed`, then base → army, `_base.setGarrisonPips(_army.garrisonCount)`, `_base.setHudHitTest(_hud.hitTest)`, `_army.setHudHitTest((sx,sy) => _hud.hitTest(sx,sy) || _base.hitTest(sx,sy))` (S49 — a building-panel tap must never also read as a march order), frames the camera. `update(dt)` ticks base → army → onslaught → combat → hud. `isDraggingUnit()` → `BaseArmy` |
| BaseArmy.js | the player's forces + the **shared** `EntityManager` + `WorldField` (both `get`-exposed for `WorldCombat` / `OnslaughtDirector`) + a `SquadManager` over the injected `PersonnelManager`. Owns `OrderIndicator` + a real `RadialMenu` + `OrderController`. `enable()` wires them, `setSpawn('player', muster)` + `setBaseFootprint(baseCentre, compoundR)` (S52: `compoundR` derived from `STARTING_PLOT_HALF`, the square/diamond plot's own half-extents — no more hex `platform.hexR`), then `_spawnPlatoon` (first `BASE.army.deploySlots` of `BASE.army.roster`, two rows on the muster ground) + `_spawnGarrison` (`BASE.garrison.roster`, capped at `.slots`, ringed inside the compound). `_deploy(key,x,y)` = `sm.createSquad(key, ENTITY_COST[cls])` (one unit per slot in v1; the deploy flow will pick personnel per squad later) → `unitRoster.makeUnit` — real `M4Sherman` / `M1GarandSquad` / `M12GMC` etc.; a denied reservation stops the loop. `get garrisonCount`. `window.army` / `window.sm`. Gestures → orders: tap = select; tap ground / drag = **march**; drag onto an enemy = **attack**; long-press = radial (Recall / Hold / Follow) |
| unitRoster.js | the world map's single "UnitStats key → `{Ctor, View}`" table — **all 24 combat units** (tanks → `EntityView`, squads → `InfantrySquadView`, guns → `DeployableView`, launcher → `RocketLauncherView`). `makeUnit(key, spawn)` → `{entity, view}` (view not yet mounted). `BaseArmy`, `WorldCombat` and `OnslaughtDirector` all build units through it |
| WorldCombat.js | combat on the map — owns `EffectsSystem` + `ProjectileSystem` + `VehicleDust` + **`Separation`** + `FuryManager` + `AIManager` + `DamageNumbers` (shares BaseArmy's `EntityManager` + `WorldField`), spawns a static Legion camp (`BASE.enemy.roster`, a dozen hexes off the base). `enable()` builds in order (`fx` first so `ProjectileSystem` + `VehicleDust` get `fx.particles`). `update` ticks AI → Fury → projectiles → dust/tracks → **separation** → FX → damage numbers. Field Fury AND Base Fury both live (footprint via `WorldField`) |
| WorldField.js | the world map's collision + pathing substrate: a hex `TerrainGrid` **painted by `worldTerrainGen`** (grass / forest / hills / water). `getTileAt` / `isPassable` (water + `blocked` bar) / `getMovementCost` + `setSpawn(side,wx,wy)` / `spawnColumns` + **`setBaseFootprint(cx,cy,r)`** → `isInSpawn('player',tx,ty)` (circular — arms Base Fury) + **`blockDisc(cx,cy,r,gateBearing?,gateHalf?)`** stamps a disc of tiles `blocked` (the compound with a gate gap, each neighbour base — GDD-17 fields/camps later) so marches route around + can't be driven into + **`nearestOpen(wx,wy)`** snaps a drop out of one + `setDecalSink` / `addDecal` → the injected `DecalField`. The surface Pathfinder / entityMotion / EntityManager / Fury / AI expect |
| WorldTerrain.js | ground on `LAYERS.SKY` (oversized backdrop rect) + `LAYERS.TERRAIN` — `enable(grid)` draws every hex into one batched `Graphics` per terrain type, filled from `TERRAIN_TYPES[type].color`. Built once, `update(dt)` no-op. FORWARD: roads / sectors / resource fields / camps as map objects (GDD 17) |
| worldTerrainGen.js | pure + deterministic `paintTerrain(grid, clears)` — two fbm layers sampled in world px per hex: elevation (low → `water`, high → `hills`) + a forest field (→ `forest` on grass/hills). `clears` = world-px circles (base compound + muster + Onslaught approach; Legion camp) forced to `grass` so nothing spawns stuck. Runs once from `WorldScene.enable()` |
| BaseSite.js | the player's base as a PLACE (GDD 18/24). The compound's footprint (`BaseGridView` — walls + every building but the HQ) is drawn at its TRUE, FIXED world size always — it never rescales; owns `BaseManager` + `ResourceManager` + `PersonnelManager` + `BaseGridView` + `HqView` + `BaseTroops` + `TerritoryRing` + (S49/51) `BuildingHexMenu` + `BuildingPanel` + `BuildingContext` — mirrors how `BaseArmy` owns `OrderController` + its view. `buildingAt(wx,wy)` composes HQ (S52: `pxToCellCentre` inverse-projects the tap into grid-unit space, then a plain footprint half-extent check — not raw px math — since `HqView` isn't a grid cell) + `_view.buildingAt` (same inverse-projection approach). `setHudHitTest(fn)` / `hitTest(sx,sy)` passthrough to `_ctx` for `WorldScene`'s combined tap arbitration. `_layoutPanel()` re-docks the panel above `NavBar` on boot + `RESIZE`. `_syncLod()` (every frame) computes `pin` (BaseTroops' garrison-hint crossfade, `lod.pinBand`) and `reveal` over `lod.buildingBand` — the HQ shrink + wall/building/territory-ring reveal. `_hq.setBlend(reveal)`, `_view.setBlend(reveal)`, `_troops.setBlend(pin)`, `_territory.setBlend(...)` (fades out over `ringFadeFrac` as the walls solidify). `get hqLevel`, `get personnel`, `get base`, `get resources`, `setGarrisonPips(n)`. `window.base` / `.rm` |
| BuildingContext.js | (S49, reworked S51, re-anchored S54) the building tap controller — the GDD-23 context menu, `OrderController`'s shape but for buildings. `hitTest(sx,sy)` (composed into `WorldScene`'s combined `army.setHudHitTest` chain, ahead of unit orders — a building tap must never double as a march order) is true while the hex menu OR the panel is open, or the point is over a building. `_handleTap`: HUD-owned taps, the open menu (routed to `BuildingHexMenu.handleTap`), and the panel's own rect are all skipped in that order; a building hit opens `_openMenu` (fan of hex actions from `BuildingMenuConfig.BUILDING_ACTIONS[id] ?? .default`). **S54: `_openMenu` anchors on `_buildingAnchor(id)`** — the WORLD point at the building's own footprint-front edge (`footprintFrontAnchor` + `cellCentreToPx`), NOT the raw tap point, since the menu now lives in world space and must sit under the building regardless of where it was tapped. Title is `` `Lvl ${level} ${name}` `` (was `${name} L${level}`). Anything else closes whatever's open. `_onAction`: `info`/`upgrade` both open `BuildingPanel` (`_describe`: name, level, `nextLevel`, `upgradeCost`, `maxed`, `afford`); `manage` (Barracks only) cycles `BARRACKS_VARIANTS` directly via `BaseManager.setBarracksProduction` — instant, no sub-panel. Re-describes the open panel on every `RESOURCE_CHANGED` so its button's enabled state tracks live affordability |
| HqView.js | **the Headquarters, rendered at every zoom** (GDD 24 "Base zoom" reference — replaces the old constant-screen-size pin, S46). **S54: live 3D, not a sprite, and drastically simplified** — `enable()` just calls `base3D.setBuildingModel(HQ_ID, hqModelUrl, 0, 0, {footprint, rotationYDeg: HQ_FACING_DEG})`, `setBlend(reveal)` just calls `base3D.setModelScale(HQ_ID, lerp(lod.hqFarScale, 1, reveal))` (oversized at the far end of `lod.buildingBand`, shrinking to true size by the near end), `disable()` just calls `base3D.removeBuildingModel`. `HQ_FACING_DEG = -90` — the unrotated mesh's entrance faces upper-right, the base's gate is lower-right, a quarter turn from there to here (user-confirmed against the gate). **No floating name caption anymore** (removed S54 — the name/level only ever show in `BuildingHexMenu` on tap now, matching GAME_DESIGN.md/Headquarter.jpeg's no-always-on-label reference); `_renderer`/`_events` ctor params are unused, kept only for a stable ctor shape |
| TerritoryRing.js | the dotted claim-radius circle (GDD 24), world-space so it scales with the camera like the compound (the same fixed footprint the walls occupy) — drawn once at `enable(cx,cy,radiusPx)` via a hand-rolled dashed-circle stroke (`WORLDMAP.territory` dash/gap/width/colour), `setBlend(alpha)` per frame — a raw passthrough; callers shape their own fade curve. One per `BaseSite` (the player — `BaseSite` fades it out as the walls solidify) and one per `PlotMarker` (dimmer, static). Purely a visual read — `territory.js` owns the actual placement rule it illustrates |
| territory.js | pure geometry, no rendering: `territoriesOverlap(a,b)` (two `{x,y,r}` claim circles intersect?) + `findTerritoryConflict(candidate, claimed)` → the first violated claim or null. Runs today as a `console.warn` dev-check on the static `neighbourHexes` layout (`WorldScene.enable`); the rule the future Airlift/relocation flow calls before allowing a placement — "no other base / map object inside your territory" |
| BaseTroops.js | the zoomed-out garrison hint only — a pip blob (`buildPipCluster`) just below the compound centre, **one pip per real garrison unit** (`setCount(n)` from `BaseArmy.garrisonCount`, rebuilds the cluster), faded out by the LOD blend `t` (`WORLDMAP.lod.pinBand`) as the real marchable squads (`BaseArmy`) take over up close |
| PlotMarker.js | one neighbour base — the shared `buildCompoundIcon` (neutral brown wall) + name/level `Text` on `LAYERS.GROUND_UNITS` + its own dim, static `TerritoryRing`, at the world pos `WorldScene` derives from a `WORLDMAP.neighbourHexes` axial offset. Built once. FORWARD: tappable → neighbour info; real map objects (GDD 17) |

### src/ui/ — order feedback + menus  (WORLD_UI loop systems + the long-press menu)

| File | Purpose |
|---|---|
| OrderIndicator.js | loop system on the `WORLD_UI` layer. Pre-allocates all Graphics in `enable()` (`ORDERS.pool`) and reuses via `ObjectPool` — no `new Graphics()` or allocation in `update(dt)`. `showSelection`/`clearSelection` (pulsing ring re-read to the unit x/y each tick; **plus a translucent `ORDERS.aimCone` wedge** rotated to `unit.rotation` when `unit.noTurret`), `showMove`/`showAttack`/`showRecall` (auto-fading transients), `showDragPreview`/`hideDragPreview` (live line) |
| DamageNumbers.js | loop system on the `WORLD_UI` layer (mirrors OrderIndicator). `enable()` builds one shared `TextStyle` + pre-allocates `DAMAGE_NUMBERS.poolSize` `Text` in an `ObjectPool`; subscribes to `ENTITY_DAMAGED`. `_spawn` acquires a Text (evicts oldest when dry), `.text` = `("!"?)`+round(amount), `.tint` = white / crit-yellow / player-red, jittered x, start above the hit. `update(dt)` scales 0→1.3→1.0 over `scaleIn.ms`, floats up (enemy) / down (player), fades over a random `fadeMs`, retires at `travelPx` or alpha 0; active list compacted in place — zero alloc |
| orders/OrderDraw.js | pure PixiJS 8 Graphics shape builders — `buildRing` / `buildArrow` / `buildAttackLine` / `buildCrosshair` / `buildDashedLine` / `buildDragLine` / `buildAimCone` (filled ±`halfAngleDeg` wedge, `radiusPx` long). Each takes a Graphics + cfg, clears & redraws |
| RadialMenu.js | long-press menu on the `HUD` layer (raw SCREEN px). `open(sx,sy,handlers)` places 3 `RadialOption`s (Recall top / Hold left / Follow right) that GSAP-scale in (`back.out`); `handleTap` routes a tap to an option (fire + close) or closes with no order; `close` idempotent |
| RadialOption.js | one circular option button — coloured disc + single-letter placeholder icon. `mount` / `setPosition` / `contains` (hit radius) / `destroy` |

### src/ui/hud/ — the persistent world-map HUD  (post-audit rebuild, GDD 23; `LAYERS.HUD` + `LAYERS.OVERLAY`)

| File | Purpose |
|---|---|
| Hud.js | coordinator, owned + ticked by `WorldScene`. Composes `TopBar` + `NavBar` + `NavPanel` + `MapButtons`; subscribes `INPUT_TAP` and routes it (open panel → dismiss > nav tab → open > map button → act); `RESIZE` → re-layout. `hitTest(sx,sy)` (panel open OR nav bar OR map buttons) is registered with `OrderController.setHudHitTest`. `setCommander(level)` → TopBar. World-space combat feedback (`DamageNumbers`) lives in `WorldCombat`, not here |
| TopBar.js | top resource strip on `LAYERS.HUD`. Live Money / Steel / Oil (`RESOURCE_CHANGED`, comma-formatted), Gold + Power stub fields, a `PERS <cur>/<max>` reserve-personnel field (`PERSONNEL_CHANGED`; red under `persWarnFrac`), `HQ <n>` (from `BUILDING_UPGRADED` + `setCommander`), a live `X <q> Y <r>` map coordinate (throttled), and a `BASE <n>%` field shown only while the base is damaged (`ONSLAUGHT_BASE_HP`; red under `baseWarnFrac`, cleared on `ONSLAUGHT_ENDED`). `OWN_STYLE` fields (`base`, `personnel`) get a cloned `TextStyle` so their fill can be set independently. Coordinate changes trigger width-aware wrapping; portrait fields remain visible. |
| NavBar.js | the 6-tab bottom strip (Campaign · Alliance · Store · Officers · Units · More) — evenly split labels + divider + active-tab underline. `rect` / `tabIdAt(sx,sy)` / `setActive(id)`; no input routing itself (Hud does that) |
| NavPanel.js | one full-screen scrim + card on `LAYERS.OVERLAY`. `open(tab)` shows the tab's title + "Coming soon" + its GDD contents list (GSAP slide); any tap closes it; the map keeps simulating behind |
| MapButtons.js | bottom-right Home (snap camera to base @ `homeZoom`) + World (pull to `worldZoom`) discs — camera-only. `hitTest` / `handleTap` |
| BuildingHexMenu.js | (S51, S54 rework) the GDD-23 building menu itself — a fan of `BuildingHexOption`s below a title label (GAME_DESIGN.md/Headquarter.jpeg: glass hex icons, gold-highlighted primary action). **S54: moved from the screen-space `HUD` layer to the world-space `WORLD_UI` layer** — it used to be anchored at a SCREEN point captured once at open(), so panning the camera dragged the menu along with the screen; now `open(wx,wy,title,actions,onPick)` sets `_root.position` at the building's own WORLD coords (from `BuildingContext._buildingAnchor`) and the layer's own camera-transform tracks it automatically on every pan/zoom. `handleTap(sx,sy)` runs the tap through `_root.toLocal({x:sx,y:sy})` (accounts for the live position+scale transform, i.e. correct under zoom) rather than a manual screen-position subtraction. Options sit in a true **U shape**: `setPosition((i-centreIdx)*spacingPx, dropPx + (centreIdx - |i-centreIdx|)*vSpreadPx)` — centre option dips lowest, edges climb back up toward the building (S54: the first version had this inverted — an upside-down arch, corrected). Options GSAP-stagger in on open (rebuilt per open — the action count varies by building, no pool); fires `onPick`, **capturing it before `close()` clears `_onPick`** (a real S51 bug: calling `close()` first fired against an already-nulled reference) |
| BuildingHexOption.js | (S51, S54 rework) one glass **hexagon** button — `hexPolygon` fill/stroke (glass, or gold `primary` for `upgrade`) + a hand-drawn vector icon (`ActionIconDraw.js`, replacing a plain Unicode-glyph placeholder — S54: briefly tried a circle shape matching the Warpath reference image, user corrected back to hexagon) + a text label underneath (S54: title/label/icon/stroke font sizes all shrunk — the reference-matched circle attempt had made them read too large). `setPosition`/`contains` in menu-local screen px |
| ActionIconDraw.js | (S54, new) hand-drawn PixiJS `Graphics` icon builders for `BuildingHexOption` — `drawInfoIcon` (dot + rounded bar), `drawUpgradeIcon` (chevron + stem), `drawManageIcon` (two arcs forming a ring + an arrowhead) — all centred on (0,0), sized off `BUILDING_MENU.iconPx`, shape proportions as named fraction-of-half-size constants (no magic numbers). `ACTION_ICON_DRAW` = `{info, upgrade, manage}` lookup, replacing the old plain-text glyph icons which read as cheap placeholder text at this size |
| BuildingPanel.js | (S49) the GDD-23 building "context panel" — owned by `BaseSite`, not `Hud`. A bar docked above `NavBar` (bg + title + cost `Text` in a `_root` that GSAP-slides between docked and off-screen) plus a **separate sibling** `Button` (`ui/controls/Button.js`, revived) fixed at its absolute resting screen position — `Button` hit-tests in raw screen coords with no awareness of a parent's animated transform, so it can't live inside `_root` and slide with it; only its `visible` toggles with open/close. `open({name,level,nextLevel,cost,maxed,afford}, onUpgrade)` / `close()` / `refreshAfford(afford)` (live update while open) / `hitTest(sx,sy)` (bounding-rect, for `BuildingContext`'s tap arbitration) |

### src/ui/ — kept for the settings-overlay rework  (not on the runtime path)

| File | Purpose |
|---|---|
| SettingsScreen.js / SettingsDraw.js | the old full-screen settings modal + its draw helpers. Superseded by GDD 23's in-world Settings **overlay** (not built) — kept as the closest reference; `SettingsStore` + `SETTINGS_SCHEMA` + `ui/controls/*` are the live parts to build it from |

### src/ui/controls/ — reusable front-end controls  (Sessions 22A / 22C; screen-space, `MENU` config)

All self-subscribe to the relevant `INPUT_*` event and hit-test their own rect;
every tap/drag handler early-returns when the control's own root is not visible
(screens toggle `control.view.visible` to make a hidden panel inert). `update(dt)`
is a no-op on all four. `setValue` is silent; `onChange` fires only on a user
gesture.

| File | Purpose |
|---|---|
| Button.js | rounded bg + centred label built on an inner box `Container` (scale-punch pivots at centre). `constructor(events, label, onPress, tone?)` — `tone:'danger'` swaps stroke + label to combat-orange (`MENU.color.quit`) for QUIT / CONFIRM. `setPosition` (top-left) / `setLabel` / `setEnabled` (dim + inert) / `contains`. A hit runs GSAP `1 → MENU.pressScale → 1` (`springEase` return) then fires `onPress`; callbacks pre-bound |
| Slider.js | range control — track + gold fill + knob + right value label. `constructor(events, {min,max,step}, onChange)`. Grabs a gesture beginning on its hit-rect (`INPUT_DRAG_START/MOVE/END`) + an `INPUT_TAP` on the track; value `quantise`d to `step` (float dust trimmed, one decimal when `step < 1`) |
| Toggle.js | on/off pill — rounded track (olive `confirm` when on) + knob GSAP-sliding between ends. `constructor(events, onChange)` |
| SegmentedControl.js | (S22C) N-way enum picker — evenly-split rounded segments, the selected one filled olive, spanning `MENU.settings.controlColPx`. `constructor(events, options, onChange)`. Used for `graphicsQuality` |

### src/ui/ — the loading screen  (Sessions 22B; `LAYERS.OVERLAY`, `MENU` config)

| File | Purpose |
|---|---|
| ScreenDraw.js | pure builders (the `OrderDraw` pattern): `buildBackdrop` (solid `MENU.color.backdrop`), `buildGlow` (soft centre-glow ellipse — a fake vignette), `buildBar` (rounded progress bar). No state |
| LoadingDraw.js | pure helpers for LoadingScreen: `makeText` (centre-anchored Text), `barWidth(screen)`, `layoutLoading(refs, screen, targetFrac)` (re-anchors bg/glow/title/track/fill/percent/tip/begin). Split for the 150-line cap |
| LoadingScreen.js | dark ground + gold `MENU.title`, a progress bar fed by `LOADING_PROGRESS {frac}` (GSAP-tweened `fill.scale.x`, live "NN%" label), a `LOADING_TIPS` line cross-fading every `MENU.loading.tipRotateMs`. At frac ≥ 1: bar turns full-gold + a pulsing "TAP TO BEGIN"; an `INPUT_TAP` then emits `LOADING_DISMISSED` (once, guarded). `update(dt)` = tip timer only |

### src/onslaught/ — the Onslaught alliance base-defense event  (post-audit rebuild, GDD 16)

| File | Purpose |
|---|---|
| OnslaughtDirector.js | loop system, owned by `WorldScene`, DORMANT until `start(levelId)` (`window.onslaught` dev handle). Runs `ONSLAUGHT_WAVE_COUNT` (10) escalating Legion waves at the player's base. `spawnWave` → `resolveWave` groups via `unitRoster.makeUnit` (`entity.onslaughtRaider = true`, level `powerScalar` applied, marched at the compound). Owns a `BaseHealth`, ticked while active + reset on `start`. Emits `ONSLAUGHT_STARTED` / `WAVE_INCOMING` / `WAVE_CLEARED` / `ENDED {wavesCleared, fullClear, score}`. **Win** = wave 10 cleared; **loss** = base HP hits 0 (`get baseHp`) |
| OnslaughtState.js | plain data — `phase` (`ONSLAUGHT_PHASE`: idle / incoming / fighting / pause / ended), `levelId`, `waveNumber`, `timerMs`, `wavesCleared`, `outcome`, live raider id set. Mirrors the old `SkirmishState` |
| BaseHealth.js | the base's HP for a run (GDD 16). `update(dt)` counts live enemies inside the compound (`furyZone.inBase`) → siege at `siegeDpsPerRaider` each; a clear footprint for `regenDelayMs` heals at `regenPerSec`. Emits `ONSLAUGHT_BASE_HP {hp,maxHp,frac}` on each rounded-% change. `get depleted` → `onslaughtStep` ends the run. Config `ONSLAUGHT.baseHp` (flat across difficulty in v1) |
| onslaughtStep.js | pure — `stepPhase(d, dtMs)` (the phase machine, works through the director), `retargetRaiders(d)` (every FIGHTING tick: give each targetless raider the nearest live defender + re-issue a march toward one that walked out of range — the first raider shot trips Field Fury and the fight escalates), `composeText(groups)` for the HUD banner |
| onslaughtSpawn.js | pure — `spawnWaveUnits(d, wave)`: mounts each raider `approachTiles` **south** of the base (the gate side), `applyPower(e, s)` (× hp / dmg / pen / armor / soldierHp), `moveTo` the converge point (run through `field.nearestOpen` so the blocked compound can't strand them). `AIManager` skips raiders (`entity.onslaughtRaider`) — the director drives them |

### src/ui/ — persistent base  (Session 25; world-space placeholder render — LIVE, owned by `worldmap/BaseSite`)

| File | Purpose |
|---|---|
| BaseDraw.js | (S52 rewrite — was hex; S54: floating labels removed) pure builders + diamond-projected square-grid math (`utils/SquareGrid.js`): `cellToPx(cx,cy)` = `cellCentreToPx` at `BASE.grid.cellPx`, `compoundCentreLocal` (→ 0,0), `buildPlatform(g,hqLevel)` (diamond shadow/pad/berm via `plotCorners` + interior lattice via `gridLineSegments`, wall N→E→S→W with the gate cut into the E→S edge — lower-right, matching the buildings' own camera facing, not due south). `makeCellLabel` (a per-building floating name caption) **deleted S54** — no building shows a floating name anymore; a building's name/level only ever appear in `BuildingHexMenu` on tap. No state |
| BaseGridView.js | loop-system view: the compound `_platform` Graphics on `LAYERS.TERRAIN` + a `_buildRoot` Container on `LAYERS.GROUND_UNITS`, both at the `enable(originX,originY,hqLevel)` origin (`WORLDMAP.baseCentre`), drawn at the current level-stage plot size (`BaseGridConfig.plotCells`) — static at boot, live re-growth on level-up not wired (see `BaseGridConfig.js`). Every building EXCEPT `headquarters` and `defence_wall` (perimeter, not a grid cell — both skipped by id) is a **`BuildingSprite`** in a per-building `box` Container sized/positioned from its own `BaseGridConfig.FOOTPRINT`. `setBlend(t)` is a **pure crossfade** — only alpha moves, no whole-compound rescale — same staggered-reveal behaviour as before. `buildingAt(wx,wy)` (S49, S52 rewrite) — inverse-projects the tap via `pxToCellCentre` into grid-unit space, then a per-building footprint half-extent check (no more px-radius math), composed by `BaseSite.buildingAt` into `BuildingContext`'s tap-to-open-panel flow. `update(dt)` ticks every sprite (skipped while the build root is not renderable) |
| base/BuildingSprite.js | one building's view (GDD 24) for every building EXCEPT `headquarters`, which moved to `Base3DLayer`/`HqView` entirely in S54 (this file no longer renders the HQ at all — `BaseGridView` skips it by id, same as it always skipped `defence_wall`). Owns `level` / `state` / `variant`; renders through a `BuildingPlaceholder` + `BuildingFx` by default, but if `BuildingArtConfig` ships an `art.sprite` for the id, `_loadSprite()` async `Assets.load`s it and swaps it in ahead of the placeholder (which hides; FX stays layered on top) — same API either way. **S53 fix (still load-bearing for the remaining 2D buildings):** sprite width + ground-contact position are computed purely from `BaseGridConfig.footprintOf(id)` via `SquareGrid.footprintFrontAnchor(w,h,cellPx)` — NOT from any hand-picked value — so the art fills exactly its allocated footprint, edge to edge. Runtime math alone doesn't fix visual fit if the source PNG's own ground pad is an organic blob (a TRELLIS mesh-reconstruction limitation, not a scaling bug) — that needs the mesh-level ground-rectangle trim technique in `assets/buildings/hq/levels01-06/README.md` (applied to the HQ's `main_tent.glb` in S53, before it later became the live 3D model). Real 2D-sprite art today: `treasury`, `steelworks`, `crude_oil`, `barracks` (pre-guardrails art, SUPERSEDED per GDD 24, still need the ground-rectangle trim, not yet rebuilt or converted to 3D). `setLevel` → tier silhouette, `setState` (idle / working / upgrading …) → animation + FX intensity, `update(dt)` advances it, `get tier` (S52: was `get band`) |
| base/BuildingPlaceholder.js | the procedural stand-in until an atlas ships: a faux-3D **rectangular** block (S52: was a hex block) sized from the building's own `BaseGridConfig.footprintOf(id)` × `BuildingArtConfig.tierScale(tierOf(level))` (S52: was `PLH.bandScale` — a 4-step lookup; now a smooth lerp across the 12-tier ladder), plus **one signature moving part** per building — `radar` sweep / `pump` nod / `crane` slide on rails / `doors` shutter cycle — animated in `update(dt)` from `BuildingArtConfig` timings. Barracks tint from `DynamicBarracks` |
| base/BuildingFx.js | the procedural FX layer: a soft **additive glow** that pulses with state + rising **smoke puffs** from each chimney anchor (fixed pool, alloc-free steady state). `setState` scales glow alpha + puff rate (idle wisp → working plume). Self-contained — no combat ParticleSystem |
| TroopDraw.js | pure builders for the placeholder garrison tokens (`BaseTroops`): `buildInfantry` (dot huddle), `buildTank` (hull + turret + barrel), `buildArty` (body + long barrel), `buildPipCluster` (tight dot grid). Each → a fresh Graphics at (0,0). No state |
| MarkerDraw.js | pure `buildCompoundIcon(g, spec)` — the shared zoomed-out **low-iso fort** placeholder: a squashed-hex earth plate + a raised wall (`wallFace` fills the vertical faces on the 3 front edges, with a gate gap) + 6 corner towers + a keep + 2 outbuildings (`raisedBlock` = shadow face + lit top face). Sized from `WORLDMAP.plot` — used by `PlotMarker` (neighbour bases, brown wall) only now; the player's own base uses the real HQ art (`HqView`) at every zoom instead. No state |

### src/world/ — the hex grid + pathfinding  (Session 4; hex A* Session 19; square-arena gen deleted in the post-audit rebuild)

| File | Purpose |
|---|---|
| PriorityQueue.js | binary min-heap keyed by numeric priority — `push(item,priority)` / `pop()` (lowest) / `size`. Purpose-built for Pathfinder's A* open set; steady-state pop/push don't allocate. No PixiJS |
| Pathfinder.js | `findPath(field, sx, sy, gx, gy)` — **6-neighbour HEX A*** over `grid` (`HEX_DIRS`) / `TerrainTile.movementCost` (Infinity = impassable), `axialDistance`×min-step heuristic (admissible + consistent). World-px in → world-px waypoint array out (hex centres via `grid.axialToPixel`, collinear runs stripped, last point pinned to the exact goal) or **null** when the goal hex is unreachable / off-map. Pure, no PixiJS; called ONCE per move order (event-time), never from `update(dt)`. Static terrain only |
| TerrainTile.js | one hex. Carries its axial `q,r`; pulls `passable / speedMult / cover / blocksGround` from `TERRAIN_TYPES`; adds `blocked` + `feature`, `sprite` (reserved). `get movementCost` (Infinity when blocked/impassable), `setType` re-pulls type fields. No PixiJS |
| TerrainGrid.js | hex TerrainTiles in a `Map` keyed by `Hex.axialKey`, for the axial rectangle `cols`×`rows` (per-column r-window offset by `Hex.rOffset`). `fill` / `inBounds(q,r)` / `tileAt(q,r)` / `setType(q,r)` / `forEach` + `axialToPixel`/`pixelToAxial` (carry `size`) + `widthPx`/`heightPx`. Pure data. Wrapped by `worldmap/WorldField` |
| DecalField.js | Live pooled ground marks, craters and scorch on DECALS. 1,200 Graphics, oldest recycled at capacity. `addGroundMark(type,corners)` copies coordinates into a Pixi polygon; `WorldField` forwards the sink alongside existing `addDecal`. |

### src/entities/ — field units  (Sessions 5-8; **LIVE** on the world map via `worldmap/unitRoster.js`; placeholder rects)

| File | Purpose |
|---|---|
| Entity.js | base field object, NO PixiJS. id/team/faction/cls/x/y/rotation, hp/maxHp/def/armor, speed (px/s), `moveSpeedMult` (transient scalar — AI patrol/retreat; FORWARD Fury meter), `turnRateRadPerSec` (body pivot rate — `cfg.turnRateDegPerSec ?? VEHICLE.entityTurnDegPerSec`), sightRangePx, `bodyScale`, `nonCombat`, isAlive, target, moveTarget, `_path`/`_pathIdx` (Pathfinder route, owned by entityMotion.js), `stance` (`STANCE` = CALM / FIELD_FURY / BASE_FURY), `lastAttackerId`, `selected`. `update` = timers + `_stepMovement` → **`pivotAndDrive`** (rotate-in-place toward the travel bearing, then drive straight; follows the stored route waypoint-by-waypoint). `moveTo(x,y)` → **`resolvePath`** (terrain-aware Pathfinder route, straight-line fallback with no battlefield, stays put if unreachable); `stop`/`die` → `clearRoute`. `setTarget`/`clearTarget`, `takeDamage(final,type,src)`, `die()` (emit `ENTITY_DIED`), `facingOf(src)`, `getDistanceTo` |
| entityMotion.js | pure shared movement step for non-tank entities (Gather Truck, limbered DeployableWeapon, RocketLauncher, InfantrySquad centroid). `resolvePath(e,x,y)` (moveTo backend — A* around impassable terrain), `pivotAndDrive(e,dt)` (per-tick pivot-then-drive, alloc-free; the drive step scales by the current tile's `speedMult` — forest / hills slow every unit, matching `TankMotor`), `arriveAtWaypoint(e)` / `clearRoute(e)` (path progression, also reused by TankMotor). **`blockedStep(e,stepMag,dtMs)`** — a blocked forward step no longer stops the unit dead: it slides one full step along a passable cardinal axis toward the current waypoint AND (throttled by `VEHICLE.repathCooldownMs`, never per frame) re-runs A* to the route goal so the unit routes around the obstruction instead of grinding it. `clearRoute` only when it can neither slide nor find any route. Shared by `pivotAndDrive` + `TankMotor`. No PixiJS |
| GatherTruck.js | `extends Entity` — the in-game "Armored Car": one non-combat hauler, 3 cosmetic faction skins (`TRUCK_SKINS`). Resolves `hp/def/spd` from `GATHER_TRUCK.gather_truck` at `{tier:3, level:1}`, `sightRangePx = TRUCK.sightRangeTiles·TILE_SIZE`, `nonCombat: true`, `bodyScale 0.7`. Stores `skinName` + `hullTint` (EntityView reads the tint) + FORWARD `carryCapacity`/`gatherPerSecond`. No turret / fire — Entity's move is the whole behaviour |
| EntityView.js | the distributed placeholder Graphics for ONE entity, synced each frame. shadow on SHADOWS; body `Container` (hull + turret `Container` {box+barrel+flash}) on VEHICLES scaled by `entity.bodyScale`; `HealthBar` on WORLD_UI. **A `nonCombat` entity gets NO turret** — shadow + hull + bar only, hull fill from `entity.hullTint ?? body.hull`. `sync(e,dt)` positions/rotates, (turret rotation / barrel recoil / muzzle-flash only when `this._turret`), unchanged living-unit colors, then `bar.setPosition/setSelected/setFraction/tick(dt)`. On death: recolour + fade over `ENTITY.wreck.fadeMs`, then `wreckDone` |
| HealthBar.js | one world-space bar `Graphics`, **stateful + ticked**. `setFraction(f)` drops `_real` instantly + seeds a trailing white `_ghost` (`ghost.delayMs` hold → `ghost.catchUpMs` slide); `setSelected` / `setPosition` / `setHidden`. `tick(dt)` advances the ghost + crit phase, `_redraw()` = bg → ghost slice → fill (olive ≥ midFrac / gold / orange) → `segments-1` divider ticks → `hideAtFull` visibility + sub-`critical.belowFrac` alpha pulse |
| EntityManager.js | unit registry + loop system + OrderController unit source + first ORDER_* consumer + the projectile-vs-entity query. `add`/`remove`/`get`/`forEach`/`clear`; `update(dt)` updates live entities then syncs views, sweeps a dead view after `wreckDone`. `unitAt(wx,wy)` → a **live handle** `{id,x,y,isOwn,rotation,noTurret}` (x/y/rotation tracked each tick). `firstHitAlong(x0,y0,x1,y1,q)` → nearest live entity within `q.radiusPx · entity.bodyScale` of the swept segment (bigger tank = bigger target), earliest first, `q.excludeId` skipped (alloc-free, reused `q`). `forEachWithin(x,y,r,cb)` for splash. `baseAnchor()` → player spawn centre. `enable(events)` wires ORDER_MOVE→**`field.nearestOpen`-snapped** moveTo + clearTarget (a drop on a building / base lands at its edge, not inside), ORDER_ATTACK→setTarget (CALM gate; **skipped for `nonCombat` units**), ORDER_HOLD→stop, ORDER_RECALL→moveTo(base) |
| tanks/tankConfig.js | pure `tankConfigFromRow(key, base, spawn)` → the `BaseTank` cfg. Resolves `hp/dmg/def/pen/rof/rng/spd` + per-facing `armor` via `resolveStat` at `{tier:4, level:1}`, `·TILE_SIZE` conversions, `noTurret: base.noTurret ?? false`, `TANKS_TUNING[key]` (turn rates, sight, `camoSightMult`), `furyChargePerSec` from `CLASS_TRAITS[cls]`. The one place row → tank happens |
| tanks/BaseTank.js | `extends Entity`; composes `TankMotor` + `TankTurret`. Adds `turretAngle`, `reloadRemaining`, `muzzleFlashRemaining`, `recoilOffsetPx`, `aoe`, `noTurret`, `camoSightMult` + `furyChargePerSec` (FORWARD), `lookAngle` (AI IDLE sweep), `aimPoint` (AI scatter aim point), `_hullReleased` (sequential-move latch). `update` order = drop dead target → tick timers → **turret first** → compute `hullFree` (a move order with no combat target freezes the hull until `_turret.isFrontAligned(turretFrontLockDeg)` reads true ONCE, then `_hullReleased` latches so the drive isn't choppy; re-armed when the move ends) → `_motor.update(dt, this, hullFree)` → `_tryFire`. `fire()` emits the enriched `COMBAT_SHOT` from a reused scratch. Field Fury trips in `FuryManager`, not here |
| tanks/TankMotor.js | pure. `update(dt, tank, hullFree)`. `_desiredHeading` = face a move target; else face an attack target only while chasing it into range OR always if `noTurret`; a turreted tank in range **holds its heading**. Steers (via `rotateToward`) only while `hullFree`; ramps speed + `_advance`s only once **aligned** (`_aligned` — hull within `VEHICLE.headingAlignDeg` of the heading) AND `hullFree` — so the tank pivots in place first, then drives straight. `_checkArrival` → `arriveAtWaypoint` (drives through interior route waypoints, brakes only near the final goal); an impassable step → `blockedStep` (slide toward the waypoint / throttled re-path — keeps momentum, no permanent stop) |
| tanks/TankTurret.js | pure. Turn rate > 0: `rotateToward(turretAngle, bearing, rate·dt)` — bearing = the target, else `tank.lookAngle` (AI IDLE sweep), else the hull. Turn rate **== 0** (noTurret): snap `turretAngle` to `tank.rotation`. `_error` drives `isOnTarget`. `isFrontAligned(tank, tolDeg)` — barrel within `tolDeg` of the hull's forward axis (the sequential-move gate; independent of `_bearing`, trivially true for a fixed barrel). Recoil phase → `recoilOffsetPx` |
| tanks/{PanzerIV,TigerI,Maus,Jagdpanther, M24Chaffee,M4Sherman,M26Pershing,M18Hellcat, T34_85,IS2,SU100}.js | 11 ~15-line `BaseTank` subclasses (Germany 4 / USA 4 / Russia 3), each `super(tankConfigFromRow(KEY, TABLE[KEY], spawn))` — `TABLE` = `TANKS` / `UNIQUE` / `TANK_HUNTERS`; `noTurret` (Jagdpanther, Hellcat, SU-100) flows from the row. No behaviour code |

### src/entities/infantry/ — the squad composite  (Session 12; placeholder circles)

| File | Purpose |
|---|---|
| Soldier.js | plain data (no PixiJS), ~20 lines: `id`, live `x/y`, fixed formation `slotX/slotY` (offset from centroid, pre-rotation), `hp/maxHp`, `isAlive`, `fireCooldown`. The squad creates `count` of these once and never allocates more |
| squadConfig.js | pure `squadConfigFromRow(key, base, spawn)` → the `InfantrySquad` cfg. Resolves `hp/dmg/def/rof/rng/spd` via `resolveStat` at `{tier: base.star, level: 1}` (INFANTRY rows carry `star` 4 / 4.5 / 5 — the 5★ tier gets its `STAR_MULTIPLIER`, unlike the always-4★ tank rows), `rng/spd ·TILE_SIZE`, `sightRangePx` from `SQUAD.sightRangeTiles`, `count = spawn.count ?? SQUAD.defaultCount`. The parallel of `tankConfig.js` |
| InfantrySquad.js | `extends Entity` — the infantry-only COMPOSITE. `super({...cfg, hp: count·soldierHp})`; builds `this.soldiers` on a `SQUAD.formation.cols`-wide grid centred on the spawn (+ jitter), each `fireCooldown` seeded random so the first shots stagger. `update` = drop dead target → `super.update` (centroid pivot-then-drive along the path) → `_updateHeading(dt)` (slew to face a live target via `rotateToward`, but yields while `this.moveTarget` is set) → `_followStep` (each living soldier independently eases to its heading-rotated slot, records its own travel bearing, and advances its distance-driven walk phase) → `_faceStep` (faces travel while moving, squad heading when settled) → `_fireStep`. `takeDamage` culls living soldiers one-by-one. Zero alloc in `update` |
| InfantrySquadView.js / SquadBodies3D.js / SoldierBody3D.js | 2D fallback remains one circle + shadow per soldier. When `UNIT_3D` is present, the view mounts one independent `SoldierBody3D` per soldier; each body owns its root transform and two leg pivots, is reprojected at render cadence, and returns legs to rest when its soldier settles. Death fade remains per slot with one aggregate health bar |
| {Kar98kSquad,Gewehr43Squad,Stg44Squad, SpringfieldSquad,M1GarandSquad,M2CarbineSquad, MosinSquad,MosinCarbineSquad,Svt40Squad}.js | 9 ~15-line `InfantrySquad` subclasses (3 weapon tiers × 3 factions) — `super(squadConfigFromRow(KEY, INFANTRY[KEY], spawn))`. No behaviour code |

### src/entities/artillery/ — the deployable weapons  (Session 13; placeholder rects)

| File | Purpose |
|---|---|
| artilleryConfig.js | pure `artilleryConfigFromRow(key, base, spawn)` → the `DeployableWeapon` cfg. Resolves `hp/dmg/def/rof/rng/spd` via `resolveStat` at `{tier:4, level:1}`; **guards the rows that lack `pen` (→ 0) and `armor` (→ [0,0,0])**; `·TILE_SIZE` for `rangePx` / `minRngPx` / limbered `speedPx`; carries `aoe`, `indirect`, and `shieldFrontMult` (`AT_GUN.shieldFrontMult` for `cls==='atGun'`, else 1). The parallel of `tankConfig.js` |
| DeployableWeapon.js | `extends Entity` — the deploy machine `DEPLOY_STATE` = LIMBERED / DEPLOYING / DEPLOYED / UNDEPLOYING (`CombatConfig.DEPLOY` seconds). `setTarget` from LIMBERED faces + `stop()` + DEPLOYING; `moveTo` while deployed queues `_pendingMove` + UNDEPLOYING (fires the move on reaching LIMBERED). `update` = drop dead target → `_advanceDeploy` → `super.update` **iff LIMBERED** → reload/flash → `_tryFire` **iff DEPLOYED** (alive target, reloaded, `minRngPx ≤ dist ≤ rangePx`, `!indirect` → `±AT_GUN.firingArcDeg` traverse check). `fire()` fills a reused `_shot` from the barrel tip: `indirect` → `±HOWITZER.scatterPx` ground point; direct → `targetX/Y` null. `takeDamage` halves a front-arc hit on a DEPLOYED gun with `shieldFrontMult < 1` |
| DeployableView.js | low hull + barrel on VEHICLES (bodyScale), `DEPLOYABLE.crew.count` decorative crew circles on GROUND_UNITS (shown only DEPLOYING/DEPLOYED, evenly spaced at `orbitPx`), a deploy progress bar on WORLD_UI (fill `scale.x = deployProgress`, shown only DEPLOYING/UNDEPLOYING) + a `HealthBar`. All Graphics built in `mount()`; `sync()` mutates only transforms / visibility / one `scale.x` — no allocation. `wreckDone` / `unmount` mirror `EntityView` |
| {PaK40,M12GMC,ISU152}.js | 3 ~15-line `DeployableWeapon` subclasses — `super(artilleryConfigFromRow(KEY, UNIQUE[KEY], spawn))`. No behaviour code: the AT-gun-vs-howitzer split is `cls` + the `indirect` / `shieldFrontMult` cfg flags |

### src/entities/rocket-artillery/ — the salvo launcher  (Session 14; placeholder rects)

| File | Purpose |
|---|---|
| rocketConfig.js | pure `rocketConfigFromRow(key, base, spawn)` → the `RocketLauncher` cfg. Resolves `hp/def/dmg/rng/spd` via `resolveStat` at `{tier:4, level:1}`; the launcher row has no `armor` / `pen` / `minRng` / `rof` — it carries `salvo` + `reloadSeconds`, passed straight through. Parallel to `artilleryConfig.js` |
| RocketLauncher.js | `extends Entity` — MOBILE, no deploy. `update` = drop dead target → `super.update` (fully mobile) → `_faceTarget` (slew the hull toward the target at `ROCKET.turnRateDegPerSec`, yields while `this.moveTarget` is set) → `_advanceSalvo` → tick reload / backblast. `_advanceSalvo`: idle + live target in `rangePx` + aimed within `VEHICLE.fireArcDeg` + `reloadRemaining ≤ 0` → arm `_salvoRemaining = salvoSize`; then launch one rocket per `ROCKET.salvoStaggerMs` (timer `+=`, not `=`, so an uneven dt can't stretch the salvo), and on the last one set `reloadRemaining = reloadSeconds`. Losing the target mid-salvo calls `_endSalvo` (stop + pay the reload). `_fireRocket` fills ONE reused `_shot` (BaseTank shape + `targetX/targetY`) from the next rack-cell origin, a `±ROCKET.scatterPx` scattered ground aim point, sets `backblastRemaining`, emits a `rocket` `COMBAT_SHOT`. `get salvoRemaining` |
| RocketLauncherView.js | low hull + a rack of `salvoSize` cells + a backblast flash on VEHICLES (bodyScale) + a `HealthBar`. All Graphics built in `mount()`; `sync()` shows `e.salvoRemaining` rack cells (0 while `reloadRemaining > 0`, full when ready), toggles the backblast on `backblastRemaining`, ticks the bar — no allocation. `wreckDone` / `unmount` mirror `EntityView` |
| Katyusha.js | ~15-line `RocketLauncher` subclass — `super(rocketConfigFromRow(KEY, UNIQUE[KEY], spawn))`. The only subclass (Rocket Launcher is a Russia exclusive). No behaviour code |

### src/effects/ — pooled particle FX  (Session 15; placeholder Graphics discs/rings)

| File | Purpose |
|---|---|
| Particle.js | plain-data record (no PixiJS): position / velocity / accel / wind / gravity, `life` + `maxLife` + `delay`, `radius`/`alpha`/`color` start→end ramps, `rotation`, `drawMode` ('disc'\|'ring') + `ringWidthPx`, `blend` ('normal'\|'add'), `ease`. `reset()` zeroes it |
| particleStep.js | pure. `stepParticle(p,dt)` → bool: Euler-integrates, `life -= dt`, then eased (`EASE` = linear \| easeOutCubic) lerp of radius / alpha / channel-wise `lerpColor` (no `delay` branch — removed 15b). `drawParticle(g,p)`: a **ring** `clear()`s + `stroke()`s; a **disc** only `g.scale.set(p.radius)` + `g.tint` + `g.alpha` (its Graphics is a unit circle primed once at spawn), then position / rotation / `blendMode`. `initParticle(p,cfg,pos)` (+ private `initParticleVisual`) copies a stage cfg onto a pooled particle; `pos` is reused `{x,y,vx,vy}` scratch |
| Emitter.js | a continuous source (smoke plume). `step(dt, spawn)` bursts `burstCount` on the first step, then `ratePerSec` via a fractional accumulator, `get done` at `durationMs`. Origin (`point`\|`circle`\|`cone`) + velocity written into module scratch — alloc-free |
| ParticleSystem.js | loop system. `enable()` pre-allocates `PARTICLES.poolSize` (500) `{Particle, Graphics}` entries on `PARTICLES_LOW` / `PARTICLES_HIGH`. `emitBurst(cfg,x,y,count,layer)` (random dir/speed per particle) + `addEmitter(cfg)` (≤ `PARTICLES.maxEmitters` 24) draw from the free list; `_spawn` honours `PARTICLES.onFull` ('skip') when dry and primes the slot's Graphics ONCE (disc = unit `circle().fill(white)`; ring = `clear()`). `update(dt)` steps emitters (drops `done`) then particles — `drawParticle` the live, `_release` the dead (unparent + reset the shared Graphics to scale 1 / white / alpha 1 + `p.reset()` + back to free), compact in place. `activeCount` / `emitterCount` getters; `clear()` / `destroy()`. Zero allocation in `update` |
| Explosion.js | pure `spawnExplosion(fx, x, y, presetKey, withShake=true)` — `presetKey` ∈ small\|medium\|large\|massive; `size = EXPLOSION.presets[presetKey]` scales the 5 particle stages (flash disc · additive fireball yellow→red · `easeOutCubic` shockwave ring · gravity debris on `PARTICLES_LOW` · rising smoke `Emitter` when `size ≥ smoke.minSize`) + `fx.screenFlash` when `size ≥ screenFlash.minSize` (massive only) + `fx.battlefield.addDecal('scorch', …)` + (`withShake`) `fx.camera.shake(EXPLOSION.shake[presetKey].i, 0, .type)` — verbatim, no `× size` (impact ≤ medium / rumble ≥ large). `explosion{Small,Medium,Large,Massive}(fx,x,y,ws)` wrappers. Stage cfgs are built here (event-time, never per-frame) |
| EffectsSystem.js | loop system. `constructor(renderer, camera, battlefield, events)`. `enable()` builds + enables a `ParticleSystem`, adds one OVERLAY `Graphics` for the screen flash, subscribes `PROJECTILE_IMPACT` → `spawnExplosion(this, x, y, IMPACT_EXPLOSION[weapon])` (**shake ON — sole impact-shake path**; `bullet` → `null` → nothing) and `ENTITY_DIED` → `spawnExplosion(this, x, y, DEATH_EXPLOSION)` ('medium', shake), and (when `RENDER.devEffects`) binds keys `5/6/7/8` → the four presets at camera centre + sets `window.fx`. `screenFlash(ms)` resizes the OVERLAY rect to `renderer.app.screen`, sets `alpha = screenFlash.fromAlpha`; `update(dt)` runs `particles.update` then fades the flash. Satisfies the `{particles, camera, battlefield, screenFlash}` shape `Explosion` expects |

### src/combat/ — projectiles + impact damage  (Session 6; consumes `combat:shot`)

| File | Purpose |
|---|---|
| DamageResolver.js | pure `resolveDamage(shot, target, splashFactor=1, out)` → the **full `CombatConfig` model**: `raw = dmg × COUNTERS[attackerCls][targetCls] × VS_INFANTRY[attackerCls]` (the last only when the target is infantry), then `× penMult` — armoured target: PEN band by `shot.pen` vs `target.armor[FACING_INDEX[facing]]` (ricochet 0.35 / penetrate 1.0 / overmatch 1.15; a `NO_OVERPEN_CLASSES` attacker or a real counter upgrades a marginal ricochet; `EXPLOSIVE_CLASSES` → `explosiveVsArmour`; an attacker with **no `pen` at all** → `SOFT.smallArmsVsArmour`) — then `× (1 - def/(def+DEF_K)) × splash × (1±DAMAGE_VARIANCE)`, floored at `raw × SOFT.minDamageFrac`. `facing` returned. Reused `out`, no alloc |
| Projectile.js | plain pooled data + `reset()`. `active/weapon/motion`, `x/y` (rendered) vs `baseX/baseY` (pure path) vs `prevX/prevY` (swept-collision), `vx/vy/speedPx`, `origin·/target·`, `heightPx` (arc lift), `elapsedSec`, `dmg/pen/attackerCls/aoePx`, `shooterId/targetId`, `arcT/wobblePhase`. No PixiJS. `attackerCls` threaded from `COMBAT_SHOT` (set by every shooter) → `ProjectileSystem._configure` → `DamageResolver` |
| ProjectileMotion.js | pure `step(proj, dt)` → true at impact. `straight` (base += v·dt), `wobble` (+ lateral `sin(phase)·wobbleAmpPx` ⟂ velocity), `arc` (lerp origin→locked impact by `arcT`, `heightPx = sin(arcT·π)·arcApexPx`). Sets `prevX/prevY` each call |
| ProjectileView.js | pooled Graphics: body tracers on PROJECTILES (`tracerEveryN` blink; `acquireBody` draws a rect or, for `shape:'oval'`, an ellipse, and sets `blendMode` from `blendAdd`), additive impact flashes on PARTICLES_HIGH (fade over `impactFlash.ms`), arc ground shadows on SHADOWS. `acquireBody/releaseBody/syncBody`, `acquireShadow/releaseShadow/syncShadow`, `flashAt`, `update(dt)`, `clear`/`destroy`. All pre-allocated in `enable(renderer)`. **Trails moved to ParticleSystem (S16) — no `emitTrail`, no `TrailField`.** |
| VehicleDust.js | Live WorldCombat system: existing per-vehicle dust puffs plus GroundTrails updates for all living units. Histories pruned when units disappear. |
| GroundTrails.js / TrailProjection.js | Distance/angle-sampled pairs of contact quads, model-aware isometric projection, per-soldier alternating footprints; teleport reset and dead-unit pruning. |
| ProjectileImpact.js | `constructor(events, entityManager, view)` (no `camera` — 15b). `resolve(proj, hitEntity)` → `DamageResolver` + `Entity.takeDamage`, splash over `aoePx` via `forEachWithin` (`1-(1-SPLASH.edgeFalloff)·d/aoePx`), `view.flashAt`, `PROJECTILE_IMPACT` emit. NO camera shake — EffectsSystem owns impact shake now. Reused scratch objects; split out of ProjectileSystem for the line cap |
| ProjectileSystem.js | loop system. `constructor(events, renderer, entityManager, battlefield)` (no `camera` — 15b). `enable()` → `view.enable`, `ObjectPool<Projectile>(PROJECTILE.poolSize)`, subscribe `COMBAT_SHOT`. `_spawn` acquires + aims a Projectile. `_aimAt`: an explicit numeric `shot.targetX` (indirect fire / scatter) wins; else straight/wobble chase the live target's pos, arc locks it, else the `angle` fallback. `update(dt)` steps each, tests `firstHitAlong` → terrain `!isPassable` → reached aim → lifetime, hands hits to `ProjectileImpact`, compacts the active list in place (zero alloc). `activeCount` / `poolTotal` getters (window.ps) |

### src/ai/ — enemy unit AI  (Session 17; no PixiJS, alloc-free per tick)

| File | Purpose |
|---|---|
| aiState.js | `AI_STATE` enum (`IDLE`/`PATROL`/`ALERT`/`ENGAGE`/`RETREAT`), its own file so controller + states + manager + UI share it with no import cycle |
| Behaviors.js | pure stateless helpers, caller passes a reused `out`. `pickTarget(self,candidates,out)` — strict tiers: last attacker (`selfDefense` 1000) > any in-range (`inRange` 100 + `proximity` 50·(1−d/range)) > capped threat; skips dead/self/same-team (alliance immunity). `desiredPosition(self,target,out)` — per `AI.movement.byClass[cls].profile`: advance / flank (±`flankDeg`) / strafe (±`strafeDeg`) / ambushCover / coverAdvance / deployAtRange (hold once in range) / maxRangeSalvoRetreat (kite to `retreatFrac`). `aimScatter(self,target,out)` — cone `baseDeg + (moving?movingDeg) + perHundredPxPastHalfRangeDeg·steps` → a scattered world aim point |
| AIStates.js | the per-state behaviour bodies (`idle`/`patrol`/`alert`/`engage`/`retreat` + `sweepTurret`/`scan`), split from AIController for the line cap; each takes the controller `c` and works through `c.entity` / `c.goTo` / `c.enter`. `engage` (re)acquires via `pickTarget`, positions via `desiredPosition`, writes `entity.aimPoint` via `aimScatter` — it NEVER fires |
| AIController.js | per-enemy-unit state machine skeleton. `constructor(entity,battlefield,events)`, `setWaypoints`, `update(dt,players)`. `_gate()` each tick: hp/maxHp < `AI.RETREAT.hpFrac` → RETREAT (sticky until dead/home); `entity.stance === FIELD_FURY` ⇄ ENGAGE. `enter(next)` sets `entity.moveSpeedMult` from `SPEED_MULT`, stops/clears target/aimPoint/lookAngle, resets `_dest` (a new state re-issues its own route), emits `AI_STATE_CHANGED`. **`goTo(x,y)` now resolves a terrain-aware A* route** (`resolvePath`) so patrol / engage / retreat route AROUND buildings, trees and water instead of stalling on the straight line; A* re-runs only when the destination shifts past `AI.movement.repathMinDeltaPx` or the route is spent (`!e._path`), so steady following stays alloc-free. Straight fallback with no battlefield. Movement + posture ONLY (CALM rule) |
| AIManager.js | loop system mirroring EntityManager. `constructor(entityManager,battlefield)`, `enable(events)`, `update(dt)`, `disable(events)`, `setPatrol(waypoints)`. Holds one AIController per live enemy row that has a `rangePx` (`_syncControllers` add/sweep via a reused `_seen` Set + id list); refills a reused `_players` list each tick and ticks every controller. Unit-to-unit spacing moved out to the shared `systems/Separation.js` (all teams). Registered via `loop.addSystem()` |

### src/systems/ — cross-cutting sim systems  (Sessions 17-18, 22A / 22C, 25)

| File | Purpose |
|---|---|
| BaseManager.js | (live, owned by `worldmap/BaseSite`) loop system, no PixiJS — the persistent home base (GDD 04). Owns the **square** placement grid (S52: was hex) + building instances `{id,level,cx,cy,isActive,produces?,variant?}` (cell-unit centre offsets — was axial `q,r`). `enable()` seeds `BASE.STARTING_LAYOUT` (headquarters first — it gates every level), warning loudly (non-fatal `console.error`) if a seed entry fails `BaseGridConfig.isGridAligned` (S54), then emits `BUILDING_PLACED {id,cx,cy,level}`. `place(id,cx,cy)` — the runtime "build a new building" path, fully implemented but not yet called from anywhere (no UI wired to it) — `_fits` now ALSO hard-rejects a mis-parity `isGridAligned` position (S54) before checking the current plot's bounds via `BaseGridConfig.plotCells(hqLevel)` + no overlap with another building's own footprint, both pure grid-unit checks via `utils/SquareGrid.js`; `BUILDINGS[id].unique` cap, HQ gate. `upgrade(id\|index)` is **instant** (GDD 04, corrected S48) — pays `upgradeCost` (resources + materials, no time) and applies the level via `buildingUpgrade.js`'s preview/complete pair, split out purely to keep this file under 150 lines. `setBarracksProduction(index,cls)` (re-derives the variant via `DynamicBarracks.variantFor`, emits `BARRACKS_TRANSFORMED` — instant + free, GDD 04). Serves `productionByResource(out)` (per-hour, reused scratch) + `summedLevel(key)` + `get hqLevel`. Per-building HP is NOT a field (GDD 04 / 09 whole-base HP). `update(dt)` no-op — nothing here runs on a timer |
| buildingUpgrade.js | pure functions, no class — `previewUpgrade(buildings,hqLevel,ref)` quotes + validates an upgrade (level cap via `effectiveMaxLevel`, cost via `upgradeCost`) without mutating; `completeUpgrade(buildings,events,ref)` applies a level already paid for and emits `BUILDING_UPGRADED {id,level}`. `BaseManager.upgrade` calls both back to back (no timer between them) — the `DynamicBarracks.js` pattern (logic operates on the array it's handed, not a class) |
| ResourceManager.js | (S25) loop system, no PixiJS — Money / Steel / Oil balances + a construction-materials map (`MATERIAL_KEYS`, spent only on upgrades — not a 4th resource). Each `update(dt)` banks fractional per-second income from `BaseManager.productionByResource` (alloc-free); every `RESOURCE_ACCRUAL.tickSeconds` folds whole units into the balances clamped to `storageCap(key, base.summedLevel(key))` (overflow discarded, GDD 07) and emits `RESOURCE_CHANGED {money,steel,oil,materials,rates}`. `canAfford(cost)` / `spend(cost)` over `upgradeCost(...)` output. PvP looting is not modelled (GDD 01 pillar 8 — `RESOURCE_LOOTABLE === false`). Starts from `STARTING_STOCK` |
| DynamicBarracks.js | (S25) pure helpers for the GDD-04 Dynamic Barracks — `variantFor(cls)` / `allowedClasses(variant)` / `label(variant)` / `tint(variant)` off `BUILDINGS.BARRACKS_VARIANTS`. Not a class per building: the live `produces` class + derived `variant` are plain fields on the barracks instance in BaseManager. No production pipeline yet — "can produce tanks" just means the Tank Factory variant reports the tank classes (FORWARD: build queue) |
| SettingsStore.js | (S22A) framework-free player-settings model — NO PixiJS, not a loop system. `constructor(events)` seeds defaults + `load()` (reads `SETTINGS_STORAGE_KEY`, try/catch, merges over defaults, drops unknown keys, never throws). `get(key)` / `all()` snapshot / `set(key,val)` — `coerce`s val against `SETTINGS_SCHEMA` (bool cast / enum whitelist / range clamp + snap-to-step, float dust trimmed), persists in try/catch, emits `SETTINGS_CHANGED {key,value}` on a real change only. `broadcast()` (S22C) re-emits `SETTINGS_CHANGED` for every key so a just-wired consumer pulls current values. Built once in `Game.init()`, handed to consumers |
| haptics.js | (S22C) module-state gate around `navigator.vibrate` — no PixiJS. `setHapticsEnabled(bool)` (driven by the `vibration` setting via `Game._applySetting`), `hapticsEnabled()`, `vibrate(ms?)` (FORWARD hook — nothing calls it yet; no-ops when disabled / unsupported, try/catch) |
| PersonnelManager.js | (live, owned by `worldmap/BaseSite`, injected into `BaseArmy`'s `SquadManager`) loop system — the global reserve personnel pool (GDD 06). `constructor(events, {reservesBarracksLevel?, isInCombat?})` (level = a number or a getter, default 1; `isInCombat` gates refund). `enable()` **re-reads the level and, if the pool is pristine, refills to `CAPACITY[level-1]`** — the pool is built before the base seeds its buildings, so the constructor's level read is stale (1). `consume(n)` → false + `PERSONNEL_DENIED` if short, else debit + `PERSONNEL_CHANGED`. `refund(n)` voluntary dismantle (no-op + warn while `isInCombat()`). `deduct(n)` combat death — never refunded. `update(dt)` banks dt, every `REGEN_TICK_SECONDS` adds `regenPerTick(level)` toward max; raises max (keeps current) when the injected level rises. `getRegenPerTick()` |
| DeployedSquad.js | plain data (no PixiJS) — one deployed group: `id`, `unitKey`, `cls`, `order`, and a `Map<unitId, UNIT_STATE>`. `add`/`remove`/`stateOf`/`setState` (→ previous state or null) / `get size` (total members, 0 = spent) / `activeCount` / `forEach(cb(unitId,state))`. Distinct from the `InfantrySquad` soldier composite |
| SquadManager.js | (live, owned by `worldmap/BaseArmy`) loop system — manages DeployedSquads (GDD 06). `constructor(events, entityManager, personnelManager)`. `createSquad(unitKey, personnelInvested)` → `squadSize()` members, `consume(n·ENTITY_COST[cls])`, returns `{squadId:'dsq-N', unitIds}` (caller spawns one entity per id) or `{squadId:null}`. `recallUnit(id)` → `RECALLED` + `ORDER_RECALL`; `update(dt)` promotes it to `HEALING` within `SQUAD_LIFECYCLE.arriveRadiusPx` of `baseAnchor`. Recall CATCH (re-entrancy-guarded): an `ORDER_ATTACK` on any member flips every `RECALLED` member → `ACTIVE` + re-issues `ORDER_HOLD`+`ORDER_ATTACK`. `ENTITY_DIED` → `DESTROYED` + `deduct` + `removeUnit`; `removeUnit` drops a squad from the map once its last member is gone (no leak). Emits `SQUAD_UNIT_STATE` on every transition; alloc-free `update` |
| Separation.js | loop system (owned by `WorldCombat`) — a cheap terrain-guarded boids nudge over **every** live entity (all teams) so no two squads overlap and a squad ordered to a point fans out; `AI.separation` magnitude, O(n²) over the small list, breaks a perfect stack on a fixed axis, never touches the A* route. Replaced `AIManager._separate` (enemy-only) |
| furyZone.js | `inBase(bf, e, side=e.team)` — is an entity standing in a base footprint? Footprint = the team's spawn zone (`Battlefield.isInSpawn`) until real base buildings exist |
| FieldFury.js | the Field Fury aggro state (GDD 02). `onShot(shot)` trips on the first `STANCE.CALM` shot from an out-of-base unit: every field unit of BOTH teams → `STANCE.FIELD_FURY`, targets the initiator (allies take the nearest enemy via `pickTarget`). `update(dt)` retargets any field-fury unit with no valid target (a live already-set target — player drag-aim — is left alone), and clears after `FURY.fieldFuryLingerSeconds` with no field-fury unit holding a target in range. Reused candidate list + bound per-entity arrows — alloc-free |
| BaseFury.js | the Base Fury aggro state (GDD 02), independent of Field Fury. `onDamage(dmg)` trips ONLY when an in-footprint unit is hit: that team's in-base garrison (skips `nonCombat`) → `STANCE.BASE_FURY`, focus-fires the victim's `lastAttackerId`. `update(dt)` re-picks a random remaining in-base attacker when the focus dies/leaves (`FURY.targetSwitchOnClear`), stays active `FURY.baseFuryLingerSeconds` after the footprint clears, then `_end()` stands the garrison down + emits `FURY_BASE_ENDED` |
| FuryManager.js | loop system composing FieldFury + BaseFury. `constructor(entityManager,battlefield,events)`, `enable()` subscribes `COMBAT_SHOT` (stamps each victim's `lastAttackerId`, then `field.onShot`) + `ENTITY_DAMAGED` (`base.onDamage`), `update(dt)` ticks both, `disable()` unsubscribes + resets both. Sets stance + target on entities; never emits `COMBAT_SHOT`. `fieldFuryActive` / `baseFuryActive` getters |

### src/config/ — game constants and tuneables  (POPULATED, all files < 150 lines)
Exempt from the no-magic-numbers rule. Every file carries DRAFT / REVIEW
markers; nothing is balance-final. Import via `src/config/index.js` or the
specific module.

**Done in the post-audit rebuild:** `OnslaughtConfig` (replaces `SkirmishConfig`,
deleted); `HudConfig.WORLD_HUD` (top bar + 6-tab nav + panels + map buttons);
`CombatConfig` `COUNTERS` / PEN bands are now consumed by `DamageResolver`.
**Still pending (per the Warpath GDD):** `AllianceConfig`, `CampaignConfig`,
`LegionConfig`, `EventsConfig`, `ShopConfig`, `VipConfig`; `WorldMapConfig`
sectors + map-object specs.

**Stale fields swept (step 7):** removed `GameConfig.RENDER.dev*` (kept
`devEffects`), `CAMERA.zoomLevels`, `BATTLEFIELD.*` square-arena fields (kept
`hex*`); the whole legacy `HudConfig.HUD` block; `MenuConfig` menu/pause/results
sub-blocks; `OrdersConfig.aiAlert`; `EntityConfig.DEV`; 13 dead `GameEvents`
constants; `GameLoop.setSimPaused`.

| File | Owns |
|---|---|
| GameConfig.js | `TILE_SIZE`, `WORLD`, `BATTLEFIELD` (hex terrain-grid extent — `hexCols/hexRows/hexSize`), `LOOP`, `HQ` (max 35), `LIMITS`; `CAMERA` (default/min/max zoom, pan/follow/move eases, `shake` curves), `RENDER` (`backgroundColor`, `showDebugFps`, `devEffects` keybind, `maxResolution`, FPS bookkeeping), `INPUT` (gesture thresholds) |
| LayerConfig.js | the 13 render layers as a named registry (LAYERS, LAYER_ORDER, WORLD_LAYERS, SCREEN_LAYERS) + (S54) `WORLD_BACK_LAYERS` (SKY..SHADOWS) / `WORLD_FRONT_LAYERS` (GROUND_UNITS..WORLD_UI) — the split `Renderer._buildLayers` uses to distribute layers around the live-3D `buildingsSlot` |
| TerrainConfig.js | `TERRAIN_TYPES` (9: grass/dirt/road/concrete/mud/sand/**forest**/**hills**/water — passable / speedMult / cover / color; forest 0.55× + hills 0.7× per GDD 17), `TERRAIN` (default, move-cost math, `coverReducesHitChance` FORWARD flag), `FEATURES` (tree / building blockers — FORWARD), `DECAL` (`poolSize` 1200 — the ring cap / trail length — + tread/wheel/foot/track/crater/scorch colour+alpha). `TERRAIN_GEN` removed (deleted arena passes) |
| EntityConfig.js | `ENTITY` (hit-reaction, wreck fade, `healthBar` — sizes/colours + `segments`/dividers, `midFrac`/`midColor`, `ghost` {delay,catchUp}, `critical` {belowFrac,pulseHz,minAlpha}, `showWhenSelected`), `VEHICLE` (accel/decel ramps, `fireArcDeg`, `arrivalPx`, S19 `entityTurnDegPerSec` 140 / `headingAlignDeg` 6 / `turretFrontLockDeg` 10 / `repathCooldownMs` 500 (blockedStep re-path throttle), recoil, `dust` cfg driven by `VehicleDust` (contact trails now in `GroundTrailConfig`), placeholder `body` geometry + colours), `TANKS_TUNING` (11 rows: Germany 4 + USA 4 + Russia 3 [t34_85/is2/su100] — hull+turret deg/sec, sight tiles; `turretTurnDegPerSec: 0` = fixed barrel; jagdpanther/m18_hellcat/su100 `camoSightMult` FORWARD), `VEHICLE.body.scaleByClass` (incl. `gatherTruck: 0.7`, `infantry: 1.4`, `howitzer: 1.2`, `atGun: 0.8`, `launcher: 1.15`), `TRUCK` (sight tiles, neutral colour) + `TRUCK_SKINS` (germany/usa/russia name + hull tint), `DEV` (`enemyDummy` + `parade` 'germany'\|'usa'\|'russia', also the truck skin) |
| InfantryConfig.js | `SQUAD` — `defaultCount` (dev spawn; FORWARD `PersonnelConfig.squadSize`), loose `formation`, soldier presentation/death values, per-soldier `moveLerp`/turn-rate jitter, `walkCycle` (`swingDeg`, `stridePx`, `minStepPx`), `fireStagger`, and `sightRangeTiles`. All DRAFT / REVIEW |
| ArtilleryConfig.js | `DEPLOYABLE` (decorative `crew` {count,radiusPx,orbitPx,colours}, `progressBar` sizes/colours, `barrelLenPx` {howitzer,atGun}), `HOWITZER` (`scatterPx` — indirect aim jitter), `AT_GUN` (`firingArcDeg` 45, `shieldFrontMult` 0.5), `ROCKET` (`salvoStaggerMs` 200, `scatterPx` 60, `turnRateDegPerSec` 100, `rack` cell geometry, `backblast` flash, `sightRangeTiles`), `ARTILLERY_TUNING` (per-row `sightRangeTiles`, FORWARD). Setup/teardown + `salvo`/`reloadSeconds` are NOT here — `CombatConfig.DEPLOY` + the UnitStats row. All DRAFT / REVIEW |
| FeedbackConfig.js | `DAMAGE_NUMBERS` — `poolSize`, rise/fall/travel px, `jitterXPx`, `scaleIn` {to,settle,ms}, `fadeMs` {min,max}, `spawnOffsetY`, `style` (font + stroke), `critFrac` (amount/maxHp → crit) + `critPrefix`/`healPrefix` (heal FORWARD), `colors` {normal,crit,playerHit,heal} |
| ProjectileConfig.js | `PROJECTILE` — pool sizes (body 96 / flash 24 / shadow 16), `hitRadiusPx`, `maxLifetimeSec`, `terrainStopsProjectile`, `impactFlash` / `groundShadow` styling, and 4 `archetypes` (shell = bright ADD line + `smokeTrail`; bullet 12×2; rocket-wobble `fireTrail` + `smokeTrail`; howitzer_shell-arc `shape:'oval'` dark + `groundShadow`). `TRAIL` (S16) — `emitEveryFrames` + `fire` / `smoke` particle cfgs emitted through the shared ParticleSystem. `WEAPON_ARCHETYPE_BY_CLASS` maps unit `cls` → archetype |
| EffectsConfig.js | `PARTICLES` (`poolSize` 500 = LIMITS.maxActiveParticles, `maxEmitters` 24, `onFull` 'skip'), `EXPLOSION` (`presets` small/medium/large/massive size scalars; per-stage `flash` / `screenFlash` / `fireball` / `shockwave` / `debris` / `dirt` (S16 tan ground kick) / `smoke` cfgs — counts & radii scale off `size`; `decal` scorch; `shake` per-preset `{i, type}` applied verbatim — retuned 15b to 0.6/0.9/1.2/1.6 now that `× size` is gone), `IMPACT_EXPLOSION` (weapon → preset key, `bullet: null`), `DEATH_EXPLOSION` ('medium'). All DRAFT / REVIEW |
| OrdersConfig.js | `ORDERS` — order-feedback tuneables (DRAFT): selection ring pulse, move arrow, attack line + crosshair, recall dashed line + home marker, drag preview, `aimCone` (noTurret firing wedge), radial menu (3 verb colours, GSAP ease), Graphics pool sizes. Blue (`0x4A90D9`) flagged REVIEW |
| SquadStateConfig.js | `UNIT_STATE` (S18, frozen) — a DeployedSquad member's lifecycle: `ACTIVE` / `RECALLED` / `HEALING` / `DESTROYED` (GDD 06). `SQUAD_LIFECYCLE` (DRAFT) — `arriveRadiusPx` (48, RECALLED→HEALING handoff distance) + FORWARD `hospitalHandoffSeconds` (null until a Hospital system exists) |
| AIConfig.js | `AI` (S17, DRAFT) — `IDLE` (turret `sweepDeg`/`sweepPeriodMs`, `scanIntervalMs`), `PATROL` (`speedMult` 0.70, `waypointArrivePx`), `ALERT` (`recognitionDelayMs` 500, `recooldownMs`), `RETREAT` (`hpFrac` 0.25, `speedMult` 1.0), `targetPriority` (selfDefense/inRange/proximity/threat weights + `threatCap`), `movement` (`default` {profile,idealRangeFrac 0.85}, `flankDeg`/`strafeDeg`/`retreatFrac`, `repathMinDeltaPx` 40 — `goTo` A* re-run threshold, `byClass` profile per cls — heavy/superHeavy advance, medium flank, light strafe@0.80, tankHunter ambushCover, infantry coverAdvance, howitzer/atGun deployAtRange, launcher maxRangeSalvoRetreat), `accuracy` (AI-shot scatter cone: `baseDeg` 3 / `movingDeg` 5 / `perHundredPxPastHalfRangeDeg` 1), `separation` (`radiusPx` 34 / `strengthPx` 6 — local-avoidance nudge) |
| HudConfig.js | `WORLD_HUD` (post-audit, DRAFT) — the persistent world-map HUD: palette, `topBar` (resource keys, Gold/Power/**Pers**/HQ labels, `persWarnFrac` + pers colours, `baseWarnFrac` + base-HP colours, coord throttle), `navBar` (6 tab defs {id, label, lines} + colours), `panel` (scrim/card geometry + slide), `mapButtons` (Home/World sizes + zoom targets), `buildingPanel` (S49 — docked-bar geometry, cost-line labels/separator, slide timing) for `BuildingPanel.js`. Plus `PLACEHOLDER_PORTRAIT` + `UI_UNIT_LABELS` + `unitLabel(cls, faction, team)` / `portraitColor(cls)` helpers. The legacy battle-HUD `HUD` block was deleted in the step-7 sweep |
| BuildingMenuConfig.js | (S51, S54 retune) `BUILDING_ACTIONS` — per-building action lists for `BuildingHexMenu` (`default: [info,upgrade]`, `barracks: [info,upgrade,manage]`; only real, working actions ship, no Research/Tactics placeholders) + `ACTION_LABEL` (text label per action — S54: `ACTION_GLYPH` removed, icons are now `ActionIconDraw.js` shapes, not text glyphs) + `BUILDING_MENU` (hex radius/spacing/**U-shape** drop+vSpread, glass vs gold-`primary` fill/stroke, icon/label/title text style — S54: shrunk `iconPx`/`labelPx`/`titlePx`/`strokePx` to fit the hexagon, GSAP stagger) |
| MenuConfig.js | `MENU` (DRAFT) — the boot `LoadingScreen` (`title`, `color` palette, `loading` geometry, `LOADING_TIPS`) + the reusable `ui/controls/*` widget kit (`button` / `control` / `pressScale` / `springEase` / `segmented` / `panel` / `settings` — the last two for the future in-world Settings overlay + the retained `SettingsScreen`). Menu / pause / results sub-blocks deleted in the step-7 sweep |
| SettingsConfig.js | `SETTINGS_SCHEMA` (S22A, DRAFT) — one def per setting `{key,type('range'\|'enum'\|'bool'),default,label,min/max/step\|options}`: musicVolume / sfxVolume / touchSensitivity / graphicsQuality / vibration / damageNumbers / fpsCounter (**no auto-fire — CALM model**). `SETTINGS_BY_KEY` lookup, `SETTINGS_STORAGE_KEY` (`'blitzmire.settings'`), `GRAPHICS_PRESETS` (Low/Medium/High → `dprCap` / `maxParticles` / `decalPoolFrac`) |
| OnslaughtConfig.js | (post-audit, DRAFT) — the Onslaught alliance base-defense event (GDD 16). `ONSLAUGHT` (pacing + edge-spawn/converge params, boss waves 5/10), `ONSLAUGHT_LEVELS` (5 leader-picked difficulty tiers — `powerScalar` / `countScalar` / `commanderGate` / `rewardMult`), `ONSLAUGHT_EVENT` (alliance scheduling / RSVP / sync-start / grace-join / bracket), `ONSLAUGHT_WAVES` (10-wave table, Level-1 baseline — single-type probe → escalating), `onslaughtLevel(id)` + `resolveWave(levelId, waveNumber)` (applies the level scalers). Replaces `SkirmishConfig` (deleted). FORWARD: 15–20 waves, milestone / leaderboard / event-shop tables |
| ResourceConfig.js | 3 core resources (Money/Steel/Oil), currencies, `MATERIAL_KEYS`, `storageCap(key, summedLevel)`, `RESOURCE_LOOTABLE` (false) |
| BaseConfig.js | (S52 rewrite, DRAFT; S54: dead `fontFamily`/`labelPx`/`labelColor` removed alongside `BaseDraw.makeCellLabel`) — `BASE` for the SQUARE compound (world map stays hex): `grid` (`cellPx` 42, from `BaseGridConfig`), `platform` (wall/gate/nub/berm/shadow colours & sizes — no more `hexR`), `building` (faux-3D **rectangular** block styling — shadow offset, roof inset/lighten/drop, outline, pop/pulse timings), `garrison` (`slots` + `roster` — empty by request as of S50), `army` (`deploySlots` cap + `roster` + muster-ground spacing), `enemy` (Legion camp offset + roster), `labels` (name lookup by id — used for the `BuildingHexMenu` title, e.g. `headquarters: 'Headquarters'`; NOT a floating caption, S54). `STARTING_LAYOUT` — 8 buildings at **cell-unit `(cx,cy)`** centre offsets from the plot centre (S52: was axial `(q,r)`), HQ near-centre first. **S54: every position corrected for `BaseGridConfig.isGridAligned` parity** (was hand-typed against neither the even/odd rule nor grid lines — every building sat a half-cell off the grid on whichever axis had the wrong parity until real 3D meshes made it visible; `BaseManager` now guards this going forward, see its own row). Exports `STARTING_HQ_LEVEL` (3 — the seed level; sizes the boot-time plot before `BaseManager` seeds, since `BaseGridView.enable` must subscribe to placement events first), `STARTING_PLOT_HALF` + `STARTING_GATE_ANCHOR` (derived once from that level; every consumer that used to read `PLATFORM_SPAN_PX`/`platform.hexR` now reads these) |
| BaseGridConfig.js | (S52, split out of BaseConfig.js for the 150-line cap) the base's own square build grid: `CELL_PX` 42, `PLOT_STAGES` — the plot grows every 6 HQ levels, same ~9:11 ratio throughout, 18×22 (L1–5) → 22×26 → 26×30 → 30×34 → 34×38 → 38×42 (L30–35) — `plotCells(hqLevel)` / `plotSizePx` / `plotHalfExtentsAt` / `gateAnchorAt` (the diamond's E→S edge midpoint — muster ground + the world-map obstacle gate wedge both anchor here). `FOOTPRINT` — every building's fixed size in squares (CLAUDE.md "BUILDING VISUAL GUARDRAILS" — both physical size and visual prominence; level TIER scales the art WITHIN it, never changes it): `headquarters` 7×8, `barracks` 4×4, `engineering`/`research_center` 4×3, most mid-tier 3×3, `treasury`/`steelworks`/`crude_oil`/`reserves_barracks`/`black_market` 2×2, `attack_towers` 2×2 (S54: was 1×1 — dwarfed by the wall either side once it moved to a wall-corner position); `defence_wall` has none — it IS the perimeter. `footprintOf(id)` (1×1 fallback). **`isGridAligned(cx,cy,footprint)` (S54)** — grid lines sit at whole integers, so an EVEN footprint dimension must centre on a whole integer and an ODD one on a half-integer (X.5) to span whole cells edge-to-edge; every hand-typed `BaseConfig.STARTING_LAYOUT` position violated this on at least one axis until S54 (invisible on flat sprites/placeholders, visible once real 3D meshes shipped) — `BaseManager` now calls this on every seed entry (loud `console.error`, non-fatal) and inside `_fits` (hard rejection) so `place()` can never accept a mis-parity position either. Re-growing the LIVE plot when HQ crosses a stage boundary mid-session is **NOT wired** — sizing is resolved once from the seeded starting level. FORWARD |
| BuildingArtConfig.js | (GDD 24, DRAFT) — the building visual manifest: `BUILDING_STATE` enum, `tierOf(level)` (S52: was `LEVEL_BANDS`/`bandOf` — a 4-band lookup; now `ceil(level/TIER_LEVELS)` capped at `MAX_TIER` 12, a full remodel every 3 levels) + `TIER_ERAS`/`eraOf(tier)` (the narrative label — 3 tiers per era, improvised/established/reinforced/fortified — now just a label, not a render key), `ANIM` (placeholder spin/pump/crane/door rates, glow pulse, smoke-puff pool timing, reveal / upgrade-pulse ms), `PLH` (placeholder-element geometry) + `tierScale(tier)` (S52: was `PLH.bandScale`'s 4-step lookup — now a smooth lerp 0.55→1.0 across the 12-tier ladder), `ATLAS` (the `bld_<id>__t<NN>__<state>__####` key + path contract — S52: tier number, not band name), and `BUILDING_ART[id]` per building — `tint`, footprint `cells` (legacy field, superseded by `BaseGridConfig.FOOTPRINT` for actual sizing), the signature `element` {kind, at, size}, the `fx` {smoke anchors, glow} recipe, and — for `treasury`, `steelworks`, `crude_oil`, `barracks` (4 of 8 starting buildings; still pre-guardrails art, SUPERSEDED but not yet rebuilt or converted to 3D) — a `sprite: {url}` pointing at a real Vite-imported PNG under `assets/buildings/<id>/` (S53: dropped the per-sprite `anchor`/`widthPx` fields — a building's sprite size/position is derived purely from its `BaseGridConfig.FOOTPRINT`, not hand-picked here; see `BuildingSprite.js`). **`headquarters` deliberately has NO `sprite` entry** (S54) — it's a modular command-tent, S52 rebuild, tier 1 only, but rendered as a LIVE 3D model now (`HqView.js` loads `main_tent.glb` straight into `Base3DLayer`); every building is moving to this same live-3D path. `buildingArt(id)` with a generic fallback |
| WorldMapConfig.js | (DRAFT) — `WORLDMAP` for the single scene: `orientation:'flat'` / `hexSize` 110 / `cols` 100 / `rows` 100 (flat-top hex, `utils/Hex.js` — the world map itself, unrelated to the base's own square grid) + derived `widthPx/heightPx` ≈ 16335×18957, `minZoom` 0.12 / `maxZoom` 2.5 / `startZoom` 1.0 (boot into the base) / `nearZoom` 1.1 (Home) / `farZoom` 0.22 (World), `lod` {`pinBand` [0.34, 0.46] — BaseTroops' garrison-hint crossfade only now, `buildingBand` [0.40, 1.0] — the HQ shrink + wall/building/territory reveal, `hqFarScale` 3.0 (HqView's oversized world-scale at the band's far end), `wallRevealFrac` 0.38, `ringFadeFrac` 0.4, `buildingStart` 0.30 + `buildingSpread` 0.55 (per-building stagger fractions)}, `territoryRadiusPx` (S52: `Math.hypot(STARTING_PLOT_HALF.hw,hh) × 2.3` — a circle circumscribing the square/diamond plot, was `PLATFORM_SPAN_PX/2 × 2.3`) + `territory` dash/gap/width/colour style, `terrain` block (fbm elevation / forest freqs + thresholds + keep-clear radii — consumed by `worldTerrainGen`), `baseHex {q,r}` + `baseCentre` (world px) — S52: `baseSpanPx`/`baseRect` **removed** (dead — the base's own rectangular plot size now lives in `BaseGridConfig.plotSizePx`, level-driven, not a single world-map constant), `obstacles` (`baseBlockFrac` / `baseGateDeg` + `baseGateBearingRad` — S52: `Math.atan2(ISO_RATIO,1)` ≈ 26.57°, the diamond's E→S edge, not due south / `plotBlockPx` / `snapMaxRings` — consumed by `WorldScene._blockObstacles` + `WorldField.nearestOpen`), `neighbourHexes` (4 axial-offset specs — a maxed-out square plot at 38×42 needs more buffer from these than exists today, flagged not fixed), `plot` (neighbour hex-fort icon spec — the player's own base no longer uses one) |
| MaterialsConfig.js | 6 construction materials, tier gates, craft/cost math |
| BuildingConfig.js | all 19 buildings: caps, HQ-gating, per-level effects, cost (`upgradeCost` → money/steel/oil + materials — no time; building upgrades are instant, GDD 04, corrected S48). Real time in this economy belongs to Research (`docs/gdd/12-research.md`, unbuilt) and Engineering-Center material crafting (`MaterialsConfig.materialCraftSeconds`, unbuilt) instead. `BARRACKS_VARIANTS` (militaryBarracks / tankFactory / artilleryFactory — label + tint + queueable `classes`) + `barracksVariantForClass(cls)` (S25) |
| PowerConfig.js | Power score from buildings/troops/research/officers/equipment |
| StarTiers.js | star ladder (3..10, Gold I-II++ live, 8.5+ future), level model |
| ProgressionConfig.js | level-band costs, Assembly recipes, Nation Bonus, disassembly |
| StatResolution.js | the ONE order-of-operations for final troop stats (base → star × level × bonus bucket) |
| unitRoles.js | the balance tuning tables the stat model derives from: `REFERENCE` (a 4★ Medium Tank — the 1.0 on every axis), `MIRROR_TTK_SECONDS` (the single dial — a medium mirror match lasts this long, `REFERENCE.dmg` solves from it), `CLASS_ROLE` (9-class shape: hp/dmg/def/rof/pen multipliers + absolute rng/spd/acc/dodge/armour + flags), `FACTION_DOCTRINE` (Germany/USA/Russia fractional deltas per GDD 03), `INFANTRY_TIER` (bolt→semi→auto: `rofMul` only, DPS-neutral — the tier power gain is `STAR_MULTIPLIER`), `UNIT_OVERRIDE` (5 GDD-03 per-unit callouts). Retune balance here; all 24 units re-derive |
| UnitModel.js | `deriveRow(key, [faction, cls, star])` — the ONE place a base stat is computed: `REFERENCE × CLASS_ROLE × (1 + FACTION_DOCTRINE) ÷ infantry rofMul`, rounded. Solves `REF_DMG` from `MIRROR_TTK_SECONDS` at load. `MODEL_INFO` exposes the anchors for balance read-outs |
| UnitStats.js | base rows (4★/L1) for 24 combat units + Gather Truck, class traits. Rows are **NOT hand-typed** — `INFANTRY` / `TANKS` / `TANK_HUNTERS` / `UNIQUE` are built by `deriveRow` over a `{key: [faction, cls, star]}` `REGISTRY` (groups keep their historical membership for the entity subclasses). `GATHER_TRUCK` stays hand-specified (non-combat) |
| FactionConfig.js | `FACTIONS` (germany/usa/russia — id, name, doctrine, `exclusives`/`lacks` class keys, GDD 03), `FACTION_IDS`, `FACTION_CLASS_COVERAGE` (the GDD 03 "TROOP SUMMARY" table, DERIVED from the rows). Pure queries: `getAvailableUnits(faction)` (sorted combat-unit KEYS from `ALL_COMBAT_UNITS`, Gather Truck excluded), `isUnitAvailable(unitKey, faction)` ('any' = all), `unitClassesFor(faction)` → Set, `nationBonusFor(faction, sameNationBarracks)` (passthrough to `ProgressionConfig.nationBonus` — faction never branches the math). No state, no per-frame work. FORWARD: chosen-faction persistence lives in the future save/meta layer; today's dev source is `DEV.parade` |
| CombatConfig.js | damage pipeline, pen/armour bands, Unit Fury, base defence. `COUNTERS` is GDD 02's chain **verbatim** (every pair SOFT 1.2 unless the GDD marks "(hard)"); `VS_INFANTRY` is the separate anti-infantry-effectiveness-by-attacker-class map (arty 2.0 wipe, AT gun 0.4, no-turret hunter 0.7 — replaces the old arty-vs-infantry COUNTERS rows); `SOFT.smallArmsVsArmour` (0.035) is the flat chip a no-`pen` attacker does to armour so a lone tank isn't swarmed by rifles |
| PersonnelConfig.js | reserve pool L1-35 tables, entity cost, squad size (every unit rendered) |
| OfficerConfig.js | star tiers (L60/80/100), skill unlocks, talents, EXP, bonus math |
| EconomyConfig.js | production seconds, gather, hospital, research pacing, timers. `RESOURCE_ACCRUAL {tickSeconds}` (ResourceManager fold cadence) + `STARTING_STOCK` (money/steel/oil + `materialEach` — S25) |
| ArmoryConfig.js | troop + officer crate rates, pity, drop pool, blueprint fragments |
| PartsConfig.js | part categories, blueprints, components, Modify, conversion store |
| research/ | ResearchModel + 5 trees (Development, Military, Doctrine, Defense, Support) + index |
| equipment/ | EquipmentSlots, EquipmentParts, EquipmentSets, EquipmentModel + index |

### docs/gdd/  — 25 files  (rewritten Session 27 for Warpath parity; +24 S42)
01 pillars+constraints · 02 combat model (on the map) + damage model · 03 units
(9 ground classes) + stat defs · 04 buildings (19, L35) · 05 officers · 06
personnel+squads · 07 economy (5 top-bar resources) · 08 armory · 09 base
states · 10 progression · 11 open items · 12 research · 13 equipment · 14
parts+modify · 15 power rating · **16 Onslaught** (base-defense event) · **17
world map** · **18 base-on-map** (footprint / zoom LOD / expansion) · **19
alliance** · **20 campaign + the Legion (PvE)** · **21 events + season** · **22
VIP + shop (Gold)** · **23 UX + navigation** (no pause) · **24 visual
direction** (the art bible — locked iso frame, level/state grammar, per-building
briefs, atlas contract).

═══════════════════════════════════════════════════════════════
ROADMAP — building toward Warpath parity (Session 27)
═══════════════════════════════════════════════════════════════
Phases, not a strict order; each ends testable. GDD refs in brackets.

**Grid: flat-top HEX** (`utils/Hex.js`, decided + built S28). Axial (q,r) storage,
rectangular layout. `WorldTerrain` draws hex tiles; `WorldField` wraps a
`TerrainGrid`; `Pathfinder` (6-neighbour A*), `entityMotion` (6-direction slide)
and `AIController` all path on it — marches, troops and AI move the same way.
The square-arena generator was deleted in the post-audit rebuild; GDD-17 world
terrain (sectors / roads / nodes) is a fresh hex build (Phase B4).

**Phase A — World-map foundation** (extends the S26 base scene). ✅ hex grid +
rectangular tiled terrain (S28). Next: terrain types / roads / sectors /
coordinates; fog-of-war + Recon; `PlotMarker` → real map objects (other bases,
resource fields, Marauder camps, plunder, outposts) with a tap → target-action
menu; base footprint + expansion plots; base build/rearrange UI. [17, 18]

**Phase B — Army & combat on the map** (the core). ✅ **DONE (post-audit
rebuild).**
- **B1** — `EntityManager` + `OrderController` + `OrderIndicator` + `RadialMenu`
  live in `WorldScene` via `BaseArmy`; `WorldField` (hex `TerrainGrid`) backs
  `Pathfinder`; select / march / attack / long-press-radial all work.
- **B2** — `WorldCombat`: `AIManager` + `FuryManager` + `ProjectileSystem` +
  `EffectsSystem` + `DamageNumbers` live; a static Legion camp. Order-attack →
  close + fire → Field Fury trips → both sides auto-fire → enemy AI ENGAGE →
  damage, deaths, the fight resolves.
- **B3** — the **real entity stack** (`BaseTank`+turret, `InfantrySquad`+soldiers,
  `DeployableWeapon`, `RocketLauncher`) via `unitRoster.makeUnit`, from
  `UnitStats` keys. **`DamageResolver` full model** (counters + pen bands by
  facing). **Base Fury** live (`WorldField` footprint). **Onslaught event**
  (`src/onslaught/`) — 10 escalating Legion waves at the base.
- **B4 (in progress)** — ✅ **base-HP model** (`BaseHealth` — siege drain /
  regen / loss at 0, top-bar readout). ✅ **personnel-gated roster** —
  `PersonnelManager` + `SquadManager` revived and wired into `BaseArmy`: the
  platoon is capped at `BASE.army.deploySlots` (5) + a `BASE.garrison` rings the
  compound, both reserving/freeing personnel; `TopBar` `PERS` readout; pip blob
  = real garrison count. ✅ **`DecalField` wired** — `WorldScene` owns it,
  `WorldField.addDecal` feeds it: shell scorch (`EffectsSystem`) + tank tread
  marks (`VehicleDust`, now also live) on `LAYERS.DECALS`. ✅ **stat model** —
  `UnitStats` rows now derive from `unitRoles.js` (one TTK dial); `COUNTERS`
  realigned to GDD 02; `VS_INFANTRY` + `smallArmsVsArmour` fix the tank↔infantry
  exchange. Next: playtest / retune the anchors + Onslaught difficulty; GDD-17
  map objects (resource fields / Marauder camps / plunder as tappable targets) +
  roads + sectors + fog. [02, 06, 07, 17]

**Phase C — Base systems, real and player-reachable.** ✅ **Building upgrades
are instant** (S48, correcting S47): `BaseManager.upgrade` pays `upgradeCost`
(resources + construction materials, no time) and applies the level in the
same call. Real time in this economy belongs only to Research (12-research:
"cost is Money/Steel/Oil + time") and Engineering-Center material crafting
(`MaterialsConfig.materialCraftSeconds`, already fully speced, no runtime
yet) — never building upgrades. ✅ **Tap-to-upgrade is live** (S49): tapping
any building (HQ included) opens `BuildingPanel` — a GDD-23 "context panel"
docked above the nav bar — showing the next-level cost, with an Upgrade
button wired to `BaseManager.upgrade`; disabled + "MAX LEVEL" once the
building hits the HQ-level cap; live-refreshes its afford-state on
`RESOURCE_CHANGED`; dismisses on tap-outside. `BuildingContext` (owned by
`BaseSite`, the `OrderController`/`BaseArmy` pattern) arbitrates taps so a
building tap never also reads as a march order. Verified end-to-end in-
browser (see SESSION_LOG). Next: the same treatment for barracks Produce /
Info; the material-crafting queue at Engineering Center (the real home for a
timed-job system); production pipeline (Barracks → units, personnel-costed);
Research tree; Hospital healing; Recon Post; Armory / Assembly / Parts /
Modify / Equipment / Officers logic + screens. [04, 05, 08, 12, 13, 14]

**Visual track (parallel).** ✅ Guardrails rewritten (S52 — CLAUDE.md "BUILDING
VISUAL GUARDRAILS" + `docs/gdd/24-visual-direction.md`): saturated palette (the
old desaturated one read "blank"/unattractive on mobile) + a **12-tier ladder**
replacing the old 4-band grammar — a full remodel every 3 levels, with a shared
cross-building "tier kit" table so every building reads as the same
fortification stage at the same level regardless of type. ✅ The base's own
build grid is **square, diamond-projected** (S52 — was a hex platform; the
world map's own hex grid is untouched): `utils/SquareGrid.js` +
`BaseGridConfig.js` — an oblong plot that grows every 6 HQ levels (18×22 at
L1–5 up to 38×42 at L30–35, static at boot, live re-growth on level-up not
wired), every building with a fixed footprint in squares (both size and
visual prominence), diamond-projected (`ISO_RATIO`=sin(30°)) so the plot's
own wall/grid visually faces the same oblique way every pre-rendered building
sprite does — gate on the E→S (lower-right) edge, not due south. Base zoom
LOD (S46 correction) unchanged by this: the compound's footprint still never
independently rescales, and the **HQ itself renders at every zoom** — oversized
far, shrinking in place as the walls solidify and other buildings
stagger-reveal around it (`HqView`) — + a `TerritoryRing` claim radius that
fades out as the walls take over. ✅ **Headquarters tier 1 (levels 1–3)
rebuilt** (S52) under the new guardrails as a **modular kit piece** — one
command tent (radio mast / camo netting / sandbags, no flag/firepit — dropped
as reading too "soldier camp" for a tank-war game), concept→TRELLIS mesh
(`main_tent.glb`). The old grey-bunker HQ art is **deleted**, not just
superseded. `assets/buildings/hq/levels01-06/README.md` has the full packet + a
technique note: a TRELLIS text-reconstruction error (a stencilled "1" baked as
something closer to "7") was fixed by patching the mesh's own embedded
texture atlas directly (`pygltflib`), not by re-running the pipeline. ✅
**S54: every building will be 3D, HQ converted first.** The pre-rendered
sprite step (`<model-viewer>` iso capture) is gone for the HQ — its facing
is no longer "locked at capture time" but passed as a live rotation
(`HQ_FACING_DEG`) to `Base3DLayer.setBuildingModel`, and `main_tent.glb`
itself renders directly via the new `Base3DLayer`/`Renderer`-split
architecture (see the Current Phase summary + Known Issues above for the
compositing/parallax/facing bugs this took to get right). Treasury /
steelworks / crude_oil / barracks are still the **pre-guardrails**,
pre-rendered-sprite art (SUPERSEDED per GDD 24, not yet rebuilt as 2D
guardrails art OR converted to 3D). ✅ **S54 (same session): the 3D
mandate widened from "every building" to the WHOLE GAME** — tanks,
troops, world-map terrain, fog of war, and every other world structure
are all to become live 3D models too, not just buildings. Next, in order:
port the other 4 real-art buildings to live 3D (same
`Base3DLayer.setBuildingModel` pipeline the HQ already proves out); the
remaining 3 placeholder buildings + tiers 2–12; then the much larger
systems — world-map terrain (the natural next system, since it's what
buildings already sit on), tanks + troops (dozens of unit GLBs — a real
asset-pipeline undertaking), fog of war — each needs its own technical
plan before starting given the mobile-perf stakes (CLAUDE.md PERFORMANCE
TARGETS), not a blind conversion. Also still open regardless of the 3D
work: the reusable HQ side-tent piece + composing it with the main tent
into the full tier-1 read; drive building state (idle/working) from real
production; a real Airlift/relocation flow that calls
`territory.findTerritoryConflict` before allowing a placement. [04, 17,
18, 24]

**Phase D — Front end (Warpath UX).** ✅ HUD frame done (`src/ui/hud/`: top
resource bar, 6-tab nav, Home/World buttons). Next: real nav-panel content
(Units / Officers / Store / Campaign / Alliance / More); context panel;
attack-incoming alert; Settings as an in-world overlay; Profile / Mail / Chat /
Bag. [23]

**Phase E — Meta & live systems.** ✅ Onslaught config + director done
(`OnslaughtConfig` + `src/onslaught/`). Next: Onslaught rewards / leaderboard /
alliance bracket; Campaign / Frontier + the Legion; Alliance; Events / Battle
Pass / Season; VIP / Shop. Then `src/network/` (persistence, multiplayer),
`src/audio/`, `assets/`. [16, 19, 20, 21, 22]

**New config files still pending (per the new GDD):** `AllianceConfig`,
`CampaignConfig`, `LegionConfig`, `EventsConfig`, `ShopConfig`, `VipConfig`;
`WorldMapConfig` sectors / object specs.

**Orphan — revive (on disk, not yet wired):** `GatherTruck` (resource
gathering), `ui/controls/*` (widget kit for the real panels), `SettingsScreen`/
`Draw` (the Settings-overlay reference). `PersonnelManager` + `SquadManager` +
`DeployedSquad` were revived Session 39; `DecalField` + `VehicleDust` Session 40.
Live dev console handles: `window.game`, `window.base`, `window.rm`,
`window.onslaught`, `window.army`, `window.sm`.

## Active Systems  (single world map + live battle stack)
- **GameLoop** — fixed 20 Hz sim / interpolated render. Registered systems:
  `Game` + `WorldScene`. `WorldScene.update(dt)` ticks `BaseSite` → `BaseArmy`
  → `OnslaughtDirector` → `WorldCombat` → `Hud`. `Game.update(dt)` runs the
  loader tip timer (while LOADING) + `camera.update`. Tab-hidden → `loop.pause()`;
  no sim-freeze / pause (GDD 23).
- **Boot lifecycle** — `BOOT → LOADING → RUNNING`. `init()` builds `WorldScene`
  (enabled immediately, warming behind the loader) + `LoadingScreen`; `_load()`
  yields rAF frames emitting `LOADING_PROGRESS`, holds in LOADING;
  `LOADING_DISMISSED` (the "TAP TO BEGIN" tap) → `RUNNING`. No screen swap.
- **WorldScene** — the persistent map. `WorldTerrain` batches `Noise.fbm` hex
  tiles; `BaseSite` puts the base at `WORLDMAP.baseCentre` with a **3-stage**
  continuous zoom LOD (FAR marker → MID fort silhouette + troop pips → NEAR full
  animated compound); `PlotMarker`s drop 4 neighbours; `Hud` draws the GDD-23
  HUD; `enable()` sets zoom limits + `startZoom` (boots into the base) +
  `_blockObstacles` + frames the camera. `update` also `_lodDetail`s — fades
  the `WORLD_UI` layer (unit bars / order rings) out below the FAR→MID band so
  the strategic map isn't cluttered.
- **Army & combat** (`BaseArmy` + `WorldCombat`) — `BaseArmy` fields the player
  force through a `SquadManager` over the shared `PersonnelManager` pool: a
  marchable platoon (first `BASE.army.deploySlots` = 5 of `BASE.army.roster`,
  mustered outside the gate) + a `BASE.garrison` (3 units ringed inside the
  compound), each `unitRoster.makeUnit` a real `BaseTank` / `InfantrySquad` /
  `DeployableWeapon`, each reserving personnel on deploy and freeing it on
  death. Owns the shared `EntityManager` + `WorldField` + `OrderController` +
  `RadialMenu`. `WorldCombat` runs `AIManager` + `FuryManager` (Field + Base) +
  `ProjectileSystem` + `EffectsSystem` + `VehicleDust` + `DamageNumbers` + a
  static Legion camp. Order-attack → CALM shot → Field Fury → auto-fire → AI
  ENGAGE; a hit in the compound → Base Fury. `DamageResolver` runs the full
  counter + penetration model. Moving vehicles kick dust + lay tread marks;
  explosions scorch the ground — both through the `WorldScene`-owned `DecalField`
  (a `DECAL.poolSize` ring on `LAYERS.DECALS`). The compound + neighbour bases
  are `blockDisc`-stamped impassable — a march routes around, a drop on one
  snaps to its edge (`nearestOpen`), and `Separation` keeps every unit from
  overlapping any other.
- **Personnel** (`PersonnelManager`, GDD 06) — the global reserve pool, owned by
  `BaseSite` (capacity from the Reserves Barracks level, proxied by `hqLevel`
  until that building exists), regenerating over time. `SquadManager` debits it
  per deployed unit and `deduct`s on a combat death (never refunded). `TopBar`
  shows it as `PERS <cur>/<max>`.
- **Onslaught** (`OnslaughtDirector`, GDD 16) — dormant until
  `window.onslaught.start(levelId)`. 10 escalating Legion waves at the base;
  `resolveWave` from `OnslaughtConfig` scaled by the chosen alliance level;
  raiders march + hunt defenders; emits `ONSLAUGHT_*`; win = wave 10, loss = no
  defenders. Verified full-clear + loss paths.
- **HUD** (`src/ui/hud/`) — `Hud` composes `TopBar` (live resources + Gold/Power
  stubs + `PERS <cur>/<max>` + map coord + damaged-base `BASE <n>%`), `NavBar`
  (6 tabs), `NavPanel` (full-screen shells), `MapButtons` (Home / World). Routes
  `INPUT_TAP`; registers `hitTest` with `OrderController`. Enabled before the
  army so the bar catches the deploy-time `resource:changed` / `personnel:changed`.
  `RadialMenu` (long-press Recall/Hold/Follow) + `DamageNumbers` revived.
- **Base economy** (`BaseManager` + `ResourceManager`, GDD 04 / 07) — seeds
  `BASE.STARTING_LAYOUT` (HQ L3 gates the rest); `place` / `upgrade` /
  `setBarracksProduction` are all **instant** — `upgrade` pays resources +
  construction materials and applies the level in one call, no timer (real
  time belongs to Research + Engineering-Center material crafting instead,
  neither built yet); folds per-hour production into Money / Steel / Oil every
  `RESOURCE_ACCRUAL.tickSeconds` (clamped to `storageCap`), emits
  `RESOURCE_CHANGED` → `TopBar`. No PvP looting (pillar 8).
- **Navigation** — `Game._wireInput`: `INPUT_PAN` / `INPUT_DRAG_MOVE` (unless a
  squad was grabbed) → `camera.panBy`, `INPUT_ZOOM` → `camera.nudgeZoom`, gated
  to `RUNNING`. `BaseSite` cross-fades the 3-stage LOD across `WORLDMAP.lod`;
  `MapButtons` Home / World fly the camera to `WORLDMAP.nearZoom` / `farZoom`.
- **Renderer / Camera** — see the file rows. Renderer folds camera centre +
  zoom + shake into `worldRootBack`/`worldRootFront` identically each frame
  (S54 split, sandwiching the live-3D `buildingsSlot`; HUD/OVERLAY
  untouched). Camera: eased move/zoom → follow → pan-target → focal
  `nudgeZoom` → `clampToWorld` → `CameraShake`. `Base3DLayer.update()`
  mirrors this same camera state into the Three.js scene every frame,
  running before `Renderer.render()` in `Game.render()`.

## Event Flow  (one bus)
One `EventEmitter`, created in `Game`, shared by every system.
- `GameLoop` → `loop:tick` / `loop:fps`. `Game` → `game:stateChanged`
  (`BOOT/LOADING/RUNNING`), `view:resize`, `view:visibility`.
- `InputManager` → `input:tap` / `doubleTap` / `longpress` / `pan` / `zoom` /
  `dragStart` / `dragMove` / `dragEnd` / `swipe` (SCREEN px). `Game._wireInput`
  consumes pan / dragMove / zoom → camera; `Hud` consumes `input:tap` (nav +
  map buttons); `OrderController` consumes tap / drag / long-press → `ORDER_*`
  (skips taps `Hud.hitTest` claims); `LoadingScreen` consumes `input:tap` (armed
  at `frac ≥ 1`) → `loading:dismissed`.
- **Combat chain:** shooters emit `combat:shot` → `ProjectileSystem` → hit →
  `ProjectileImpact` (`DamageResolver`) → `Entity.takeDamage` → `entity:damaged`
  (→ `DamageNumbers`) / `entity:died` (→ `EffectsSystem`). `FuryManager`
  watches `combat:shot` (Field Fury) + `entity:damaged` (Base Fury) and sets
  stance/target. `AIManager` watches `entity:died` (drop controllers) + emits
  `ai:stateChanged`.
- **Onslaught:** `OnslaughtDirector` → `onslaught:started` / `waveIncoming` /
  `waveCleared` / `ended`; watches `entity:died` to track live raiders.
- **Base economy:** `building:placed` (seed) / `building:upgraded` /
  `barracks:transformed` → `BaseGridView` + `TopBar`; `resource:changed` →
  `TopBar`.
- **Personnel / squads:** `SquadManager` consumes `order:attack` (recall CATCH)
  + `entity:died` (free personnel, drop spent squads); `PersonnelManager` emits
  `personnel:changed` → `TopBar` (`personnel:denied` on a short pool — no
  consumer yet). `squad:unitState` fires on every member transition — no
  consumer yet (FORWARD: a roster / deploy panel).
- `settings:changed` → `Game._applySetting` (Renderer FPS + dpr, InputManager
  sensitivity, haptics; music/sfx FORWARD).
- **Emitted, no consumer yet:** `loop:tick`, `ai:stateChanged`, `order:follow`,
  `personnel:denied`, `squad:unitState`. The `skirmish:*` / `menu:*` /
  `results:*` / `game:pause/resume/quit` constants were removed in the step-7
  sweep.

## Known Issues
`npx eslint src/` clean (150-line cap), `vite build` clean, ~60 FPS (desktop
Chrome, one 3D building — NOT yet perf-tested on mid-range mobile with
several). All `src/config/` layers are DRAFT.

**Base3DLayer is brand new (S54), HQ-only.** Only `headquarters` is
converted; the other 4 real-art buildings (treasury/steelworks/crude_oil/
barracks) are still 2D `BuildingSprite`s — porting them is the natural
next step, not started. **Fixed this session** (each was a real bug the
user caught, not a design gap): the 3D layer used to be a `position:fixed`
DOM overlay that painted over the loading screen and every 2D layer
regardless of world position — replaced with the `buildingsSlot`
compositing (see `Base3DLayer.js`/`Renderer.js` rows), so a 2D building
placed in front of the HQ by world position now correctly occludes it and
vice versa; a camera-tilt "parallax" attempt caused visible swing and was
removed outright (fixed camera direction now); a frame-order bug (Pixi
compositing the 3D texture before Three.js re-rendered it) caused a
one-frame lag under continuous panning, fixed by running `base3D.update()`
before `renderer.render()`; the HQ's facing took two correction rounds,
now locked at `HQ_FACING_DEG = -90` and user-confirmed against the gate.
**Still genuinely open:** no depth compositing WITHIN the 3D scene against
moving 2D entities — a troop/vehicle sprite always draws in the 2D
front-root layer, so it will always render in front of (never behind) any
3D building regardless of world position; harmless with only the HQ
converted (nothing normally walks "through" it), becomes a real Y-sort
problem once more buildings are 3D and units can path near/behind them.
Lighting intensity/exposure (`Base3DConfig.js`) was tuned by eye against
one building, not measured against the locked-frame reference. `vite
build` warns the main chunk is >900 kB (three.js) — no code-splitting
done yet. Not perf-tested on mid-range mobile with more than one 3D
building on screen.

**Balance is model-derived, not playtested.** `UnitStats` rows now derive from
`unitRoles.js` anchored to one dial (`MIRROR_TTK_SECONDS` 13 — a medium mirror
match); `COUNTERS` matches GDD 02 verbatim; `VS_INFANTRY` + `smallArmsVsArmour`
make the tank↔infantry exchange lopsided the right way. Analytic TTKs check out
(mirrors ~8–18 s, heavy stomps medium ~6 s, arty wipes a squad ~12 s) but
nothing is playtested and the anchor magnitudes are a proposal — retune from
`unitRoles.js`. Onslaught-difficulty scaling is still a flat `powerScalar` per
level (`OnslaughtConfig`), not tuned against this. In v1 each roster slot is a
single unit; multi-vehicle squads wait on the Phase-C deploy flow.

**Nav panels are shells.** `NavPanel` shows each tab's planned contents as
"Coming soon" text — the Units / Officers / Store / Campaign / Alliance / More
systems don't exist. `TopBar` Gold + Power are static `0` (no economy for
them). No context panel, no attack-incoming banner yet.

**Base HP is Onslaught-only.** `BaseHealth` exists only for the duration of a
run (armed on `start`, cleared on `end`). GDD 09 base states — PvP / offline /
Redeploy — and a persistent base-HP value are still FORWARD. Siege damage is a
flat `siegeDpsPerRaider`, not the raider's `dmg`, and doesn't scale with the
difficulty level (v1).

**World map — terrain done, objects thin.** Real hex terrain (grass / forest /
hills / water) painted by `worldTerrainGen`; water bars pathing, forest / hills
slow units; `DecalField` stamps tracks + scorch. The player compound + the 4
neighbour bases are `blockDisc` obstacles (marches route around, drops snap out,
`Separation` stops unit overlap). Still missing (GDD 17, Phase B4): roads,
numbered sectors, fog of war, and the tappable map objects themselves — the
`PlotMarker`s have no tap action, resource fields / Marauder camps / plunder
don't exist (when they do, they call the same `blockDisc`).

**Base grid rewrite is fresh + under-tested (S52, sprite-fit bug closed S53).**
The base's build grid moved from hex to a diamond-projected square grid in
one session pass — lint + build clean, one visual verification round in-
browser (tap-to-upgrade flow re-confirmed working against the new hit-test
math), but not exercised against edge cases (e.g. a building placed at the
very edge of a plot stage boundary, or the plot actually crossing a growth
stage — that path is unbuilt, see above). S53 fixed a real footprint-fit bug
in the 2D `BuildingSprite` pipeline, in two layers: the runtime scaling/
positioning (real building art was sized/positioned from hand-picked config
values, not its actual grid footprint) AND the mesh's own ground geometry
(an organic TRELLIS reconstruction blob, cut back to a clean rectangle via
`trimesh` — see `assets/buildings/hq/levels01-06/README.md` for the technique).
That fixed `main_tent.glb`'s ground geometry directly, which is why it's
still correct now that S54 renders that same GLB live instead of a baked
sprite from it. The other 4 buildings' sprites still need the same
mesh-level ground-rectangle trim, not just the runtime math (which they
already have). **Known, unfixed:** sibling `BuildingSprite` boxes under
`BaseGridView`'s `_buildRoot` have no Y-sort between them, so one 2D
building placed south of a taller neighbour can visually overlap and
render behind it when it should render in front (cosmetic; hit-testing
unaffected — this no longer involves the HQ, which moved off this
Container entirely in S54's 3D pivot). Neighbour-base spacing
(`WORLDMAP.neighbourHexes`) has no buffer for a plot that grows to 38×42 by
L30 — not urgent, neighbours are still a static dev-placeholder layout.

**Base look is 1 of 8 rebuilt under the new guardrails (S42/44/45/46, HQ
rebuilt S52, HQ ground geometry trimmed S53, HQ moved to live 3D S54 — see
the Visual Track summary above for what changed).** `headquarters` tier 1
is the new modular command-tent design, now rendered as a live 3D GLB
(`Base3DLayer`) rather than a pre-rendered sprite — one static pose, no
idle animation played yet. `treasury`, `steelworks`, `crude_oil`,
`barracks` are still 2D `BuildingSprite`s on pre-guardrails art
(SUPERSEDED, not rebuilt) AND still have the organic untrimmed TRELLIS
ground pad the HQ mesh used to have; `defence_wall`, `attack_towers`,
`engineering` are still the animated vector placeholder. No full Blender
cleanup pass has run on any building (the HQ's ground plinth was trimmed
by a targeted `trimesh` script, S53 — a real fix for the footprint-fit
bug, but not a full DCC-tool pass: no part-splitting for animation yet,
e.g. flag/canvas movement). `state` is hard-set from
`BUILDING_ART.defaultState` (nothing drives `working` from real
production) for the 2D buildings; the live-3D HQ has no state/animation
wiring at all yet. The tap→context menu (S49, S51's `BuildingHexMenu`
fan, S54's world-space-anchored U-shape + hexagon buttons + hand-drawn
icons) covers Info/Upgrade (→ `BuildingPanel`, Info an alias of the same
panel — no dedicated read-only view) and Manage (Barracks); a real
Produce/train pipeline is FORWARD. `TerritoryRing` is visual + a dev-time
static check — no Airlift/relocation flow calls
`territory.findTerritoryConflict` yet. `DynamicBarracks.label` overflows
its cell. FORWARD: port the other 4 real-art buildings to live 3D (the
stated end goal — "every single building will be 3D"), then the same
guardrails rebuild for the remaining 3 placeholder buildings, tiers 2–12
each, real per-building idle/working animation (3D and Blender-atlas
alike), production→state wiring, real Airlift, world-map
tileset/roads/sectors, live plot re-growth.

**Orphan-revive code on disk (~5 files)** — `GatherTruck`, `ui/controls/*` (4),
`SettingsScreen`/`Draw`. Not on the runtime path; each has a clear revival
target (see the roadmap). `dev/` holds 9 legacy harnesses, excluded from the
build.

**Line counts:** every live file ≤ 150 code-lines.


Historical verification notes and past fixes (session-by-session) moved to
`docs/SESSION_LOG.md` — this section should only ever list currently-true
issues; replace it wholesale rather than appending dated notes to it.

Damage smoke implementation: `src/effects/DamageSmoke.js`, configured by
`src/config/DamageSmokeConfig.js`; regression coverage in
`tests/damage-smoke.test.mjs`. No per-hit material mutation or new per-frame
continuous-emitter allocation is used.

HQ finishing correction: ground wear is now faint outside the footpaths, preserving
grass across the plot. Front checkpoint floorboards are trimmed within the
sandbag footprint. The supply tarp has a continuous top and hanging skirts
with clearance over all crate battens, preventing wood from protruding.

### Base terrain and perimeter presentation
`BaseGround3D` fills the defence polygon with the same `BaseGrassMaterial` and
world-scale UVs as `DefenceGround`. Shared 1K CC0 grass maps are attributed in
`assets/base/ground/textures/README.md`. The construction grid shows only while
relocating; ground follows compound/pin visibility, including neighbour bases.
`BaseTrafficPaths` resolves permanent gate-origin roads from plot dimensions only.
`BaseTrafficTexture` stamps broad feathered vehicle wear and narrow foot wear into
one small texture. No building data or placement/movement listeners affect roads.
`DefenceTerrainHeight`/`DefenceTerrainGeometry` recess the outer belt beneath the
continuous trench floor and sloping entrances. Existing timber lining and rounded
soil banks remain instanced. `DefenceGateApron` marks the cleared entrance.
`DefenceMaterials` shares HQ timber maps; Node/Three refinement scripts update
existing kit GLBs, with original snapshots retained for repeatable builds. Three
pine variants use tapered opaque needle sprays and shared foliage materials.

### Reference timber barracks and troop yard
The runtime barracks uses `assets/buildings/barracks/levels01-06/reference_barracks.glb`,
a newly authored 4x4 timber hut/yard, yaw 0 (yard screen-left). No lookout tower.
`Building3DView` owns `BarracksYard`; the instanced models inherit drag, position
and LOD from the building root. `BarracksYardLayout` supplies fixed four-bay reserve
occupancy; `BARRACKS_TRANSFORMED` carries cls to refresh the assigned class display.
The infantry display is sixteen enlarged soldiers in four aligned ranks. The German five-star Maus has dedicated grey hull/turret art;
AT/launcher leave markers empty. Yard figures are decorative, not combat actors.
Asset build source and class preview media live beside the model; art review is
`dev/barracks/`, importing the current runtime model and yard owner.


### Active model packets and shared levels 1–6 art
HQ, military barracks and the complete defence kit live under their respective
`assets/buildings/<id>/levels01-06/` folders. They share one appearance for levels
1–6; no sixfold geometry duplication. DefenceKitConfig maps both existing tiers
1 and 2 to the same kit. Higher unbuilt visual tiers retain existing fallback.
Building level statistics, grid, camera and combat are unchanged.
`assets/asset_catalog.json` inventories runtime and necessary rebuild GLBs with
hashes; `scripts/catalog-assets.py` refreshes it. Replaced tent/barracks/standalone
wall/gate/tower/ground models and rejected SH iterations are removed. HQ
structure.glb and defence original/ snapshots remain required authoring inputs.

German SH uses `assets/units/super_heavy/tier01/maus_{hull,turret}.glb` through
UnitMeshFactory/Unit3DBody, source +Z corrected +90°, hull length 160 world pixels.
Five stars is its starting art rating; no advanced additions. Its matte grey
texture, independent ring pivot and larger-than-heavy dimensions are shared by
portraits and the single SH yard display. Image/video/source provenance accompany it.
Barracks now shows 16 infantry at .76/.56-cell spacing, four light/medium/tank
hunter/howitzer, two heavy, or one SH. Yard scale follows CELL_PX against its
42-pixel authored reference so the current 22-pixel grid does not crowd troops.
This changes decorative occupancy only, not reserve costs or combat actors.
