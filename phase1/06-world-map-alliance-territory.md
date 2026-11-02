# 06 — World Map, Alliance & Territory Design

**Status:** v1.0. Default: Layout A built from modules (§4). Sources: client decisions in `reference/03` and `reference/05`,
GDD 17 (map), 18 (base), 19 (alliance), 09 (base states).

## 1. Client decisions this design must keep

| Rule | D# |
|---|---|
| Several map **levels**; everyone starts on an L1 map | D7 |
| Farms L1–L5 gathered by Army trucks; probably attack-free | D8, D9 |
| Rings: outer L1 forts with equal buffs → stronger forts inward → **one central fort** with captain boosts | D10 |
| Portal forts to the next map level are built but **"Coming Soon"** | D11 |
| Attacks give **zero resources**; only kill statistics | D13, D18 |
| Territory must connect to a fort; built by **relocating bases** into it; enemies block it by relocating in | D14 |
| Players left behind can take over forts; the map must refill and not become a boring farm | D15 |
| Fort pyramid idea: **16 → 8 → 4 → 1** | D19 |
| Gates to other L1 maps after ~1 month; **7-day merge event** when activity drops | D20, D21 |
| Defeated base: random spot, **10% HP**, regenerates | D23 |
| Voluntary relocate: base becomes a **slow convoy**; troops travel separately | D24 |
| Start with 1 truck + L1 farms; cap at **5 trucks + L5 farms** | D25 |

## 2. What exists in code

One 100×100 hex map (10,000 hexes) with generated terrain (water, hills,
forest, grass), hex A* pathfinding, a locked **7-hex base territory**
(`WorldMapConfig.baseTerritoryHexes`) and 4 static neighbour bases. No farms,
forts, alliances, territory, relocation or second map. All of it needs the
server (01).

## 3. How the GDD maps onto the client's design (C5, C6, C20)

| GDD 17/19 term | Becomes |
|---|---|
| Sectors with level bands 1–4 | The **rings** of the L1 map |
| Capital sector | The **central fort** |
| Fortress (alliance stronghold) | The **L2–L3 forts** |
| Central Command + Turrets (alliance territory buildings) | **Territory towns**, built by relocating bases (D14) instead of placing buildings |
| Sector Transfer items | Move within one map only; never between map levels |
| Frontline War season | Deferred; map levels + merges are the lifecycle in v1 |
| "Captains" | Officers placed in central-fort slots |

## 4. Three layouts to compare

### Layout A: Pyramid rings (the client's 16/8/4/1)
```
          ┌──────────── outer ring: 16 L1 forts, farms L1–L2 ───────────┐
          │      ┌──── middle ring: 8 L2 forts, farms L3–L4 ────┐       │
          │      │    ┌─ inner ring: 4 L3 forts, farms L5 ─┐    │       │
          │      │    │         CENTRAL FORT               │    │       │
          │      │    │  + "Coming Soon" portal forts      │    │       │
```
- 29 forts give up to ~29 alliances a place to hold.
- Clear goal: move inward. Easy to explain.
- Risk: once the strongest alliances own the centre, the outer rings go
  quiet.

### Layout B: Compact map with limits
- A smaller map with fewer forts (e.g. 8 + 1 central).
- Each alliance may hold at most N territory towns and N forts, so no one
  alliance can take everything (client's alternative, ref 05).
- Fills quickly and feels busy; needs more map instances for the same number
  of players; the limits must be easy to understand.

### Layout C: Provinces with gates
- Several small "provinces", each a mini version of Layout A, inside one map
  instance.
- **Gates open around day 30** (D20): provinces connect and new competition
  begins without new players.
- Merges (D21) join provinces from different servers.

| | A Pyramid | B Compact | C Provinces |
|---|---|---|---|
| Players per map | Most | Fewest | Many |
| Fills fast at launch | Slower | **Fastest** | Medium |
| Alliance competition | Strong at the top, quiet outside | Even | **Renewed by gates** |
| Fits merges (D21) | OK | OK | **Best** |
| Server and design complexity | Medium | **Lowest** | Highest |

**Default:** build **Layout A** for the first map, made from province-sized
modules, so we can add gates (C) later without a redesign. The client can
still choose B or C before Phase 5 starts.

## 5. Map size: a rule of thumb

> hexes needed ≈ players × hexes per base slot ÷ share of land for bases

With the planning figure of **1,500 players per map** (README §2): 1,500 ×
19 hexes per base slot (7-hex territory + 1 ring of spacing) ÷ 40% land for
bases ≈ **71,000 hexes**, about 267×267. Today's map is 100×100 = 10,000
hexes, so **the map must grow**, and the client must stream it in chunks
(01 §4). With alliances of up to 50 members, 1,500 players form about 30
alliances, which fits the 29 forts of Layout A.

## 6. Systems

### 6.1 Resource farms
- Money, steel, oil; tiers L1–L5 (tier 6 on the L2 map).
- A farm holds a fixed amount and **depletes**, then **respawns** elsewhere
  in the same ring.
- **One truck per farm**; first to arrive gets it; trucks can't be attacked
  (C19).
- Farms inside your alliance's territory pay a bonus (GDD 17).

### 6.2 Forts
- Levels L1–L3 plus the central fort. All L1 forts have the **same buffs**
  (D10).
- An unowned fort is held by **Legion NPC defenders** (GDD 20) until an
  alliance takes it.
- **Capture:** the alliance's territory must **touch** the fort (D14); then
  defeat the garrison (Rally, GDD 17) and hold it for an occupation timer.
- **Buffs** go to alliance members (e.g. gather speed, march speed). The
  central fort adds **captain slots**: officers placed there give stat boosts
  (C20).
- **Ownership lapse** (*proposal*): a fort is released if the owning alliance
  moves to the L2 map, falls below a minimum of active members, or doesn't
  defend it for N days. This is how players left behind take forts over
  (D15).

### 6.3 Territory towns
- Pre-built **town sites** on the map (D14).
- An alliance claims a site and **builds it by relocating member bases next
  to it**. More bases means faster building, up to a cap.
- An **enemy base relocated inside** pauses construction until it is
  defeated. Defeat sends it away (D23), so construction can resume.
- **Connection check:** a chain of owned towns must link the alliance's
  territory to the fort before capture can start (a graph search on the
  server).

### 6.4 Bases on the map
- The locked 7-hex base territory stays (in code).
- **Convoy relocate** (D24; GDD 09 "Caravan"): the base becomes a slow, high-HP,
  unarmed truck; troops move separately; allies may escort it; a destroyed
  convoy is sent to a random location.
- **Defeated base** (D23, C4): random spot in the same ring, 10% HP,
  regenerates (GDD 09: full in ~8 h), plus a **post-defeat shield** (Novice
  Shield, GDD 17) so it can't be farmed.
- **Instant moves** (Redeploy charges, transfer items, GDD 09/17): keep them
  limited, so territory blocking stays a real decision.

### 6.5 Kill statistics (D18, C3)
- Recorded per player by **star tier** of killed troops (pending C3), shown
  on the profile and used for rankings and events.

### 6.6 Map levels and portals (D7, D11)
- Portal forts sit in the inner ring and display "Coming Soon" in v1.
- Moving up (later): requirements (e.g. HQ level, alliance holds a portal
  fort), a one-way move, and alliances moving as a group. Details are
  deferred until the L2 map is funded.

### 6.7 Lifecycle (D15, D20, D21)
- **Day ~30:** gates open (if Layout C modules are used).
- **Low activity:** announce a 7-day merge event; move everyone onto one map;
  give alliances a fresh start on forts; resolve duplicate names (01, ADR-006).
- **New servers** open on a schedule. New players go to the newest server,
  not into an old one (the client was unsure about the alternative, ref 03).

## 7. Defaults used (values tuned in Phase 5)

1. **Layout:** A, built from province modules (§4).
2. **Players per map:** 1,500 (planning figure).
3. **Alliance size:** up to 50 members (*proposal*).
4. **Fort buffs:** L1 forts give equal economy buffs (gather and march
   speed); L2–L3 forts add combat buffs; the central fort has **5 captain
   slots**, each boosting one stat for the holding alliance (*proposal*).
5. **Fort lapse:** a fort is released when its alliance moves to the L2 map,
   or has fewer than 10 active members for 7 days (*proposal*).
6. **Relocation:** convoy relocation is free with a short cooldown; each
   member base next to a town speeds construction, up to 10 bases
   (*proposal*).
7. **L5 farms:** inner ring.
8. **Instant transfer items** can be earned and bought, but **can't target
   enemy territory**. Only a visible, slow convoy can enter it to block
   construction, which keeps blocking a real decision (D27).
