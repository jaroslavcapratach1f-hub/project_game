# Game Design Document — Blitzmire

**North star: Warpath parity.** Blitzmire matches Warpath (Lilith Games, WWII
persistent MMO strategy) — its gameplay, functions, menus, fields, and screen
flow — renamed and re-skinned. When a detail here is thin, do it the Warpath
way. See **01-core-pillars.md** for the hard constraints; the load-bearing ones:

- **Ground war only** — tanks, infantry, artillery. **No aircraft, no naval,
  no scout planes, no shooter mode.**
- **One persistent shared world map.** No menu, no screen-swap, no separate
  battlefield. Combat resolves in place on the map.
- **No pause.** Always-online. Settings is an overlay.
- **The base is a place on the map**, scaling with camera zoom.

## Document Index
Read ONLY the file relevant to your current task. Do NOT read all at once.

| File | Contents | Read When |
|---|---|---|
| 01-core-pillars.md | North star, hard constraints, pillars, terminology | Always (short) |
| 02-combat-model.md | Controls, encounters on the map, counters, Fury, **damage model** | Working on combat |
| 03-factions-troops.md | 9 ground classes + Gather Truck, 3 factions/camps, **stat defs** | Working on units |
| 04-buildings.md | All 19 buildings, functions, level 35, effect keys | Working on base |
| 05-officers.md | Commander system, skills, roster, assignment | Working on officers |
| 06-personnel-squads.md | Personnel pool, squad rendering, barracks L1–35 | Working on squads |
| 07-economy.md | 5 top-bar resources, materials tiers, manufacturing | Working on economy |
| 08-armory-gacha.md | Crate system, pity, merging | Working on armory |
| 09-base-states.md | Deployed / Caravan / Redeploy / Cloud, destruction | Working on base states |
| 10-progression.md | Star ladder, level cap, nation bonus, kills | Working on progression |
| 11-open-items.md | Resolved vs still-open decisions | Reference only |
| 12-research.md | The 5 research tracks and their nodes | Working on research |
| 13-equipment.md | Troop equipment slots, parts, sets | Working on equipment |
| 14-parts-and-modify.md | Parts, blueprints, components, Modify, conversion | Working on manufacturing |
| 15-power-rating.md | The public Power score and its 5 sources | Working on power / matchmaking |
| 16-skirmish.md | **Onslaught** — ~30-day base-defense wave event | Working on the event / PvE |
| 17-world-map.md | The shared server map: sectors, objects, marching, relocation, shields | Working on the world map |
| 18-base-on-map.md | Base footprint, build grid, zoom LOD, expansion, territory | Working on base view / camera |
| 19-alliance.md | Ranks, alliance tech, territory, rally, help, alliance shop | Working on alliance |
| 20-campaign-pve.md | The Legion (NPC faction) + the Campaign / Frontier chain | Working on PvE / campaign |
| 21-events-and-season.md | Dailies, Arms Race, limited events, Battle Pass, Frontline War season | Working on events / season |
| 22-vip-and-shop.md | Gold, VIP, store bundles, monetization guardrails | Working on shop / VIP |
| 23-ux-navigation.md | Boot flow, HUD, bottom nav, panels, controls, settings overlay | Working on UI / screens |

## Config map (`src/config/`)
`GameConfig` scale/limits · `WorldMapConfig` map + base footprint + LOD zooms ·
`BaseConfig` build grid · `ResourceConfig` resources+storage · `MaterialsConfig`
6 materials · `BuildingConfig` 19 buildings · `PowerConfig` power score ·
`StarTiers` ladder+levels · `ProgressionConfig` bands/assembly/nation ·
`StatResolution` order of ops · `UnitStats` base rows · `CombatConfig` damage
model + `COUNTERS` · `PersonnelConfig` pool+squads · `OfficerConfig` commanders ·
`EconomyConfig` production/timers · `ArmoryConfig` crates · `PartsConfig`
manufacturing · `research/` 5 trees · `equipment/` slots+parts+sets ·
`OnslaughtConfig` the event · `AllianceConfig` · `CampaignConfig` +
`LegionConfig` PvE · `EventsConfig` events/season · `ShopConfig` + `VipConfig` ·
`HudConfig` + `MenuConfig` UI.
