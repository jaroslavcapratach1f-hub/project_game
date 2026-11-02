## 2026-10-11 — Research Center hub corrected: own resource bar + landscape honeycomb
Two rounds of player correction against real Warpath reference screenshots,
both now fixed and verified live:
- **Resources belong to this screen, not a gap for the global TopBar.** The
  player's exact words: "resources has to be visible on top of the screen...
  allocated to this research screen which will be in all screens in Research
  Center under Research button." The earlier `topBarReservePx` approach (a
  gap in this screen's own background letting the real persistent HUD TopBar
  show through from the layer underneath) was wrong — replaced with a new
  `ResearchResourceBar` component: this screen's OWN live Money/Steel/Oil
  readout, present on every page (hub and tree), using the same real icons
  `ResourceStatIcon` already uses everywhere else. SCOPE LOCK
  (`ResourceConfig.js`) — no Gold here, only the 3 resources research costs
  are ever paid in.
- **Equal-size hexes, equal spacing, and only 2 tracks open.** The hub's old
  big-hero + smaller-column hex sizing is gone — `RESEARCH_HUB.radiusPx` is
  now one uniform size for every hex. Only Development and Military are
  interactive now (`RESEARCH_HUB.openCategories`); Doctrine/Defense/Support
  (real data, fully wired trees) and the one inert placeholder all render the
  identical dimmed "Coming Soon" lock treatment, matching the reference's own
  mostly-locked state — a deliberate scope reduction for now, not a data gap;
  flipping one open later is a one-line config change.
- **Landscape needed a genuinely different layout, not a stretched portrait
  one.** The player's own landscape reference screenshot showed a single
  combined header row (back+title left, resources right-aligned, no separate
  strip) and a 2-row honeycomb hex grid (even/odd index alternating top/
  bottom row, each bottom-row hex interlocking half a column left of its own
  column's top hex) — nothing like the tall vertical 1-2-1-2 column, which
  the player called "totally a mess" stretched sideways. `ResearchHubView`
  now has 2 layout methods (`_layoutColumn` portrait, `_layoutHoneycomb`
  landscape) picked by `ResearchScreen._reflow` off `w > h`, the same
  orientation convention `screenSidePad`/`navEdgePad` already use elsewhere
  in this HUD. `ResearchResourceBar` got a matching 2nd layout method
  (`layoutInline`, right-aligned within the shared header row, no background
  of its own) alongside the original `layoutBar` (portrait's own full-width
  strip). The node detail popup's own top-reserve is no longer a fixed
  constant — `ResearchScreen` now computes its own live header height per
  orientation and hands it to `ResearchNodeDetail.layout` each call, so the
  popup never covers whichever header shape is currently on screen.
- One real bug caught only by the first live landscape screenshot, not code
  review: the restructured header math left the back/title row (and, in
  landscape, the resources folded into it) with NO background at all —
  `drawTroopSurface`'s own opaque fill only ever starts below the full header
  reserve now, so the world-map scene bled through behind the header text.
  Fixed with a dedicated `_headerBg` rect, always covering the header's own
  row in both orientations.
- Verified live via Puppeteer at both a portrait (430×900) and landscape
  (900×420) viewport: hub hexes equal-size/equal-spaced, only Development/
  Military open and tappable (Coming Soon hexes correctly inert), resource
  bar shows live balances in both header shapes, tree page carries the same
  header, node detail popup positions correctly below the header in both
  orientations, portrait re-verified unchanged after the landscape work.
  `npx eslint src/`: 0 errors. `npm run build`: clean. Fresh reload: 0
  console errors.

## 2026-10-11 — Barracks Detail Screen + Research Center screen built end-to-end

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

- **Barracks Detail Screen** (`BarracksDetailScreen.js`): full-screen overlay
  replacing the generic Upgrade screen for the Barracks building — hero unit
  preview, officer slot placeholders, a real unit grid, inline stats, and a
  two-step REMOVE/ASSIGN flow. Rebuilt through several correction rounds against
  real Warpath reference screenshots the player supplied. Fixed a back-button
  bug (`Hud._routeTap` was missing a guard against open building screens, so
  back also re-opened the avatar/NavPanel menu underneath) and a camera-pan-lock
  regression (the hex menu gated pan/zoom off an overly broad `isAnyOpen` check
  that should have been the narrower `isAnyScreenOpen`).
- **Research Center screen** (`ResearchScreen.js`): the hex-menu's generic
  "View" action is replaced with "Research" (new flask icon, `ActionIconDraw.js`)
  for `research_center`. Opens a full-screen hub/tree/detail flow:
  - **Hub** (`ResearchHubView`/`HexCategoryButton`): 1-big/2/1/2 column of glass
    hexes — Development/Military/Doctrine/Defense/Support (themed per-track
    color wash, no photo art — explicit player call) + one inert "Coming Soon"
    placeholder, preserving the 1-2-1-2 rhythm even though only 5 tracks have
    real data. Progress ("N/M ranks"), icon and label are baked inside each hex,
    matching the reference screenshots exactly.
  - **Tree** (`ResearchTreeView`/`ResearchTreeNode`): each track's real
    `nodesInTrack` data (`src/config/research/`, ~57 nodes total) renders as a
    literal connected node graph — circular "gear badge" nodes (icon + rank
    pill) for multi-rank nodes, square "milestone" nodes for single-rank ones,
    grouped by real tier and connected by elbow-routed lines to each node's real
    `requires` parents. Tiers past the player's HQ level show a locked/grey
    state with the HQ level needed. Node icons dispatch to the existing
    `StatIconDraw` for any node whose effect matches a real stat key
    (hp/dmg/def/armor/pen/rof/rng/acc/spd/dodge/aoe/cost), else fall back to the
    track's own category icon — mechanical, not hand-picked per node.
  - **Node detail popup** (`ResearchNodeDetail`): tapping a node opens a popup
    with icon, "`<Label>` Lvl N" title, a plain-language effect description
    derived straight from the node's own data (no invented flavor text), real
    Power gain (`PowerConfig.researchPower` — written in an earlier session,
    wired to a real caller for the first time here), the real resource cost
    (visible even while locked, so the player can see what to save for — an
    explicit player ask), time, and a Start/Active-progress/Maxed control
    (`ResearchNodeAction`, reused verbatim from the earlier inline-card design).
  - **`ResearchManager`** (new system): owns completed ranks + up to
    `parallelSlots` concurrent active jobs (`TimedJob`, reused as-is — no new
    timer primitive needed), validates against HQ/tier gates, prerequisites,
    slot capacity and `ResourceManager.canAfford` before starting, spends +
    starts a real timer on `start()`, and settles finished jobs every frame via
    `WorldScene.update`. In-memory only, resets on reload — same honest pattern
    as every other non-settings stateful system in this codebase (no save
    layer exists anywhere except `SettingsStore`).
  - The player's own explicit correction mid-build: the real persistent TopBar
    (money/steel/oil/Power) was being completely hidden behind this screen's
    opaque background, because `TopBar` renders on the `HUD` Pixi layer while
    this screen renders on `OVERLAY` above it. Fixed by measuring
    `TopBarLeftCluster`'s real rendered height live (Puppeteer,
    `.getBounds()` ≈ 129px) and reserving `topBarReservePx = 136` at the top of
    this screen's own background/content — scoped to `ResearchScreen` only;
    other full-screen `OVERLAY` screens (`UnitsMenu` etc.) have the identical
    underlying issue and were deliberately left untouched (not requested).
  - Deliberately omits two things the reference screenshots show that this game
    has no real data for: hand-written flavor quotes (no per-node flavor text
    exists anywhere in the GDD/data — inventing 57 of them would be fabricated
    content) and a 2nd "pay Gold to finish instantly" button (no premium/gold
    currency economy exists anywhere in Blitzmire yet).
- Verified live via Puppeteer end-to-end, including compositing the `HUD` +
  `OVERLAY` Pixi layers in Python/PIL to confirm the TopBar renders correctly
  above the screen (`Image.alpha_composite`, since `extract.base64` needs a
  real `PIXI.Rectangle` frame, not a plain object, to crop safely):
  hex menu on Research Center shows `info`/`upgrade`/`research` with the new
  flask icon → hub renders 6 hexes in the exact 1-2-1-2 layout with real "0/N
  ranks" progress → tapping a track opens its real tree, node costs/times spot-
  checked against the source data → tapping a node opens the detail popup →
  pressing Research spends the exact real cost, starts a real job, and the
  popup correctly swaps the RESEARCH button for a live countdown progress bar
  → fast-forwarding the job's clock credits the rank, advances the popup to
  the next rank's cost/time, and reopens on a fresh RESEARCH button → closing
  the popup (✕) returns to the tree with scrolling re-enabled → the hub's
  track progress text updates after navigating back → `isAnyScreenOpen()`
  still gates camera pan/zoom correctly with the detail popup open → the
  Military track's tree shows genuinely distinct per-stat icons (HP heart,
  attack, defense/armor hex, speed chevron, accuracy target, RoF clock) with
  correct fallback-to-category icon for non-stat nodes. `npx eslint src/`: 0
  errors (pre-existing warnings only). `npm run build`: clean. Fresh reload:
  0 console errors.
- Three real bugs caught only by live screenshot inspection, not code review:
  a hub row that double-subtracted the hex radius and rendered ~60px too high
  (`HexCategoryButton.totalHeight` was already measured from hex centre); an
  absolute-vs-relative return-value mismatch between a node card's own layout
  and its caller that collapsed every tier past the first onto the same Y; and
  an edge-line elbow bend that used the global parent/child midpoint and could
  visually cross through an unrelated intermediate-row node — fixed by hugging
  the child's own row and sorting each tier's nodes by their real parent's
  already-placed X before row-wrapping.

## 2026-10-10 — researched compact Factory replaces bulky warehouse

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

## 2026-10-09 — TopBar HUD redesign and real-art resource icons

- Replaced every generic hand-drawn resource/currency/avatar glyph in the
  TopBar with real art (background-removed, LANCZOS pre-downsampled to
  avoid GPU-minification mud): player avatar portrait + live HQ-level
  badge, Power (star-over-glass-pill), Location (pin-over-glass-pill),
  Personnel, Money, Oil, Steel (logs/jerrycan/I-beams), and Gold (bars +
  "+" purchase-stub button) — all four non-avatar badges share one
  `glassPill()` gradient structure in `TopBarRightCluster.js` for pixel
  consistency.
- Added `FormatNumber.js` (`formatAbbr`): K/M-abbreviated HUD numbers
  (`"1.4M"` not `"1,350,000"`), with a fixed-width slot reservation per
  badge so a value crossing a digit boundary no longer shifts the whole
  resources row. Power keeps up to 4 plain digits before abbreviating
  (`formatAbbr(v, 10000)`) so the player can track it precisely.
- Reworked the TopBar's left/right cluster layout: avatar inset from the
  screen edge; Power then Location now stack centred directly beneath the
  avatar's level badge instead of beside it, freeing width for the
  resources row. In portrait, the resources row auto-shrinks (via a
  measured natural-width budget, not a hardcoded guess) to fit on one row
  beside the avatar rather than overlapping or wrapping to its own row.
- Unified building-screen resource icons: new `ResourceStatIcon.js` is the
  one place `BuildingInfoScreen`, `BuildingUpgradeContent` (Features
  Unlocked), and `BuildingCostSections` (Resource Cost) get Money/Steel/Oil
  art from, replacing the old per-screen hand-drawn glyphs (now deleted
  from `BuildingIconDraw.js`; Power/material-swatch glyphs stay, no real
  art exists for those). Fixed a real bug this surfaced: the icon's async
  texture load could resolve after its row was destroyed (rows rebuild on
  every cost/stat refresh), throwing on a null internal Sprite bounds —
  guarded with a `_destroyed` flag.
- Fixed `BuildingUpgradeScreen` on a short landscape phone viewport: the
  Army-shell sizing formula it reuses could let the panel (and its
  UPGRADE button) extend past the nav bar and off the bottom of the
  screen. The shell is now hard-capped at the nav bar's top edge, and if
  content still doesn't fit, the whole body shrinks as one unit (a
  `Container.scale` fit, mirroring the resources-row technique) rather
  than clipping the button — verified both the visual fit and that the
  button's tap hit-test still lines up at its real shrunk position.
- Verified throughout via Puppeteer against the live dev server (0 console
  errors at each step) at both desktop-landscape and real phone
  portrait/landscape viewport sizes; lint 0 errors, production build
  clean.

## 2026-10-09 — oil pumping plant and shared-ground correction

- Rebuilt crude_oil as a recognizable metal pumpjack plant: curved horsehead,
  walking beam, A-frame, gearbox/motor, linked counterweights, wellhead, connected
  storage tanks, separator/vent and timber service hut. Uses shared HQ materials
  and treasury Blender helpers; 2×2 footprint and economy unchanged.
- User rejected dedicated flooring. Removed the oil terrain slab and foundation
  pads, retaining narrow machinery skids and shed sills. Applied the same request
  to steelworks: removed foundation slab and all apron paving; grounded supports.
  Furnace/ladle structural bases remain part of the equipment.
- Oil current GLB: 4,436,704 bytes, 39,860 triangles; static mechanical pose.
  Saved packed Blender source, actual-model preview/turntable and manifest under
  levels01-06. Removed the superseded tier01 packet after switching runtime imports.
- Steelworks approved concept stays unchanged as requested earlier; its depicted
  paving is superseded by the current floor-free model. Refreshed model turntable.
- Browser checks use the actual current WorldScene, including relocation and
  visibility restoration, plus portrait/landscape emulation. Physical devices,
  Safari and sustained FPS are not verified.
- Final verification: 42/42 tests pass; production build passes with chunk-size
  advisory; lint reports 0 errors / 247 warnings. Steelworks now has 61,352
  triangles / 5,271,736 bytes; manifests and asset catalog hashes refreshed.

## 2026-10-09 — approved steelworks rebuild and compact asset packet

- Implemented the approved concept composition in the existing Blender steelworks:
  connected timber workshop and furnace annex, pouring ladle, hot casting molds,
  coal shelter and separate anvil/hammer station. Moved casting equipment clear of
  porch occlusion after inspecting renders; calibrated roof, paving and hot metal.
- Preserved approved concept as steelworks_preview.png; captured a fresh complete
  turntable with explicit steelworks identity guard to avoid the previous HQ mixup.
- Retained one current 6,362,460-byte GLB (80,900 triangles), packed editable .blend,
  modular rebuild scripts, manifest and README. Reused HQ/treasury material/bake
  helpers. Removed duplicate concept, Blender backup and local Python caches.
- Refreshed manifest/catalog hashes. Existing 2×2 footprint, yaw 0, levels 1–6,
  steel economy and combat remain; initial plot (0,-7) uses the requested free spot.
- Verified actual WorldScene model loading, hide/restore and relocation. Inspected
  portrait and landscape Chrome emulation plus four asset-review angles.
- 41/41 tests pass; production build passes with chunk-size advisory; lint reports
  0 errors / 236 warnings. Physical device, Safari and sustained FPS untested.
- Runtime art follows the approved reference but is not pixel-identical. Smelting
  uses decorative static geometry/emissive surfaces, not a production simulation.

## 2026-10-06 — steelworks concept approval required
User rejected the current steelworks layout and requested an image first, then
explicit approval before further 3D construction. Stopped the in-progress Blender
rebuild. `assets/buildings/steelworks/levels01-06/source/concept_pending_approval.png`
is the new proposal: connected timber workshop, masonry furnace, visible pouring
crucible, red-hot ingot molds and blacksmith station. It is NOT approved or an
in-game render. Do not resume 3D work until user approves this concept.
Current working source includes unapproved layout edits; the live GLB and preview
packet must not be described as finished or matching this new concept. Previous
preview/video may show HQ; recapture with explicit steelworks asset verification
when implementation resumes. Steelworks placement is now (0,-7), facing lower-right.

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

## 2026-10-02 — HQ ground, checkpoint floor and supply cover corrections
- Reduced plot-wide worn dirt to faint tint; localized walking-route wear remains.
- Trimmed both front checkpoint floor meshes inside the curved sandbag footprint.
- Rebuilt the supply tarp with continuous top/skirt geometry, correct outward
  normals and clearance above the wooden battens. No wood penetrates the cover.
- Inspected close-ups and refreshed preview/video/detail images. Targeted HQ
  asset test and production build pass. Current WorldScene portrait/landscape
  checks pass for 7x8 bounds, selection, ghost and LOD; game restored RUNNING.
  No physical-device test. Gameplay, grid, camera and yard layout unchanged.
- Next requested work: same visual-quality upgrade for the defence perimeter,
  including properly recessed trenches, wall/towers/gate, wire and hedgehogs.

## 2026-10-02 — HQ realism, full courtyard dressing, cable and Units menus
- Completed the interrupted HQ work in the existing runtime asset. Kept the
  accepted two-storey house, shallow terrace wings, rear-edge position and 7x8
  gameplay footprint. No detached buildings, flags, stars or front map board.
- Added Node/Three structural refinement, rounded compressed sandbags, four
  reduced/reposed textured infantry-derived guards, perforated machine-gun
  jackets, receiver/mount/ammunition detail, material maps and static contact
  shading. Original troop source assets and gameplay remain unchanged.
- Corrected grouped prop transforms, floating wing-frame placement, guard scale,
  shadow orientation and gun alignment during visual iteration. Soldiers use
  1.78m reference matched to field troops. No external modelling application
  used for this refinement; historical earlier Python sources are retained.
- Responded to the empty-yard feedback with closer front posts, an open canvas
  dispatch shelter and telephone desk, then extended dressing across the full
  territory: covered pallet, equipment cases, receiving crates, service drums,
  rolled canvas, short sandbag borders and worn ground. Central access stays open.
- Replaced the deformed roof cable with one straight span between final mast
  attachment points. Refreshed preview PNG, gunner detail PNG and turntable WebM.
  CC0 Poly Haven wood texture provenance is recorded beside refinement sources.
- Carried-over UI work: olive/brass roster and detail presentation, current-level
  cards, symmetric CSS safe-area-aware landscape padding, fixed Upgrade dock.
  Earlier Chrome checks exercised level increments, cap20, tab switching and
  simulated59px notch ->73px margins. Upgrade state remains session-local,
  display-only; no cost/persistence/combat integration was added. Promote,
  Modify and Parts remain placeholders. No physical notch-device test.
- The four deleted root PNGs (arrows-perp-crop, pershing_patch_view,
  sherman_patch_view, tower_icon_neighbour) were inspection screenshots with
  no runtime references; no missing game asset was inferred or recreated.
- Final verification: 29 tests and production build pass; bundle-size advisory
  remains. Current lint 0 errors / 99 warnings. Actual WorldScene checked at
  390x844 and 844x390: exact7x8 bounds, selection, ghost and LOD restoration;
  75/81 Three draws in those views. Game restored to RUNNING. Review page is
  supplementary, not sole integration evidence. No physical-device/Safari FPS
  test. Asset ~152.8k triangles / 11.7MB; mobile memory/load budget still needs
  device profiling. Final visual result inspected in both game orientations.
- Updated architecture, HQ plan, base handoff, GDD04/23/24 and asset documentation.
  No deployment or commit performed. Next step: user review of the current HQ.

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
  assets/buildings/defence_wall/tier01/modular/README.md. Next: review game or
  /dev/defence/ against reference.jpeg; art can change independently of logic.

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

# SESSION_LOG.md — Blitzmire

This is the **append-only development history** — one entry per session,
newest first. It is a changelog, not a reference: read it only when you need
to know *why* something is the way it is, or what a past session actually
built/verified. It is **not** required reading at the start of every session.

`ARCHITECTURE.md` is the living reference — current file map, active systems,
event flow, known issues. It describes only present-tense state and is
edited in place. New session work goes there (trimmed to a few sentences in
"Current Phase") **and** here (the full recap, prepended above the previous
entry). Do not grow `ARCHITECTURE.md` with historical detail — that's what
this file is for.

Recent sessions get a full recap; once a session's work is superseded or
its files deleted, it gets condensed to a one-line pointer (see "Sessions
5–25" at the bottom) rather than kept verbose forever — trim old entries
the same way when this file grows long again, instead of just appending.

---

## Session Recaps

## 2026-09-26 — Bot turret derivatives and softer blue
Found the heavy bot's pre-recolored GLBs still used the previous split:
source/enemy face counts differed while enemy config already inherited the
new pivot. Regenerated all 11 registered enemy assets from current source
GLBs, applying the corrected hull/prop partition and medium closure paint.
Blue hue retained; saturation multiplier reduced 1.15 -> .80, value lifted
10%. Shared material objects are recolored only once. No player model or
AI/combat-stat changes. Fixed-gun tank hunters stay fixed.

Added recolor_enemy.py --all, source/output SHA manifest and registry-coverage
regression test to detect stale derivatives. Verified exact vertex/index/UV
identity across all 11 source/output pairs. In current WorldScene inspected
blue tank cut surfaces, light/medium/heavy aim to 90 degrees with hull fixed,
and all three completed move orders with zero turret/front error on arrival.
18 node tests pass; production build passes with size warning; lint has only
existing AttackTowers3D warning. No new physical mobile test. Temporary
review positioning is cleared by restoring the normal world map.


## 2026-09-26 — Turret cleanup and portrait/landscape checks
User reported medium white surfaces and heavy hull fragments rotating.
Sherman cap material used byte sRGB colors as linear factors: regenerated
hull/turret with linear olive caps, keeping original source geometry/pivot.
Pershing's old region mask cut through fender boxes and lamps; replaced it
with connected-component classification above skirt Y=.055. The connected
turret/gun rotates; nine other upper components (1,424 faces) stay fixed.
Export preserves source UVs via an untouched copy, caps just the actual
ring, and uses recomputed pivot (0.000706329534,.055,-.106018742084).
Surface conservation error ~2.2e-16. Original files/previews retained;
light-tank assets unchanged. Four cardinal turret poses visually inspected
in current WorldScene; hull transforms fixed through the sweep.

Prior mobile testing request continued: no physical phone or iOS simulator
available. Chrome emulation at 390x844 / 844x390, DPR3 (render cap2), touch
selection/pan/pinch tested. Reproduced severe 3D stretch/misalignment after
rotation despite correct numerical canvas sizes. Rebuilding Sprite alone
reused cached TextureSource; fresh CanvasSource/Texture plus disposal of old
GPU source fixes both 3D layers. Also fixed portrait TopBar fields clipping
by wrapping full-size labels to rows and reflowing when values change.

Final checks: screenshots inspected for both orientations, unchanged paint
at smoke thresholds, turret exposed surfaces, destruction explosion/black
wreck, exactly one .22/180ms shake then zero active shakes. 17 tests pass,
build passes with size warning, lint has only existing AttackTowers3D warning.
Added mobile-layout regressions for fresh source ownership/disposal through
rotations and resource-field bounds. No physical-device performance, Safari,
thermal, or safe-area validation claimed. Temporary review state reloaded.


## 2026-09-26 — Stable troop colors, three-stage smoke, destruction shake
Removed living-unit damage tint logic from Unit3DBody and EntityView and
retired damageStates/opt-in preserveMaterialColor config. All authored GLB
material factors now remain untouched while alive. Existing wreck path alone
blackens models; a delayed GLB load inherits pending wreck color/opacity.

Added DamageSmoke and DamageSmokeConfig to current WorldCombat: 3/7/14 puffs
per second at <=75%/50%/25% remaining HP, increasing size and opacity, rising
and drifting from current vehicle hull position. Healing/death/removal stops
emission; infantry excluded. Shared 500-particle cap preserved with 120 slots
reserved from sustained smoke for burst effects. Existing ENTITY_DIED blast
remains one event and now uses a small .22-intensity, 180ms shake. Ordinary
projectile impacts remain shake-free. No stats, damage formulas or gait edits.

Verification: 15 node tests pass (thresholds/density, moving origin,
repair/death/removal, infantry exclusion, preserved materials, death event
idempotence, hit shake suppression and particle reserve). Build passes with
existing size warning. Lint: no errors, existing AttackTowers3D warning.
Actual WorldScene browser inspection: light/medium/heavy staged smoke,
material arrays unchanged at each stage; lethal damage creates black wreck
and explosion, repeated damage creates no second shake, shake expires.
Physical mobile-device performance untested. Review-only damage/state is
removed by reloading the normal game afterward.


## 2026-09-26 — Pershing turret separation and paired ground trails
Split the newly imported USA heavy tank at source skirt Y=.055, preserving
rear log/fender/front equipment on the hull, source surface area and UVs.
Added olive caps to both cut surfaces, source split script/report, separate
runtime hull/turret GLBs and registry pivot. Retained intact color-prepared
model, original GLB, image and video. The latest request replaces the earlier
intact-model decision; existing targeting, stats and gait are unchanged.

VehicleDust delegates contacts to new GroundTrails and TrailProjection.
GroundTrailConfig covers every ground class, USA 3D measurements, increasing
tank tread widths, wheeled gun/truck tire pairs and each living soldier's
alternating footprints. WorldField forwards quads to the bounded 1,200-decal
pool. Removed obsolete single-strip VEHICLE.tracks settings. Browser review
caught and fixed Pixi's typed-array polygon rejection (copy to number array)
and overly bright closure material (linear RGB).

Verification: 10 node tests pass, including Three camera/contact projection,
track continuity, class coverage, pivot sweeps, teleport/death suppression,
individual footprints and Pixi buffer independence. Production build passes
with bundle-size warning; lint has zero errors and one pre-existing warning
in AttackTowers3D.js. Actual current WorldScene reviewed via browser: model
loads, 360-degree turret sweep leaves hull matrix unchanged, heavy completes
up/down/left move orders, paired curves render, class parade includes light,
medium, heavy, hunter, super-heavy, AT, tracked artillery, launcher, infantry;
USA wheeled howitzer reviewed separately. Not a physical-device performance
check. Referenced base plan was absent, so created a scoped handoff only.


## 2026-09-25 — Complete howitzer asset packet
Added the previously omitted prediction MP4 and PNG to m12_gmc/tier01 as
howitzer_turntable.mp4 and howitzer_preview.png. Both compare byte-for-byte
with the downloaded originals. README distinguishes original-color generation
previews from the color-corrected runtime GLB. No runtime changes or new
browser/device tests needed for these reference files.

## 2026-09-24 — USA level-1 howitzer model and olive palette
Integrated supplied TRELLIS prediction rneq4tdzsxrnc0d0tknsm6c1yw as the intact
level-1 visual for existing m12_gmc / usa:howitzer. DeployableView now accepts
Unit3DLayer and uses Unit3DBody when registered, retaining its 2D fallback,
crew, deployment progress, health, muzzle flash and wreck fade. Source -X
muzzle becomes +X with 180° rotation; full model fits X to 80 world pixels.
The portrait automatically uses the same registry asset. No gameplay stats
or infantry changes. No separate wheel, fold or recoil animation is supplied.

User requested a closer color match to the existing troops. Retained original
GLB under source and added reproducible prepare.py changing only the material
base-color factor, matching the Sherman's olive texture median in linear RGB.
Unit3DBody preserves authored color for this opt-in registry entry so damage
tint updates do not reset it; other unit rendering retains its prior behavior.

Verified in the current Chrome world-map runtime: loaded field model and HUD
portrait, inspected screenshot, floor Y=0, three routes completed within the
existing 3px arrival tolerance with forward/travel dot ≈1; deployment, firing
and teardown exercised. Recolored material values persist after sync and were
inspected beside USA units. Build passes; lint has only the existing
AttackTowers3D warning. No physical-device test. BASE_REDESIGN_PLAN.md remains
absent; this entry is the handoff for this artillery-only change.

## 2026-09-23 — USA infantry separated movement and distance-driven walk cycle
Audited the existing USA infantry GLB packet and runtime path before changing
behavior. The live view now mounts one `SoldierBody3D` per soldier, with the
source-space torso and left/right leg pieces kept in one coordinate frame and
independent hip pivots. The packet README records the split and transform
contract.

Changed each `Soldier` to track its own travel bearing, walking state, and gait
phase. `InfantrySquad._followStep` now measures each soldier's actual eased
displacement toward its rotated formation slot, faces that bearing while
moving, and advances the walk phase by distance/stride. `SquadBodies3D` uses
that phase for opposite leg swings and returns both legs to rest when the
soldier settles. Formation jitter and per-soldier easing remain, so troops
continue to move as separate units instead of a rigid block.

Verification: a direct M1 Garand simulation kept all 10 soldier positions
unique while moving and returned every soldier to `isWalking=false` after the
formation settled; lint has zero errors and the existing AttackTowers warning;
production build passes with the existing chunk-size warning. A fresh browser
visual capture was unavailable because the local DevTools endpoint was already
occupied, so live device/FPS testing remains outstanding.

Follow-up correction: the leg meshes were previously left in the root frame
while their hip groups were offset, which caused the reported wobble. Each
mesh is now positioned relative to its own hip pivot before cloning. The walk
pose uses a stronger forward/back swing plus opposite inward hip crossover so
the legs pass the centre line during a step.

Visual inspection of the actual GLB bounds then found the split leg tops were
about 0.20 source units above the torso hip edge. Recorded `legLTopY` and
`legRTopY` offsets now pull the pieces down to the waist, restoring full leg
length instead of leaving only short shins visible.
A local Blender render of the corrected assembled GLB confirms the torso-to-hip
connection and full shin/foot extents; the browser capture remains black during
the loading gate.

## 2026-09-21 — USA light tank implemented from supplied local GLB
Resolved the prior model-access blocker using the user's downloaded
replicate-prediction-bet54x8vhxrna0d0rknr55szqg-0.glb. Preserved it byte-for-byte
under assets/units/m24_chaffee/source/original.glb, recorded provenance/hash,
and retained the supplied turntable in tier01. Followed the existing Sherman
packet structure, Unit3DConfig registry and EntityView/Unit3DBody/Unit3DLayer;
no new runtime renderer or tank behavior class.

Inspected model profiles and the turntable, split at source skirt Y=0.075,
kept Z>0.27 rear stowage fixed, interpolated UVs and closed the exposed deck
and turret underside. New closures use an olive sRGB texture and metallic
finish; browser inspection caught and corrected an initially bright diffuse
seam. Raw ring pivot comes from split-report.json. Source -Z front uses -90°
baseline, reusing the corrected shared heading convention. Hull length 39.1
world px (85% of Sherman), matching the existing light/medium scale ratio.

Registered usa:lightTank. Starting first slot now deploys m24_chaffee;
Springfield remains on the bench. Five-squad cap, other fielded types,
personnel costing, stats, pathfinding, firing and turn rates unchanged.
M24Chaffee was already the USA light-tank implementation (50°/s hull,
44°/s turret). The user confirmed the prior Sherman repair works correctly;
its mesh and runtime behavior were preserved.

Verification: source-frame mesh checks pass (fixed/rotating membership, UVs,
closures, original surface area/bounds). Node heading regressions pass
(72 travel headings, 288 hull/aim combinations). Current Chrome world-map
runtime loads both tanks; Chaffee 12-heading turret sweep preserves hull
matrix and position, with gun/aim dot within floating-point tolerance of 1.
Three ORDER_MOVE paths completed with forward/travel dots >=
0.9999999999999997; one impassable destination skipped. Full real-time world
loop drive also exercised. Final forward and turned-turret poses inspected.
Build passes (existing chunk-size warning); lint has no errors and the existing
AttackTowers3D.js:25 warning. No physical-phone testing. Runtime Chaffee GLBs
are ~10.54 MB combined; whole build GLBs ~119.65 MB. Tracks static and separate
3D barrel recoil still absent, as with the existing tank renderer.

Updated CLAUDE renderer status, ARCHITECTURE, GDD 03/24 and asset README.
BASE_REDESIGN_PLAN.md remains absent; this entry is the handoff. No paid
Replicate generation, no unrelated local edits discarded. Game left running
for user inspection; subsequent work can use the same packet/registry path.


## 2026-09-21 — USA light-tank integration preparation (awaiting model access)
User requested the supplied TRELLIS model as USA's light tank, with the same
correct hull heading and independent turret behavior, and explicitly required
Claude-compatible repository structure. Re-read CLAUDE.md, current architecture,
unit/combat GDD and live roster, deployment, HUD, entity and 3D-render paths.
M24Chaffee / m24_chaffee already provides the USA light-tank simulation;
its existing 50-degree/s hull and 44-degree/s turret tuning should be retained.
Asset target is assets/units/m24_chaffee/tier01, with reproducible preparation
under source, registered as usa:lightTank in Unit3DConfig and rendered through
the existing Unit3DBody. No new tank system is needed.

Blocker: supplied prediction bet54x8vhxrna0d0rknr55szqg is not retrievable
without further access. Its public API detail and /p/ sharing page both return
404; the model playground HTML provides an unrelated default example, which
was deliberately not downloaded as the requested tank. Asked for a shared
prediction link or direct GLB download URL. No asset or runtime edits made.

Verification during preparation: actual M24Chaffee simulation drives forward
in eight directions and turns its turret toward an in-range target without
moving the hull; existing 72-heading / 288 hull-aim projection tests pass.
No new-model browser verification is possible until the mesh is available.
Handoff: retrieve exact supplied asset, inspect its own axes/skirt/pivot,
split with UV-preserving closed surfaces, register and field the light tank,
then verify actual mesh movement/turret rotation alongside the Sherman.
BASE_REDESIGN_PLAN.md remains absent from the checkout.


## 2026-09-20 — Sherman hull/turret and sideways movement repair
User reported upper hull rotating with the turret and sideways movement.
Launched Chrome against the running port-3000 game and inspected the actual
world-map entity, rather than a legacy harness. Preserved the approved tank
model/texture. Recovered its original frame by matching 521 shared vertices
between the old parts; saved `assets/units/m4_sherman/source/reassembled.glb`.
Added reproducible `split_turret.py` and `verify_split.py`: cut at the actual
skirt (Y=0.075, replacing 0.015), keep rear stowage fixed, retain UVs, add deck
and turret-underside closures. Separate exported mesh materials avoid atlas
repacking artifacts. Updated the raw ring pivot in Unit3DConfig.

Corrected source facing (-Z → +X through Ry(-90)) and the scene Y heading
sign (`atan2(-z,x)`). No simulation/pathfinding/turn-rate changes. Existing
Unit3DBody composition now receives the correct geometry, pivot and headings.

Verification: inspected textured straight and quarter-turned poses in Chrome;
12 turret bearings through the real BaseTank update preserve hull matrix and
position while matching gun aim. Three ORDER_MOVE paths through the live
hex pathfinder completed, all sampled forward/travel dots >=
0.9999999999999998; one impassable requested destination was skipped. Also
ran a move with the full world loop active in real time. Added Node tests
for 72 headings / 288 hull-aim pairs; Python checks UVs, closure meshes,
fixed/rotating bounds, and preservation of original surface area/bounds.
Both pass. Build passes with existing large-chunk warning; lint has zero
errors and the existing AttackTowers3D.js:25 warning. No physical mobile test.

Updated architecture, GDD 24 and tank README. BASE_REDESIGN_PLAN.md remains
absent; handoff lives here. Tracks remain static and there is no separate 3D
barrel recoil; these were not part of the split/heading repair. Browser test
poses/loop controls were temporary; no test-only behavior added to the game.
Preserved unrelated local changes; no Replicate generation or paid API calls.


## 2026-09-20 — Current-development review and Replicate handoff
Reviewed current rules, architecture, recent session history, visual/base GDD,
asset READMEs, registries, and live Game → WorldScene wiring at the user's
request. Corrected the earlier assumption that sprite output is the target:
live 3D is now the direction, with 13 building types plus ground/walls/gate/
towers and the first Sherman hull/turret already wired. Existing combat stays
in place. Higher tiers, remaining unit/world conversion, and repeatable
Replicate automation remain outstanding. Manual playground runs and one-off
mesh cleanup are documented in asset packets; automation is a proposed next
step, not implemented or newly authorized paid generation.

Updated ARCHITECTURE's current-phase summary and GDD 24 status, preserving
unrelated local work. Older detailed documentation remains partly stale.
The requested BASE_REDESIGN_PLAN.md is absent, so no plan status was updated.
Build passes (large-chunk warning; ~108 MB GLBs); lint: zero errors, one
magic-number warning at AttackTowers3D.js:25. No browser/device checks or paid
API calls. No gameplay changes. Handoff: establish reproducible generation,
part/pivot preparation, facing/footprint validation, and mobile asset budgets
when implementation is requested.


## Session 54 recap
**Every building is now live 3D, not a pre-rendered sprite — user mandate:
"Delete current HQ image from the map and create 3D model, from now on
every single building will be 3D."** Rebuilt the HQ's rendering pipeline
from scratch on that constraint; the other 4 real-art buildings stay 2D
sprites for now (not yet ported). Took several correction rounds, each
driven by a specific user-caught bug — kept short here; see the actual
files for the current shape, this is only the "why."

**Architecture — `Base3DLayer.js` (new) + a `Renderer.js` split.** A live
Three.js scene renders to an off-screen canvas, composited into Pixi as a
`Sprite` (`Texture.from(canvas)` + `source.update()` each frame) rather
than a second DOM canvas — a naive `position:fixed` overlay was the root
cause of the HQ rendering on top of the loading screen and everything
else, un-occludable by 2D content. `Renderer.js`'s single `worldRoot` was
split into `worldRootBack`/`worldRootFront` sandwiching a `buildingsSlot`
Container, giving 3D buildings a real position in Pixi's draw order
relative to 2D ground/decals (behind) and units/particles/UI (in front).
Camera math (`Base3DConfig.js`: `pitchDeg 30, azimuthDeg 45, cameraScale
1/√2`) is analytically derived so a 3D grid-cell step produces the exact
same screen delta as `SquareGrid.cellCentreToPx` — the two layers pan/zoom
in lockstep. Per-building auto-fit-to-footprint (`Box3` measure → non-
uniform scale to span the footprint exactly) replaces the old
`footprintFrontAnchor` 2D approach; footprint-fit scale and LOD-shrink
scale live on separate inner/outer groups so `setBlend`'s LOD multiplier
can't clobber the fit.

**Bugs the user caught, each fixed same-session:**
- **Camera-tilt parallax ("swing") caused visible desync** — tilting the
  shared orthographic camera by pan distance made every building not
  exactly at the pan target swing out of sync with the linear-panning 2D
  grid. User: "remove that swing nonsense" — removed entirely, not
  replaced with a variant; camera direction is now fixed.
- **HQ "slightly moves" while other buildings look glued** — `Game.render()`
  was compositing Pixi (reading the 3D texture) *before* `base3D.update()`
  re-rendered Three.js with that frame's camera state, a one-frame lag
  invisible at rest but visible under continuous panning. Fixed by
  reordering: `base3D.update()` now runs first.
- **HQ facing** — two rounds (`-45deg` rejected: "wrong side again"); user
  then said stop measuring and just commit, so the fix landed directly at
  `HQ_FACING_DEG = -90` — confirmed correct ("finally"). Lesson: when told
  to stop empirically verifying mid-task, commit to a reasoned value and
  verify once, not iteratively in front of the user.

**Building menu + label rework, against `GAME_DESIGN.md/Headquarter.jpeg`:**
floating per-building name labels removed entirely (were "nonsense");
tap-menu title format changed to `Lvl {n} {name}` (was `{name} L{n}`);
`BuildingHexMenu` moved from the screen-space HUD layer to the world-space
`WORLD_UI` layer so it tracks the building instead of scrolling with the
camera pan (its anchor + `open()` API now take world coords, and
`handleTap` uses `Container.toLocal()` instead of a manual screen-space
subtraction, so it still hit-tests correctly under zoom); its U-shape
formula was inverted (center option now dips lowest, edges rise — the
first version was an upside-down arch); button shape reverted from circle
back to hexagon (briefly changed to match the reference image, corrected
by the user: "has to be hexagon"); plain Unicode glyph icons replaced with
hand-drawn `ActionIconDraw.js` vector icons (info/upgrade/manage).

**Verified**: lint + build clean throughout; HQ pans/zooms with zero
visible lag or drift; facing, menu shape, menu tracking, and label format
all confirmed by the user in-browser. **Not done**: the other 4 real-art
buildings (treasury, steelworks, crude_oil, barracks) are still 2D
sprites — porting them to `Base3DLayer` is the natural next step, not yet
started. `ARCHITECTURE.md` has not yet been updated for this session's
`Base3DLayer`/`Renderer`-split/menu changes.

## Session 53 recap
**Closed a footprint-fit bug on the (since-superseded) 2D HQ sprite** — the
sprite's `anchor`/`widthPx` were hand-picked and disconnected from the
building's real grid footprint, and even once sized correctly the ground
pad was an organic blob, not a clean rectangle, because TRELLIS
reconstructs 3D shape from a single 2D concept image with no hard
geometric constraints. Took three rounds (the first two correctly
rejected by the user as not actually fixing the visual): (1) added
`SquareGrid.footprintFrontAnchor(w,h,cellPx)` and wired `BuildingSprite`
to size/position off the real footprint instead of hand-picked constants;
(2) recaptured the `<model-viewer>` render at the correct 30°-pitch
camera (was 14° off spec) — a real improvement, still not the fix; (3) the
actual fix — edited `main_tent.glb` directly with `trimesh`, deleting
every ground-band face **whose any vertex** fell outside the footprint
rectangle (an earlier per-face-centroid version of this rule left a
crate prop straddling the boundary, caught by the user and fixed same
session — "any vertex outside" is the correct rule, kept for future
buildings).

**Lesson for future 2D building art**, recorded in
[[base-square-grid-footprint]]: verifying computed pixel numbers match a
formula is **not** proof the art visually fits — always overlay the exact
target footprint diamond on the actual rendered pixels before calling a
footprint-fit issue closed. TRELLIS will not preserve a concept's clean
geometric ground pad on its own; every future 2D-sprite building needs the
same mesh-level ground-rectangle trim (`remove_unreferenced_vertices()`
after a face mask — not `trimesh.slice_plane`, which drops UVs).

**Superseded by S54**: the HQ itself no longer uses this sprite at all —
S54 deleted `main_tent_sprite_idle.png` and moved the HQ to a live 3D
model (`Base3DLayer`). The trim technique + lesson above still apply to
the other 4 real-art buildings, which remain 2D sprites.

## Session 52 recap
**New saturated-palette + 12-tier visual guardrails, the base grid rebuilt
from hex to a diamond-projected square grid, and Headquarters tier 1 rebuilt
from scratch as a live modular design.** This is the session the "separate
peer session" note in S49/S51 referred to — confirmed mid-session (via
`git log`, different `Claude-Session:` trailer) that S49–51 landed on a
different, concurrent session while this one was running; no file conflicts,
both sessions independently avoided touching the other's in-flight work.

### Guardrails rewrite
User rejected all 5 previously-"real" buildings outright: "the colloring
looks blank, totally not attractive... this is a mobile game which should
trigger imagination." Pointed at `GAME_DESIGN.md/BASE_DESIHN.jpeg` as the bar
— saturated true-olive greens, deliberate bright accent colors (hazard
yellow/black, tarp blue, insignia white), clean daylight lighting, dense
readable props, grounded in a colorful environment, not a flat grey studio
background. **CLAUDE.md** "VISUAL STYLE" rewritten (desaturated → saturated
palette + a mandatory accent kit) + a new "BUILDING VISUAL GUARDRAILS"
section: one shared color kit across all 19 buildings, a fixed **3-level
tier cadence** (full remodel every 3 levels, not the old 4 uneven bands),
same-tier-same-read across every building regardless of type. **GDD 24**
rewritten to match: the new palette, a "VISUAL TIER SYSTEM" section with the
12-tier ladder (`tier = ceil(level/3)`, 4 eras of 3 tiers each), a
cross-building "tier kit" table (the shared tells every building picks up at
each tier — sandbags, crates, lighting, insignia, blast walls, AA nests —
so a level-10 Treasury and a level-10 Barracks read as the same
fortification stage), a max-level-cap table for buildings below 35, and the
new tier-based atlas naming contract. The 5 previously-real buildings marked
SUPERSEDED, scheduled for a rebuild "one building at a time, gated on
approval before the next."

### BuildingArtConfig.js code (matches the doc)
`LEVEL_BANDS`/`bandOf()` → `tierOf(level)` (12-tier) + `TIER_ERAS`/`eraOf()`
(narrative label only); `PLH.bandScale` (4-step lookup) →
`tierScale(tier)` (smooth lerp 0.55→1.0 across the ladder); `ATLAS.keyFor`
now builds `bld_<id>__t<NN>__<state>` keys. `BuildingPlaceholder.js` /
`BuildingSprite.js` updated to match (`get band()` → `get tier()`). Lint +
build clean.

### Base grid: hex → square, then flat → diamond-projected (two passes)
User: HQ needs to dominate visually (7×8 squares), Military Barracks 4×4,
Treasury 2×2 — **literal squares**, not hexagons, and "the whole idea is
every 6 levels we will increase the internal base area." New files:
`utils/SquareGrid.js` (pure cell↔px math) + `config/BaseGridConfig.js`
(split out of `BaseConfig.js` for the 150-line cap) — `PLOT_STAGES` (18×22
at L1–5 growing to 38×42 at L30–35, every 6 levels, same ~9:11 ratio) +
`FOOTPRINT` (every building's fixed size in squares — both physical size and
visual prominence, independent of level tier). `BaseManager` moved from
axial `(q,r)` + `axialDistance` bounds to cell-unit `(cx,cy)` + pure
grid-unit `footprintInPlot`/`footprintsOverlap` checks. `BaseDraw` /
`BaseGridView` / `BuildingPlaceholder` rewritten for rectangles. First
in-browser check (screenshot) showed a correct rectangular platform — but
**second look surfaced a real geometry problem**: buildings are pre-rendered
from a 3/4 isometric camera (GDD 24's locked frame), so their own silhouette
reads obliquely, while the flat top-down rectangle (matching the genuinely
flat hex terrain around it) visually clashed — "looks strange." User chose
the bigger fix over the cheap one (just angling the gate) — rotate the whole
plot into a diamond. `SquareGrid.js` rewritten again:
`cellCentreToPx`/`pxToCellCentre` (the projection + its inverse, `ISO_RATIO
= 0.5 = sin(30°)`, derived from GDD 24's own 30°-pitch camera, not
arbitrary), `plotCorners` (N/E/S/W), diamond-aware `gridLineSegments` /
`plotHalfExtents`. Gate moved from due-south to the diamond's E→S edge
(`atan2(ISO_RATIO,1)` ≈ 26.57°, matching where the buildings' own camera
implies "front" is) — `BaseDraw._walls`, `WorldMapConfig.obstacles
.baseGateBearingRad`, and a new `BaseGridConfig.gateAnchorAt` (the muster
ground now anchors to the actual gate position, not a flat south offset) all
agree. Hit-testing (`BaseGridView.buildingAt`, `BaseSite.buildingAt`)
rewritten to inverse-project taps into grid-unit space rather than dividing
raw px — cleaner than the original flat-grid version, not just a patch.
Gameplay/validation logic (`footprintInPlot`, `footprintsOverlap`,
`BaseManager._fits`) deliberately stayed in plain grid-unit space, untouched
by either projection change — only rendering and hit-testing project.

**Scope line, deliberate:** plot size is resolved once at boot from the
seeded starting HQ level (`STARTING_HQ_LEVEL` = 3) — live re-growth when HQ
actually crosses a 6-level boundary mid-session (re-blocking world-map
obstacles, moving the muster ground, re-tuning LOD) is **not wired**.
Flagged, not attempted blind.

**Verified in-browser both passes:** lint clean, build clean, screenshots at
multiple camera zooms, and — critically for the second (diamond) pass — the
tap-to-upgrade flow re-tested against real screen coordinates (`camera
.worldToScreen`) end to end (tap → `BuildingHexMenu` opens → correct
building) to confirm the new inverse-projection hit-test didn't regress
S49/51's work.

**Known, unfixed:** `HqView` and `BaseGridView`'s building boxes are
separate sibling Containers under `GROUND_UNITS` with no Y-sort between
them — a building south of the HQ can now visually overlap it and render
behind when it should render in front (cosmetic; hit-testing confirmed
unaffected). The "HQ L3" label sits close to its neighbour's at the new
sprite's proportions. Neither fixed this session — flagged to the user,
deferred at their direction ("we will build all 3D models... after we
complete design we will implement all buildings separately").

### Headquarters — tier 1, rebuilt from scratch as a modular design
**The concept iteration was long and mostly about learning what
text-to-image generation can't reliably do.** Early attempts at one
monolithic "big tent + 2 flanking tents + firepit + flag, all facing a
specific direction" composition drifted a different way on nearly every
regeneration — orientation, symmetry, and the ground-pad shape all fighting
each other under one prompt, image-conditioned "identical except X" edits
proving just as unreliable (locked designs drifted anyway, e.g. a flag
color reverting or a rectangular pad reverting to a diamond). **User's own
call fixed the process, not just this asset:** split into modular kit
pieces instead — one main tent generated alone (much easier to control),
one reusable side tent to be mirrored in-engine for the opposite flank
rather than separately generated. Also cut the flag/firepit entirely
partway through ("it's a tank war game, not a soldiers war") and asked for
explicit command-post signifiers instead (radio mast, camo netting,
sandbags) so the tent doesn't read as a generic supply tent.

**Orientation solved at the wrong layer, then the right one.** Getting FLUX
to put the entrance on a specific side failed repeatedly (a known
weakness of text-to-image models for precise directional instructions).
Fixed instead at the `<model-viewer>` capture step — `camera-orbit` is an
exact numeric angle, so the final sprite's facing is chosen deterministically
after the mesh exists, not gambled on in the prompt. Locked at `128deg 76deg
auto` so the entrance/crate side reads toward the lower-right, matching the
base plot's own gate direction.

**A TRELLIS text-reconstruction bug, fixed by patching the mesh, not
regenerating it.** The concept's stencilled "1" was reconstructed in 3D as
something closer to "7" (TRELLIS has no text understanding — a known
failure mode for any stencilled/painted text). Two dead ends first: local
pixel-inpainting the 2D concept doesn't help since the mesh was already
built from the numeraled version; re-running TRELLIS needed a public URL for
the locally-edited PNG, and neither this session's Replicate MCP
(`create_prediction` rejects local file paths) nor the Artifact `assets`
capability (its blob URLs aren't externally fetchable by Replicate's
servers — confirmed by a failed `curl`) could host one, and embedding the
image as a base64 data URI directly in a tool call is infeasible at this
sizes (a 90KB base64 string alone blew a 25000-token Read cap). Solved by
installing `pygltflib` and patching the mesh's own embedded texture atlas
directly: `convert_images(DATAURI)` → locate the numeral's pixels in the
extracted PNG → the same scanline-inpaint-plus-blur technique used on the 2D
concept → write the cleaned PNG back as the image's data URI (clearing
`bufferView`/`mimeType` so the image struct stays spec-valid) →
`save_binary`. Verified by loading the patched `.glb` in a fresh
`<model-viewer>` test page — loads clean, texture applies correctly.

**Shipped:** `assets/buildings/hq/tier01/` (concept, mesh, turntable,
sprite, a full production-packet README covering all of the above) wired
into `BuildingArtConfig.BUILDING_ART.headquarters.sprite`. The **old
grey-bunker HQ art is deleted outright** (not just marked superseded — user
explicit: "delete previous one to save the space... this design is main
design for HQ 1-3 lvl"), along with every discarded concept iteration from
this session's exploration.

**Verified in-browser:** lint clean, build clean, fresh boot screenshot
shows the new tent HQ correctly scaled and positioned on the diamond
platform, entrance/crate side facing lower-right as intended, no console
errors.

### Not done this session
The HQ side-tent piece + composing it with the main tent into the full
tier-1 read (next, explicitly — "after approved we will jump to the next
one"). Tiers 2–12 for HQ. The same guardrails rebuild for the other 7
starting buildings. Blender cleanup pass (still none, on any building, ever
— baked ground plinths, un-split moving parts). Live plot re-growth on
HQ level-up. The HQ/BaseGridView Y-sort fix. The label-overlap cosmetic
fix. Neighbour-base spacing for a maxed-out (38×42) plot.

## Session 51 recap
**The building tap menu now matches Warpath — a fan of glass hex actions, not
straight-to-Upgrade.** User: "when pressed on the building, it's always opens
upgrade menu, but each building will be having additional functions as well,
so I want you to build the glass menu exactly like in the Research
center.jpeg image I have provided." Read `GAME_DESIGN.md/Research
center.jpeg`: not a docked bottom bar (what Session 49 built) — a row of
glass hexagon icon buttons (Info / Tactics / Upgrade / Research) fanned
below the tapped building, Upgrade gold-highlighted as the primary action,
a title callout above. This is architecturally the existing `RadialMenu`/
`RadialOption` pattern (army unit long-press orders) generalized: anchored
on the tap point, screen-space, options scale in with GSAP — just hex-shaped
instead of discs, and a variable count instead of a fixed 3. Built parallel
classes rather than generalizing the existing ones, to avoid destabilizing
the working unit-order menu for an unrelated feature.

### What shipped
- **`BuildingMenuConfig.js`** (new) — `BUILDING_ACTIONS`: per-building action
  lists. `default: [info, upgrade]`; `barracks: [info, upgrade, manage]`.
  Deliberately does NOT include Warpath's "Tactics"/"Research" icons for any
  building — this game has no research or tactics system, and the project's
  standing rule (established repeatedly this project — "never pretend
  queues/research/multiplayer exist") is no fake buttons for systems that
  don't exist. `ACTION_GLYPH`/`ACTION_LABEL` (single-
  glyph placeholder icons — the existing `RadialOption` letter-icon
  convention, just hex-shaped) + `BUILDING_MENU` (hex/spacing/drop geometry,
  glass vs. gold-`primary` fill/stroke, GSAP stagger timing).
- **`BuildingHexOption.js`** / **`BuildingHexMenu.js`** (new, `src/ui/hud/`)
  — one glass hex button (`hexPolygon` fill/stroke + glyph + label) and the
  fan container (title + N options, GSAP scale-in stagger, `handleTap`/
  `hitTest` mirroring `RadialMenu`'s contract exactly).
- **`BuildingContext.js`** reworked: a building tap now opens the hex menu
  first (`_openMenu`), not the panel directly. Picking `info`/`upgrade` opens
  the existing `BuildingPanel` (real cost/upgrade — unchanged from S49);
  `manage` (Barracks only) cycles production directly
  (`BARRACKS_VARIANTS` → `BaseManager.setBarracksProduction`, instant, real,
  no new sub-menu) — the concrete "additional function" proving the
  framework supports more than Upgrade. `hitTest` extended to also claim
  taps while the hex menu is open.
- **`BaseSite.js`** — now also owns `BuildingHexMenu` alongside the panel,
  enable/disable wired, `BuildingContext` constructor gained a `menu` param.

### A real bug, caught only by testing an actual tap against it
`BuildingHexMenu.handleTap` called `this.close()` (which nulls `_onPick`)
*before* trying to invoke `this._onPick?.(action)` — so no option's callback
ever fired; a tap would visually select an icon (menu closes) but nothing
happened next. Silent — no console error, the menu just closed and picking
Upgrade did nothing. Caught by scripting a tap at the option's real computed
screen position and checking `panelOpen` after, not by reading the code.
Fixed by capturing `onPick` into a local before calling `close()`.

Also hit, and want on record since it's now happened twice this session with
this exact shape: **testing across separate `browser_evaluate` calls gives
stale coordinates** — the camera position isn't stable between tool calls
(same open question as earlier sessions' "camera drift" investigation, still
unresolved as to root cause, but the workaround is proven: compute the tap
position and perform the tap in one atomic call). A second trap on top of
that: calling the SAME "open the menu" tap twice across separate calls
without checking state first re-closes an already-open menu instead of
opening a fresh one — cost real debugging time chasing a phantom "menu won't
open" bug that was actually "menu was already open, so this tap closed it."

**Verified end-to-end in-browser**: tapped Military Barracks at its real
computed screen position → hex menu opened with exactly `[info, upgrade,
manage]`, positions matching `BUILDING_MENU` config exactly; tapped a
non-barracks building (Treasury) → exactly `[info, upgrade]`, confirming the
per-building action list works; tapped Upgrade → `BuildingPanel` opened
(unchanged S49 flow, screenshot-confirmed); tapped Manage → barracks variant
cycled `militaryBarracks → tankFactory` instantly, confirmed both in data
(`buildings.find(...).variant`) and visually (the building's own label
updated to "Tank Factory" — `DynamicBarracks` responding for real, not a
mock); tap-outside dismissed cleanly. No console errors throughout. Lint +
build clean.

**Not done:** Info still aliases the same panel as Upgrade — no dedicated
read-only stats view exists yet. A real Produce/train pipeline (vs. Manage's
instant variant-cycle, which only changes *what* the barracks makes, not
queues anything) is still not built. A separate peer session is mid a
visual/art redesign in parallel this session (`BuildingArtConfig.js` gained
a 12-tier visual ladder, new concept art incl. `assets/buildings/hq_v2/`) —
confirmed no overlap: this session's changes don't touch that file or the
sprite/placeholder rendering path at all, only the tap-menu interaction
layer built on top of the existing `BuildingConfig.js` (mechanics, not art).

## Session 50 recap
**Two small user-reported fixes.** (1) "localhost page does not show properly,
it's just a small part at the corner" — investigated thoroughly (fresh cold
boot, resize-after-load, landscape/small/portrait-mobile viewports, a full
dev-server restart in case a long-lived tab across dozens of this session's
hot-reloads had left something stale) and **could not reproduce it** — every
configuration tested rendered the canvas filling the full viewport correctly.
No code changed here; `Renderer.js`'s resize path (`resizeTo:window` +
`main.js`'s own `window resize` → `Game.onResize` → `Renderer.resize()`) is
unchanged from before this session and wasn't touched by Sessions 47–49
either. Reported back to the user as unreproduced, asking for more detail
(exact window size / browser, or a screenshot) rather than guessing at a fix.
(2) "3 troops stuck in the base, remove them" — `BASE.garrison.slots: 3` with
`roster: ['springfield_squad','springfield_squad','m4_sherman']` (GDD 09 base
defense, `BaseArmy._spawnGarrison`) was placing exactly 3 real units ringed
inside the compound. Emptied `roster` to `[]` — `slots` stays 3 (the real
capacity, unchanged) with nobody currently assigned to it, so the garrison
system itself (Base Fury, the pip-blob hint) stays intact and this is a
one-line revert if the user wants the garrison back later. Verified: a fresh
boot shows no units inside the compound; the outside-the-gate marchable
platoon (a separate system, `BASE.army.roster`) is untouched. Lint + build
clean.

## Session 49 recap
**Tap-to-upgrade is real — the base economy is player-reachable in the game
itself for the first time.** User: research/materials deferred (not urgent);
asked what to build next. Answer, grounded in this project's own repeated
"Next" notes across S45–S48: every base system built so far (upgrades,
resources, personnel) was dev-console-only — nothing a player could actually
touch. Built the GDD-23 "context panel": tap a building (HQ included) → an
action bar slides up with the next-level cost → tap Upgrade.

Also: the user is starting a fresh 3D-model redesign pass in a separate
terminal in parallel (their words: what exists "is actually useless and
totally not matching the design"). Confirmed 3 new untracked concept PNGs
appeared under `assets/buildings/{attack_towers,defence_wall,engineering}/`
mid-session from that other session — left entirely untouched, not part of
this commit. No code overlap this time: this session stayed in game-systems
files (upgrade queue removal, tap-to-upgrade UI), not visual/building-art
config, so nothing needed reconciling.

### What shipped
- **`BuildingContext.js`** (new, `src/worldmap/`) — the tap controller,
  `OrderController`'s shape but for buildings. `hitTest(sx,sy)` composes into
  `WorldScene`'s existing `army.setHudHitTest` chain so a building tap can
  never also read as a march order (true whenever the panel is open OR the
  point is over a building) — this was the one genuinely tricky part: a
  naive implementation would let tapping a building while a squad is
  selected issue a "march to the building" order underneath the panel
  opening.
- **`BuildingPanel.js`** (new, `src/ui/hud/`) — the view. Revives
  `ui/controls/Button.js` (previously orphaned, listed in CODE_AUDIT.md as
  exactly this kind of revival target) for the Upgrade button. Hit a real
  bug getting this working: `Button` hit-tests in raw screen coordinates
  with no awareness of a parent's animated transform, so nesting it inside
  the panel's own sliding `_root` container meant the button rendered in the
  right place but never received taps (visually correct, functionally dead
  — confirmed by testing an actual tap against it, not just reading the
  code). Fixed by making the button a separate sibling fixed at its
  absolute resting screen position, toggling only its `visible` with
  open/close, while `_root` (bg + title + cost text — pure visuals, no
  independent hit-testing) still slides normally.
- **`BaseSite.js`** — now owns `BuildingPanel` + `BuildingContext` together
  (the `BaseArmy` → `OrderController`/`RadialMenu` pattern), plus
  `buildingAt(wx,wy)` (composes a fixed-radius HQ check, since `HqView`
  isn't a grid cell, with `BaseGridView.buildingAt` for everything else),
  `get base` / `get resources` (so `BuildingContext` can read/act on the
  economy without `WorldScene` reaching into `BaseManager`/`ResourceManager`
  directly), and `setHudHitTest`/`hitTest` passthroughs.
- **`BaseGridView.buildingAt(wx,wy)`** — world-space hit-test over every
  visible, renderable building box.
- **`HudConfig.js`** — new `buildingPanel` block (docked-bar geometry, cost
  labels/separator, slide timing).
- **`WorldScene.js`** — one new line (`base.setHudHitTest`) + one line
  extended (`army`'s combined hitTest now also checks `base.hitTest`); both
  `BaseSite.js` and `WorldScene.js` stayed within the 150-line cap on
  otherwise-tight files by keeping the new logic's real weight in the two
  new files instead.

**Verified end-to-end in the browser**, not just unit-level: tapped a real
building via a simulated `INPUT_TAP` at its actual screen position (not a
direct method call) → panel opened showing the correct live cost ("→ L3
Money 655 · 19 materials") → tapped the Upgrade button's actual screen
position → level bumped 2→3, money deducted exactly, panel closed, building
pulsed → tapped the now-maxed building again → panel showed "MAX LEVEL" with
the button visibly disabled → tapped empty ground → panel dismissed cleanly,
no console errors, no regression to normal tap/army-order handling. One
false-positive during testing (state appeared to reset to a fresh boot
mid-sequence) turned out to be Vite's dev-server doing a full page reload in
response to a source edit landing while the browser tab was still open — an
environment artifact of rapid edit-test cycling, not a code bug; resolved by
re-running the same sequence as one atomic, uninterrupted browser evaluate
call with no edits in between, which reproduced cleanly.

**Not done:** Info / Produce / Manage (GDD 23 lists all four for a building
tap; only Upgrade exists). Barracks' Produce action needs the troop
production pipeline first, which doesn't exist. Multi-instance buildings
(a 2nd Treasury) still can't be independently addressed — `BuildingContext`
inherits the same by-`id` simplification `BaseGridView`'s view map already
had; true per-instance addressing was part of the removed S47 peer-session
work and wasn't reintroduced. Lint 0 errors, build clean throughout.

## Session 48 recap
**Correction: building upgrades are instant — Session 47's real-time queue was
built for the wrong system.** The user: "there is no time required to
complete building upgrade, it is done immediate and only materials is
consumed. Only time required will be on research and on material production."
Direct, unambiguous design correction — GDD 04 itself said upgrade cost was
"resources + materials + real time (TIME_GROWTH 1.25)" and Session 47 built
exactly that, verified it worked, and documented it as correct. It was a
legitimate reading of the GDD text, but the wrong economy: checking
`MaterialsConfig.js` (unread carefully in S47) shows the REAL time gate was
already fully speced there and just never consumed — `baseSeconds` per
material + `materialCraftSeconds(materialKey, engineeringLevel)`, for the
Engineering Center's (unbuilt) crafting queue. `docs/gdd/12-research.md` also
already says "cost is Money/Steel/Oil + time" for research ranks. Building
upgrades were only ever supposed to spend whatever materials are already
sitting in inventory — the wait already happened when Engineering crafted
them — and apply instantly. Exactly the same shape of mistake as the thing S47
itself fixed (an unconsumed config field, `upgradeCost().seconds`, taken as
license to build a system around it) — except this time the field genuinely
was for a different system.

### The fix
- **`BuildingConfig.js`** — removed `TIME_GROWTH`, `UPGRADE_QUEUE_SLOTS`, and
  every building's `baseSec` field; `upgradeCost()` no longer returns
  `.seconds`, just `{money?,steel?,oil?,materials}`. Rewrote the file header
  to explain where time actually belongs (Research, Engineering material
  crafting) so a future session doesn't independently re-derive S47's mistake.
- **`systems/UpgradeQueue.js`** — deleted outright. Not repurposed/kept
  speculatively for Research or material crafting either — those systems
  don't exist yet, and pre-building their timer ahead of the systems that
  would drive it is exactly the kind of premature, unrequested scope this
  project's rules argue against; when Research or Engineering crafting is
  actually built, its timed-job system gets designed against that system's
  real requirements then, informed by (but not copy-pasted from) this one.
- **`buildingUpgrade.js`** — kept (the preview/complete split is still doing
  real work keeping `BaseManager` under 150 lines), header corrected.
- **`BaseManager.js`** — `upgradeInstant()` renamed back to `upgrade()` — it's
  the one real path again, not a "dev/cheat convenience." `update(dt)` back to
  a true no-op.
- **`BaseSite.js`** / **`BaseGridView.js`** — all queue wiring removed
  (`window.queue`, `setQueue`, the live "Ns" countdown caption, the
  `BUILDING_UPGRADE_STARTED` subscription). `BaseGridView` is back to exactly
  its S46 shape.
- **`GameEvents.js`** — `BUILDING_UPGRADE_STARTED` removed; `BUILDING_UPGRADED`
  is the only building-upgrade event again.
- **`docs/gdd/04-buildings.md`** — the GLOBAL RULES upgrade-cost line
  corrected: no more "plus real time"; added a pointer to where time actually
  applies (Research, material crafting) so this doesn't drift again.

**Verified live in-browser**: `base.upgrade('treasury')` now bumps the level
in the same synchronous call (no wait), balance deducted correctly for the
exact target level's cost; `window.queue` is `undefined`;
`BuildingConfig.upgradeCost(...)` returns no `seconds` field (checked via a
live dynamic `import()` in the browser console, not just a source read).
Lint 0 errors, build back to a clean 303 KB bundle throughout.

**Not done (unchanged, now correctly re-scoped):** no in-game UI to trigger an
upgrade — `window.base.upgrade(id)` only. The real-time systems this economy
actually needs — Engineering Center material crafting and the Research tree —
remain unbuilt; `MaterialsConfig.materialCraftSeconds` and GDD 12's research-
rank timing are both fully speced and waiting, same as building-upgrade cost
was before Session 47 (and before that, before the post-audit rebuild) — a
recurring pattern worth watching for: this config layer tends to get built out
completely before the runtime catches up, and it's easy to wire the right
formula to the wrong consumer.

## Session 47 recap
**A rejected peer redesign, fully removed; then Phase C's first real system —
the real-time upgrade queue.** Two distinct pieces of work.

### Part 1 — the "connected-base" 3D redesign was removed
The user had been discussing a base-visual redesign in a SEPARATE peer Claude
Code session (`blitzmire-38`, coordinating through new shared files —
`AGENTS.md`, `docs/BASE_REDESIGN_PLAN.md` — and edits to `CLAUDE.md` / GDD
01/04/18/README pivoting the north star from "Warpath parity" to "Warpath-
inspired combat + an original connected base"). That session had built a real
Three.js overlay (`Base3DView.js`, composited over the Pixi canvas via new
`Renderer.setExternalRender/Resize` hooks), a Blender-scripted GLB
(`tools/create_base_model.py` → `base_compound_v1.glb`), an instance-identity
model in `BaseManager` (so multiple barracks could be addressed
independently), and a `node:test` suite — all uncommitted. Rendering the GLB
directly (the same `<model-viewer>` pipeline used for the HQ sprite pipeline)
showed why the user rejected it: **no material survives the Blender→glTF
export** — it's flat, untextured grey boxes at every camera angle, regardless
of the underlying geometry. The user said "I totally do not like this poor 3D
design, size mismatching and everything" and asked for it all removed.
Since none of it was ever committed, `git stash push -u` captured the entire
working tree in one move (`git stash list` still has it — recoverable, not
deleted) while restoring the tree to this repo's last real commit (`8939058`).
Verified after: `git status` clean, lint 0 errors, build back to the normal
303 KB bundle (no Three.js). The other terminal has since been switched off by
the user; it has no way to know its files are gone until told.

### Part 2 — the real-time upgrade queue (Phase C, first system)
User: "let's continue with game architecture development" → picked **Phase C
— real base systems** over finishing the visual track, world-map content, or
the front-end UI (explicit choice among roadmap tracks). GDD 04 already
specifies upgrades cost "resources + materials **plus real time**
(`TIME_GROWTH` 1.25)", and `BuildingConfig.upgradeCost(...)` already computed
a `.seconds` field — the config layer was complete, just never consumed;
`BaseManager.upgrade()` applied levels instantly.

- **`buildingUpgrade.js`** (new, pure functions, the `DynamicBarracks.js`
  pattern) — `previewUpgrade(buildings,hqLevel,ref)` quotes + validates
  without mutating; `completeUpgrade(buildings,events,ref)` applies a level
  already paid for and emits `BUILDING_UPGRADED`. Extracted out of
  `BaseManager` specifically to keep it under the 150-line cap once the queue
  wiring landed there too — not just a style choice.
- **`UpgradeQueue.js`** (new loop system, owned by `BaseSite`) — `start(ref)`
  quotes via `previewUpgrade`, refuses if `UPGRADE_QUEUE_SLOTS` (1 — one
  builder, GDD-thin so defaulted to the genre norm) jobs are already active or
  the SAME building is already queued, else pays via `ResourceManager.spend`
  and opens a timed job; `update(dt)` counts every job down and calls
  `completeUpgrade` at zero. New event `BUILDING_UPGRADE_STARTED
  {id,fromLevel,toLevel,seconds}`.
- **`BaseManager`** — `upgrade()` split into `previewUpgrade`/`completeUpgrade`
  (now living in `buildingUpgrade.js`) + a new `upgradeInstant(ref)` dev/cheat
  convenience that does both with no timer (`window.base.upgradeInstant`).
- **`BaseGridView`** — `setQueue(q)` wires the queue in; `_relabel` (now also
  called every frame from `update(dt)`, not just on placement/patch) shows a
  live `"{n}s"` countdown caption in place of the level while that building's
  `id` has a job, reverting automatically once `BUILDING_UPGRADED` fires and
  `_patch` calls `_relabel` again.
- Small drive-by fix in the same file: `BaseSite._syncLod` was calling
  `this._hq.setBlend(reveal, 1)` with a stale unused second argument left over
  from S46's HqView simplification — harmless (JS ignores extra args) but
  cleaned up.

**Verified live in the browser**, not just read — `window.queue` /
`window.base` / `window.rm` console calls: paying up front (money balance
dropped by the exact `upgradeCost` for the target level, before the level
itself changed); the level staying old until completion; the countdown
(`remainingFor`) ticking down; `UPGRADE_QUEUE_SLOTS` correctly refusing a
SECOND, different building while one job is active; re-queueing the SAME
building while mid-upgrade correctly refused; fast-forwarding
(`queue.update(bigDt)`) firing `BUILDING_UPGRADED` and bumping the level
exactly once; the existing HQ-level gate correctly refusing a further upgrade
once a building hit the current HQ-level cap (treasury L3, HQ L3 — refused,
as designed, not a bug); the label's live "Ns" text confirmed by walking the
actual PixiJS scene graph for the real Text node's `.text` value (`"Steel\n
79s"`), then confirmed it reverted to `"Steel\nL3"` after completion. Lint 0
errors, build clean throughout.

**Not done:** no in-game way to trigger an upgrade yet — `window.queue.
start(id)` only, no tap→context-menu UI (that's its own, larger task, listed
next in the roadmap). Jobs are tracked by building `id`, not a true per-
instance key, so a second building of the same type (e.g. a 2nd treasury)
can't be independently queued yet — matches BaseGridView's existing per-id
view-map limitation, not a new regression; real per-instance addressing was
part of the removed peer-session work and wasn't reintroduced.

## Session 46 recap
**The HQ shrinks in place — Session 45's LOD model was still wrong, plus 4
more real buildings.** The user rejected Session 45's fix a second time: "base
zoom not even close to what I'm asking" (sent before the follow-up below), and
then gave a precise, literal walkthrough of Airlift 1/3/5/6 and Base zoom
1/in2/in3/in4 — the compound's world footprint never changes size (confirmed:
S45 already had this right), but the **Headquarters itself is what's visible
at max zoom-out**, oversized, standing in for the whole base; zooming in makes
the HQ **shrink in place** (not just hold a constant screen size — its actual
pixel footprint gets smaller, confirmed by measuring the reference screenshots:
the wall grows ~35% between two zoom steps while the HQ shrinks ~20% over the
same step) while the walls solidify and the other buildings fade in around it.
Session 45's `BaseMarker` (an abstract fort-icon pin, constant screen size,
swapped for the compound) never matched this — none of the reference stills
show an abstract icon, every one shows the real HQ at a different scale.

### The fix
`BaseMarker.js` → renamed **`HqView.js`**: no longer an abstract icon, it
wraps a real `BuildingSprite('headquarters')`, rendered at every zoom, never
swapped out. `setBlend(reveal)` sets `scale = lerp(lod.hqFarScale (3.0), 1,
reveal)` — 3× size at the far end of `lod.buildingBand`, shrinking to true
size (matching its siblings) by the near end. `BaseGridView._place` now skips
`headquarters` entirely (HqView owns it); its `setBlend` gives every OTHER
building its own start point spread across `lod.buildingStart`..+
`buildingSpread` (by insertion index) instead of one shared group-alpha, so
they reveal one after another rather than all at once — matching the
reference's "wall first, then 2 buildings, then everything" staggered
sequence. `TerritoryRing` (unchanged component) now fades out over
`lod.ringFadeFrac` as the walls solidify, computed in `BaseSite` rather than
hard-wired into the ring itself. `BaseTroops` lost its dependency on the now-
deleted `WORLDMAP.marker` sizing block (replaced with a small fixed anchor
constant) — its role is unchanged (the far garrison-pip hint, crossfading with
real troops over `lod.pinBand`, which now has no visual marker attached to it
at all, just a blend curve). `WorldMapConfig.marker` (the abstract fort-icon
spec) was deleted outright — `WORLDMAP.plot` (neighbour bases, which still use
the icon via `PlotMarker`) is untouched.

### Verified
A raw `camera.zoom` sweep (0.40 → 0.55 → 0.70 → 0.78 → 0.85 → 1.0, one
screenshot each, dev server) reproduces the reference progression almost
exactly: 0.40 = HQ alone + full-strength dotted ring on bare grass (matches
"Base zoom 1"); by 0.70 the wall/platform is fully solid with the HQ still
large (matches "zoom in 2"); 0.78 shows a genuine partial reveal (some
buildings ghosting in, others still near-invisible — matches "zoom in 3"'s
partial-buildings read); by 0.85–1.0 every building is visible and the HQ has
shrunk down to roughly match its siblings' scale (matches "zoom in 4/5"). A
second, completely unprompted fresh page load (no manual zoom set) landed near
the far end on its own and rendered the "Base zoom 1" state correctly,
confirming the behaviour isn't an artifact of the manual test values.

### 4 more real buildings (same pipeline as the HQ)
Regenerated the production pipeline from Session 45 (FLUX 1.1 pro concept →
`firtoz/trellis` mesh → `<model-viewer>` iso render → `toDataURL` real-alpha
capture → PIL bbox auto-crop) for **Treasury**, **Steelworks**, **Crude Oil**,
and **Military Barracks** — grounded each FLUX prompt in the matching
reference still (`Money factorry.jpeg`, `Steel Factorry.jpeg`, `Oil
Factorry.jpeg`, `Infantry Barrack.jpeg`). All 4 wired into
`BuildingArtConfig.BUILDING_ART[id].sprite` alongside the HQ's; each gets a
production-packet README under `assets/buildings/<id>/` matching the HQ's
format (concept ✅, raw mesh ✅, static sprite on map ✅, Blender cleanup /
atlas ⛔). **5 of 8 starting buildings are now real 3D-derived art**
(headquarters, treasury, steelworks, crude_oil, barracks); `defence_wall`,
`attack_towers`, `engineering` remain the animated vector placeholder — the
natural next candidates, deferred this session on Replicate credit (a stray
`$0` test prediction was cancelled mid-run but still completed and billed
before the cancel landed — logged as a lesson, not repeated). One accepted
cosmetic detail on the Treasury/Steelworks crops: a small dark AO-shadow
gradient at the front-bottom corner of the baked ground plinth, confirmed via
pixel sampling to be a natural shadow gradient, not a broken cutout.

### Not done this session (unchanged from Session 45's list)
No Blender cleanup pass on any mesh (still baked ground plinths, un-split
moving parts, one static pose). No Airlift/relocation UI — the red/green
placement-preview, drag-to-move, and build-in animation from the reference are
still entirely unbuilt; `territory.findTerritoryConflict` still only runs as a
`console.warn` dev-check against the static neighbour layout. Lint (`npx
eslint src/`) and `vite build` both clean throughout.

## Session 45 recap
**VISUAL TRACK — match the reference zoom exactly + a real building on the map.**
The user pushed back hard on Session 44's LOD: "walls jump to a bigger interior
and overlap" + no territory + the HQ 3D model built last session was sitting
unused in `assets/`. Re-examined the full reference set (renamed/reorganised —
individual per-building shots, a "Base territory on the map" still, an Airlift
sequence, and a "Base Zoom and Relocation.mp4"). That revealed the real Warpath
model: the compound is drawn at ONE fixed world size always (the camera zooming
is the only thing that makes it bigger — same as terrain or a unit); below a
zoom threshold it's replaced by a constant-**screen**-size pin (a legibility aid,
not a shrunk copy); a dotted "territory" ring marks a claimed radius that other
bases may not sit inside. My Session 44 build had it backwards — a marker that
independently grew to chase the compound's size, which is exactly the "jump /
overlap" the user saw. Lint + build clean; verified in-browser (0 console
errors) both programmatically (single-call state sweeps) and visually.

### Reference re-review
`GAME_DESIGN.md/` now has real filenames (was WhatsApp timestamps): "Base zoom"
→ "Base zoom in 2" → "...3" → "...5" is a single base, unchanged proportions,
revealing more buildings as you zoom in, with a dotted territory circle present
from "zoom 1" onward at a FIXED world size (it does not resize as the wall
"grows" — the wall doesn't grow either, the camera does). "Airlift 1/3" show
the relocation flow: a green dashed hex = the placement footprint, red hatching
across the wider map = territory you may NOT place in. "Map max/mid zoom out"
confirm every base (including your own) is a small constant-size 2D pin at FAR.

### New
- `src/worldmap/TerritoryRing.js` — a dotted circle, world-space (scales with
  the camera like the compound), hand-rolled dashed-stroke draw, `setBlend(a)`.
  One per `BaseSite` (the player, full alpha) and one per `PlotMarker` (dimmer,
  static) — `WORLDMAP.territoryRadiusPx` / `.territory` style.
- `src/worldmap/territory.js` — pure geometry: `territoriesOverlap(a,b)` +
  `findTerritoryConflict(candidate, claimed)`. Run today as a `console.warn`
  dev-check on the static `neighbourHexes` layout (`WorldScene.enable`); the
  rule a future Airlift/relocation flow calls before allowing a placement.
- `assets/buildings/hq/hq_sprite_idle.png` — the HQ TRELLIS mesh, rendered via
  `<model-viewer>` at the locked GDD-24 iso camera, alpha-cropped to content
  (via `model-viewer.toDataURL()` + PIL bbox crop — real transparency, no
  white-halo cutout).

### Changed — the LOD model (BaseMarker / BaseSite / WorldMapConfig)
- `BaseMarker` — now a **constant-screen-size pin**: `enable()` measures its
  icon and sets `_baseScale = pinScreenPx / iconWidth`; `setBlend(alpha,
  cameraZoom)` sets `scale = _baseScale / cameraZoom` every frame, so it reads
  the same size on screen at ANY zoom, like a real map pin. No more "grow to
  match the compound" tween.
- `BaseGridView` / the compound: unchanged from Session 44's fix (drawn at true
  `PLATFORM_SPAN_PX` size, never rescaled) — that part was already right.
- `BaseSite._syncLod` — `pin` over a tight `lod.pinBand` swaps marker↔compound;
  `reveal` over a wider `lod.buildingBand` staggers buildings + the territory
  ring in as you keep zooming past that swap.
- `WorldMapConfig` — `lod.farMid/midNear` → `lod.pinBand [0.34,0.46]` /
  `buildingBand [0.40,1.0]`; new `pinScreenPx` (44), `territoryRadiusPx`
  (`PLATFORM_SPAN_PX/2 × 2.3`), `territory` style block; `startZoom` 0.35→1.0.
- `WorldScene` — `_lodDetail` reads `lod.pinBand`; the neighbour-hex loop now
  builds a claimed-territory list and warns on overlap.
- `PlotMarker` — owns + enables its own dim `TerritoryRing`.

### Changed — the HQ on the map (BuildingArtConfig / BuildingSprite)
- `BuildingArtConfig.headquarters` gained `sprite: {url, anchor:[0.5,0.87],
  widthPx:172}` — a Vite-imported PNG, not a bare path.
- `BuildingSprite._loadSprite()` (new) — if `art.sprite` exists, `Assets.load`s
  it async and swaps in a real `Sprite` ahead of the procedural placeholder
  (which hides; FX stays on top) — the same slot a full atlas lands in later.

### Verified in-browser
- Single-call zoom sweep: `markerWorldScale × cameraZoom` == `0.0989` at both
  zoom 0.15 and 0.30 — the pin's SCREEN size is provably constant. Marker
  alpha 1→0.5→0 and compound/territory alpha 0→0→1 land exactly on the FAR /
  MID / NEAR zooms the bands specify.
- `gv._views.get('headquarters').sprite._sprite` exists and the placeholder is
  hidden — the real building renders. A screenshot (loop paused, manual
  `renderer.app.render()`, so nothing could drift mid-capture) shows the actual
  HQ art — bunker, radar mast, dish, antenna — in place on the compound, next
  to the wall, other placeholder buildings, and their labels.
- 0 console errors throughout.

### A test-harness note, not a game bug
Across several multi-call screenshot sequences, `camera.zoom`/`x`/`y` changed
between tool calls with the loop paused and no code path that should touch
them — almost certainly Puppeteer/CDP screenshot-related synthetic input
leaking into `InputManager`. A same-call sweep (set zoom → read 15 samples
over 2 s inside one `evaluate`) held perfectly steady, as does a fresh page
load. Documented here so a future session doesn't re-diagnose it.

### Next (visual track)
The same concept→mesh→sprite pipeline for the other 18 buildings; drive
`BuildingSprite.setState('working')` from real production; the tap→context-
menu UI kit; a real Airlift/relocation flow wired to `territory.js`; then
animated multi-band Blender atlases replacing today's static sprites.

## Session 44 recap
**VISUAL TRACK — 3-stage base zoom LOD.** The reference material (a frame-by-
frame zoom-out from the base to the world map) shows three read-states; the LOD
was a 2-state marker⇄compound blend. Restructured into a proper continuous
3-stage LOD with the right content at each level. Lint + build clean; verified
in-browser (0 console errors). This is the LOD *behaviour*; the assets stay
placeholder vector art.

### The three stages (continuous, no threshold snap)
- **FAR** (`camera.zoom` ≲ 0.30) — a small marker on the flat map + the troop
  pips; world-space unit UI (health bars, order rings) faded to 0.
- **MID** (~0.30–0.62) — the marker grows into the full fort silhouette; unit
  UI fades up.
- **NEAR** (0.62–1.0+) — the fort dissolves into the full walled compound with
  animated buildings; pips gone.

### Changed
- `WorldMapConfig` — `lodZoomIn` / `lodZoomOut` → `lod { farMid: [0.30, 0.62],
  midNear: [0.62, 1.0] }` (the two smoothstep bands) + `nearZoom` 1.1 (Home) /
  `farZoom` 0.22 (World) + `startZoom` 0.35 → 1.0 (boot into the base view).
- `BaseSite._syncLod` — computes `mid` + `near` from the two bands; calls
  `_marker.setBlend(mid, near)`, `_view.setBlend(near)`, `_troops.setBlend(near)`.
- `BaseMarker` — `enable()` computes `_fortScale = PLATFORM_SPAN_PX /
  iconWidth`, so the MID fort is drawn at **exactly the compound's wall
  footprint** (was ~445 px vs the compound's 767 — a >1.7× size jump at the
  handoff that read as "walls jump to a bigger interior / overlap"). `mid`
  grows a `PIN_FRAC` (0.3) pin → that full fort; `near` fades it out **at that
  size**. Dropped the extra `GROW_TO` scale.
- `BaseGridView.setBlend` — dropped the whole-compound `SCALE_FROM 0.93→1`
  rescale; it is now a **pure alpha crossfade** (per-building pop-in kept). The
  "expansion" is 100 % the camera zoom, so the walls grow continuously into
  view with nothing rescaling under them.
- `WorldScene._lodDetail` (new, per-frame) — fades the `WORLD_UI` layer with the
  FAR→MID band so the strategic map isn't littered with tiny bars.
- `MapButtons` — Home → `WORLDMAP.nearZoom`, World → `WORLDMAP.farZoom` (dropped
  the duplicate `homeZoom` / `worldZoom` from `HudConfig`).

### Verified in-browser (swept camera.zoom, 0 console errors)
Marker vs compound **world width** (they must match through the handoff):
| zoom | marker w / α | compound w / α | troop pips α | unit-UI α |
|---|---|---|---|---|
| 0.22 FAR | 225 / 1.0 | 767 / 0 | 1.0 | 0 |
| 0.62 MID | **752** / 1.0 | **767** / 0 | 1.0 | 1.0 |
| 0.80 handoff | 752 / 0.6 | 767 / 0.85 | 0 | 1.0 |
| 1.10 NEAR | — / 0 | 767 / 1.0 | 0 | 1.0 |

Marker and compound stay the same size (±2 %) across the crossfade — no jump.

### Next (visual track)
A real pin sprite for FAR; MID troops as power-tagged icon stacks (not the pip
blob); the tap→context-menu UI kit; production→`BuildingSprite.setState`
wiring; then Blender atlases + the world-map tileset / roads / sectors / fog.

## Session 43 recap
**VISUAL TRACK — solid map objects + unit spacing.** The user's bug: marching a
squad onto the base walked it through the buildings; troops also stacked on one
another. The compound (and neighbour bases) are now impassable obstacles, a
drop on one snaps to its edge, and a shared separation pass keeps units apart.
Lint + build clean; verified in-browser (0 console errors).

### New
- `src/systems/Separation.js` — a loop system (owned by `WorldCombat`) that
  runs a cheap terrain-guarded boids nudge over **every** live entity (all
  teams), `AI.separation` magnitude, O(n²) over the small list. Breaks a
  perfect stack on a fixed axis; never touches the A* route. Replaces
  `AIManager._separate` (which was enemy-only).

### Changed
- `WorldField` — `blockDisc(cx, cy, r, gateBearing?, gateHalf?)` stamps every
  grid tile in the disc `blocked` (Pathfinder routes around, `entityMotion`
  won't step onto, `isPassable` false), leaving an optional gate wedge open.
  `nearestOpen(wx, wy, maxRings?)` rings outward to the nearest passable tile
  centre — snaps a march drop out of a solid, returns the point unchanged when
  already open.
- `WorldScene._blockObstacles` — `blockDisc`s the player compound
  (`platform.hexR × 0.9`, a 40° gate gap facing the muster ground, due south)
  and each of the 4 neighbour bases (`obstacles.plotBlockPx`).
- `EntityManager` ORDER_MOVE — routes the destination through
  `field.nearestOpen` before `moveTo`, so a drop on a building / base lands at
  its edge, not inside.
- `AIManager` — `_separate` / `_shove` removed; `AI` import dropped.
- `onslaughtSpawn` — raiders now approach from **south** (the gate side), and
  the converge point is run through `field.nearestOpen` so the blocked compound
  can't strand them.
- `WorldMapConfig` — new `obstacles` block (`baseBlockFrac`, `baseGateDeg`,
  `baseGateBearingRad`, `plotBlockPx`, `snapMaxRings`).
- `AIConfig.separation` doc — now names `systems/Separation.js` (all teams).

### Verified in-browser (hand-cranked sim, 0 console errors)
- Compound centre + sides are impassable; the south gate gap is passable
  (16 tiles blocked across the base + 4 plots).
- A march order dropped on the base centre snaps its target to ~381 px out
  (just past the `R≈376` footprint) onto open ground.
- A heavy tank aimed dead-centre from outside drove up to ~292 px and stopped —
  it never crossed the wall.
- Two infantry placed on the exact same pixel separated to exactly 34 px
  (`AI.separation.radiusPx`) within ~1.5 s.
- Onslaught wave 1: both raiders spawn ~800 px south, have live move targets,
  none frozen by the block.

### Next (visual track)
Drive `BuildingSprite.setState('working')` from real production; the
tap→context-menu UI kit; the LOD "base reacts" tuning pass.

## Session 42 recap
**VISUAL TRACK — art bible + building-render framework.** The user supplied a
Warpath visual-quality reference and asked for the base rebuilt to that tier:
every building unique and *animated* ("real action happening in there"), same
menu style, original art. This session lays the foundation — the spec and the
code that consumes real assets — on procedural placeholders. Lint + build
clean; verified in-browser (0 console errors).

### New — `docs/gdd/24-visual-direction.md` (the art bible)
The locked isometric frame (30° camera, warm key from upper-left, one shadow),
the CLAUDE.md palette as law, the material vocabulary, the **level grammar**
(improvised → established → reinforced → fortified — silhouette must change per
band), the **state grammar** (idle / working / upgrading / offline / damaged),
the animation + FX-layer spec, the **atlas delivery contract**
(`bld_<id>__<band>__<state>__####.png` → hash atlas), **per-building briefs**
for the 8 seeded buildings (each with its signature working animation), the
menu-chrome kit, the base-territory / airlift / world-map overlays, and the LOD
"base reacts" sequence. The approach: **pre-render 3D → sprite atlases** for a
2D engine; a real-time 3D layer under the HUD is an optional later upgrade.

### New — `src/ui/base/` (the framework)
- `BuildingSprite` — one building's view. Owns `level` / `state` / `variant`;
  renders through a placeholder + FX today, an atlas `AnimatedSprite` per
  band/state when one ships — identical API. `setLevel` → band silhouette,
  `setState` → animation + FX intensity, `update(dt)` advances it.
- `BuildingPlaceholder` — the procedural stand-in: a faux-3D hex block scaled
  to the level band plus **one signature moving part** — radar sweep / pump nod
  / crane slide / shutter cycle — so a building is never a static rectangle.
- `BuildingFx` — a state-driven additive glow + pooled rising smoke puffs per
  chimney anchor (alloc-free steady state, no combat ParticleSystem).
- `src/config/BuildingArtConfig.js` — `BUILDING_STATE`, `LEVEL_BANDS` +
  `bandOf`, `ANIM` timings, `PLH` placeholder geometry, the `ATLAS` key/path
  contract, and `BUILDING_ART[id]` (tint, footprint cells, signature element,
  smoke/glow recipe) for the 8 seeded buildings + a generic fallback.

### Changed
- `BaseGridView` — each building is now a `BuildingSprite` in a per-building
  `box` Container (was a raw `Graphics` via `BaseDraw.buildBuilding`).
  `update(dt)` ticks every sprite (skipped while the build root isn't
  renderable). `BUILDING_UPGRADED` → `sprite.setLevel` + pulse;
  `BARRACKS_TRANSFORMED` → `sprite.setVariant`. Staggered reveal + pulse kept
  (timings moved to `ANIM`).
- `BaseDraw.buildBuilding` retired (BaseGridView no longer imports it).

### Verified in-browser
- 8 buildings render as `BuildingSprite`; band resolves (`improvised` at L1–3);
  economy buildings default `working`, the rest `idle`.
- Every signature element animates over 6 s of sim — radar spins (idle 22°/s),
  cranes slide on rails, the pump nods, shutters cycle; working buildings show
  a brighter glow (0.5 vs 0.16) and a faster smoke plume (4 live puffs vs 0/2).
- LOD blend still gates it — buildings fade/scale with camera zoom and the
  animation loop skips when the base is zoomed out.

### Next (visual track)
Drive `setState('working')` from real production; the tap→context-menu UI kit
(Info / Upgrade / Produce); the LOD "base reacts" tuning pass; then per-building
Blender atlases drop in with no code change.

## Session 41 recap
**PHASE B4 — model-derived unit stats + GDD-02 counters.** The `UnitStats` rows
were hand-typed guesses and firefights were grindy (a rifle mirror ran ~22 s);
the `COUNTERS` table had also drifted from GDD 02. Now every base row derives
from one dial, and the counter chain matches the spec verbatim. Lint + build
clean; analytic TTKs verified + wired rows checked in-browser (0 console errors).

### New — the stat model
- `src/config/unitRoles.js` — the tuning tables: `REFERENCE` (a 4★ Medium Tank,
  the 1.0 on every axis), `MIRROR_TTK_SECONDS` (13 — the single dial; a medium
  mirror match lasts this, `REFERENCE.dmg` solves from it), `CLASS_ROLE`
  (9-class shape — hp/dmg/def/rof/pen multipliers + absolute rng/spd/acc/dodge/
  armour + flags), `FACTION_DOCTRINE` (Germany +armour/+HP −speed, USA +ROF/
  +range/+speed, Russia +HP/+AoE −acc, per GDD 03), `INFANTRY_TIER` (bolt →
  semi → auto: `rofMul` only, DPS-neutral — the tier power gain is the existing
  `STAR_MULTIPLIER`, not re-applied here), `UNIT_OVERRIDE` (5 GDD-03 per-unit
  callouts: T-34 durable, Hellcat glass, SU-100 pen, ISU-152 short-range/tanky,
  Chaffee HE).
- `src/config/UnitModel.js` — `deriveRow(key, [faction, cls, star])`: the ONE
  place a base stat is computed (`REFERENCE × role × (1 + doctrine) ÷ infantry
  rofMul`, rounded). Solves `REF_DMG` from the TTK anchor at load.

### Changed
- `UnitStats.js` — `INFANTRY` / `TANKS` / `TANK_HUNTERS` / `UNIQUE` are now
  `build()` calls over a `{key: [faction, cls, star]}` `REGISTRY` (groups keep
  their historical membership so the entity subclasses' `INFANTRY[KEY]` imports
  still resolve). `CLASS_TRAITS` / `UNIT_CLASSES` / `GATHER_TRUCK` unchanged.
- `CombatConfig.COUNTERS` — GDD 02's chain verbatim: every pair SOFT (1.2)
  unless the GDD writes "(hard)" (tank-hunter → heavy, AT gun → super-heavy).
  Dropped the pairs the config had invented (AT gun hard-countering all armour,
  medium → infantry, etc.).
- `CombatConfig.VS_INFANTRY` (new) — anti-infantry effectiveness by attacker
  class (target infantry only): arty 2.0, launcher 1.8, light/medium/heavy tank
  1.7 / 1.5 / 1.6, super-heavy 1.35, no-turret hunter 0.7, AT gun 0.4. Replaces
  the arty-vs-infantry `COUNTERS` rows — it's a weapon property, not the chain.
- `CombatConfig.SOFT.smallArmsVsArmour` (new, 0.035) + `DamageResolver` — an
  attacker with **no `pen` at all** (rifle squads) does a flat chip to armour
  instead of the 0.35 ricochet band, so a lone tank isn't ground down by small
  arms (GDD 03: "infantry can't fight tanks"). `resolveDamage` also applies
  `VS_INFANTRY[attackerCls]` when the target is infantry.

### Verified (analytic model + in-browser)
- Mirrors: rifle squad ~8 s, medium ~13 s (the anchor), heavy ~18 s.
- Counter chain: heavy → medium ~6 s (medium → heavy 62 s — must flank);
  medium → light ~7 s; tank-hunter ↔ heavy even head-on (TH wins on 7-tile
  ambush range); infantry deletes an exposed AT gun; AT gun → super-heavy slow
  but works.
- Tank ↔ infantry: rifle squad → lone medium ~58 s vs medium → squad ~38 s
  (tank wins); Tiger shrugs off rifles (~104 s); howitzer wipes a squad ~12 s.
- In-browser: all 24 derived rows load into real entities, no `NaN`, a forced
  fight resolves with deaths and no errors.

### Next (B4)
Playtest and retune the anchors from `unitRoles.js`; tie Onslaught difficulty
scaling to the new numbers; then GDD-17 map objects (roads, sectors, fog,
resource fields / camps / plunder).

## Session 40 recap
**PHASE B4 — ground decals (tracks + scorch).** `WorldField.addDecal` was a
no-op stub and `DecalField` / `VehicleDust` were orphaned on disk, so the world
map showed no sign that anything moved or fought on it. Both are now wired:
moving vehicles lay tread marks and kick dust, explosions scorch the ground.
Lint + build clean; verified in-browser, 0 console errors.

### Changed
- `WorldScene` — owns a `DecalField`; `enable()` calls
  `_decals.enable(renderer.layer('DECALS'))` + `_army.field.setDecalSink(_decals)`
  before the army/combat come up; `disable()` destroys it.
- `WorldField` — `setDecalSink(field)` + `addDecal(type, wx, wy, sizePx, rot)`
  forwards to the sink (inert until wired). `EffectsSystem` / `Explosion`
  already call `battlefield.addDecal('scorch', …)` — that now lands.
- `VehicleDust` (src/effects/) — broadened from "dust puff" to "what a moving
  vehicle leaves behind": measures displacement once → `speed`, then
  `_emitDust` (unchanged particle path) **and** `_stampTrack` — on a coarser
  `VEHICLE.tracks.stampIntervalMs` throttle, `field.addDecal('track', behindHull,
  sizePx, e.rotation)` (a rect aligned to travel). New `_track` throttle Map,
  pruned with the rest. 4th constructor arg `field`. Alloc-free.
- `WorldCombat` — constructs + enable/update/disable`s the `VehicleDust`
  (in `enable()`, once `fx.particles` exists, like `ProjectileSystem`); passes
  it the shared `EntityManager` + `ParticleSystem` + `WorldField`.
- `EntityConfig.VEHICLE` — new `tracks { stampIntervalMs: 85, minSpeedPxPerSec:
  26, offsetPx: 15, sizePx: 30 }`.
- `TerrainConfig.DECAL` — `poolSize` 64 → 110 (the ring caps the on-map decal
  count and, at the track cadence, the visible trail length); `track.alpha`
  0.18 → 0.16.

### Verified in-browser (hand-cranked sim, 0 console errors)
- Marched the 4 non-infantry player units ~700px: `DecalField._active` climbs
  0 → 110 (pool full), never exceeds `poolSize` (ring eviction holds); a
  sampled track sits on the path, rotation ≈ π/2 (driving south).
- `decals.clear()` → 0; kill an enemy at (10278, 11050) → `ENTITY_DIED` →
  explosion → exactly one `scorch` decal, positioned on the dead unit.

### Next (B4)
`UnitStats` / Onslaught-difficulty balance pass (firefight TTK is ~20 s for
even matchups — a design-tuning call, best done with a target TTK from the
designer); then GDD-17 map objects (roads, sectors, fog, resource fields /
Marauder camps / plunder as tappable targets).

## Session 39 recap
**PHASE B4 — personnel-gated roster + a real garrison (GDD 06).** The player's
troops were a hardcoded 6-entry list spawned straight onto the map with no cost
and no cap — 6 units where the design allows 5, and nothing tying them to the
personnel economy. The orphaned `PersonnelManager` / `SquadManager` /
`DeployedSquad` stack (grid-agnostic, event-driven, written for the old
battlefield flow) is now wired into the live world map: the marchable platoon is
capped at `BASE.army.deploySlots` (5) and a 3-unit garrison rings the compound
interior, every unit reserving personnel on deploy through `SquadManager` and
freeing it on death. Lint + build clean; verified in-browser, 0 console errors.

### Changed — `src/worldmap/BaseArmy.js`
- 4th constructor param `personnel`; owns `this._sm = new SquadManager(events,
  this._em, personnel)`, `enable`/`update`/`disable` it alongside the
  `EntityManager`.
- `_spawnPlatoon(m)` — iterates only the first `BASE.army.deploySlots` of
  `BASE.army.roster`, two rows on the muster ground.
- `_spawnGarrison(centre)` — `BASE.garrison.roster` capped at `.slots`, placed on
  a ring at `platform.hexR × 0.5` inside the walls; returns the count.
- `_deploy(key, x, y)` — `sm.createSquad(key, ENTITY_COST[cls])` (one unit per
  slot in v1) → `unitRoster.makeUnit`; a null `squadId` (pool short) stops the
  loop. Unknown roster key → `console.warn` + stop.
- `get garrisonCount`; `window.army` / `window.sm` dev handles.

### Changed — the rest
- `BaseSite` — constructs + `enable`/`update`/`disable`s a `PersonnelManager`
  (`reservesBarracksLevel: () => this._base.hqLevel` — HQ level is the v1 proxy
  for the not-yet-built Reserves Barracks). `get personnel` (handed to
  `BaseArmy`), `setGarrisonPips(n)` → `BaseTroops`.
- `PersonnelManager.enable()` — now re-reads the injected level and refills a
  pristine pool to `CAPACITY[level-1]`. The pool is constructed before the base
  seeds its buildings, so the constructor read was stale (level 1 → cap 300);
  without this the pool started 200 short of HQ-L3's 500. The mid-game
  "level-up doesn't gift personnel" path in `_syncLevel` is untouched.
- `SquadManager.removeUnit` — deletes a squad from `_squads` once its last
  member is gone (squad-of-1 means every death used to leak an empty
  `DeployedSquad`). `DeployedSquad` gained `get size`.
- `WorldScene.enable()` — passes `_base.personnel` to `new BaseArmy(...)`;
  brings `Hud` up **before** `base` + `army` so `TopBar` catches the
  deploy-time `resource:changed` / `personnel:changed` emits (as a bonus the
  resource fields now show real values immediately, not `–`); calls
  `_base.setGarrisonPips(_army.garrisonCount)` after the army spawns.
- `TopBar` — a `PERS <cur>/<max>` field (`PERSONNEL_CHANGED`), red under
  `persWarnFrac`. `FIELDS` gained `personnel`; `OWN_STYLE` set marks the fields
  (`base`, `personnel`) that need a cloned `TextStyle`.
- `BaseTroops` — the zoomed-out pip blob is now `setCount(n)`-driven off the
  real garrison size (rebuilds the `buildPipCluster`), not a fixed 12.
- `BaseConfig.BASE` — new `garrison { slots: 3, roster: [springfield_squad ×2,
  m4_sherman], compact: {…} }`; `army.deploySlots: 5` + `army.roster` reordered
  so the first 5 are the intended platoon (rifles ×2, Sherman, Pershing, GMC)
  and the 2nd Sherman is a bench entry.
- `HudConfig.WORLD_HUD.topBar` — `persLabel: 'PERS'` + `persWarnFrac` / `persColor`
  / `persWarnColor`.

### Verified in-browser (hand-cranked sim, no console errors)
- 8 player units spawn: platoon `dsq-1..5` (infantry, infantry, mediumTank,
  heavyTank, howitzer) + garrison `dsq-6..8` (infantry, infantry, mediumTank).
  **5 in the platoon, not 6.** Legion camp still 4.
- Personnel pool 500 (HQ L3 `CAPACITY[2]`), 28 spent (platoon 20 + garrison 8) →
  `PERS 472/500` on the top bar from the first frame.
- Killing the heavyTank → pool `−7` (`ENTITY_COST.heavyTank`), `PERS 465/500`;
  the mediumTank → `−4`. `_squads` drops 8→7 (spent squad removed, no leak).
- Recall CATCH: `recallUnit` → member `RECALLED`; an `order:attack` on it →
  `ACTIVE` again (GDD 02), no throw.

### Next (B4)
`UnitStats` / Onslaught-difficulty balance pass; `DecalField` (tracks/scorch);
GDD-17 map objects (resource fields / Marauder camps / plunder as tappable
targets) + roads + sectors + fog.

## Session 38 recap
**PHASE B4 — Onslaught base-HP model (GDD 16).** The run's loss condition was a
proxy (`0 live defenders`); now the base has real HP that raiders siege, that
regenerates between waves, and that ends the run when it hits 0. Lint + build
clean; verified in-browser.

### New — `src/onslaught/BaseHealth.js`
`update(dt)` counts live enemies standing inside the base compound
(`furyZone.inBase`) → each sieges for `siegeDpsPerRaider`; with the footprint
clear for `regenDelayMs` the base heals at `regenPerSec`. Emits
`ONSLAUGHT_BASE_HP {hp, maxHp, frac}` on each rounded-percent change. `get
depleted` / `get fraction`. `reset(maxHp)` on run start, `stop()` on end.

### Changed
- `OnslaughtDirector` — owns the `BaseHealth`, `reset`s it in `start()`, ticks
  it in `update()` while active, `stop()`s it in `endRun` / `disable`;
  `get baseHp`.
- `onslaughtStep.stepPhase` — checks `d.baseHp.depleted` first → `endRun(false)`;
  dropped the `0 live defenders` proxy loss (base HP is the real condition now).
- `OnslaughtConfig` — `ONSLAUGHT.baseHp { max: 6000, siegeDpsPerRaider: 60,
  regenPerSec: 120, regenDelayMs: 4000 }` (flat across difficulty for v1);
  removed the aspirational `endWhenBaseHpZero` flag.
- `GameEvents` — `ONSLAUGHT_BASE_HP`.
- `TopBar` — a `BASE <n>%` field, hidden at full HP, shown while damaged
  (`ONSLAUGHT_BASE_HP`), red under `baseWarnFrac` (0.3), cleared on
  `ONSLAUGHT_ENDED`. `HudConfig.WORLD_HUD.topBar` gained `baseLabel` /
  `baseWarnFrac` / `baseHpColor` / `baseWarnColor`; the field list is a module
  const `FIELDS`.

### Verified in-browser (no console errors)
- **Undefended run** (platoon killed): raiders reach the compound at t≈5.5s,
  2 sieging → −120 HP/s (exactly `2 × siegeDpsPerRaider`); 100
  `ONSLAUGHT_BASE_HP` events (one per %); base hits 0 → `ONSLAUGHT_ENDED
  {fullClear:false, wavesCleared:0}`.
- **Defended run** (platoon alive): base dips to 82%, footprint clears, HP
  **regenerates** back to 100%; run continues (wave 1 cleared, wave 2 fighting).
- `TopBar` shows `BASE 82%` while damaged, clears when full / on run end.

### Next (B4)
Real roster from personnel (revive `PersonnelManager` / `SquadManager`) + a
real garrison entity; a `UnitStats` balance pass; `DecalField`; GDD-17 map
objects.

## Session 37 recap
**STEP 8 — real hex terrain (GDD 17, first slice).** The world map's ground was
cosmetic fbm colour bands over an all-passable grid; now every tile has a real
type that pathing + combat respect. Lint + build clean; verified in-browser.

### New — `src/worldmap/worldTerrainGen.js`
Pure + deterministic `paintTerrain(grid, clears)` — two fbm layers sampled in
world px per hex: an elevation field (`< waterBelow` → `water`, `> hillsAbove`
→ `hills`) and a forest field (`> forestAbove` → `forest` on grass/hills).
`clears` = world-px circles (base compound + muster + Onslaught approach ~1500
px; Legion camp ~420 px) forced to `grass` so nothing spawns on impassable
ground. Runs once from `WorldScene.enable()` on `WorldField`'s grid.

### Changed
- **`WorldTerrain`** — `enable(grid)` now draws each hex into one batched
  `Graphics` per terrain type, filled from `TERRAIN_TYPES[type].color` (was one
  per fbm band). Keeps the SKY backdrop rect.
- **`WorldScene.enable()`** — computes the base + camp clear circles, calls
  `paintTerrain`, then `_terrain.enable(this._army.field.grid)`.
- **`entityMotion.pivotAndDrive`** — the drive step now scales by the current
  tile's `speedMult`, so forest / hills slow infantry + deployables +
  launchers too (tanks already did via `TankMotor`).
- **`TerrainConfig`** — added `forest` (0.55×, cover 0.3) + `hills` (0.7×)
  types; removed the dead `TERRAIN_GEN` block (deleted arena passes).
- **`WorldMapConfig`** — replaced `terrainSeed` / `noiseScale` / `biomeBands`
  with a `terrain` block (elevation + forest fbm freqs / thresholds / seeds,
  keep-clear radii).

### Verified in-browser (no console errors)
- Tile histogram over 10 000 hexes: grass 66% · forest 24% · water 8% · hills 2%.
- Base / muster / Onslaught approach / Legion camp all `grass`; **0 units on
  impassable tiles**.
- Water `isPassable` → false; A* from one side of an interior lake to the other
  routes **around** it (path 953 vs straight 762 px, no water crossed).
- A Sherman on forest travels less than on grass over the same window;
  `getTileAt().speedMult` returns the painted value.
- Onslaught still runs (raiders spawn, march, fight).
- Terrain renders with distinct grass / forest / hills / water colours; the
  base sits in a clean grass clearing.

### Deferred (GDD 17, Phase B4)
Roads, numbered sectors, fog of war, and tappable map objects (resource fields
/ Marauder camps / plunder / outposts) — each needs systems (recon, alliances,
economy, multiplayer) that don't exist yet.

## Session 36 recap
**STEP 7 — config sweep.** Removed the config keys + one engine method that
pointed at code deleted in Session 35. Lint + build clean; bundle 279.4 → 274.9
kB; world map + Onslaught + HUD verified in-browser, no console errors.

- **`GameConfig`** — `CAMERA.zoomLevels` (unused); `BATTLEFIELD.*` square-arena
  fields (`widthTiles` / `heightTiles` / `seed` / `spawnColumns` / spawn tints /
  `waterBand` / `road` / `buildings` / `trees`), keeping only `hexCols` /
  `hexRows` / `hexSize` (TerrainGrid defaults); `RENDER.dev*` flags (10 of them
  — harnesses live in `dev/`), keeping `devEffects` (live EffectsSystem keybind).
- **`GameEvents`** — the 13 dead constants: `SKIRMISH_*` (6), `MENU_DEPLOY` /
  `MENU_SETTINGS`, `GAME_PAUSE/RESUME/QUIT_REQUESTED`, `RESULTS_CONTINUE` /
  `RESULTS_EXIT`. (`PERSONNEL_*` / `SQUAD_UNIT_STATE` kept — still emitted by
  the orphan-revive systems.)
- **`GameLoop`** — deleted `setSimPaused` + `_simPaused` + the sim-freeze
  branches in `_tick` (no pause — GDD 23; tab-visibility uses `pause()` /
  `resume()`).
- **`MenuConfig`** — `MENU.menu` / `MENU.pause` / `MENU.results` /
  `MENU.fadeThroughBlackMs` / `MENU.color.fadeBlack` (deleted screens). Kept:
  `loading`, `color`, `panel` / `settings` / `segmented` / `button` / `control`
  (the `ui/controls/*` widget kit + `SettingsScreen`, retained for the future
  in-world Settings overlay).
- **`HudConfig`** — deleted the whole legacy `HUD` block (battle-HUD widget
  config + `visibleStates`). `unitLabel` / `portraitColor` now use local
  `ENEMY_LABEL` / `DIM_PORTRAIT` consts instead of `HUD.*`. Kept `WORLD_HUD`,
  `PLACEHOLDER_PORTRAIT`, `UI_UNIT_LABELS`, the two helpers.
- **`OrdersConfig`** — `ORDERS.aiAlert` (deleted `AIAlertIndicator`).
- **`EntityConfig`** — the `DEV` export (`enemyDummy` / `parade` — dev-harness
  only). `FactionConfig`'s `DEV.parade` note rewritten to point at
  `BASE.army.roster` + `unitRoster.js`.

### Deferred
Step 8 — GDD-17 world-map content (terrain types / sectors / roads / resource
nodes / NPC bases). Then Phase B4: `UnitStats` balance pass, a real garrison
entity (revive `PersonnelManager` / `SquadManager`), a base-HP model.

## Session 35 recap
**POST-AUDIT REBUILD — the battle stack goes live, then the dead weight is
cut.** A full read of all 217 `src/` files (`docs/CODE_AUDIT.md`) found the
world map running placeholder `MarchUnit` tokens while the real entity stack
(turret rotation, per-soldier squads, deploy timers) sat orphaned. Six steps
fixed that; two commits: `a221794` (steps 1–5b) + `cf427a1` (step 6 cleanup).

### The audit — `docs/CODE_AUDIT.md` (new)
Every file classified Live / Live-thin / Orphan-revive / Orphan-rework /
Orphan-cut against the Warpath GDD, with a per-subsystem table and an 8-step
work plan. Also published as a mobile-viewable artifact.

### Step 1 — real units on the map
- **`src/worldmap/unitRoster.js`** (new) — one `key → {Ctor, View}` table for
  all 24 combat units (tanks → `EntityView`, squads → `InfantrySquadView`,
  guns → `DeployableView`, launcher → `RocketLauncherView`); `makeUnit(key,
  spawn)`.
- `BaseArmy` + `WorldCombat` spawn real subclasses from `BASE.army.roster` /
  `BASE.enemy.roster` (now `UnitStats` keys) via `makeUnit`.
- **Deleted** `MarchUnit.js` + `MarchUnitView.js`. `BaseConfig` roster arrays →
  real keys; dead placeholder `stat` / draw blocks removed.
- Verified: real Sherman marches on `WorldField`, turret slews independently of
  the hull, fires with recoil + muzzle flash, trips Field Fury; M12 GMC runs
  the LIMBERED → DEPLOYING → DEPLOYED sequence; per-soldier squads render.

### Step 2 — finish `DamageResolver`
- Full `CombatConfig` pipeline: `dmg × COUNTERS[attackerCls][targetCls] ×
  penMult × defMitigation × splash × variance`, floored at `dmg × counter ×
  minDamageFrac`.
- `penMult`: armoured target → PEN band by `shot.pen` vs
  `target.armor[facing]` (ricochet 0.35 / penetrate 1.0 / overmatch 1.15); a
  `NO_OVERPEN_CLASSES` attacker or a real counter upgrades a marginal ricochet;
  `EXPLOSIVE_CLASSES` bypass the table; soft targets ignore pen.
- `CombatConfig` adds `EXPLOSIVE_CLASSES` + `NO_OVERPEN_CLASSES`. `attackerCls`
  threaded through `COMBAT_SHOT` → `Projectile` → resolver (every shooter).
- Verified numerically on live entities: front 44.8 vs side/rear 57.7 (flank
  ≈ +29%); counters exact (mediumTank→infantry ×1.2, atGun→mediumTank ×1.35);
  overmatch, noOverpen upgrade, explosive bypass all confirmed.

### Step 3 — base footprint → Base Fury
- `WorldField.setBaseFootprint(cx, cy, r)` (circular); `isInSpawn('player', …)`
  now true inside the compound. `BaseArmy.enable()` registers it at
  `WORLDMAP.baseCentre` + `BASE.platform.hexR`.
- Verified: a unit hit inside the compound → `baseFuryActive`, stance
  `BASE_FURY`, focus-fires the attacker; a unit hit outside does not trip it.

### Step 4 — persistent world-map HUD (`src/ui/hud/`, GDD 23)
- **`Hud`** coordinator + **`TopBar`** (live Money/Steel/Oil, Gold/Power stubs,
  `HQ n`, live `X q Y r` map coord) + **`NavBar`** (6 tabs) + **`NavPanel`**
  (full-screen shells) + **`MapButtons`** (Home → snap to base, World → zoom
  out). `Hud.hitTest` registered with `OrderController.setHudHitTest`.
- `HudConfig.WORLD_HUD` added. `WorldScene` swaps `HudContext` → `Hud`.
- **`DamageNumbers`** revived into `WorldCombat`; **`RadialMenu`** revived into
  `BaseArmy` (replaced the `NO_MENU` stub — long-press Recall / Hold / Follow).
- Verified: resources tick live; tab tap opens the right panel + underline; any
  tap closes it; nav-bar taps don't order units; Home/World fly the camera;
  long-press radial fires `ORDER_HOLD`.

### Step 5 + 5b — Onslaught alliance base-defense event (GDD 16)
- **`OnslaughtConfig.js`** (new, replaces `SkirmishConfig`): `ONSLAUGHT_LEVELS`
  (5 leader-picked difficulty tiers — power / count / gate / reward scalars),
  `ONSLAUGHT_EVENT` (alliance scheduling / RSVP / sync-start / grace-join /
  bracket), `ONSLAUGHT_WAVES` (10-wave table — single-type probe → escalating
  count then variety, bosses at 5 / 10), `resolveWave(levelId, n)`.
- **`src/onslaught/`** (new): `OnslaughtDirector` (loop system, dormant until
  `window.onslaught.start(levelId)`) + `OnslaughtState` + pure `onslaughtStep`
  (phase machine + `retargetRaiders`) + `onslaughtSpawn`. Raiders spawn CALM
  `approachTiles` north of the base, march + hunt defenders; first shot trips
  Field Fury; `AIManager` skips `entity.onslaughtRaider`.
- `GameEvents`: `ONSLAUGHT_STARTED` / `WAVE_INCOMING` / `WAVE_CLEARED` /
  `ENDED`. GDD 16 rewritten for the alliance-coordinated model.
- **Bugs fixed:** raiders spawned at the map origin (→ base-relative);
  `InfantrySquad._updateHeading` / `RocketLauncher._faceTarget` deadlocked
  `pivotAndDrive` on an attack-move (→ yield while `moveTarget` set);
  `unitRoster` was missing tiger_i/maus/etc (→ completed to all 24).
- Verified: Level 1 + default platoon → Field Fury t=11, wave 1 cleared t=32,
  9 s pause, wave 2, loss when platoon wiped. Level 3 + invincible defenders →
  all 10 waves spawn & clear, bosses flagged, level scaling in the
  compositions, `ONSLAUGHT_ENDED {fullClear:true, wavesCleared:10}`.

### Step 6 — cut the superseded dead code
`src/` **217 → 181 files**, −3311 lines. Everything removed is unreachable
from `src/main.js`, documented in `docs/CODE_AUDIT.md`, recoverable from
`a221794`.
- **Deleted:** the battle-HUD family (`HUD` + `HudLayout` + `HudContext` +
  `Minimap` + `MinimapDraw` + `UnitInfoPanel` + `UnitSelectionBar` + `KillFeed`
  + `Announcements` + `DamageDirection` + `AIAlertIndicator`) — replaced by
  `src/ui/hud/`; `MenuScreen` + `PauseScreen` + `PauseButton` + `ScreenFade`
  (hard constraints); `DeploymentScreen`(+Draw/Layout/Roster) + `SkirmishBanner`
  + `ResultsScreen`(+Draw) (no solo skirmish); `src/skirmish/*` +
  `SkirmishConfig` (→ `src/onslaught/`); `world/{TerrainRenderer, Battlefield,
  MapGenerator, passes/*}` (square-arena gen, HEX PENDING).
- **Moved to `dev/`** (out of the build): the 9 Session 2–21 dev harnesses +
  `devParade.js` + a `README.md`. Most reference deleted modules — reference
  only.
- JSDoc `@param` types pointing at `world/Battlefield.js` → `worldmap/
  WorldField.js`. `config/index.js` drops the `SkirmishConfig` re-export.

### Deferred
Step 7 (config sweep — `GameConfig.RENDER.dev*` + `CAMERA.*` + `BATTLEFIELD.*`,
`HudConfig.HUD.visibleStates`, `MenuConfig` menu blocks, dead `GameEvents`
constants) and Step 8 (GDD-17 world-map content). Balance pass on `UnitStats`,
a real garrison entity (revive `PersonnelManager`/`SquadManager`), and a base-HP
model are Phase B4.

## Session 34 recap
**PHASE B SLICE 2 — combat on the world map.** Enemies, AI, Field Fury,
projectiles, damage, deaths. Revives `src/ai/` + `src/combat/` + `src/effects/`
+ Fury (all orphaned since S26) as live world-map systems, on the S33 entity
stack.

### New — `src/worldmap/`
- **`WorldCombat.js`** — owns `EffectsSystem` + `ProjectileSystem` +
  `FuryManager` + `AIManager` (shares `BaseArmy`'s `EntityManager` +
  `WorldField`), spawns a placeholder Legion camp (`BASE.enemy`) a few hexes
  off the base. `enable()` builds them in order (`fx` first → `ProjectileSystem`
  gets `fx.particles`); `update` ticks AI → Fury → projectiles → effects.

### Edited
- **`MarchUnit.js`** — gains a fire path: a `target` in `rangePx` + reload
  ready → emits `COMBAT_SHOT` (`_shot` scratch, weapon from `.stat`). Enemies
  hold fire until Fury flips their stance off `CALM`; the player initiates.
  `_chaseTarget` closes to range on an attack order (AI units exempt — they
  drive themselves via `aimPoint`). `_faceTarget` slews the hull while
  stationary. Stats now from `BASE.army`/`BASE.enemy` `.stat` blocks.
- **`MarchUnitView.js`** — death fade (`wreckDone` after 500 ms); enemy tokens
  use `BASE.enemy` colours.
- **`WorldField.js`** — `setSpawn(side,wx,wy)` + `spawnColumns` (retreat/recall
  home via the ×`TILE_SIZE` math `EntityManager.baseAnchor` / `AIController.
  homePoint` expect), `isInSpawn()`→false (BaseFury stays off), no-op
  `addDecal` (EffectsSystem calls it).
- **`BaseArmy.js`** — `EntityManager` + `WorldField` now `get`-exposed and
  shared with `WorldCombat`; dropped the `baseAnchor` monkey-patch for
  `field.setSpawn('player', …)`; roster spawns with `.stat` combat stats.
- **`WorldScene.js`** — owns + ticks `WorldCombat` after `BaseArmy`.
- **`OrderController.js`** — (S33) tap open ground with a squad selected →
  march there.
- **`BaseConfig.js`** — `BASE.army` per-cls `stat` (hp/def/rangePx/dmg/rof/
  aoePx/weapon); new `BASE.enemy` (camp hex offset, roster, infantry/tank
  stats).

### Verification (in-browser, 3 fight traces)
- 6 player squads + a 4-unit Legion camp spawn; 4 `AIController`s created,
  all `CALM`.
- Order squads to attack → they close to range and open fire → **Field Fury
  trips** (`fieldFuryActive`) → `ProjectileSystem.activeCount` 4–10 → enemy HP
  drops → enemies **ENGAGE and return fire** (killed 1–2 player squads across
  runs) → all enemies dead → fight resolves, Fury lingers then clears, corpses
  fade + are removed.
- `npm run lint` clean, `vite build` clean (bundle 193→227 KB — combat stack),
  console clean, 60 FPS.

### Known limits (B2)
Placeholder tokens + fast small tracers (no muzzle flash / health bars).
`DamageResolver` still the reduced model (no type counters, no pen/armour
band). No BaseFury (base defense). No retreat tuning. Fixed camp, no map
targets. TTK is quick — all tuneable in `BASE.army`/`BASE.enemy` + CombatConfig.

## Session 33 recap
**PHASE B SLICE 1 — playable marching troops on the world map.** You can
select a squad and send it marching; it paths the hex grid and drives there.
No combat yet (that's B2). Reuses the entity/order/pathfinding stack the
Session 26 reset had orphaned.

### New — `src/worldmap/`
- **`WorldField.js`** — the world map's collision/pathing substrate: wraps a
  hex `TerrainGrid` (`BATTLEFIELD.hex*` defaults, aligned to WORLDMAP), all
  tiles passable for now. `getTileAt` / `isPassable` / `getMovementCost` — the
  `Battlefield`-shaped surface `Pathfinder` / `entityMotion` / `EntityManager`
  expect.
- **`MarchUnit.js`** — a placeholder player squad, `extends Entity` with
  `BASE.army` speed/turn rate. `moveTo` + `update` do the marching.
- **`MarchUnitView.js`** — one unit's `ui/TroopDraw` token on `GROUND_UNITS`,
  re-positioned + rotated each frame.
- **`BaseArmy.js`** — owns the live `EntityManager` + `OrderIndicator` +
  `OrderController` (no-op menu), spawns `BASE.army.roster` (2 inf, 3 tank,
  1 gun) on the muster ground outside the gate, routes gestures to orders.
  `_em.baseAnchor` monkey-patched to the muster centre (the hex world isn't
  arena-tile based). `isDraggingUnit()` for camera-pan suppression.

### Edited
- **`WorldScene.js`** — owns + ticks `BaseArmy`; exposes `isDraggingUnit()`.
- **`Game.js`** — `_wireInput`: `INPUT_DRAG_MOVE` pans the camera only when
  `!_world.isDraggingUnit()`, so a drag that grabbed a squad is an order-drag.
- **`OrderController.js`** — tap on open ground with a squad selected → march
  there (`_moveTo`), instead of just deselecting.
- **`BaseTroops.js`** — trimmed to the zoomed-out pip blob only; the real
  `BaseArmy` squads are the up-close garrison now. `BASE.garrison.spread` →
  `BASE.army`.

### Verification (in-browser)
- 6 squads spawn outside the gate, each with `battlefield` + `speed`.
- Select `sq-5` (tap), tap a point ~800px away → `ORDER_MOVE` → a 6-waypoint
  hex A* route → the tank drove there steadily over ~8 s (≈110 px/s effective),
  `moveTarget` advancing waypoint-by-waypoint, then clears on arrival.
- Two squads ordered north at once march independently past the base.
- `npm run lint` clean, `vite build` clean (bundle 167→193 KB — the
  entity/order stack is now bundled), console clean, 60 FPS.

### Known limits (B1)
No combat / AI / enemies / damage / death. No real stats or roster (flat
`hp`/`speed` from config). `WorldField` is all-passable (no terrain blocking).
Each squad ordered individually (no group/formation move). Tap hit-radius is
26 world px — comfortable at base-view zoom, fiddly zoomed way out.

## Session 32 recap
**Garrison troops now visible on the world map.** They existed only as ~12
dots that faded in past a deep zoom and sat hidden inside the walls — you saw
nothing. `BaseTroops` rebuilt with two representations cross-faded by the LOD
blend `t`, so troops show at **every** zoom:
- `_compact` — a tight pip blob tucked under the fort marker (zoomed out).
- `_spread` — squad tokens mustered on the field outside the base gate (zoomed
  in): 2 infantry huddles, 3 tanks, 1 towed gun, from a placeholder roster in
  `BASE.garrison.spread.roster`.
New `ui/TroopDraw.js` — pure builders (`buildInfantry` / `buildTank` /
`buildArty` / `buildPipCluster`). `BASE.parade` → `BASE.garrison`. Marker label
pushed below the compact blob. lint + build clean, verified in-browser.
Placeholder — no real roster/personnel system yet (Phase B).

## Session 31 recap
**Map base marker → a low-iso fort.** The zoomed-out marker was a thin small
hexagon ("looks funny"). Rebuilt `ui/MarkerDraw.buildCompoundIcon` as a
stylised **placeholder** fort seen at an angle: a squashed-hex earth **plate**
(keeps the hex identity), a raised perimeter **wall** with filled vertical
faces + a **gate gap**, **6 corner towers**, a central **keep** + 2
outbuildings — each raised element = a shadow face + a lit top face. `sizePx`
enlarged (~1.5–2 map hexes wide). `BaseMarker` (gold wall) + `PlotMarker`
(brown) share it. All params in `WORLDMAP.marker` / `.plot`.

**This is not Warpath-quality** and can't be with vector primitives —
Warpath's map base is a textured 3D model. That's the art phase; flagged to
the user. lint + build clean, verified in-browser.

## Session 30 recap
**THE BASE IS NOW A HEX COMPOUND.** The build grid + platform were still
square; now the whole base is hexagonal — hexagon platform, a hexagon of
hexagonal build cells, hexagonal building blocks, a hex-fort map marker — on
the same `utils/Hex.js` math as the world map.

### Hex module
- **`Hex.js`** — added `HEX_CORNER_UNITS` (12 flat-top corner offsets) +
  `hexPolygon(cx, cy, size, out)` for `Graphics.poly`. `WorldTerrain` refactored
  to use it (dropped its private corner loop).

### The base (all hex)
- **`BaseConfig`** — rewritten: `BASE.grid` (`radius` 3 hexagon of cells,
  `cellHexSize` 50), `BASE.platform` (`hexR`, wall / gate / 6 vertex nubs /
  berm / shadow), `BASE.building` (faux-3D hex block params). Exports
  `PLATFORM_SPAN_PX`. `STARTING_LAYOUT` → axial `(q, r)` offsets, HQ at `(0,0)`.
- **`BaseDraw`** — `cellToPx(q,r)` via `axialToPixel`; `gridCells()` (radius-R
  hexagon); `buildPlatform` draws a shadow/pad/berm **hexagon**, faint cell
  hexes, a wall along the 6 platform edges with a **gate gap**, and a nub
  hexagon at each vertex; `buildBuilding` draws a faux-3D **hex** block.
- **`BaseGridView`** — roots anchored at `WORLDMAP.baseCentre` with axial
  (0,0) there; `_place` positions a box at `cellToPx(q,r)`.
- **`BaseManager`** — instances carry `q, r`; `_inBounds` =
  `axialDistance(0,0,q,r) ≤ gridRadius`; `BUILDING_PLACED {id,q,r,level}`.
- **`MarkerDraw`** — `buildCompoundIcon` is now a **hexagon** fort (hex ground
  + hex wall stroke + keep hex + 2 nub hexes) from a `sizePx` spec.
  `WORLDMAP.marker` / `.plot` reworked (`sizePx` etc), enlarged so a base
  clearly reads bigger than a map tile.
- **`BaseTroops`** — parade strip positioned off `BASE.platform.hexR` inside
  the gate; anchored at `baseCentre`.
- **`WorldMapConfig`** — `baseRect` → derived from `PLATFORM_SPAN_PX`; added
  `baseCentre` (world px) + `baseSpanPx`; `BaseSite` / `BaseMarker` /
  `BaseTroops` anchor on `baseCentre`.

### Verification
- `npm run lint` clean, `vite build` clean; in-browser: zoomed-out gold hex
  fort marker (+ brown neighbour forts), zoomed-in hexagonal walled compound
  with a gate, vertex nubs, hex build cells, hex building blocks, garrison on
  the parade strip; console clean.

### Known rough edges (placeholder)
`DynamicBarracks.label` ("Military Barracks") overflows its cell; a couple of
labels graze the block above at close spacing. Cosmetic — tune later.

### Next
Phase A: base-footprint **expansion plots** (unlock more cell rings), a
build/rearrange UI, tappable neighbour markers; then terrain types / roads /
sectors on the world hex grid.

## Session 29 recap
**WARPATH BASE LOOK — walled compound + continuous zoom LOD.** The base
previously popped between a black-rect marker and a flat labelled grid at a
zoom threshold. Now it's a walled earth compound that fades and grows in
continuously as you pinch, with faux-3D building blocks.

### Continuous LOD (the main ask — "smooth animation, not an immediate jump")
- **`BaseSite._syncLod()`** (per frame) — `easeInOutQuad`-smoothsteps
  `camera.zoom` across `[lodZoomOut, lodZoomIn]` into `t ∈ 0..1` and calls
  `setBlend(t)` on the marker / grid / garrison. No `_detailed` boolean, no
  threshold, no `gsap` cross-fade in BaseSite.
- Band widened to `lodZoomOut` 0.42 → `lodZoomIn` 0.95 so the transition
  spans a long stretch of the pinch.
- Layering of the blend: the **marker** fades out while growing ~1.5×, the
  **platform** fades + scales `0.93→1`, **buildings** fade in a beat later,
  the **garrison** last. Verified numerically at zoom 0.25 / 0.62 / 0.68 /
  0.9 / 1.35 — a smooth ramp, real in-between states.

### The compound (position / area on the map)
- **`ui/BaseDraw.buildPlatform`** — a walled earth platform: cast shadow (so
  it sits on the map), packed-earth pad, inner berm, faint build grid, four
  wall segments with a **gate gap** at bottom centre, corner **bastions**.
  Sized `grid + BASE.platform.marginPx` (≈ 3 hexes across when expanded).
- **`ui/MarkerDraw.buildCompoundIcon`** (new) — the shared zoomed-out fort
  icon (wall, keep, two building nubs, shadow), sized from a
  `WORLDMAP.marker` / `.plot` spec. **`BaseMarker`** (gold wall) and
  **`PlotMarker`** (brown wall) both use it, so every base on the map reads
  the same — ~1 hex wide.

### Buildings
- **`ui/BaseDraw.buildBuilding`** — faux-3D block: drop shadow + body +
  dark outline + a `lighten()`ed inset **top face**. Barracks still tints by
  variant.
- **`BaseGridView`** — `_platform` (Graphics, `LAYERS.TERRAIN`) + `_buildRoot`
  (Container, `LAYERS.GROUND_UNITS`), both pivoted on the compound centre for
  centre-scaling. First time the base is revealed, every block **pops in
  staggered** (`back.out`); **`BUILDING_UPGRADED` / `BARRACKS_TRANSFORMED`**
  redraw + a scale **pulse**.
- **`BaseTroops`** — dots moved onto a parade strip just inside the gate;
  `setBlend(t)` fades + scales them in last.

### Config
- **`BaseConfig.BASE`** — new `platform` (margin, colours, wall, bastion,
  gate, shadow), `building` (shadow offset, roof inset/lighten/drop, outline,
  pop/pulse timings), `parade` blocks.
- **`WorldMapConfig`** — `marker` / `plot` reworked for the compound icon
  (ground / wall / keep / nub / shadow / label sizes); `lodFadeMs` +
  `WORLDMAP.troops` removed; LOD band widened.

### Verification
- `npm run lint` clean, `vite build` clean; in-browser: zoomed-out fort
  marker, mid-zoom cross-dissolve, zoomed-in walled compound with 3D-ish
  blocks + garrison; console clean.

### Next
Phase A continues — base-footprint **expansion plots**, build/rearrange UI,
tappable neighbour markers; then real terrain types / roads / sectors.

## Session 28 recap
**WORLD MAP → FLAT-TOP HEX GRID.** Resolves the "hex vs square" open item (GDD
11) — hex, so the game feels like Warpath. One coordinate system for all world
movement: marches, troop movement and AI movement all path on the hex grid.
Committed sessions 22–27 first (`4c53558`, branch renamed
`sessions/22-27-worldmap-reset-warpath-gdd`, pushed).

### New
- **`src/utils/Hex.js`** — pure flat-top hex math. Axial (q,r) storage, cube
  rounding. `axialToPixel` / `pixelToAxial` (out-param, alloc-free),
  `axialRound`, `axialDistance`, `axialKey` (Map key), `HEX_DIRS` (6 axial
  deltas) + `HEX_PX_DIRS` (6 pixel unit vectors), `rOffset(q)` +
  `axialRectPixelBounds` (rectangular layout — per-column r-window shifts by
  −⌊q/2⌋ so the tiled region is a rectangle, not a sheared rhombus).

### Edited — live world map
- **`WorldMapConfig.js`** — square `widthTiles/heightTiles/tilePx` → `orientation`
  / `hexSize` 110 / `cols` 100 / `rows` 100; derived `widthPx/heightPx` ≈
  16335×18957; `minZoom` 0.12 / `startZoom` 0.35; `baseHex {q:50,r:25}` +
  derived `baseRect`; `neighbourPlots` → `neighbourHexes` (axial `dq,dr`);
  `noiseScale` now per world-px (biomes read as blobs, not diagonal stripes).
- **`WorldTerrain.js`** — draws hexagon polygons (6-corner `poly`) per biome
  band over the rectangular hex layout instead of square rects; fbm sampled at
  each hex's world-px centre.
- **`WorldScene.js`** — neighbour markers placed from `baseHex + {dq,dr}` via
  `axialToPixel`; camera centres on the base hex pixel.

### Edited — movement substrate (unwired, but now hex so Phase B "moves the same")
- **`Pathfinder.js`** — rewritten: 4-neighbour square A* → **6-neighbour hex
  A*** (`HEX_DIRS`), `axialDistance` × min-step heuristic, `axialKey` node keys,
  waypoints via `grid.axialToPixel`. Same px-in/px-waypoints-out contract, so
  `entityMotion.resolvePath` and `AIController.goTo` consume it unchanged.
- **`TerrainGrid.js`** — row-major `TerrainTile[]` → `Map` keyed by `axialKey`
  over the axial rectangle (`rOffset` per column). `tileAt(q,r)` /
  `inBounds(q,r)` / `setType(q,r)` / `forEach(cb(tile,q,r))` +
  `axialToPixel`/`pixelToAxial` + `widthPx`/`heightPx`.
- **`TerrainTile.js`** — carries its axial `q,r`.
- **`Battlefield.js`** — `getTileAt`/`isPassable` convert px→axial via
  `grid.pixelToAxial` (reused scratch); `widthPx`/`heightPx` from the grid.
- **`entityMotion.js`** — `blockedStep` slide: 4 cardinal axes → the passable
  **hex direction** (`HEX_PX_DIRS`) closest to the bearing toward the waypoint,
  widening off-axis (`SLIDE_ORDER`) until one is clear.
- **`AIController.js`** — `homePoint()` uses `grid.axialToPixel` (dropped the
  `TILE_SIZE` tile-math).
- **`GameConfig.js`** — `BATTLEFIELD` gains `hexCols`/`hexRows`/`hexSize`;
  `widthTiles`/`heightTiles` kept + labelled LEGACY.
- **`MapGenerator.js`** / **`TerrainRenderer.js`** — header-annotated **HEX
  PENDING**: the square arena generator + `passes/*` still assume (tx,ty); they
  get rewritten for hex + real world-map terrain in roadmap Phase B. Nothing
  imports them.

### Verification (in-browser, dev server + Pixi)
- `npm run lint` clean, `vite build` clean (755 modules).
- Hex math: pixel↔axial round-trips exactly for `[0,0]…[99,99]`; `HEX_PX_DIRS`
  = the 6 flat-top unit vectors; `axialDistance(3,10→17,10)=14`.
- Hex A*: routes a squad **around** a 16-hex impassable wall to the goal;
  no-obstacle path simplifies to a single waypoint.
- Boot → world map renders as a rectangular hex field (organic biome blobs),
  base marker + 4 neighbour markers on hex centres, HUD live. Pinch in past
  `lodZoomIn` → base grid + troops cross-fade in (`_detailed` true); pinch out →
  compact `BaseMarker`. Camera opens on `axialToPixel(baseHex)` at `startZoom`.
  Console clean (only the known favicon 404, absent this run).

### Next
Roadmap Phase A continues: terrain types / roads / sectors / coordinates on the
hex grid; `PlotMarker` → tappable real map objects; then Phase B wires the
battle stack onto the hex world map.

## Session 27 recap
**DIRECTION LOCKED + GDD REWRITTEN FOR WARPATH PARITY.** No code changed this
session — docs only. The user clarified the target: Blitzmire must play
**exactly like Warpath** (Lilith Games' WWII persistent MMO strategy) — all
functions, menus, fields, screen flow — renamed/re-skinned as Blitzmire.

### Direction clarifications (user, 2026-09-07)
- **Ground war only, tanks-focused.** No aircraft (no fighters/bombers, and no
  scout planes — recon is ground/radar), no naval, no shooter/FPS sub-game.
- **The whole battle stack is core** and runs **on the world map** — combat
  resolves in place at the target's position, never on a separate battlefield.
  This is no longer "Slice 4, deferred".
- **Skirmish → Onslaught:** a ~30-day limited-time event where the Legion sends
  escalating waves at the player's base and the player defends. Not a practice
  mode, not an away battle. GDD 16 practice framing dead.
- **No pause.** Online, persistent, multiplayer — no pause button/screen, no
  "quit to menu". Settings becomes a world-map overlay. The Session 22C pause
  path (`PauseButton`, `PauseScreen`, `MenuScreen`, `GameLoop.setSimPaused`,
  `Game.pause/resume/quit`) is to be **removed**, not revived.
- **Base on the map** expands on zoom-in / collapses to a city marker on
  zoom-out (the LOD `BaseSite` already has), Warpath-style. Base occupies a
  footprint with expansion plots.
- Scope: **full clone** — spec every system.

### GDD rewrite (`docs/gdd/`, 16 → 24 files)
Researched from public Warpath guides (Fandom wiki, warpath.guide, BlueStacks,
Lilith community). Existing GDD was already fairly Warpath-shaped (19 buildings,
9 ground classes, officers, gacha, research, parts/modify, equipment, power) so
most carried over.
- **New:** `17-world-map` (sectors, map objects, marching, rally, relocation,
  shields) · `18-base-on-map` (footprint, build grid, zoom LOD, expansion) ·
  `19-alliance` (ranks, alliance tech, territory, rally, help, shop) ·
  `20-campaign-pve` (the Campaign "Frontier" chain + **the Legion** NPC
  faction) · `21-events-and-season` (dailies, Arms Race, limited events, Battle
  Pass, **Frontline War** season) · `22-vip-and-shop` (**Gold** premium
  currency, VIP, store) · `23-ux-navigation` (boot flow, HUD, 6-tab bottom nav,
  panels, controls, settings overlay, no pause).
- **Rewritten:** `01-core-pillars` (north star + hard constraints) ·
  `02-combat-model` (combat resolves on the world map; Warpath counter chain;
  formation/terrain/entrench/retreat/quick-battle added; damage model kept) ·
  `16-skirmish` (→ Onslaught base-defense event).
- **Edited:** `03` (roster scope: 9 ground classes, no air/naval; camps = combat
  identity) · `04` (#14 AirBase → **Recon Post**, ground recon only; HQ level =
  Commander level; expansion plots) · `05` (logistics officers seat in
  buildings; an "airstrike" skill → artillery barrage) · `07` (**Gold** added,
  5 top-bar resources, dropped "no premium currency") · `09` (Airdrop state →
  **Redeploy**, motorised not planes) · `12` (recon, not scout-plane) ·
  `README` + `11-open-items` refreshed.
- **Provisional names to confirm/rename:** the Legion, Onslaught, Frontline
  War, Frontier, the 6 nav-tab labels. `16-skirmish.md` filename kept (content
  is Onslaught) to avoid cross-ref churn.

### Also
- **ARCHITECTURE.md** header + roadmap rewritten: "Session 26 slices 1–5" →
  "Warpath-parity roadmap, Phases A–E". Battle stack reframed core-not-salvage;
  pause/menu/results files marked for deletion; `worldmap/` table updated for
  the `BaseSite` LOD + `BaseMarker` + `BaseTroops` that a post-S26 sub-session
  added; config table notes the 7 new/renamed config files pending.
- **CLAUDE.md** PROJECT IDENTITY updated with the Warpath north star + hard
  constraints.
- No `npm` run — no source touched. Bundle unchanged (755 modules).

### Next
Roadmap Phase A (world-map foundation) or Phase B (army + combat on the map),
per the user. New/renamed config files to be created against the new GDD.

## Session 26 recap
**BIG DIRECTION RESET — the game is one persistent world map, Slice 1.** No menu,
no screen-swap state machine. Boot: loading screen → tap → the world map, camera
centred on the player's base at map centre. Navigation is pan + pinch-zoom on this
one scene. The base is a PLACE on the map, not a mode — its build grid + buildings
live in world space and scale with the camera (continuous scale, **no LOD swap,
no `changeState`**). This recap follows an audit + approved plan (see the plan in
the session transcript; decisions: placeholder terrain + neighbour plots /
continuous scale / battle happens on the same map — no separate battlefield or
skirmish).

### New — `src/worldmap/`
- **`WorldScene.js`** — the single always-on scene, built in `Game.init()`,
  `loop.addSystem`ed (replaces `ScreenManager`). Owns `WorldTerrain` + `BaseSite`
  + a `HudContext` + N `PlotMarker`s. `enable()` builds them, lays the HUD at
  `HUD.safeInsetPx`, then `camera.setZoomLimits(WORLDMAP.min/maxZoom)` +
  `camera.zoom = startZoom` + `setWorldBounds(map)` + `moveTo(map centre, 0)`.
  `update(dt)` ticks `BaseSite` + `HudContext`.
- **`WorldTerrain.js`** — placeholder ground on `LAYERS.TERRAIN`: one batched
  `Graphics` per `WORLDMAP.biomeBands` entry; each of 48×48 tiles tinted by
  `Noise.fbm(tx·noiseScale, ty·noiseScale, terrainSeed)` → band. Built once.
- **`BaseSite.js`** — the player's base as a place. Constructs + owns
  `BaseManager` + `ResourceManager` + `BaseGridView`; `enable()` mounts the view
  at `WORLDMAP.baseRect` (top-left), seeds the base, starts the economy. **No LOD
  gate.** `update(dt)` ticks the three. `window.base` / `window.rm`.
- **`PlotMarker.js`** — one neighbour footprint (`roundRect` + name/level `Text`)
  at a world position on `GROUND_UNITS`, from a `WORLDMAP.neighbourPlots` spec.
- **`src/config/WorldMapConfig.js`** — `WORLDMAP`: `widthTiles/heightTiles/tilePx`
  (48×48×96 → 4608² px), `minZoom 0.07` / `maxZoom 2.5` / `startZoom 0.25`,
  terrain noise params + biome palette, `baseRect` (derived from `BASE`),
  4 `neighbourPlots` offsets, `plot` marker geometry. Added to `config/index.js`.

### Edited
- **`src/engine/Game.js`** — rewritten. `GAME_STATES` collapsed to
  `{ BOOT, LOADING, RUNNING }`. Dropped `MAP_STATES` / `ARENA_STATES` /
  `DEV_STATES` / `_probes` / `_screens` / `pause` / `resume` / `quit` /
  `_showResults` / all `SKIRMISH_*` / `RESULTS_*` / `MENU_*` / `GAME_*_REQUESTED`
  wiring. `init()` builds `SettingsStore` + `WorldScene` (enabled immediately —
  the map warms up behind the loader) + `LoadingScreen` (now `Game`-owned, was
  `ScreenManager`'s). `LOADING_DISMISSED` → `_enterWorld()` = `changeState(RUNNING)`
  + `LoadingScreen.disable()`. `_wireInput` pan/zoom gated to `state === RUNNING`
  (dropped the `orderController.isDraggingUnit()` suppression — no orders yet).
  95 code-lines (was 141+).
- **`src/engine/Camera.js`** — `setZoomLimits(min, max)` (+ `_zoomMin` / `_zoomMax`
  fields; `nudgeZoom` / `setZoom` now clamp to those instead of the `CAMERA`
  constants). `CAMERA.minZoom/maxZoom` stay the defaults.
- **`src/ui/BaseGridView.js`** — `enable(originX = 0, originY = 0)` positions both
  roots (`BaseSite` passes `WORLDMAP.baseRect`). No longer "dev only".
- **`src/config/index.js`** — export `WorldMapConfig`.

### Deleted
- `src/ui/ScreenManager.js`, `src/engine/DevProbes.js`,
  `src/engine/DevBaseHarness.js` — the screen-swap engine + per-state
  mount/unmount + the base dev harness have no place in a single scene.

### Orphaned (on disk, unimported, **not deleted** — salvage for Slice 4)
The whole entity / combat / AI / effects / arena stack (`src/entities/`,
`src/combat/`, `src/ai/`, `src/effects/`, `src/world/`), `src/skirmish/*`, the
front-end screens + battle HUD (`src/ui/{MenuScreen,PauseScreen,SettingsScreen,
ResultsScreen,DeploymentScreen*,ScreenFade,ScreenDraw,SkirmishBanner,
UnitSelectionBar,PauseButton,HUD,HudLayout,UnitInfoPanel,Minimap*,KillFeed,
Announcements,DamageDirection,LoadingDraw,OrderIndicator,RadialMenu*,orders/,
AIAlertIndicator,DamageNumbers}` + `ui/controls/`), and every dev harness. Vite
tree-shakes them (bundle **900 → 755 modules**); eslint still checks them. The
GDD-16 skirmish mode is superseded — battle will be on this same map (Slice 4).
`RENDER.dev*` flags are dead.

### Verification (in-browser, 390×844)
- Boot → `LOADING` (world map built behind the loader) → "TAP TO BEGIN" →
  `RUNNING`, `LoadingScreen` disabled+destroyed, `OVERLAY` empty.
- Camera: centred at `(2304, 2304)` (map centre), `zoom 0.25`, bounds `4608²`,
  `_zoomMin 0.07` / `_zoomMax 2.5`.
- Layers: `TERRAIN` 5 (4 biome bands + base grid), `GROUND_UNITS` 5 (4 plot
  markers + base build root), `HUD` shows the live resource line.
- Base seeded (HQ L3, 8 buildings); `RESOURCE_CHANGED` drives the HUD line
  `MON 8004 (+715/h)  STE 5004 (+581/h)  OIL 3001`; economy accrues.
- Pinch in (`INPUT_ZOOM` ×N) → clamps at `2.5`, base fills the screen as the
  build grid + labelled building rects ("HQ L3", "Wall L1"). Pinch out → clamps
  at `0.07`, whole map visible: noise terrain, base as a centre plot with tiny
  building specks, 4 neighbour markers around it. Pan (`INPUT_PAN`) shifts the
  camera target by `dx/zoom`.
- `npm run lint` clean, `vite build` clean (755 modules), 60 FPS, console clean
  (no favicon 404 this run). Every live file ≤ 150 code-lines
  (`Game` 95, `WorldScene` 45, `WorldTerrain` 36, `BaseSite` 31, `PlotMarker` 31,
  `WorldMapConfig` 44, `Camera` 113).
- ARCHITECTURE.md consolidated 730 → 495 lines (the reset forced the overdue
  trim); stale rows describing orphaned code flagged at the top.

### Deferred (PLANNED slices)
2: troops standing in the base · 3: real terrain + tappable plots · 4: **combat
on the same map** (revive the orphaned entity/AI/Fury stack in world-map coords;
no separate arena) · 5: settings + pause as world-map overlays. An orphaned-code
prune / `_attic/` move once Slice 4 confirms the salvage.

## Sessions 5–25 recap (condensed)

**The pre-reset engineering arc — entity/combat foundation, Solo Skirmish
mode, front-end screens.** All of it was superseded by Session 26's
direction reset (one persistent world map, no menu/screen-swap state
machine) and most of the actual files were then physically deleted in
Session 35's cleanup ("Step 6 — cut the superseded dead code", -3311
lines) or rewritten from scratch by later hex-grid/combat-revival
sessions. Condensed to one line per session — none of the flows or files
named below exist in the current codebase, so the play-by-play isn't
useful to a future session; the full original recaps are recoverable from
git history (any commit before the Session 26 reset) if ever needed.

- **S25** — persistent-base economy substrate (`BaseManager` /
  `ResourceManager` / `DynamicBarracks`) behind a dev flag — the direct
  ancestor of today's live base economy.
- **S24** — two regressions fixed (canvas resize, AI pathing stuck on
  obstacles) — both systems later rewritten for the hex grid (S28/S35).
- **S23** — Solo Skirmish results screen + run tally/scoring. Skirmish was
  later redefined as the Onslaught base-defense event (S27) and this UI
  deleted.
- **S22A–C** — front-end screens (loading / menu / settings / pause) —
  deleted once the game became one persistent map with no menu state
  machine (S26) and no pause (S27 hard constraint).
- **S21A–C** — Solo Skirmish mode itself (deployment screen, wave
  director, in-battle HUD) — deleted, see S23/S27.
- **S20** — `FactionConfig` (per-faction roster derivation) — logic
  carried forward into the live game largely unchanged.
- **S19** — tank rotate-in-place movement fix + grid A* pathfinding —
  superseded by the S28 hex-grid rewrite of the same systems.
- **S18** — `PersonnelManager` + `SquadManager` (personnel pool,
  deployed-squad lifecycle) — revived and wired into the real world map
  in S39.
- **S17** — enemy AI + Field/Base Fury aggro states — the direct ancestor
  of the live `src/ai/` + Fury stack revived in S34/S35.
- **S16** — projectile trails + vehicle dust onto the shared
  `ParticleSystem`.
- **S15b** — effects cleanup (particle hot path, `Explosion` preset-key
  API, impact-shake ownership consolidated onto `EffectsSystem`).
- **S14** — `RocketLauncher` (Katyusha) — salvo-fire artillery unit.
- **S13** — `DeployableWeapon` (PaK 40 / M12 GMC / ISU-152) — deploy/limber
  state machine.
- **S12** — `InfantrySquad` composite (multi-soldier squads, per-soldier
  culling).
- **S11** — `GatherTruck` (non-combat cosmetic hauler).
- **S10** — Russia's 3 tanks; all 11 faction tanks complete.
- **S9** — `tankConfigFromRow` resolver + USA's 4 tanks.
- **S8** — Germany's 4 tanks + shared noTurret plumbing.
- **S7** — stateful `HealthBar` + `DamageNumbers`.
- **S6** — `src/combat/` — the first projectile/impact/damage pipeline
  (REDUCED model, no counters/penetration yet — completed in S35).
- **S5** — base `Entity` / `EntityView` / `EntityManager` + the first tank
  stack — the foundation every later entity system builds on.

A parallel "Verification & Debugging Notes" section (browser-test detail
tied to these same sessions) was removed alongside them for the same
reason — the systems it verified no longer exist in this form.
