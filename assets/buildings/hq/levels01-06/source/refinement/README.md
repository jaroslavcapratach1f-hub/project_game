# Existing HQ refinement

Rebuild from the repository root:

```sh
node assets/buildings/hq/levels01-06/source/refinement/refine.mjs
```

This Node/Three.js pipeline edits the existing HQ; no external modelling
application is required. `structure.glb` is its immutable authored input,
not a second runtime building. Historical Python sources outside this folder
produce the earlier structure and must not be used to overwrite the refined asset.

Architecture retains the house/wings and refines structural proportions.
Posts replaces the old guards with a reduced, reposed derivative of the existing
infantry GLB (the troop source is unchanged), rounded bags and MachineGun geometry.
Courtyard, SupplyDressing and YardDressing add the dispatch shelter, desk,
covered stores, distributed supply groups, low edging and pedestrian approach. Textures
supplies embedded PBR maps; Lighting bakes static occlusion/contact shading.
GlbEdit reads/writes the embedded GLB and merges geometry by material.

The existing registry, +90-degree facing and 7x8 fit remain authoritative.
Four static crews use a 1.78m reference matched to existing field infantry.
They are decorative, not combat units. Baked shading assumes current daylight;
changing global sun direction would require rebaking. No runtime shadow pass
or character skeleton is added. Geometry is checked against a 165k triangle
ceiling, not a claim of measured mobile performance.

After rebuilding, inspect `/dev/headquarters/` and the actual world map,
refresh preview/video, run the asset test and update the manifest verification.
The review page alone is not proof of runtime integration.

The roof aerial is rebuilt as one taut span between final transformed mast
attachments; it no longer inherits sag or mismatched component scaling.
