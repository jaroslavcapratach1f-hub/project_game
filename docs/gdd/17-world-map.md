# World Map

The single shared server map. **Everything happens here** — building, training,
gathering, PvE, PvP, events. There is no other scene. Config in
`src/config/WorldMapConfig.js` (+ `WORLD.*`).

## STRUCTURE
- One large **tile grid** per server (Warpath uses hex; square is acceptable —
  the base build grid is separate, GDD 18). Thousands of player bases.
- Divided into numbered **Sectors** with a level band **1–4** (mirrors city
  levels). Higher sector = tougher Marauder camps, higher-tier resource
  fields, harder PvP, better rewards.
- A central **Capital** sector holds the season objective (GDD 21).
- Every tile has an **(X, Y) coordinate** shown in the HUD and on profiles;
  used for "go to coordinate", scout, rally links, and relocation.
- New accounts spawn in a **rim (level-1) sector**; `Sector Transfer` items
  move a base between sectors (e.g. to join an alliance's territory).

## FOG OF WAR
- Map starts fogged. **Recon Post** (GDD 04) reveals along recon-vehicle
  routes and around the base (`radarRangeTiles`).
- Revealed tiles stay **dim-revealed** (terrain remembered) but show no live
  info without a friendly unit or recon nearby.
- Enemy marches are visible only inside your live vision. Re-fogs when you go
  offline (recon vehicles return home).

## OBJECTS ON THE MAP
- **Your base** — your tile. Zoom in past `lodZoomIn` to enter base view
  (GDD 18); zoom out to the city marker.
- **Other players' bases** — target actions: Attack · Scout · Reinforce ·
  Rally · (ally) send resources is **not** a thing — no resource transfer that
  enables looting economics.
- **Resource fields** — Cash / Steel / Oil, **6 quality tiers** (GDD 07). A
  **Gather Truck** occupies a field and collects over time; fields inside
  alliance territory pay a bonus and can drop crates.
- **Marauder camps** — low-tier Legion (GDD 20). PvE fight; clearing drops
  resources, Arms EXP, items, and Power-kill credit. Levelled by sector; they
  respawn and drift.
- **Legion bunkers / bosses** — heavy PvE targets that need a **Rally**;
  yield "Major Plunder" (large rewards) of matching level.
- **Plunder objects** — abandoned depots / stalled convoys / wrecks flagged by
  recon; a march grabs them, **no combat**, bonus Gold and items.
- **Neutral outposts** — capturable points granting a buff (march speed,
  gather rate, defense…) to the holder / their alliance while held; contested.
- **Alliance buildings** — Central Command, Turrets, Fortress, depots,
  transfer nodes (GDD 19); define alliance **territory**.

## MARCHING
- Each **deployed squad** marches independently. Simultaneous marches =
  `deploySquadSlots` (HQ + `mil_deploy_slot` research).
- A march draws a tile path with a live **ETA** = squad speed × terrain
  (roads fast, forest/hills slow) × Development `march speed` research.
- **Target orders:** March/Go · Attack · Auto-Attack (keep hitting nearby
  same targets) · Converge (multi-squad focus the toughest) · Gather · Scout ·
  Rally · Reinforce · Return.
- **Rally** — a staged march on a heavy target (boss, enemy base, alliance
  objective): the leader sets a launch countdown, members add squads, the
  whole stack lands as one force. Join slots from the Alliance Hall.
- If the base relocates mid-march, squads re-path to the new position.

## RELOCATION  (items — motorised / rail, no aircraft)
- **Ground Transfer** — short random hop. **Advanced Transfer** — choose the
  destination tile. **Sector Transfer** — jump to a chosen sector.
- **Return-to-Beginner** — early-game only, back to a rim sector.
- Redeploy base state (GDD 09) covers the post-defeat forced hop.

## PROTECTION
- **Peace Shield** items (8 h / 24 h / 3 d) — base cannot be attacked;
  attacking out breaks it (`shieldBreaksOnAttack`, configurable).
- **Novice Shield** — auto-applied to new accounts and after a base is
  defeated / force-relocated.
- Shields block player attacks only — **not** Onslaught (your own event) and
  **not** Legion NPCs. Event **Truce** windows may pause all PvP.

## SCOUTING
- **Scout** order sends a recon vehicle to an enemy base; returns a report:
  estimated garrison, visible buildings, Power, shield status, coordinates.
- Report accuracy = attacker Recon Post level vs. defender Recon Post level.

## SERVER
- One map per server. Merges and cross-server events (Frontline War) join
  multiple servers for a season (GDD 21).
