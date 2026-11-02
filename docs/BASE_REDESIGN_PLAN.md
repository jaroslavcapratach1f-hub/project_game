# Current handoff

## 2026-10-11 — Officers’ Barracks standing sentries
- Corrected both entrance guards from frozen marching poses to stationary stances.
  The offline sentry_pose helper rotates/blends hips and ankles continuously on
  the textured source mesh and plants both soles on the same ground plane.
  No mesh cuts, replacement legs or changes to deployed infantry assets.
- Preserved 1.78m guard height, rifle/upper body, building design, footprint and
  restored lower-right yaw 90. Rebuilt GLB, packed Blender master and saved media;
  updated manifest/catalog. Final asset: 80,388 triangles / 7,833,412 bytes.
- Front/side isolated poses and final building render visually inspected. Source
  sole minima are identical (-0.6111985445). Current WorldScene loading, visibility
  and relocation pass; Chrome portrait/landscape views captured. No physical-device,
  Safari or sustained-FPS test. All 47 tests and production build pass; existing
  bundle-size advisory remains. Next: user review of the corrected guards.


## 2026-10-11 — Officers’ Barracks recruitment hall
- Replaced the old model with an octagonal timber reception hall, brass rank/laurel
  crest, double doors, enclosed dossier wing and forward covered briefing veranda.
  Map table, personnel records, lanterns and two textured static infantry-derived
  sentries distinguish its officer recruitment role. Shared HQ/treasury art pipeline.
- Existing 3×3 plot and gameplay preserved. Shared levels 1–6. User briefly requested
  lower-left, then explicitly reverted: FINAL yaw 90 / +Z entrance faces lower-right.
  No daily rewards, acquisition odds, assignment, skills or training logic added.
- Saved GLB, packed Blender source, four rebuild modules, actual preview and turntable,
  manifest and catalog. Removed obsolete tier01 files; their hashes/bytes/paths are
  recorded in the new manifest. Final mesh: 80,388 triangles / 7,828,436 bytes.
- Actual WorldScene HTTP 200, 65 roots, visibility/drag restoration and relocation
  pass. Portrait/landscape Chrome views and four asset angles inspected. Lower-left
  was also checked before user reversal; saved media now matches restored yaw 90.
- All 47 tests and production build pass (existing bundle advisory). No physical
  phone/Safari/sustained-FPS test. Unrelated local edits preserved.
- Next: user visual review of the current Officers’ Barracks. Preserve the restored
  lower-right facing; guards and props are decorative rather than acquired officers.


## 2026-10-11 — approved Armory and redesigned military research laboratory
- Armory approved by the user: curved-roof timber warehouse, open doors, suspended
  tank turret over the detailed Sherman hull, rocket/ammunition cases and clear exit.
  Corrected the temporary black tank/white closure issue by separating texture
  multipliers from untextured olive plates. Deployed tank source assets unchanged.
- Research Center / Academy redesigned in the existing owner. User rejected the
  domestic/shop-like hipped-roof draft; current model is a low industrial timber
  R&D facility with stepped roofs, window bands, framed rooflights, round extraction
  duct, grounded lattice aerial and engine-test annex with radiator/gauges/plans.
  Current research design is delivered for visual review, not yet user-approved.
- Both use levels01-06 packets, shared HQ materials/treasury tools, existing 3×3
  plots and yaw 90 (+Z source entrance). All equipment is static dressing. Research,
  acquisition, costs, timers, gameplay, camera and grid systems unchanged.
- Saved current GLBs, packed Blender masters, four source modules per building,
  manifests, actual-model PNGs and rotating WebMs. Old tier01 packets removed;
  exact superseded paths/hashes/bytes retained in each new manifest. Catalog updated.
- Armory: 91,104 triangles / 7,994,956 bytes. Research: 75,244 triangles / 5,787,696 bytes.
- Actual WorldScene: both models return HTTP 200, 65 building roots, drag/visibility
  restoration and relocation/restore pass. Updated temporary checks to the current
  index-based building registry and valid half-cell coordinates for odd footprints.
  Four asset angles and portrait/landscape Chrome emulation inspected. Physical
  phones, Safari and sustained FPS remain unverified.
- All 46 automated tests and production build pass; existing large-bundle advisory.
  Added grounded/embedded-mesh checks for both packets and an Armory material
  regression. Unrelated local gameplay/UI changes preserved. No deployment.
- Next: review the Research Center in-game or its saved preview; preserve the approved
  Armory appearance. Future research art should rebuild this same live packet.


## 2026-10-11 — Factory timber finish and realistic left-side crane
- Preserved the compact sawtooth factory. Replaced brick production/boiler walls
  with the shared HQ timber palette; removed the front shed and added low stacks.
- Chimney has staggered radial brick courses, recessed mortar and an open dark flue.
- Small left-side crane uses paired tapered truss cheeks, diagonal webs, rivets,
  braced bolted base, bearing collars, manual geared winch, wound cable, sheave
  and suspended forged hook over the receiving stack. Static decorative equipment.
- Rebuilt the same GLB and packed Blender source; refreshed actual preview/video,
  manifest and catalog. 69,608 triangles / 5,874,932 bytes; no model variants kept.
- Actual WorldScene factory load (HTTP 200), visibility/drag restoration and
  relocation/restore passed. Updated temporary review script for the current
  index-based building registry; unrelated runtime edits preserved.
- Four asset angles plus portrait/landscape Chrome emulation visually inspected.
  All 43 tests and production build pass (existing bundle-size advisory).
  No physical-device, Safari or sustained mobile FPS test.
- Existing levels 1–6 appearance, 3×4 footprint, lower-right frontage, shared grass,
  camera and gameplay unchanged. Next: user review of the refreshed Factory.


## 2026-10-10 — researched compact Factory replaces bulky warehouse
- User rejected the enclosed warehouse mass and explicitly requested online factory
  research. Reviewed historic sawtooth-factory references (Lombardy heritage inventory,
  Ateliers Voirin-Marinoni images, municipal industrial heritage descriptions).
- Rebuilt the same asset as a compact brick production block with two glazed sawtooth
  bays, lower timber dispatch wing, attached boiler/service volumes and tapered round
  chimney. Added metre-scaled weathered brick texture; fixed gable/chimney UV stretching.
- Reduced building-body width/depth/height without changing its 3×4 placement plot.
  Actual runtime full-model height: Factory 30.11, HQ 49.26 scene units (61%).
  Roof/body sits lower still; yard stock/cart occupy the surrounding plot. No flooring.
- Replaced GLB/.blend/preview/turntable in place; no new duplicate packet. Final GLB:
  42,692 triangles, 4,086,820 bytes. Catalog, manifest and design docs refreshed.
- Actual WorldScene load, drag/hide restoration and relocation pass. Portrait and
  landscape Chrome emulation captured; landscape placement and four close-up angles
  inspected. All 43 tests and production build pass (bundle-size advisory).
- Physical device, Safari and sustained FPS unverified. Existing queues, recipes,
  unlocks, camera, grid and combat unchanged. Previous warehouse direction superseded.


## 2026-10-10 — enclosed Factory replaces rejected shed
- User rejected the open workshop/shed silhouette. Rebuilt the same live Factory
  as a fully enclosed industrial hall: full walls with masonry plinth, tall
  multi-pane windows, raised glazed roof monitor, sliding loading doors and
  taller kiln chimney. Only a limited framed loading doorway remains open.
- Moved the saw inside, retained construction-material stock by the loading area,
  corrected door/window clearance and filled the monitor-end roof gaps after
  inspecting four views. No terrain floor/paving added.
- Replaced the existing GLB, packed .blend, preview and turntable in place;
  no second model or duplicate packet. Current asset: 82,508 triangles,
  6,065,676 bytes. Refreshed manifest/catalog and design docs.
- Existing 3×4 grid, yaw 90, visual levels 1–6, production and combat unchanged.
- Actual WorldScene loading, visibility restoration and relocation checked;
  portrait/landscape Chrome emulation and close-up camera angles inspected.
- All 43 tests pass; production build passes with chunk advisory. Physical device,
  Safari and sustained FPS remain unverified. Machinery remains static decoration.


## 2026-10-10 — Factory construction-materials workshop
- Replaced the old engineering tent with an open timber production hall, saw/drive,
  assembly bench, log crib, drying racks and finished boards; brick mould bench,
  manual press, kiln and palletized fired bricks show the early construction chain.
- Moved the kiln into camera view and corrected brick proportions after inspecting
  the first render. No floor or terrain slab; grounded supports use base grass.
- Preserved runtime id engineering, 3×4 footprint, initial plot, yaw 90, production
  queues/recipes/unlocks and combat. Shared visual levels 1–6; authored front +Z.
- Packet: one 4,968,448-byte GLB (54,580 triangles), packed Blender source,
  four small rebuild modules, actual-model preview/turntable, manifest and README.
  Reuses HQ textures/treasury helpers. Removed replaced tier01 packet; catalog refreshed.
- Actual WorldScene loading, drag/hide restoration and relocation checked; portrait
  and landscape Chrome emulation inspected, alongside four close-up camera angles.
- 43/43 tests pass; production build passes (chunk advisory); lint: 0 errors /
  231 warnings. Physical mobile hardware, Safari and sustained FPS unverified.
- Machinery is decorative static geometry; no production animation is claimed.


## 2026-10-09 — oil pumping plant
- Replaced the old reconstruction with a metal pumpjack, connected tanks, manifold
  and timber service shed using shared HQ materials/treasury Blender helpers.
- User rejected the separate flooring. Removed the entire ground slab and broad
  foundation pads; narrow skids/sills sit directly on the existing base grass.
- Levels 1–6 share the same 2×2 model; economy, camera and placement unchanged.
- Oil preview/turntable now show the floor-free model; world loading, visibility
  restoration and relocation pass. Portrait/landscape Chrome emulation inspected.
- User also requested removal of steelworks flooring: slab and paving removed,
  structural furnace/ladle bases retained; equipment supports grounded.
- Steelworks preview remains the approved concept; current turntable shows the model.
- Final verification: 42/42 tests pass; production build passes (chunk-size advisory);
  lint: 0 errors / 247 warnings. Physical devices/Safari/FPS remain unverified.
- Steelworks is now 61,352 triangles / 5,271,736 bytes; manifests/catalog refreshed.

## 2026-10-09 — approved steelworks implemented
- User approved the concept and requested the same compact asset approach as HQ/defence.
- Rebuilt connected timber workshop/furnace, pouring ladle, glowing casting molds,
  coal shelter and blacksmith station. Adjusted casting placement for camera visibility.
- Preserved approved image as steelworks_preview.png; recaptured actual-model turntable
  with an explicit model identity check. Packed Blender source and shared rebuild helpers retained.
- Removed duplicate concept, .blend1 backup and Python caches; refreshed asset hashes.
- Current WorldScene load, hide/restore and relocation pass. Portrait/landscape Chrome
  emulation inspected. Physical devices, Safari and sustained FPS remain unverified.
- 41/41 tests pass; build passes (chunk advisory); lint: 0 errors / 236 warnings.
- Existing 2×2 footprint/economy preserved; seed (0,-7), lower-right frontage.
- The concept is reference art; runtime geometry is an interpretation, not an identical render.

## 2026-10-05 — Blender steelworks, shared levels 1–6
- Replaced the tent with an open timber field forge: masonry hearth/chimney,
  extraction hood, anvil, bench/vice, coal bin, ingots and bar stock.
- Reused HQ/treasury materials and Blender helpers. Saved packed .blend,
  reproducible source, GLB, actual-model preview and turntable. Fixed roof normals.
- Preserved 2×2 footprint, steel production/storage, grid, camera and combat.
- Live WorldScene loading, drag/LOD restoration and relocation checked; portrait
  and landscape Chrome emulation inspected. Physical device/Safari/FPS untested.
- Final checks: 41 tests pass; production build passes (bundle advisory); lint
  has 0 errors / 198 existing warnings. User confirmed lower-right facing (yaw 0).
- Removed superseded steelworks files; recorded hashes in STEELWORKS_CLEANUP_2026-10-05.json.
  Oil remains separate pending work. Preserve the accepted treasury design.


## 2026-10-05 — Blender treasury, shared levels 1–6
- Replaced the treasury tent and rejected reconstruction with an editable Blender
  timber treasury. Open printing/cashier bay, press, shelves, vault, awning,
  barred window, cash cases and rounded bags follow source/concept.png.
- User accepted the model and requested only a roof-color correction; roof is now
  darker olive-charcoal. Geometry, other materials and gameplay preserved.
- Existing 2×2 footprint, +X entrance/yaw 0, shared levels 1–6 registry. Packed
  .blend, rebuild modules, embedded PBR/AO GLB, preview and turntable retained.
- Superseded treasury/temporary files removed with hashes in
  docs/TREASURY_CLEANUP_2026-10-05.json; asset catalogue refreshed.
- Live WorldScene: model loads, 65 building roots remain, drag/LOD restoration and
  relocation/restore pass. Portrait/landscape Chrome emulation checked. No physical
  mobile/Safari/FPS verification. No camera, combat, grid or economy changes.
- Final verification: 40 automated tests pass; production build passes with the existing bundle-size advisory. Lint reports no errors. Final runtime pivot is normalized on export; the shared renderer keeps the same accepted visual placement.
- Steelworks/oil redesign remains separate. Future treasury visual edits should
  preserve this accepted structure and use the Blender source/export recipe.


## 2026-10-04 — German starting-five-star Maus, clean asset packets and yard spacing
- Rejected primitive/Pershing-like SH iterations removed. Researched real Maus
  museum geometry, generated a grey basic WWII reference with built-in imagegen,
  reconstructed it with Replicate TRELLIS and prepared separate textured hull and
  turret. 13,212 source triangles; hull fit 160 vs heavy 115 world pixels.
  Germany-only registry, independent pivot, matte paint, image and turret-sweep
  turntable saved in assets/units/super_heavy/tier01. No advanced upgrade equipment.
- User confirmed current HQ/barracks/complete defence appearance spans levels
  1–6. Moved active packets to levels01-06; updated runtime/rebuild/test imports.
  Existing defence tiers 1/2 share the same kit; no stat/grid/camera changes.
- Audited every GLB. Removed 60 obsolete/temporary files (89.4 MiB): rejected SH,
  replaced HQ tent/barracks/standalone wall/gate/tower/ground, unregistered resource
  drafts, bytecode and superseded inspection screenshots. Deletion hashes/reasons
  recorded in docs/ASSET_CLEANUP_2026-10-04.json. Necessary raw source GLBs kept.
  assets/asset_catalog.json indexes 129 retained GLBs (80 runtime); refresh with
  scripts/catalog-assets.py. Current packet README/manifests/images/videos saved.
- Found current CELL_PX=22 while yard sizes had been authored for 42. Yard display
  now scales relative to that reference; battlefield unit sizes/grid untouched.
  Latest user request: infantry spread to .76/.56-cell columns/rows, sixteen total;
  tank hunter/howitzer four each, light/medium four, heavy two, SH one. Decorative
  counts only, no change to reserve costs. All available model boxes fit without
  overlap; AT/launcher art still missing.
- Live WorldScene: every moved building/defence URL returns 200; 52 wall batches,
  5 tower batches and 65 building model roots across bases. Requested yard counts,
  SH size/heading/independent turret and shared level-six kit checked. Portrait
  390x844 and landscape 844x390 Chrome emulation inspected. Physical device,
  Safari and FPS untested. Source import audit found only existing unused legacy
  harness/config references outside this task; they were not used as proof.
- 39 automated tests pass; production build passes (bundle-size advisory).
  Lint: 0 errors / 197 warnings in the current working tree. Unrelated UI/grid
  edits preserved. No commits/deployment. Resource-building redesign remains
  pending: original active resource GLBs retained, provisional drafts removed.

Next: user visual review of the Maus and updated barracks spacing; resource
building redesign remains separate pending work. New assets must meet the
realistic-art requirement; do not restore rejected procedural SH or old packets.

## 2026-10-02 — HQ finishing corrections
- Reduced ground wear to faint grass-preserving tint and localized paths.
- Trimmed checkpoint timber floors inside the curved sandbag footprint.
- Rebuilt the supply tarp as a continuous top with hanging skirts clear of
  the wooden battens; corrected outward-facing skirt normals.
- No layout, gameplay, camera or grid changes. Final visual validation below
  is recorded in SESSION_LOG; asset preview/video are refreshed with the GLB.

## 2026-10-02 — HQ visual refinement and Units UI handoff
- Existing rear-edge timber HQ and two terrace wings retained on the 7x8 plot.
  Direct Node/Three refinement replaces primitive guards/bags/guns, adds embedded
  PBR wood maps and baked contact shading. Four crews match field-infantry scale.
- Entire command yard dressed with dispatch canvas/telephone desk, covered
  supply pallet, receiving/service stores, low sandbag runs and worn ground.
  Front posts moved closer; the roof aerial is now a straight anchored span.
- Current rebuild: assets/buildings/hq/levels01-06/source/refinement/refine.mjs.
  Historical Python sources are retained, not the current final rebuild path.
  Preview, gunner detail, turntable, manifest and texture provenance refreshed.
- Units roster/detail theme, symmetric landscape safe-area margins and fixed
  Upgrade action completed in the carried-over work. troopLevels remains a
  session-only displayed-level prototype; no upgrade economy or persistence.
- Deleted root inspection PNGs have no runtime references and need no restoration.
- 29 tests/build pass; current lint: 0 errors / 99 warnings. Current WorldScene
  checked at 390x844 / 844x390: 7x8 bounds, selection, ghost/LOD restoration.
  No physical-device/Safari test or FPS claim. HQ asset ~152.8k triangles / 11.7MB;
  profiling/download cost remains a follow-up. Existing gameplay is preserved.
- Next: review the updated HQ in-game; future art changes should edit the Node
  refinement modules and regenerate the same runtime GLB.

The referenced BASE_REDESIGN_PLAN.md was absent from this checkout when
this task began. This file records only this task's handoff; it does not
reconstruct or replace earlier base-design decisions. The approved original
connected-base direction and existing battlefield combat remain unchanged.

## 2026-09-26 — completed: heavy turret and troop ground trails
- Pershing source split reproducibly into hull/turret with closure plates;
  runtime and portrait use the same assembly and recorded ring pivot.
- Two vehicle contact bands, increasing tank widths by class, tire marks
  for wheeled units, independent alternating infantry footprints.
- Verified actual WorldScene loading, 360-degree turret isolation, completed
  up/down/left heavy-tank moves and class parade rendering. Ten tests and
  production build pass. Lint: zero errors, existing AttackTowers3D warning.
- No physical mobile-device performance test. Future troop GLBs should get
  measured model-specific contacts in GroundTrailConfig; current 2D
  placeholders retain their own class profiles. No base implementation changed.

## 2026-09-26 — completed: damage smoke and death-only blackening
- Removed living troop damage tints. Three rising vehicle-smoke stages at
  75%/50%/25% HP remaining; original model paint stays unchanged.
- Existing death event supplies explosion/black wreck plus a single slight
  180ms shake. Hit impacts do not shake. Infantry do not emit engine smoke.
- Current WorldScene visual/material checks and destruction event verified;
  15 tests and build pass. One unrelated lint warning; no device test.
- Shared particle cap retained; smoke reserves 120 burst slots. Normal
  gameplay restored after temporary damage checks. No combat balance changes.

## 2026-09-26 — completed: turret refinements and mobile viewport defects
- Medium Sherman exposed closure is olive; no white patch on rotation.
- Heavy Pershing topology split keeps all nine upper prop components fixed;
  only connected turret/gun rotates. Updated pivot; light assets untouched.
- Fixed 3D texture reuse across orientation changes and portrait TopBar
  overflow found during mobile emulation. No base geometry changes.
- Tested 390x844 and 844x390 with touch emulation: selection, pan/pinch,
  smoke/color, turret rotation, death explosion/black wreck, one short shake.
- 17 tests/build pass; one pre-existing lint warning. Physical device/Safari
  performance remains unverified (no connected device or iOS simulator).

## 2026-09-26 — completed: bot turrets and softened blue
- Rebuilt all 11 blue derivatives from current source GLBs, applying the
  corrected Pershing separation and current medium closure material.
- Blue hue retained, saturation reduced from 1.15 to .80 multiplier, value
  lifted 10%. Player model files unchanged.
- Added source/output manifest regression to catch stale enemy meshes.
- Live bot light/medium/heavy independent aim and move/recenter checks pass;
  18 tests and build pass, one existing lint warning. No new device test.

## 2026-09-27 — Shared reference building menu
- Applied Info / Upgrade / View to all buildings with silver point-up hexes,
  white outlined labels, full names/levels, smoked-glass crescent and nameplate.
- Four white grid-axis arrows at plot-edge midpoints, behind the menu;
  walls/towers retain no-relocation behavior. Barracks production moved into
  View's Change Production button; existing upgrade costs unchanged.
- Current WorldScene: checked all 15 placed types and Info tap routing in
  390x844 / 844x390 Chrome emulation, plus all three barracks buttons.
  Screenshots inspected for barracks and HQ. 18 tests/build pass; lint only
  existing AttackTowers3D warning. No physical-device test.
- Follow-up user request: model the supplied L1 defence perimeter; inspection
  and implementation decisions are in DEFENCE_PERIMETER_PLAN.md.


## 2026-09-27 — Modular L1 defence perimeter and resumed barrier correction
- Implemented the supplied wooden perimeter in the existing Three/Pixi
  runtime: 40 replaceable GLBs, shared-material instancing, source Blender
  scripts/manifest, source reference, current preview and turntable.
- User-approved extra space: two-cell setback and four equal chamfers;
  eight watchtowers, interior conifers, sandbags, trench traverses/bridges,
  sparse props, utility poles/cables and a clear foreground.
- Shared DefenceFootprint updates player/neighbour collision and gate/muster
  alignment. Building positions and combat logic retained. Tier selection
  preserves layout; unbuilt tiers use L1 art explicitly.
- On resumption, split wire from support geometry. Replaced repeated double
  posts with X → wire → single post → wire → X. Deduplicated corner steel
  obstacles and rotated their crossed beams to read correctly in-game.
- Verified 24 tests/build; lint has no errors and unrelated UnitsMenu warning.
  Current WorldScene node edit/restore, footprint passability and all five
  deployed troop positions pass. Checked 390x844 and 844x390 touch emulation,
  capped DPR2 canvas resize, gate anchor and all eight tower hit regions.
- No missing mesh placeholders; no pixel-identical final-art claim or
  physical-device/Safari performance test. JSON snapshot codec is complete;
  whole-base persistence and live HQ-stage expansion remain wider game work.
- Full file/asset contract and limitations: DEFENCE_PERIMETER_PLAN.md and
  assets/buildings/defence_wall/levels01-06/modular/README.md. Next: review game or
  /dev/defence/ against reference.jpeg; art can change independently of logic.


## 2026-09-27 — Detailed trench passages, entrances and defence palette
- Replaced disconnected capped trench tiles with one gate-separated open path;
  shared miters keep every corner/traverse connected. Bay depth is 1.25 cells
  and outer wire offset is 4 cells, using the approved extra decorative space.
- Eight side entrances with descending bank ends; ten bridges replace twenty.
  Bridges rotate across the channel. No new trench-cover AI or collision rules.
- User rejected an initial smooth-strip rendering. Final banks instead use a
  Blender-modeled instanced trench_revetment GLB: three retaining courses,
  upright stakes, coping, nails, irregular rounded earth and clods. Continuous
  geometry is restricted to the soil floor/seam beneath those detailed models.
- Material-specific linear tints deepen timber, olive, foliage, drums and steel;
  shared daylight, camera, tank art, construction grid and combat are unchanged.
- Added DefenceTrenchDressing, DefenceTrenchMesh, DefenceTrenchMaterials,
  source/trench_detail.py, trench_revetment.glb, detail preview and trench tests.
  Updated DefenceTrenches, DefenceDressing, DefencePerimeterConfig,
  DefenceInstances, DefenceWall3D, source/build.py and asset manifest/media.
- Verification: 26 automated tests, clean lint, production build pass (existing
  large-bundle advisory). Loaded GLB ray checks: 45 paths, zero obstructions at
  channel-check height. Current WorldScene rebuild/snapshot restore/collision
  probes and all five deployed units pass. Eight tower hits and gate selection
  pass in 390x844 / 844x390 Chrome touch emulation; screenshots inspected.
- Isolated reference view: 55 draws, ~809k triangles. Tested current gameplay
  view: ~1.15M triangles / 59 draws before mobile viewport changes. These are
  rendering counts, not physical-device FPS guarantees. No Safari/device test.
- Assets remain a modeled interpretation of the supplied image, not a claim
  of pixel equivalence. Terrain is still flat with shallow raised revetments;
  no underground excavation, soldier cover behavior or whole-base persistence.
- Next review: inspect perimeter_preview.png, trench_detail_preview.png and
  perimeter_turntable.webm, then the current world-map base in the game.

## 2026-09-27 — Inward tower ladders and varied trees on both sides
- Tower placements rotate local -Z (the authored ladder side) toward the
  compound center, for all eight towers, all plot sizes and neighbour bases.
- Added DefenceTrees with seeded, uneven spacing, yaw, independent height/crown
  width and both interior/exterior placement. Eight entrance approaches, tower
  ladder areas, gate and props have clearances; exterior crowns stay narrow.
- Rebuilt pine_a/b/c from nature_props.py with distinct tall/slender, fuller and
  shorter irregular crowns, differing branch counts, spacing and missing boughs.
  Contact shadows follow the varied crown scale. Existing collision is unchanged.
- New user instruction permits trees outside the wall, superseding the earlier
  inside-only composition. Keep them in the wall/trench belt, not random foreground.
- 27 tests, lint and build pass; source assets/manifest updated. Portrait and
  landscape Chrome emulation checked; no physical mobile/Safari performance test.
- Updated kit preview/video and project design handoff. Next review: inspect the
  current base and perimeter_preview.png for tree composition and ladder direction.

## 2026-09-29 — Reduced interior vegetation and finer pine foliage
- Applied the requested 25% reduction to interior tree count (rounded to whole
  trees), retaining evenly distributed existing positions. Each retained tree's
  width/depth/height scale is exactly 75% of its previous value.
- Current HQ3: 19 interior trees -> 14; exterior 5 -> 10. Exterior count doubles
  at all six plot sizes, with gate, towers, props and full trench access clearances.
- Added DefenceTreeDensity. Pine assets now use overlapping thin lobed needle
  sprays, irregular outlines, fine opaque foliage textures and covered trunk tips.
  Source helper pine_foliage.py is included by the reproducible full-kit build.
- 28 tests, lint and production build pass; build retains its bundle-size advisory.
  Baseline comparison verified the exact 0.75 scale factor for every retained
  interior tree at all six sizes. No changes to tower direction or gameplay.
- Refreshed preview/video. Chrome portrait/landscape gameplay checked; no physical
  mobile/Safari test. Isolated preview ~935k triangles / 55 draws; no device FPS claim.
- Next review: perimeter_preview.png and the current base in the running game.

## 2026-10-03 — Perimeter finishing, greener continuous grass and permanent roads
- Refined existing wall/tower materials, rounded sandbags, timber fittings, wire
  and grounded three-beam hedgehogs using the Node/Three asset pipeline.
- Trenches use recessed terrain, continuous soil floors, retained timber lining,
  rounded earth banks and sloping accesses. Gate bags cleared; trench ends capped
  and a broad apron/checkpoint dressing added without changing navigation.
- Base interior and defence belt share photographed CC0 grass maps, UV scale and
  a healthier green material. Interior mesh extends to the wall polygon, removing
  the construction-grid edge seam. Fuller varied pine needle sprays replace solid
  foliage lobes. Trees retain approved interior/exterior density and size variation.
- Latest user decision: traffic is PERMANENT terrain dressing from the gate,
  independent of building locations. Removed building-placement/movement listeners
  and building data inputs. Broad worn roads and narrower footpath use only base
  dimensions; moving buildings never redraws/repositions them. No collision changes.
- Verification: all 32 repository tests and production build pass; lint has zero
  errors and 186 warnings. Live treasury relocation/restoration confirms the
  road texture stays unchanged.
  Current WorldScene checked in Chrome portrait/landscape emulation: HQ footprint,
  selection, ghost restoration and LOD pass. Ground grid/visibility checks pass.
  Screenshots inspected; no physical-device/Safari test or mobile FPS guarantee.
  Unrelated UI edits preserved. Isolated perimeter ~1.42M triangles/62 calls.
- Next review: running base, especially foliage and gate-road composition at normal
  zoom. Existing global grass outside the defence belt is still the older terrain.


## 2026-10-03 — New reference-based barracks and assigned troop yard
- Authored a new `reference_barracks.glb` using Node/Three, preserving the previous
  military_barracks GLB. Compact timber hut, shallow stoop, framed windows,
  metal roof, four X-marked bays, sandbags and restrained stores. No tower.
- Latest approved orientation: yard on screen-left, building on screen-right;
  existing 4x4 footprint/grid and camera unchanged.
- Added BarracksYardConfig, BarracksYardLayout and BarracksYard. Existing production
  assignment event now carries cls; Building3DView owns the instanced yard display.
  Infantry is an enlarged aligned 4x4 squad (16); light/medium show four vehicles;
  heavy, tank hunter and howitzer show two; SH shows one. Reserve allocation is
  visual only, with existing training/personnel/combat mechanics unchanged.
- Dedicated SH art is absent: one enlarged heavy model is an explicit temporary
  stand-in. AT gun/launcher art is absent; no false class model is substituted.
- All available class layouts rendered and measured: no model-to-model box overlap,
  all within yard bounds. Fixed heavy spacing and infantry ground contact.
  Current WorldScene assignment counts, drag restore, LOD and relocation pass.
  35 automated tests, production build and lint zero errors (186 warnings).
  Portrait/landscape Chrome views inspected after explicitly refreshing the
  viewport; initial background-tab orientation capture was stale. Automatic
  physical-device rotation is not certified by this check.
- Saved class previews and turntable beside asset; docs and manifest updated.
  No physical-device/Safari test or mobile FPS claim. Next: user visual review and
  dedicated SH/AT/launcher assets when supplied. Neighbours have the new building;
  their unknown troop assignments are not fabricated.

