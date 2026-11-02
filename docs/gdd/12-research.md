# Research — Technology Trees

Defined in `src/config/research/`. The **Research Center** (building #13) runs
one rank at a time (more with `parallelResearch`); `researchSpeed` shortens it.

## MODEL
- **5 tracks:** Development, Military, Doctrine, Defense, Support.
- Each **node** has 1..`maxRank` ranks. Cost and time scale with the node's
  **tier** and the **rank** being bought (`ResearchModel.nodeCost` /
  `nodeSeconds`).
- **Tier gates by HQ level:** T1→HQ1, T2→6, T3→11, T4→16, T5→21, T6→26, T7→31.
- Some nodes need a prerequisite node at max rank (`requires`).
- Cost is **Money / Steel / Oil + time**. No other resource.
- Every completed rank adds **Power** (see 15), weighted per track
  (military 1.5 > doctrine 1.3 > defense 1.2 > support 0.9 > development 0.8).

## TRACK 1 — DEVELOPMENT (GDD 04 "Industry")
Economy and logistics. Nodes: cash / steel / oil output, resource storage,
construction speed, material output & tier access, gather speed / load /
trucks / node-tier access, march speed, a second build queue, research speed.

## TRACK 2 — MILITARY (general combat)
All-unit stat lines: HP, Attack, Defense, Armor, Penetration, Speed, Accuracy,
Rate of Fire, plus **army capacity**:
- `mil_level_cap` — +5 playable troop levels per rank, 5 ranks (+25 total; with
  HQ 35 that reaches the level-200 hard cap).
- `mil_rally_size` — +1 to the per-class squad cap per rank.
- `mil_deploy_slot` — +1 simultaneous field squad per rank.
- `mil_garrison_slot` — +1 garrison squad per rank.
- `mil_fury_charge` — faster per-unit Fury meter.

## TRACK 3 — DOCTRINE (GDD 04 "Modern Warfare")
Specialise a branch; each line applies to **matching classes only**:
- **Infantry:** HP, Damage, Speed, Anti-armor (pen).
- **Armour** (light/medium/heavy/super-heavy tanks + tank hunters): HP,
  Penetration, Plating, Rate of Fire.
- **Fire Support** (howitzer/launcher/AT gun): Range, Damage, AoE, Deploy
  speed.
- **Reserve Recovery:** faster Personnel regen.

## TRACK 4 — DEFENSE
Wall HP, Tower Damage / RoF / Count, Base HP regen, Base-gun Damage / Range,
Garrison capacity, Base Fury duration.

## TRACK 5 — SUPPORT (unlocks with progress)
Hospital capacity & speed, Alliance reinforcement capacity & slots, Reserve
recovery, Officer EXP gain, Recon range & duration.

## EFFECT ROUTING
A node's `effect.key` is a namespaced string routed by the owning system —
`unit.all.*` and `unit.<branch>.*` feed the `research` layer in
`StatResolution`; `cap.*` feeds the level/squad/deploy caps; `defense.*`,
`support.*`, `econ.*`, `gather.*`, `build.*`, `material.*` feed their buildings.
