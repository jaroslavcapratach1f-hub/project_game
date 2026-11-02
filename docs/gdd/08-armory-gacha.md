# Armory & Troop Acquisition

## STAR TIERS
- 3★ (Common): Cannot be upgraded. For Disassembly only.
- 4★ (Average): Primary building block for progression.
- 5★ (Very Rare): Highest tier of base power.

## MERGING / UPGRADE PATH
Phase 1 (Identical Merge):
  one 4★ + exact same 4★ = 4★+

Phase 2 (Nation Merge):
  Three 4★+ of SAME country (can be different types) = one 5★
  Player chooses which one upgrades to 5★.

## PITY SYSTEM
- Every draw fills progress bar (X/100)
- Reaching 100 guarantees a 5★ troop
- BANKING: Players can hoard (200/100, 300/100 allowed)
- Late-game: popping 100/100 in country crate lets player
  choose which country the 5★ comes from

## CRATE TYPES
- General Crate: Available early. Random troops from all nations.
- Country Crates (Germany, USA, Russia): Unlocked progressively
  by Server Time and Base Level. Milestones TBD.

## TIME-GATED DROP POOL
Prevents new player overwhelm:
- Days 1-9: Only drops Infantry, Medium Tanks, Heavy Tanks,
  Tank Hunters
- Day 10+: Unlocks Super Heavy Tanks, Howitzers, Anti-Tank Guns,
  Light Tanks, Rocket Artillery
- The Armory NEVER drops Armored Cars / Gather Trucks (non-combat,
  unlocked via Research instead — see 07-economy.md)

## DROP RATES  (`src/config/ArmoryConfig.js`, DRAFT)
Troop pull: 5★ 2% · 4★+ 8% · 4★ 30% · 3★ 60% (sums to 1).
Officer pull: 5★ 2% · 4★ 14% · 3★ 84%; officer pity 60/100 (bank to 120).
Duplicate officers auto-convert to shards (20 / 40 / 80 by star).

## BLUEPRINT FRAGMENTS
Every open also grants blueprint fragments (2 per single, 25 per ten-pull)
toward unit blueprints — see 14-parts-and-modify.