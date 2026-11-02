# Core Design Pillars & Terminology

## NORTH STAR
Blitzmire is a **Warpath-parity** game: same gameplay, same functions, same
menus, same fields, same screen flow — renamed and re-skinned as Blitzmire.
When a system here is under-specified, do it **the way Warpath does it**. The
reference is the live Warpath game (Lilith Games, WWII-era persistent MMO
strategy). Where a Warpath detail is missing from this GDD, add it rather than
invent an alternative.

## HARD CONSTRAINTS (never violate)
1. **Ground war only.** Tanks are the hero class. Units are infantry, tanks,
   tank hunters, AT guns, howitzers, rocket launchers — all ground.
2. **No aircraft.** No fighters, no bombers, no gunships, and **no scout
   planes** — map recon is done by ground vehicles / radar (see 04 Recon Post).
3. **No naval.** No ships, no boats, no coastal or amphibious layer.
4. **No shooter mode.** No FPS / third-person action sub-game. Blitzmire is
   the strategy layer only. (Warpath's separate "Ace Shooter" content is out.)
5. **One persistent shared world map.** No menu, no screen-swap state machine,
   no separate battlefield. Boot → loading → tap → the world map.
6. **No pause.** It is an online, multiplayer, always-running world. There is
   no pause button and no pause screen. Settings is a world-map overlay.
7. **The base is a place on the map**, not a mode. Its build grid and
   buildings live in world space and scale with the camera — zoom in to stand
   among the buildings, zoom out to a compact city marker.

## CORE DESIGN PILLARS
1. Tactical WWII immersion.
2. Individual vehicle identity: every troop is a **squad of individually
   simulated units** — more personnel invested = literally more vehicles on
   the map. No abstract stacks, no hidden-count numbers.
3. Personnel (Reserve Troops) is the primary army limit; it regenerates.
4. Losses are recoverable — wounded units heal, personnel regenerates.
5. Positioning and counterplay beat raw power.
6. Clear visuals, deep decisions.
7. Skill-based defense and offense (active target management during Fury).
8. PvP is strategic, not economic. Money / Steel / Oil / Materials **cannot
   be looted**. Combat destroys troops and cripples bases for map advantage,
   not for raiding a stockpile.

## TERMINOLOGY
- **Commander** — the player. **Commander level = Headquarters level.**
- **Base / City** — the one main base per player; a tile on the world map.
- **World Map** — the single shared server map; every action happens on it.
- **March** — a squad moving across the world map to a target.
- **Rally** — multiple squads (yours, or an alliance's) combined into one
  march against a heavy target.
- **Field Fury** — active combat state when any field unit initiates an attack.
- **Base Fury** — active base-defense state after the base is attacked.
- **Unit Fury meter** — per-unit charge that grants a burst buff (separate).
- **Personnel / Reserve Troops** — regenerating manpower pool.
- **Squad** — one troop type + up to two officers; N rendered units.
- **Officers** — named commanders assigned to squads (and some to buildings).
- **Camp** — a faction: Germany / USA / Russia. Sets a unit's roster and its
  combat identity (assault / siege / garrison lean).
- **Camp Prestige / Nation Bonus** — same-camp army synergy from Assembly.
- **Arms Coupons** — currency for Armory (troop) pulls.
- **Gold** — premium currency (shop, VIP, speed-ups, refreshes).
- **Base States** — Deployed / Caravan / Redeploy / Cloud (see 09).
- **Alliance** — the guild layer (see 19). **Alliance immunity:** allied units
  never damage each other; Fury targeting skips them.
- **Campaign** — PvE chapter/stage ladder vs. the Legion (see 20).
- **The Legion** — the NPC enemy army (roaming Marauder camps + bosses).
  *Name provisional — rename freely.*
- **Onslaught** — the ~30-day base-defense wave event (was "Skirmish", see 16).
- **Season / Frontline War** — timed cross-server competitive cycle (see 21).
- **Power** — the single public strength number (see 15).
