# 01 — Technical Architecture: Game, Server, Database

**Status:** v1.0. The decisions below are **Proposed** defaults; the risky
ones are proven in the Phase 2 technical spike (§7).

## 1. Starting point (from the code)

| Part | Today | Keep / change |
|---|---|---|
| Simulation (combat, AI, pathfinding, stats, economy formulas, research model) | Plain JS, no dependency on graphics. Fixed 20 Hz step (`GameLoop`). `DamageResolver.js` uses `Math.random` | **Keep**, and move into a shared package the server can run |
| Rendering | PixiJS 8 for 2D/HUD plus **two extra Three.js renderers** (`Base3DLayer`, `Unit3DLayer`), each drawing to an off-screen canvas that is uploaded as a texture every frame (`Unit3DLayer.js` ~243) | **Change**: one world renderer (ADR-004) |
| State | Everything in memory. Only settings saved (`localStorage`). Timers use the device clock (`TimedJob.js`) | **Change**: the server owns all state and time |
| Network | None | **Build** |
| Assets | 168.7 MB of uncompressed GLBs | **Change**: compressed, streamed per tier (see 04) |
| Debug hooks | `window.game`, `window.onslaught`, `window.research`, etc. | Keep for dev builds only |

## 2. Target shape

```
 Phone app (Capacitor)                        Servers
┌─────────────────────────┐   WebSocket   ┌──────────────────────────────┐
│ Client                  │ ────────────▶ │ Gateway (auth, rate limits)  │
│  • Three.js world view  │   commands    ├──────────────┬───────────────┤
│  • Pixi HUD overlay     │ ◀──────────── │ World shard  │ Meta services │
│  • shared/ simulation   │ events +      │ (one per map)│ accounts,     │
│    (for prediction and  │ snapshots     │ marches,     │ alliances,    │
│    display only)        │               │ battles,     │ chat, shop,   │
└─────────────────────────┘               │ farms, forts │ purchases,    │
         ▲ assets via CDN                 │ territory    │ leaderboards  │
                                          └──────┬───────┴──────┬────────┘
                                                 ▼              ▼
                                          PostgreSQL (truth)  Redis (cache, pub/sub)
```

**Core rule: the client only sends intentions** ("march squad 3 to hex X",
"start research Y", "open crate"). The server checks them, decides the
result, and broadcasts it. The client never reports a result.

## 3. Architecture decisions (ADRs)

| ADR | Decision | Why | Status |
|---|---|---|---|
| 001 | **Server-authoritative** for all state, time, combat, draws and purchases | Shared map, anti-cheat, store rules | Proposed |
| 002 | **Server language: JavaScript (Node.js LTS)**, ES modules + JSDoc type checking | Reuses the existing simulation code unchanged; one language for the team | Proposed |
| 003 | **Meta services: Nakama** (open source, Apache-2.0) for accounts, sign-in, alliances (groups), chat, leaderboards and store-receipt validation; the **world shard is our own Node service** | Proven standard features instead of rebuilding them, so effort goes into the game itself. Alternative: everything custom in Node (more control, more work). Decide after the spike | Proposed |
| 004 | **One world renderer**: Three.js draws terrain, buildings, units and fog; Pixi draws only HUD and labels on a transparent canvas on top. No per-frame texture copies | Removes 2 of 3 WebGL renderers and the per-frame texture upload. Matches CLAUDE.md "whole game to 3D". Lets units pass behind buildings correctly | Proposed |
| 005 | **Database: PostgreSQL** (single source of truth); **Redis** for presence, pub/sub, caches | Proven, managed offerings everywhere; Nakama also runs on Postgres | Proposed |
| 006 | **Global IDs** (ULID/UUID) for every entity; names unique **per world** only | Server merges (D21) become row moves plus rename tokens, not ID rewrites | Proposed |
| 007 | **Seeded random numbers** per battle; the seed is stored with the battle | Replays, dispute checks, client/server agreement | Proposed |
| 008 | **Event-driven world**: marches, gathering and timers are stored as *start time + rate + end time* and settled when needed; only **active battles** tick (20 Hz, as today) | Cost scales with fights, not with map size or player count | Proposed |
| 009 | **Mobile shell: Capacitor** (iOS + Android from the same web code) | Keeps the JS code base. Risk: WebGL speed inside the phone's web view. Measured in the spike; fallback is a native engine (assessment Strategy C) | Proposed |
| 010 | **Assets**: glTF with meshopt/Draco geometry, KTX2 textures, LODs, downloaded on demand per tier from a CDN | Today's 168.7 MB is far too large for a mobile first download (see 04) | Proposed |

## 4. World shard (the shared map)

- **One process per map instance** (one L1 map = one shard). The map is cut
  into **chunks** (e.g. 16×16 hexes). Clients subscribe to the chunks inside
  their camera view and receive only those updates (interest management).
- **Marches** are stored as a path + start time + speed; any client can draw
  the march position without the server ticking it. Arrival is a scheduled
  event.
- **Battles** run the existing simulation at 20 Hz on the server. Watchers
  receive compact snapshots and interpolate. Low-level PvE can use a
  quick-battle formula (GDD 02) instead of a full simulation.
- **Farms, forts, territory, relocation and convoys** are persistent map
  objects with owners and timers (design in 06).
- **Time:** the server clock is the only clock. Clients get a clock offset at
  login and show countdowns from server end times.

## 5. Data model (first sketch)

| Area | Main tables |
|---|---|
| Identity | `accounts`, `devices`, `auth_links` (Apple/Google), `players` (one per world) |
| World | `worlds`, `map_objects` (farms, forts, towns, portals), `territory_nodes`, `alliance_territory` |
| Base | `bases` (hex, HP, state: deployed / convoy / cloud), `buildings` (type, level, cell) |
| Progress | `research_ranks`, `jobs` (research, materials, training, healing: start, end, payload) |
| Army | `troops` (class, star, level, faction), `squads`, `officers`, `equipment_items`, `marches` |
| Combat | `battles` (seed, participants, result summary), `kill_stats` (player, star tier, count) |
| Social | `alliances`, `alliance_members`, `alliance_tech`, `chat` (or Nakama) |
| Economy | `wallets` + `ledger` (every currency change is an immutable row with a reason), `inventory` |
| Money | `purchases` (store receipt, status, **idempotency key**), `gacha_draws` (audit log with rates version) |
| Live ops | `events`, `event_progress`, `mail`, `config_versions` |

## 6. Security, privacy, operations

- TLS everywhere; short-lived session tokens; per-player rate limits.
- Store receipts are verified on the server before any grant. Grants are
  idempotent (a receipt can never be paid out twice).
- Every gacha draw is made on the server and logged with the published rate
  table version.
- In-app account deletion (Apple requires it) and data export (GDPR).
- Three environments: dev, staging, production. Database backups with
  point-in-time restore. Metrics, logs, alerts and crash reporting from the
  first server build.

## 7. Proven in the Phase 2 technical spike (before big spending)

1. **Two phones, one map:** both see the same march and the same battle, with
   matching results.
2. **Server load:** number of simultaneous 20 Hz battles per CPU core with
   realistic squad sizes. This sets server cost (09) and map size (06).
3. **Renderer:** ADR-004 single renderer holds **60 FPS** on a mid-range 2020
   phone with a full base and two squads on screen (CLAUDE.md target), inside
   Capacitor.
4. **Asset limits:** a compressed building tier and a tank meet the limits
   in 04.

If item 3 fails inside the phone's web view, revisit ADR-009 before Phase 3.

## Technical notes

- Moving the simulation into `shared/` touches many files. That happens in
  Phase 3, not now; Phase 1 only records the plan.
- Nakama's server-side scripting runs JS in an embedded ES5-style runtime,
  so our ES-module simulation would **not** run inside Nakama. That's why the
  world shard is a separate Node service.
- Re-check the Nakama and Capacitor licences and versions when Phase 3 starts.
