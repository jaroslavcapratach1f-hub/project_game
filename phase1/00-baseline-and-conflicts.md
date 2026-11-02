# 00 — Baseline and Conflict Register

Two things every other Phase 1 document relies on:
1. **Baseline**: what the project is today, measured on 2 Nov 2026.
2. **Conflict register**: places where the client's GDD (`docs/gdd/`), the
   code, and his newer decisions (`reference/`) disagree. Each has a
   recommendation; Open items use the defaults in [README §2](README.md).

## 1. Baseline (measured 2 Nov 2026)

| Area | Measured | Source |
|---|---|---|
| Code version | Latest commit `9cef412` (14 Oct 2026) on `main` | `git log` |
| Code size | 373 JS files, ~32,400 lines | `src/` |
| Tests | **47 pass, 0 fail** across 21 files. They check 3D asset validity, layout and unit motion. **None** test combat maths, economy, research or pathfinding | `node --test "tests/*.test.mjs"` (note: `node --test tests/` fails on Node 24 because it treats the folder as a file) |
| Lint | **0 errors, 384 warnings** in 50 of 373 files: 375 `no-magic-numbers`, 5 `max-params`, 2 `max-depth`, 1 `complexity`, 1 `prefer-const` | `npx eslint src/` |
| Version control | GitHub repository, branch `main`, 40 commits, 820 tracked files, **~259 MB packed history**, **no Git LFS** (3D models stored as normal files) | `git log`, `git count-objects -vH` |
| 3D assets | 130 GLB files, **168.7 MB**. Largest: HQ at 11.1 MB | `assets/` |
| Building art | 14 of 19 building types have a model. No model folder for hospital, alliance hall, recon post, black market | `assets/buildings/` |
| Unit art | USA only: M4 Sherman, M24 Chaffee, M26 Pershing, M18 Hellcat, M12 GMC, US infantry, plus a super-heavy. No German or Russian roster yet | `assets/units/` |
| Research | 72 nodes in 5 trees (Development 21, Military 21, Doctrine 13, Defense 9, Support 8) | `src/config/research/` |
| Timers that exist | Research (`ResearchManager.js`), material production (`EngineeringCenter.js`), troop production (`ProductionQueue.js`). All use `TimedJob.js` with the **device clock** (`Date.now`) and live **only in memory** | `src/systems/` |
| Not built | Server, accounts, saving, gathering (`GatherTruck.js` is unused), forts, alliances, territory, gacha draw logic, shop, events, campaign | — |
| Designed but missing | The GDD index names five config files that don't exist: `AllianceConfig`, `ShopConfig`, `EventsConfig`, `CampaignConfig`, `LegionConfig` | `docs/gdd/README.md` |

## 2. Conflict register

Status: **Open** means the client decides, **Proposed** means we recommend
something and need his OK.

| # | Topic | GDD / code says | Newer decision / rule says | Recommendation | Status |
|---|---|---|---|---|---|
| C1 | **IP framing** | GDD 01 and GDD README: "same gameplay, same functions, same menus, same fields, same screen flow — renamed and re-skinned" | CLAUDE.md: the design is modelled on Warpath, the work is original. The client himself worries about copying (ref 05) | Reword the north star to "inspired by Warpath's structure; own UI layout, names, text and art". Copied menus and screen flow carry the most risk. IP lawyer review before launch | Proposed |
| C2 | **Data copied from a live game** | `VipConfig.js` and `VipPackagesConfig.js` record VIP tables from "the player's own reference". They include item names found nowhere else in Blitzmire (e.g. `guardianOfTruthStatue`, `e100Suspension`), **naval and airlift perks** (`navalRapidResupplyLimit`, `airliftLimit`) and prices in **AED** | Ground war only; original work | Treat both files as reference only. Design our own VIP table in 03 | Proposed |
| C3 | **Kill statistics** | GDD 10: kills by **star tier** (4★ … Gold II++; ladder keys 4–8) | D18: "L6 ×150, L7 ×200" | Keys 6 and 7 are Gold I and Gold II on the star ladder, so the client probably means **star tier**, not troop level (1–200). Confirm | Open |
| C4 | **Defeated base HP** | GDD 09: base re-deploys at **0 HP** | D23: **10% HP**, then regenerates | Use 10%. Reuse the GDD 17 Novice Shield as the post-defeat shield | Proposed |
| C5 | **Map structure** | GDD 17: one map per server, sectors with level bands 1–4, a Capital, Sector Transfer items | D7, D10, D19: separate map **levels** (L1, L2…), rings of forts (16/8/4/1) | Rings = sectors; central fort = Capital; Sector Transfer works only inside one map. Details in 06 | Proposed |
| C6 | **Server lifecycle** | GDD 21: cross-server **Frontline War** season every 6–10 weeks, with territory soft-reset | D20, D21: gates after ~1 month, **7-day merge event**, move up to the L2 map | Running both models in v1 is too much. v1 has gates, merge tooling and the "Coming Soon" L2 portal. Frontline War is deferred | Proposed |
| C7 | **Truck count** | Code: max **4** (`EconomyConfig.GATHER.trucksBase = 1` + 3 truck nodes in `DevelopmentTree.js`) | D25: **5** | Add a 4th truck research node; keep the start at 1 | Proposed |
| C8 | **Farm tiers** | Code/GDD 07: **6** node tiers (`nodeTierYieldMult` has 6 entries); research unlocks up to site tier 5 | D25: L1 map caps at L5 | Consistent: tier 6 is reserved for the L2 map | Proposed |
| C9 | **Equipment owner** | GDD 13 + `src/config/equipment/`: 3 equipment slots per **troop** | D5: **officer** equipment | Ask. Both reuse the GDD 13 slot/part/set design. See 03 §4 | Open |
| C10 | **Officer identities** | GDD 05 example roster uses real WWII commanders (Rommel, Guderian, Dönitz). Dönitz was a **naval** commander. Code has no named officers yet (`OfficerConfig.js` holds rules only) | CLAUDE.md: officer names are our own | Use **fictional** officers: they're our own IP, and real Nazi-era commanders sold through paid card packs may be sensitive with ratings and stores in some markets | Open |
| C11 | **Art cadence** | CLAUDE.md / GDD 24: new look every **3** levels = 13 looks per building = **247** building models for 19 buildings | GDD 24 "approved range": HQ, barracks and defence kit share one look for levels **1–6** | A 6-level cadence needs 133 models. Biggest single art decision; see 04 | Open |
| C12 | **Construction speed-ups** | GDD 19 Assist "shaves construction timer"; GDD 22 Gold buys "instant-finish build" | D1: buildings are instant, no timers | Remove construction from Assist and Gold sinks. Assists apply to research, materials and healing | Proposed |
| C13 | **Premium currency** | `ResourceConfig.js` header: "No premium hard currency" | GDD 22: **Gold** exists | Header comment is out of date; Gold stays | Proposed |
| C14 | **Number of events** | GDD 21: dailies, weeklies, login calendar, Arms Race, 6 limited events, Battle Pass, Frontline War | D22: controlled number, no event flood | Small launch set; see 07 | Proposed |
| C15 | **Research gating** | GDD 12 / `ResearchModel.TIER_HQ_GATE`: tiers gated by **HQ level** | `DevelopmentTree.js`: gated by **Research Center level** | One rule for all trees: Research Center level | Proposed |
| C16 | **Recon Post** | Code key is still `airbase` and has a **`scoutPlanes`** effect (`BuildingConfig.js:62`); `EconomyConfig.TIMERS.airdropChargeRegen` | GDD 01: no aircraft, no scout planes | Rename to recon post and use ground recon vehicles (code change later) | Proposed |
| C17 | **Paid shields** | GDD 22: shields purchasable "so a spender can always opt out of PvP" | D27: fair to all | Keep shields, but make them unusable while holding a fort or blocking territory | Proposed |
| C18 | **Troop training timers** | `EconomyConfig.PRODUCTION_SECONDS`: 180 s (infantry) to 5,400 s (super heavy) | D2 names timers only for research and materials | Confirm troop training keeps timers | Open |
| C19 | **Truck safety** | GDD 07 / 11: truck vulnerability "TBD" | D9: farms probably attack-free | Trucks visible but **cannot be attacked** on the L1 map | Proposed |
| C20 | **"Captains" at the central fort** | GDD: officers are assigned to squads | Ref 03: "captains" stationed at the central base for stat boosts | Treat captains as officers placed in central-fort slots; define slots and boosts in 06 | Proposed |

## 3. What happens next

- The Open items (C3, C9, C10, C11, C18) use the defaults in
  [README §2](README.md) until the client confirms or changes them.
- Each confirmed result is recorded as a new D-number in
  `reference/README.md`. The GDD files are the client's and are updated only
  with his agreement.
