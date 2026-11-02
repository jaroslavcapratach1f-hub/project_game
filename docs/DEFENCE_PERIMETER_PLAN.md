# Level 1 defence perimeter — inspection and implementation plan

## Approved target / compatibility
The user's LVL-1 Defence Wall.jpeg is the L1 visual source of truth. Timber,
sandbags, open-frame towers, interior conifers, shallow exterior trenches,
wire, hedgehogs, wooden poles and sagging cables supersede the older GDD24
concrete-wall brief for this tier. Keep the existing camera and grid.

## Repository findings
- Vite / ES modules, PixiJS 8 UI and terrain; Three.js live GLB base layer.
- Assets live in assets/buildings/<id>/tier01; cached GLTFLoader shares meshes.
- Square base cell = 42 world pixels, 29.6985 Three scene units. Orthographic
  camera: 30° pitch, 45° azimuth, unchanged. HQ footprint 7x8; tower 2x2;
  initial compound 18x22 cells. USA tanks use a separate shared 3D layer.
- Building placement: BaseManager, basePlacement, SquareGrid; wall/towers
  excluded from individual building relocation. HQ stage expansion is not
  live-wired to navigation/muster/LOD, so don't expand only the visual wall.
- WorldField/TerrainGrid + ObstacleShapes block the whole compound polygon,
  including its decorative closed gate. Decorations must add no obstacles.
- Base3DLayer uses warm directional + ambient light, ACES exposure 1.45;
  no enabled realtime shadow map. Authored shading/roughness must hold up
  under this existing light, without changing global materials or lighting.
- DefenceWall3D repeats fitted segment GLBs; AttackTowers3D owns four corner
  towers. NeighbourCompound3D reuses both owners. No ECS/prefab framework.
- Three-level art cadence, resource-paid instant upgrades via BaseManager.
- GltfCache, shader warmup, pin LOD, capped DPR and frustum culling exist.
  Existing wall clones issue many draws and dispose shared cached geometry.
- No saved base layout/backend. Only settings have localStorage persistence.
  A defence snapshot codec is useful; claiming whole-game save/load is not.

## Implementation files / order
1. Pure DefenceLayout/DefenceConnectivity modules: cardinal masks, stable
   generated perimeter, add/remove, versioned snapshot; no new player editor.
2. Blender source kit under defence_wall/levels01-06/modular/source; shared
   materials, predictable ground pivots, named replaceable GLB modules,
   manifest, preview image and turntable. No raster stand-in in runtime.
3. Defence kit registry + instanced renderer; reuse DefenceWall3D lifecycle,
   tier selection, origin offsets, GltfCache and existing Base3DLayer.
4. Replace corner tower visual with matching kit tower; keep gameplay id,
   menu/hit region, upgrades and compound bounds. Wall joins meet tower legs.
5. Deterministic inside vegetation and exterior trench/obstacles/props;
   keep approach/spawn gate corridor clear. No decorative collision.
6. Shared-kit reference layout/preview, unit tests for all 16 connectivity
   masks, edits/serialization/upgrade invariance and perimeter continuity.
7. Live world-map desktop + portrait/landscape emulation, resource/draw stats,
   build/lint/regressions; record limits, not physical-phone FPS claims.

## Scope decisions
- Superseding user approvals: extend into extra grid space and make ALL
  corners match the reference. Implemented two-cell setback, four equal
  chamfers and eight towers (two per corner). Original construction grid
  remains enclosed. Player/neighbour collision polygons and muster gate
  anchor follow the expanded wall. No new tower combat behavior.
- No pathfinding holes from removing decorative wall pieces; the game's
  whole-base blockage is authoritative. No new per-wall HP/destruction.
- L1 kit is fallback for unbuilt future tiers; never claim higher-tier art.
- All final meshes remain replaceable through the registry. Modelled Blender
  geometry is inspected honestly; reference-quality acceptance is visual,
  not implied merely by generating a GLB.

## Completed handoff — 2026-09-27
- All implementation steps above are wired into the actual WorldScene.
- 40 modelled GLBs, reproducible Blender source, original reference, PNG
  preview and WebM turntable under defence_wall/levels01-06/modular.
- Resumed after interrupted session: corrected duplicated wire posts.
  Pattern is X obstacle → wire → ONE support → wire → X obstacle;
  corner obstacles are shared and wire endpoints meet physical supports.
  X beam orientation is readable from the fixed gameplay camera.
- 24 tests and build pass. Lint: no errors, unrelated UnitsMenu warning.
  Live node edit/restore and collision probes pass; deployed units remain
  on passable ground. Portrait/landscape emulation and eight tower hits pass.
- No missing placeholder meshes. Artistic fidelity is an interpretation,
  not a claim of pixel identity. No physical-device/Safari performance test.
- Snapshot codec is implemented; whole-base persistence and live HQ stage
  expansion remain existing wider-game limitations, not silently completed.
- Next review: run the game or /dev/defence/ and compare against reference.jpeg.

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

## 2026-10-02 — Active visual-quality refinement
Use Node/Three asset processing, retaining existing GLBs as immutable inputs
under source/refinement/original. No Blender/external modelling application.
Preserve layout, sockets, gate/tower ownership, collision and battlefield combat.

Planned changes: refinement modules for shared PBR wood/fabric, rounded bags,
more believable tower/gate fittings and three-beam steel obstacles; retain
instancing. Replace raised trench presentation with a recessed terrain belt,
lower retaining walls, earthen shoulders and shallow grade-level crossings.
Existing path/entry/corner topology stays authoritative. Add a terrain-height
helper shared by the grass belt and trench validation. Review through existing
/dev/defence owners and actual WorldScene, then update preview/video/manifest.

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

