# Campaign & the Legion (PvE)

## THE LEGION  *(name provisional — rename freely)*
The single NPC enemy faction. A stateless rogue army — WWII remnants and
mercenaries with no nation, running scavenged equipment. It supplies **all**
PvE opposition:
- **Marauder camps** — low tier, roaming the world map (GDD 17).
- **Legion bunkers** — mid tier, fixed, Rally-worthy.
- **Warlords / bosses** — high tier, named, need an alliance Rally; drop
  "Major Plunder".
- **Onslaught** waves (GDD 16) and **Campaign** nodes (below).

Roster: the same **9 ground classes** with Legion skins, plus **Elite
variants** (heavier stat block + one signature skill) and named **Warlord**
units for bosses. Scales by sector / chapter. **No air, no naval** (GDD 01).
Config: `src/config/LegionConfig.js`.

## CAMPAIGN = THE FRONTIER  (on the world map, not instanced)
Campaign is a scripted PvE region of the world map — a branching chain of
Legion positions cleared in order. It stays in the one scene: each node is a
set-piece fight **in place on its map tile**, using the normal combat systems
(GDD 02) with a scripted enemy composition and story beats.

- **Nodes** — the "stages". Unlock in sequence along the chain; branches give
  optional side nodes.
- **Chapters** — groups of ~15–20 nodes. Clearing a chapter gives a large
  reward, opens the next Frontier region, and usually introduces a mechanic
  (entrench, deployables, Rally, terrain…) as a guided beat.
- **Boss node** at each chapter end — a Warlord; needs a Rally.

## STARS & REPLAY
- Up to **3 stars** per node from objectives (clear · clear under time ·
  finish with no unit lost — set per node).
- **First-clear** reward per node; **3-star** bonus per node; **all-3-star**
  bonus per chapter.
- Nodes are **replayable** for star completion and for a limited number of
  **daily reward attempts** (`campaign.dailyAttempts`), quick-battle allowed
  once 3-starred.

## IDLE INCOME  ("held front")
- Your **furthest cleared node** is your held front and drips **Arms EXP,
  Ammunition, Troop Parts, and Gold** over time.
- Accrues up to a cap (~12–24 h); collected from the **Campaign panel**.
- Advancing the furthest node moves the drip forward and **raises its rate**
  (later nodes pay more) — the incentive to push.

## REWARDS SUMMARY
First-clear + star bonuses (parts, blueprint fragments, officer shards, Arms
Coupons, Gold) · idle income · chapter-clear chests · occasional officer or
equipment unlocks tied to story chapters.

## CONFIG
`CampaignConfig.js` — chapter/node graph, enemy comps, objectives, star and
first-clear tables, idle-rate curve, daily attempts. `LegionConfig.js` — Legion
stat blocks, elite/warlord variants, per-sector and per-chapter scaling.
