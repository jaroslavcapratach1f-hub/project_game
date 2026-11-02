# 07 — Version 1 Scope and Roadmap

**Status:** v1.0. Uses the defaults in README §2. Later phases are refined
with the real measurements from Phase 2.

## 1. What "v1" means

The first public release: a **soft launch** in a few countries on iOS and
Android, with one shared L1 map per server, real accounts and real payments.

## 2. Scope (MoSCoW)

| System | Must (v1) | Should (v1 if possible) | Later |
|---|---|---|---|
| Server & accounts | Accounts, sign-in, cloud state, anti-cheat, server time | Account linking across devices | — |
| Base | **16 launch buildings** with instant upgrades (D1), art for levels 1–18 (04 §8) | — | Recon Post, Reserves Barracks, Black Market; higher bands; level-36 finals |
| Economy | Production, materials with timers, research with timers, storage, gathering (D2, D25) | — | — |
| Army | Troop crates + star-ups, officers + skills, equipment (D3–D5) | Assembly / disassembly depth | Gold III+ tiers |
| Battlefield | Formations, group orders, flanking, PvE camps, PvP on the map (05) | Entrench, full terrain table | — |
| World map | L1 map, farms, forts, central fort, territory towns, convoy relocate, defeated-base rules, kill stats (06) | Gates (Layout C modules) | L2 map (portal is "Coming Soon", D11) |
| Alliance | Create/join, ranks, chat, rally, reinforce, territory | Alliance tech, alliance shop | Diplomacy tags |
| Events | Daily and weekly tasks, login rewards, **1 rotating event** | Onslaught (exists as a dev event) | Arms Race, Frontline War season |
| Shop | Gold packs, Monthly Card, Growth Fund, a few bundles, odds disclosure | Battle Pass, cosmetics | Subscriptions |
| Story / PvE | Tutorial, first campaign chapter (ref 00: missions and story) | Chapter 2 | More chapters |
| Live ops | Admin tools, mail, config updates without an app update, analytics, crash reports | — | — |
| Merge tooling | Data model supports merges from day one (ADR-006) | Merge script tested in staging | — |

## 3. Phase plan

The shared map is a v1 requirement, so the server moves **forward**: no more
features are built client-only.

| Phase | Content | Change vs. the earlier plan |
|---|---|---|
| 1 | Planning & architecture | **Done** (this blueprint) |
| 2 | **Quality sample + technical spike** | Spike added |
| 3 | **Server foundation + base & economy**, server-authoritative from day one | Server moved forward |
| 4 | Army, officers, equipment, battlefield | Same |
| 5 | **World map & alliances** | Was "after launch" |
| 6 | Shop, events, tutorial and story, live-ops tools | Split out of the old server phase |
| 7 | Polish, store apps, soft launch | Same |
| After | L2 map, seasons, more content, guided by player data | — |

## 4. What each phase delivers

- **Phase 2: Quality sample + technical spike.** Single-renderer prototype;
  asset pipeline with a hero building (3 visual bands, animated), one
  animated tank and one animated infantry squad; flanking prototype (05 §4);
  **two phones on one server map**; Capacitor shell; device FPS and server
  load tests (01 §7).
- **Phase 3: Server foundation + base & economy.** Finish the single
  renderer (terrain, fog, all units); shared simulation package with seeded
  RNG and unit tests; server foundation (gateway, sign-in, database, Nakama,
  environments); base, production, materials, research and storage on the
  server; client–server sync and reconnects.
- **Phase 4: Army, officers, battlefield.** Armory draws, pity and
  star-ups; officers, skills and equipment; formations, orders, flanking and
  tactical AI; server battles with client playback and quick battle.
- **Phase 5: World map & alliances.** World shard (chunks, marches, bigger
  streamed map); farms and trucks; forts and central fort; territory towns,
  relocation, convoy, defeated base, shields, kill stats; alliances, chat,
  rally, reinforce.
- **Phase 6: Shop, events, story, live ops.** Shop and receipt validation;
  events, dailies and mail; tutorial and the first campaign chapter; admin
  tools and analytics.
- **Phase 7: Polish & soft launch.** Performance and device testing; store
  apps and compliance items (03 §6, 09 §4); bug fixing and soft-launch
  support.

Every phase ends with a review of the result on real phones before the next
phase starts.

## 5. Top risks

| Risk | Effect | Mitigation |
|---|---|---|
| WebGL speed in the phone's web view | Rebuild in a native engine | Phase 2 spike measures it before the large phases |
| Server load of many 20 Hz battles | Lag or high hosting needs | Load test in Phase 2; quick-battle for low PvE; unit caps |
| Scope growth (new ideas weekly) | Focus is lost | Scope locked in this blueprint; new ideas go to the "Later" list |
| Too few players for a shared map | Empty servers | Layout choice, merges (D21), soft launch to measure |
| IP similarity to Warpath | Store or legal trouble | C1, C2, own UI/names, lawyer review |
| Art quality and volume | Looks cheap, or too many models to finish well | 6-level cadence, art made in the order players reach it (04) |
