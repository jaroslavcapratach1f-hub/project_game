# Game asset catalogue

`asset_catalog.json` indexes every retained GLB with its role, size, triangle
count and SHA-256. Refresh it after changing models:

```sh
python3 scripts/catalog-assets.py
```

| Active packet | Location | Visual coverage |
|---|---|---|
| Headquarters | `buildings/hq/levels01-06/` | One shared levels 1–6 design |
| Officers’ Barracks | `buildings/officer_barracks/levels01-06/` | One shared levels 1–6 design |
| Academy / Research Center | `buildings/research_center/levels01-06/` | One shared levels 1–6 design |
| Armory | `buildings/armory/levels01-06/` | One shared levels 1–6 design |
| Factory | `buildings/engineering/levels01-06/` | One shared levels 1–6 design |
| Oil pumping plant | `buildings/crude_oil/levels01-06/` | One shared levels 1–6 design |
| Steelworks | `buildings/steelworks/levels01-06/` | One shared levels 1–6 design |
| Treasury | `buildings/treasury/levels01-06/` | One shared levels 1–6 design |
| Military barracks | `buildings/barracks/levels01-06/` | One shared levels 1–6 design |
| Complete defence kit | `buildings/defence_wall/levels01-06/modular/` | One shared levels 1–6 design |
| German Maus | `units/super_heavy/tier01/` | Starting five-star SH, Germany only |

Defence kit includes every wall/corner mask, watchtower, gate, trench module,
bridge, wire, hedgehog, pole, pine variant and field prop. Tower/gate files are
shared modules here, not duplicated in separate obsolete building packets.
Each building packet contains its current image, rotating video, manifest and
editable/rebuild source. Other active building and troop packets retain their
existing tier01 folders and registry bindings; they were also inventoried.

`source/` inputs are necessary for repeatable asset preparation. HQ's
structure.glb, the defence original/ geometry and troop original.glb files are
read by the current tools. They are not old runtime duplicates and are not
imported into the production app. Embedded GLB textures travel with each model;
shared texture source files and their licence notes must also be retained.

Vite bundles imported runtime assets. Concepts, source geometry, previews and
videos are authoring deliverables, not extra mobile downloads. Existing higher
building levels still fall back to available art; no separate levels 7+ models
are claimed. See docs/ASSET_CLEANUP_2026-10-04.json for deleted-file hashes and
reasons. Do not accumulate rejected renders or versioned model iterations here.
