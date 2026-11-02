# Timber headquarters redesign

## Approved direction (2026-09-30)
The latest user feedback supersedes the detached-annex compound proposal.
Keep a normally scaled two-storey timber command house at the rear edge of
its existing 7x8 plot. Attach two habitable wings with shallow roof terraces,
clear upstairs access doors and one window each. Each wing front has one
window, not two cramped windows. Rounded sandbags guard the balconies.
Remove all four detached buildings and the freestanding courtyard map board.
Two open-backed sandbag checkpoints flank a clear central approach; crates,
olive equipment cases and drums dress the forecourt. No flags or stars.
The gable HQ / BASE COMMAND identification stays above the front windows.

## Architecture reused
PixiJS HUD + Three.js buildings, Vite and authored embedded-texture GLB.
Building3DConfig -> Building3DView -> Base3DLayer/GltfCache remains the
loading, grid-fit, selection, relocation, ghost and zoom-LOD path. Rotation
remains +90 degrees. No new building entity, grid rule or combat mechanic.
Defence-wall mesh_tools supplies shared timber grain/materials. Current
DefenceInstances tint/exposure is baked into the HQ material factors because
ordinary buildings do not use that renderer. Materials remain matte.

## Current implementation (2026-10-02)
- source/refinement/refine.mjs: Node/Three rebuild of the same runtime GLB.
- structure.glb: immutable input snapshot of the existing authored HQ.
- Architecture / Shapes: structural refinement and rounded geometry.
- Posts / MachineGun: compressed bags, textured infantry-derived guards,
  perforated cooling jackets, receivers, mounts and ammunition equipment.
- Courtyard: closer front posts, low open canvas dispatch shelter, telephone
  desk, worn routes and duckboards; central circulation stays open.
- Textures / Lighting: embedded wood PBR maps and baked static contact shading.
- GlbEdit: embedded GLB processing and material batching.
- timber_headquarters.glb / manifest / preview / guard detail / turntable.
- Building3DConfig continues loading the same GLB with existing fit/ghost/LOD.
- dev/headquarters uses current camera/light constants for art inspection;
  tests/headquarters-asset.test.mjs checks the embedded asset contract.

Existing infantry geometry supplies the guard silhouette and uniform;
source troop files are unchanged. Guards match field infantry scale using
1.78m as reference. Four static crews remain decorative. Historical Python
sources are retained but are not the final refinement rebuild entry.
Wood maps are Poly Haven CC0; provenance is beside the source textures.

## Gameplay scope
GDD04's 19 building roles remain independent. HQ wings contain command rooms;
checkpoints and supplies are decorative and do not add attack units, cover AI,
storage production, pathfinding blockers, colliders or separate upgrades.
Other buildings, troops, defence perimeter and camera are unchanged.

## Verification
The final gameplay-camera render and gunner close-up were inspected; preview
and turntable refreshed. Actual WorldScene checks passed at 390x844 and 844x390:
7x8 bounds, selection, ghost restoration and zoom hiding/restoration. The game
was returned to RUNNING. All 29 tests and production build pass; lint reports
0 errors / 99 warnings in the current tree. Build retains bundle-size advisory.
Final asset: approximately 152.8k triangles, 11.7 MB; materials are merged.
This is not a measured physical-device FPS result. Safari/device performance
and download cost remain unverified. Guards are static art, not animated AI.

The roof aerial is rebuilt as one taut span between final transformed mast
attachments; it no longer inherits sag or mismatched component scaling.

The yard dressing extends around the whole HQ: a canvas-covered supply pallet,
grouped cases, front receiving crates, side/rear service stores and short low
sandbag runs sit on a worn compound surface. The middle approach remains clear.
The roof aerial is a straight span fixed to the final mast attachments.

HQ finishing correction: ground wear is now faint outside the footpaths, preserving
grass across the plot. Front checkpoint floorboards are trimmed within the
sandbag footprint. The supply tarp has a continuous top and hanging skirts
with clearance over all crate battens, preventing wood from protruding.
