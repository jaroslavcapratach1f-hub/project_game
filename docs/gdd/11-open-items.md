# Open Items / To Be Defined

## 2026-09-07 — WARPATH-PARITY PASS
GDD realigned to Warpath parity (see 01). New: 17 world map · 18 base-on-map ·
19 alliance · 20 campaign/Legion · 21 events/season · 22 VIP/shop · 23
UX/navigation. Rewritten: 01, 02 (combat now resolves on the world map), 16
(Skirmish → **Onslaught** base-defense event). Edited: 03 (roster scope: no
air/naval), 04 (#14 AirBase → **Recon Post**; HQ = Commander level), 07 (Gold
added; 5 top-bar resources), 09 (Airdrop → **Redeploy**, no planes), 12 (recon).
Provisional names to confirm/rename: **the Legion** (NPC faction),
**Onslaught** (event), **Frontline War** (season), **Frontier** (campaign
region), bottom-nav labels.

## RESOLVED (specified in config + GDD)  — values still DRAFT / REVIEW
- Personnel recovery & barrack capacity per level → `PersonnelConfig.js`, GDD 06.
- Detailed troop stats → `UnitStats.js`, GDD 03.
- Troop production times → `EconomyConfig.PRODUCTION_SECONDS` + `PRODUCTION_TIER_MULT`.
- Repair (Hospital speed/capacity/slots, no field repair) → `BuildingConfig.hospital`
  + `EconomyConfig.HOSPITAL`.
- Squad size & per-class cap → `PersonnelConfig`, GDD 06.
- AoE radius per weapon → `UnitStats.aoe` + `CombatConfig.SPLASH`.
- Type counters → `CombatConfig.COUNTERS`, GDD 02.
- Tech tree layout and costs → `src/config/research/`, GDD 12.
- Officer roster tiers, skill unlocks, EXP curve, crate rates & pity →
  `OfficerConfig.js` + `ArmoryConfig`, GDD 05.
- Building level caps → HQ 35, every building HQ-gated, GDD 04.
- Nation Bonus → `ProgressionConfig.NATION_BONUS`, GDD 10.
- Star ladder & assembly recipes → `StarTiers` + `ProgressionConfig.ASSEMBLY`.
- Equipment → `src/config/equipment/`, GDD 13.
- Parts / blueprints / components / Modify / conversion → `PartsConfig.js`, GDD 14.
- Power rating → `PowerConfig.js`, GDD 15.
- Construction-material tiers per building level → `MaterialsConfig.js`.
- World gather-node tiers → `WORLD.gatherNodeTiers`.
- Base footprint, build grid, zoom LOD → `WorldMapConfig.js` + `BaseConfig.js`, GDD 18.

## STILL OPEN
### World map & PvP
- ~~Tile grid shape~~ → **flat-top HEX** (`src/utils/Hex.js`, decided 2026-09-07;
  axial coords, rectangular layout, 100×100 hexes placeholder). Still open: real
  map size, players per server, spawn rules, sector shape.
- Sector count / level bands / Capital placement; server-merge cadence.
- Fog reveal distance & duration (Recon Post: `reconRangeTiles`,
  `radarRangeTiles`, `reconDurationSeconds`).
- March speed formula, road multipliers, terrain table.
- Rally mechanics: join slots, launch timer, max stack, alliance-only vs mixed.
- Shield durations, `shieldBreaksOnAttack`, novice-shield triggers.
- Gather Truck vulnerability on the map.
- Neutral-outpost list and their held-buffs.

### Combat on the map
- Formation presets — exact unit offsets per preset and per class.
- Terrain effects — the open/forest/urban/hills/road modifier table.
- Entrench — mitigation %, enter/exit time.
- Retreat — disengage time, auto-fallback HP threshold.
- Quick-battle outcome formula (Power × counters → losses).

### Onslaught (16)
- Wave count & rosters, difficulty scalars, boss cadence, field-repair
  charges, milestone / leaderboard / event-shop tables → `OnslaughtConfig.js`.
- Exact 30-day calendar and window length.

### Campaign / Legion (20)
- Chapter/node graph, enemy comps, star objectives, idle-rate curve, daily
  attempts → `CampaignConfig.js`.
- Legion stat blocks, elite/warlord variants, per-sector scaling → `LegionConfig.js`.
- Confirm Campaign stays world-map-integrated (not instanced like Warpath's).

### Alliance (19)
- Tech tree nodes & costs; territory expansion phase rules; CC/Turret/Fortress
  stats; assist chunk size; alliance-shop stock & prices.

### Events / Season (21)
- Arms Race category schedule & point tables; limited-event roster & currencies;
  Battle Pass length & reward tracks; Frontline War phase lengths, matchmaking,
  scoring, settlement (what soft-resets — never bases/progression).

### VIP / Shop (22)
- VIP level count & per-level perk values; Gold pack tiers & prices; Monthly
  Card / Growth Fund contents; special-offer triggers.

### Still open from before
- Nation-assignment mechanic for the flexible Barracks (how a Barracks picks
  its nation, and re-picking).
- 3★ troop viability beyond disassembly fodder (garrison? weak fight?).
- Duo skill combinations; golden-star officer mechanics.
- Building placement grid spacing rules; expansion-plot layout.
- Arms Coupon / Officer Voucher earn rates.
- Future gold tiers 8.5–10: recipes, costs, kill-stat names.
