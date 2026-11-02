# 05 — Battlefield Design: Formations, Flanking, Tactical AI

**Status:** v1.0. Values marked *proposal* are tuned in the Phase 2 battle
prototype.

## 1. The client's goal (ref 00)

> Player A has two formations, Player B has one. One of A's formations
> engages head-on while the second goes around and attacks from behind. The
> rear attack should give a meaningful tactical advantage.

Battles happen **in place on the shared map** (GDD 02), so this has to work
with touch controls, on a phone, while other players can watch.

## 2. What already exists (keep)

| Piece | Where |
|---|---|
| Damage per shot: hit roll, counters, armour penetration by **facing**, defence, splash, ±10% variance | `src/combat/DamageResolver.js`, GDD 02 |
| Facing arcs: front 120°, rear 90°, the rest is side | `CombatConfig.FACING` |
| Rear/side hits already hurt armour more (thinner plate) | `Entity.facingOf`, `DamageResolver` |
| Type counters (rock-paper-scissors chain) | `CombatConfig.COUNTERS` |
| AI states: idle, patrol, alert, engage, retreat | `src/ai/AIStates.js` |
| Movement profiles, including a **flank** offset around the target | `src/ai/Behaviors.js:70` |
| Tanks pivot, then drive, with acceleration and terrain speed | `TankMotor.js` |
| Field Fury, Base Fury, unit Fury meter | GDD 02, `src/systems/` |

**Missing:** formations (names exist, positions don't), group orders, a
player "flank" order, cover, line of sight, entrench values, terrain table,
retreat rules, and a quick-battle formula. (GDD 11 lists the same gaps.)

## 3. Proposed design

### 3.1 Formations
- Each squad has a preset: **Line** (default), **Spread** (against
  artillery), **Column** (marching, roads), **Wedge** (push).
- A preset is a list of **slots** relative to the squad's heading. Heavy
  classes take front slots; artillery, AT guns and launchers take back slots
  (GDD 02 rule).
- Slots keep their shape while moving; units re-form after a turn.

### 3.2 Orders (touch)
| Gesture | Order |
|---|---|
| Drag squad → ground | Move (keeps formation) |
| Drag squad → enemy | Attack that target |
| Long-press squad → radial | Hold · Entrench · Retreat · Follow · **Flank** · Formation |
| Flank, then tap enemy | Squad routes around the target to its **side or rear** (player picks left / right / rear) and attacks from there |
| Select 2+ squads (tap each, or a "select all in view" button) | Same order for the group; **Attack + Flank** split: the first squad attacks head-on, the second flanks |

The flank route keeps out of the enemy's weapon range where the terrain
allows (reuse the `flank` profile in `Behaviors.js`), so the flankers aren't
shot on the way.

### 3.3 Why flanking pays off
1. **Thinner armour** on side/rear hits (already in code).
2. **Turn time:** tanks must rotate hull/turret to face a new threat
   (`TankMotor`), so a rear attacker gets free shots.
3. **"Flanked" status** (*proposal*): a squad engaged from two directions
   more than 90° apart gets −15% accuracy for as long as that lasts. Shown with
   a clear icon so players learn it.

**Success test for the prototype** (*proposal*): in the client's example
(two equal squads vs one), flanking should win with **at least 25% fewer
losses** than attacking head-on with both.

### 3.4 Terrain, cover and line of sight
| Terrain | Effect (*proposal*) |
|---|---|
| Open | No modifier |
| Forest | +20% defence for infantry and AT guns; blocks line of sight; tanks slower |
| Hills | +1 hex range for artillery; attacking uphill −10% accuracy |
| Urban | +25% defence for infantry; tanks −20% accuracy inside |
| Road | +30% march speed |

Line of sight is checked hex by hex (forest, hills and urban block it). A
unit can't fire at what it can't see unless a friendly unit spots for it.

### 3.5 Tactical AI (the Legion and other NPCs)
- Uses the **same orders** as players.
- **Pin and flank:** one group engages, another flanks when available.
- Picks targets by counters (e.g. AT guns aim at heavy tanks).
- Retreats below an HP threshold (*proposal* 30%) toward cover.
- Difficulty comes from smarter behaviour and better composition, not only
  higher stats.

Player units stay **CALM** until the first shot (GDD 02). Then they defend
themselves automatically; the player gives the orders.

### 3.6 Server and fairness
- Battles run on the server with a **seeded** random number generator
  (01, ADR-007), so every watcher sees the same result.
- Low-level PvE camps can be auto-resolved (quick battle). The formula uses
  Power × counters and is calibrated against full simulations.
- **Limits:** a maximum number of units per battle and squads per side, set
  by the Phase 2 server load test.

## 4. Phase 2 battle prototype (acceptance)

1. Formation slots for all 9 classes; Line/Spread/Column/Wedge.
2. Group select + Flank order on touch.
3. The client's flanking example passes the success test in §3.3.
4. Runs on the server, viewed on two phones, same result on both.
5. 60 FPS on a mid-range phone with 2 vs 1 squads on screen.

## 5. Defaults used (client can change)

1. Flanking: the player picks left / right / rear; no finger-drawn paths in
   v1.
2. The "Flanked" status (−15% accuracy) is included and tuned in the
   prototype.
3. Squad sizes per class follow `PersonnelConfig` today; the Phase 2 load
   test sets the PvP caps.
4. Squads off screen can be ordered from the squad list (march to a target
   or coordinate).
