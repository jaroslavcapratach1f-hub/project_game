# Alliance

The guild layer. One alliance per player. Config in `src/config/AllianceConfig.js`.
The **Alliance Hall** (building #16) governs the player-side limits
(`assistCount`, `assistCapacity`, `reinforcementSlots`).

## RANKS  (R1–R5, names/permissions configurable)
- **R5 Leader** — promote/demote, kick, disband, declare diplomacy, start
  territory expansion, manage tech priority.
- **R4 Officers** — everything except kicking the leader or disbanding.
- **R1–R3** — join rallies, assist, reinforce, gather in territory, contribute
  tech, use the shop. Titles per rank are editable by the leader.
- Auto-demote / leadership transfer on long leader inactivity.

## ALLIANCE TECH  (3 trees)
Members **contribute** (resources or a timed free contribution) to earn
**Alliance Points**; contributions also fund the next tech rank. Cap ~20
contributions, one free contribution regenerating every 30 min.
- **Tree 1 — Economy:** recruitment, collection, research speed, resource
  production.
- **Tree 2 — Expansion:** member cap, territory size, construction-time
  reduction.
- **Tree 3 — War:** combat bonuses to all member units.
Completed ranks buff **every member** and add alliance Power.

## TERRITORY
- During an **expansion phase** the leader / R4 place **Central Command (CC)**
  and **Turrets** on the world map to grow alliance **influence area**.
  Building a CC needs a minimum member count (~20).
- Inside territory: member bases get buffs (build speed, defense, march
  speed), resource fields pay a **bonus + crate chance**, and members earn
  **Commander Credits** for the alliance shop.
- **Turrets** auto-defend the border; **CC** is the hub and can be besieged.
- **Fortress** — a large contested alliance stronghold; holding it grants a
  server-wide buff and feeds the season objective (GDD 21).

## CO-OP ACTIONS
- **Rally** (GDD 17) — staged multi-member march on bosses, enemy bases, or
  alliance objectives. Join slots and rally size from the Alliance Hall.
- **Reinforce** — send squads to garrison a member's base; they fight under
  that base's Base Fury during a defense. `reinforcementSlots`.
- **Assist** — one tap shaves a fixed chunk off a member's construction /
  research / healing timer. `assistCount` uses, `assistCapacity` per timer.
- **Alliance immunity** (GDD 02) — allied and allied-alliance units never
  damage each other; Fury skips them.

## ALLIANCE SHOP & GIFTS
- **Alliance Shop** — spend **Alliance Contribution Coins** (from gathering in
  territory, tech contribution, assisting, and helping build alliance
  structures) on resources, speed-ups, teleports, shields, officer shards, and
  alliance-exclusive items.
- **Alliance Gifts / Chests** — member purchases and boss kills drop gifts for
  the whole alliance; a rising **gift level** improves rewards; each member
  claims their own copy.

## DIPLOMACY & COMMS
- Tags: **Ally / NAP / Enemy**. Allies gain immunity, may reinforce, and pass
  through territory.
- Dedicated **alliance chat** channel; R4+ post pinned announcements and
  alliance mail.

## EVENTS
- Internal: build races, donation drives, Onslaught alliance bracket (GDD 16).
- External: territory war, Fortress capture, and bloc participation in the
  season **Frontline War** (GDD 21).
