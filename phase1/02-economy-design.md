# 02 — Economy Design

**Status:** v1.0. Rules, structure and progression targets are set here; the
full numeric balance model (§6) is built at the start of Phase 3, when the
economy moves to the server.

## 1. Decided rules

| Rule | Source |
|---|---|
| Building upgrades are **instant**, with no timers and no speed-ups. The limit is resources + construction materials | D1 |
| **Research** and **material production** have timers | D2 |
| Attacks never take resources; the attacker only gets kill statistics | D13, GDD 01 pillar 8 |
| Gathering: start with **1 truck + L1 farms**; research raises both; the L1 map caps at **5 trucks + L5 farms** | D25 |
| Farms probably attack-free, first come first served | D9 |
| Fair to all; a real advantage for spenders; no pay-to-win treadmill | D27 |

## 2. Resource map

| Resource | Comes from | Spent on | Timer? |
|---|---|---|---|
| Money / Steel / Oil | Treasury, Steelworks, Crude Oil buildings; **farms** via trucks | Research, building upgrades, troop production, assembly | Production is continuous; storage cap, overflow lost (`ResourceConfig.storageCap`) |
| Construction materials (6 tiers: wood → concrete) | Engineering Center workshops (1 → 4 workshops at levels 1/4/18/22) | **Building upgrades only** | Yes: 66 s (wood) to 320 s (concrete) per job at level 1 (`MaterialsConfig.js`) |
| Reserve Troops (personnel) | Regenerates; capacity from barracks | Fielding squads | Regeneration |
| Gold (premium) | Purchases, events, small daily trickle | Speed-ups for research / materials / healing, crates, shields, relocation, pass | — |
| Arms Coupons / Officer Vouchers | **Earn rates not designed** (GDD 11) | Troop / officer crates | — |
| Shards, parts, components, fragments, Arms EXP, ammunition | Duplicates, disassembly, PvE, events | Promotion, assembly, equipment, troop levels | Some |

## 3. The key point: the material queue *is* the build timer

Buildings are instant (D1), so the speed at which a player climbs HQ levels
is set by how fast the **Engineering Center produces materials**:

> HQ pace ≈ materials needed per upgrade ÷ workshop output per hour

Material demand grows ×1.26 per building level, and a new material tier is
added at levels 6, 12, 18, 24 and 30 (`MaterialsConfig.js`). So the economy's main control
is **workshop output vs material demand**, not resource income. The balance
model must show, for each HQ level, how many hours of workshop time an
upgrade costs. `ENGINEERING.outputPerBatch = 20` is marked DRAFT in code and
is the most important number still to set.

## 4. Measured: research time per tree (one queue, no speed bonuses)

Computed from `src/config/research/` with `nodeSeconds` / `nodeCost`:

| Tree | Nodes | Ranks | Total time | Money cost |
|---|---|---|---|---|
| Military | 21 | 70 | **321.6 days** | 67.1 M |
| Development | 21 | 92 | **182.6 days** | 38.1 M |
| Doctrine | 13 | 86 | 101.5 days | 34.3 M |
| Defense | 9 | 54 | 15.5 days | 5.2 M |
| Support | 8 | 44 | 6.7 days | 2.4 M |
| **All** | **72** | **346** | **~628 days** | **~147 M** |

Findings:
- **Two time models that don't match.** Development and Military use a
  seconds-per-Power rule (`SECONDS_PER_POWER = 900/29`, with each node's
  Power given by the client); Doctrine, Defense and Support use a generic
  growth formula (`COST_MODEL`). That's why Military takes ~322 days while
  Defense takes ~16.
- **Total research is ~628 days (about 1.7 years) on one queue** at base
  speed. Speed research and VIP shorten this, but a second research queue
  (GDD 12 mentions `parallelResearch`) is probably needed.
- Single research steps get long: `dev_collection_truck_3` alone takes
  **156.9 hours (6.5 days)**.
- Research now costs similar amounts of money, steel and oil
  (`COST_PER_POWER` 75 / 70 / 65 per Power point).
- **Proposed:** one time model for all trees, with a target total per tree
  set from the progression curve (§5).

## 5. Progression targets (proposal, to calibrate in the Warpath study)

Placeholder numbers to start the discussion. They are not decided:

| Player day | HQ level target | What the player is doing |
|---|---|---|
| Day 1 (first session) | 6–8 | Tutorial, first squads, first farm, first Legion camp |
| Day 7 | 12–14 | Joins an alliance, 2–3 trucks, first fort fight |
| Day 30 | 18–20 | Gates open (D20), competes for L2 forts |
| Day 90 | 24–27 | Fights for L3 forts / central fort |
| Day 180+ | 30–35 | Ready for the L2 map when it launches |

Spenders reach the same levels sooner (time); they don't reach levels free
players can never reach (D27, GDD 22).

## 6. Balance model (built at the start of Phase 3)

A spreadsheet **generated from `src/config`** by a script, so the design
numbers and the game code can't drift apart. Sheets:

1. Building output and storage per level.
2. Material demand per upgrade vs workshop throughput → hours per HQ level.
3. Research cost and time per tree.
4. Gathering yield per farm tier, trucks and research.
5. Player profiles: free, light spender, heavy spender. Daily sessions, time
   online, Gold per day → day-by-day HQ level and Power.
6. Currency faucets vs sinks per day: no runaway surplus, no dead ends.

## 7. Gathering (Proposed)

- **Trucks:** 1 at start → 5 max on the L1 map. Needs a 4th truck research
  node (conflict C7).
- **Farm tiers:** L1–L5 on the L1 map (research `dev_resource_collection_sites_2…5`);
  tier 6 is reserved for the L2 map (C8).
- **One truck per farm.** First to arrive takes it. A farm holds a fixed
  amount, **depletes**, and **respawns** elsewhere in the same ring, so no one
  can camp a farm forever.
- **Trucks cannot be attacked** on the L1 map (C19). Farms inside your
  alliance's territory pay a bonus (GDD 17).
- Trucks keep working while the player is offline; the server settles the
  load on arrival.

## 8. Server rules

- Production, gathering and timers are settled **lazily** on the server:
  `amount = rate × (now − last_settled)`, capped by storage. No per-second
  server work per player.
- Every change to a wallet is a ledger row with a reason. That makes support
  questions ("where did my steel go?") and exploit checks possible.

## 9. Defaults used (client can change)

1. Troop training keeps its timers (C18).
2. Arms Coupon and Officer Voucher earn rates are set in the balance model so
   a daily free player reaches pity about once a month (03 §4.1).
3. Gold **can** finish material timers, with a daily cap, so Gold doesn't
   become unlimited building speed.
4. Storage caps stay ("overflow is lost"). With no looting, the cap only
   limits how long a player can stay away.
