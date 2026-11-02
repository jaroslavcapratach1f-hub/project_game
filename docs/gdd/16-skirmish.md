# Onslaught — Base-Defense Event  (replaces "Skirmish")

**Onslaught** is a limited-time event, **not** a game mode and **not** a
separate battlefield. Roughly **once every 30 days** the Legion (GDD 20) throws
escalating waves of troops at the player's base and the player must **defend the
base** — fought at the base's real position on the world map, using Base Fury,
the garrison, and the defensive buildings.

> Supersedes the old "solo Skirmish practice mode". There is no away force, no
> config budget picker, no arena, no tutorial framing. Salvage from
> `src/skirmish/` only: the wave director / phase machine / escalating roster.

## CADENCE & ENTRY  (alliance-coordinated)
- Opens on a fixed server calendar every ~30 days; runs for a **3–5 day
  window** (`ONSLAUGHT_EVENT.windowDays`). It appears as an **event option**
  in the Alliance panel and the world-map Events rail — not a solo timed run.
- The **alliance leader** picks **one difficulty level** for the whole
  alliance from `ONSLAUGHT_LEVELS` (currently 5: *Skirmish Line → Last Line*),
  scaling Legion power + wave size + rewards, and **schedules a kickoff time**
  inside the window that suits the members. Members below a level's
  `commanderGate` still join at a capped contribution.
- Members **RSVP** ahead (`rsvpLeadHours`), then a shared
  `syncCountdownMinutes` countdown starts everyone together; `graceJoinMinutes`
  lets latecomers begin. Each member defends **their own base**; one run per
  member per window.
- Before kickoff: pre-position the garrison, set squad formations, and request
  **alliance reinforcements** (they garrison for the run, GDD 19).
- Scores sum into an **alliance bracket** (`allianceBracket`) alongside the
  individual leaderboard.

## STRUCTURE
- **10 waves for v1** (`ONSLAUGHT_WAVES` in `src/config/OnslaughtConfig.js`,
  real `UnitStats` keys only); grows to 15–20 once the attack patterns are
  designed. **Wave 1 is a single-type probe**; troop **count then variety**
  climb wave by wave to a super-heavy-led final assault. `resolveWave(levelId,
  n)` applies the chosen level's `countScalar` / `powerScalar`.
- **Boss waves** at milestones (`ONSLAUGHT.bossWaves` — 5 and 10) — a heavier
  roster fronted by a Legion heavy; flagged to the HUD banner. No separate boss
  stat block.
- Waves spawn **CALM** from map edges / roads and converge on the base
  (`AIManager` patrol → ENGAGE once Base Fury trips).
- Between waves: `interWavePauseSeconds` lull — Hospital heals, the event
  grants limited **field repair** charges, garrison and formations can be
  swapped.

## DEFENCE (existing systems only)
- **Base Fury** (GDD 02): base guns + Attack Towers + garrisoned squads +
  Wall HP. Dormant until the first wave attacks, then the full defender-control
  toolkit is live — target reset, manual target, pull-and-re-push.
- No new healing system. Casualties are **wounded only** — every unit lost in
  Onslaught is recoverable via the Hospital (the event adds temporary hospital
  capacity). **No permanent personnel loss** (pillar 4).
- The base is **not** destroyed or relocated by Onslaught. Base HP reaching 0
  just **ends the run** at the wave reached; HP regenerates afterward as normal.

## WIN / LOSS
- **Full clear:** the final wave is cleared.
- **Run ends:** base HP hits 0 — result is the highest wave reached and the
  time taken.
- Emits `ONSLAUGHT_STARTED`, `ONSLAUGHT_WAVE_INCOMING`, `ONSLAUGHT_WAVE_CLEARED`,
  `ONSLAUGHT_ENDED { wavesCleared, fullClear, score }`.

## REWARDS
- **Per-wave milestone rewards** — Arms EXP, Ammunition, Troop Parts,
  Arms Coupons, Gold, and **event currency**.
- **First-clear** bonus per difficulty tier (one-time).
- **Leaderboard** — server ranking by score (`wavesCleared` then speed);
  ranked reward tiers. An **alliance bracket** ranks summed member scores.
- **Event shop** spends the event currency (officer shards, blueprint
  fragments, equipment parts, speed-ups, cosmetics). Unspent currency expires
  at window close (standard limited-event rule).

## STATE / CONFIG
- Run state in `src/skirmish/` (rename to `src/onslaught/`): `waveIndex`,
  `phase` (`setup → incoming → fighting → pause → ended`), `spawnedEnemyIds`,
  `score`, `outcome`. Salvage the phase machine + escalating-roster spawner;
  drop the DeploymentScreen / arena / force-budget picker.
- `OnslaughtConfig.js` (DONE) — `ONSLAUGHT` pacing + edge-spawn/converge
  params, `ONSLAUGHT_LEVELS` (leader-picked difficulty), `ONSLAUGHT_EVENT`
  (alliance scheduling / RSVP / bracket), `ONSLAUGHT_WAVES` (10-wave table),
  `resolveWave()`. FORWARD: milestone / leaderboard / shop tables.
- Events: `ONSLAUGHT_STARTED`, `ONSLAUGHT_WAVE_INCOMING`,
  `ONSLAUGHT_WAVE_CLEARED`, `ONSLAUGHT_ENDED` (GameEvents.js).
