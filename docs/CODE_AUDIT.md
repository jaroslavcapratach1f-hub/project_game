# CODE_AUDIT.md — Blitzmire

**Date:** 2026-09-09 — **point-in-time snapshot.** The per-file verdicts and
reachability map below describe the codebase *before* the rebuild. For current
state see `ARCHITECTURE.md`; for what changed and why see the Session 35 recap
in `docs/SESSION_LOG.md`. This file is kept as the record of the analysis that
produced the work plan (§15) and the rationale for each cut.

**Scope:** all 217 files in `src/`, classified against the design north star
(**Warpath parity** — ground war, tanks-only, one persistent shared world map,
base is a place on the map, no menu / no pause). See `CLAUDE.md` + `docs/gdd/`.
**Method:** read every file; traced the real import graph from `src/main.js`.

## Progress against §15 (the work plan)

| Step | Status |
|---|---|
| 1 — swap `MarchUnit` for the real entity stack | ✅ done — `worldmap/unitRoster.js`, `MarchUnit(+View)` deleted |
| 2 — finish `DamageResolver` (counters + penetration) | ✅ done — full `CombatConfig` pipeline |
| 3 — real base footprint → Base Fury | ✅ done — `WorldField.setBaseFootprint` |
| 4 — rebuild the HUD to GDD 23 | ✅ frame done — `src/ui/hud/`; `DamageNumbers` + `RadialMenu` revived; nav-panel *content* pending |
| 5 — reframe `skirmish/` as Onslaught | ✅ done — `OnslaughtConfig` + `src/onslaught/` (wired, verified) |
| 6 — delete the cut list + move dev harnesses | ✅ done — `src/` 217 → 181; harnesses → `dev/` |
| 7 — sweep the stale config fields | ✅ done — `RENDER.dev*`, `CAMERA.zoomLevels`, `BATTLEFIELD.*`, legacy `HUD` block, `MenuConfig` menu/pause blocks, `OrdersConfig.aiAlert`, `EntityConfig.DEV`, 13 dead events, `GameLoop.setSimPaused` |
| 8 — world-map content (GDD 17) | ✅ first slice — real hex terrain (`worldTerrainGen`: grass/forest/hills/water; water bars pathing, forest/hills slow units; base kept clear). Roads / sectors / fog / map objects deferred to Phase B4 |

All 8 audit steps done. **Phase B4 in progress:** ✅ base-HP model
(`BaseHealth`, Session 38) · ✅ personnel-gated roster + garrison — revived
`PersonnelManager` / `SquadManager` / `DeployedSquad`, wired into `BaseArmy`
(platoon capped at `BASE.army.deploySlots` = 5, `BASE.garrison` of 3 inside the
compound, `TopBar` `PERS` readout), Session 39 · ✅ ground decals — revived
`DecalField` + `VehicleDust`, wired via `WorldField.addDecal` (tank tracks +
shell scorch on `LAYERS.DECALS`), Session 40 · ✅ model-derived stats —
`UnitStats` rows now derive from `unitRoles.js` / `UnitModel.js` (one TTK dial),
`COUNTERS` realigned to GDD 02 verbatim, `VS_INFANTRY` + `smallArmsVsArmour`
added, Session 41.

**Visual track (parallel):** Session 42 — art bible
(`docs/gdd/24-visual-direction.md`) + building-render framework
(`src/ui/base/BuildingSprite` / `BuildingPlaceholder` / `BuildingFx` +
`BuildingArtConfig`) — each building animates on a procedural placeholder and
swaps to a Blender atlas with no code change. Session 43 — solid map objects:
`WorldField.blockDisc` / `nearestOpen` make the compound + neighbour bases
impassable (marches route around, drops snap to the edge), `EntityManager`
ORDER_MOVE snaps through `nearestOpen`, and `systems/Separation.js` keeps every
unit from overlapping any other (replaced `AIManager._separate`). Session 44 —
first pass at a 3-stage base zoom LOD. Session 45 — corrected that LOD against
the reference, but still not a full match (a constant-screen-size pin swapped
for the compound) + a `TerritoryRing` claim radius (`src/worldmap/territory.js`
owns the overlap rule, dev-checked against the static neighbour layout) + the
**headquarters** building is now real 3D art on the map (TRELLIS mesh →
sprite, `BuildingSprite._loadSprite`), not just an asset sitting on disk.
Session 46 — the LOD model itself was still wrong (the user's literal
walkthrough of the reference stills showed the HQ must render + shrink in
place at every zoom, not be swapped for an icon): `BaseMarker.js` → **`HqView.
js`**, now a real `BuildingSprite('headquarters')` always on screen, oversized
far and shrinking to true size across `lod.buildingBand` as the walls +
other buildings stagger-reveal around it (each on its own start point now,
not one shared group-fade). Verified against a `camera.zoom` sweep matching
the reference's 5-stage progression. Plus 4 more real buildings on the same
concept→mesh→sprite pipeline: **treasury, steelworks, crude_oil, barracks**
— 5 of 8 starting buildings now real 3D-derived art.

Session 47 — a separate peer AI session's uncommitted "connected-base" 3D
redesign (Three.js `Base3DView` + a Blender-scripted GLB with no materials
surviving export — verified by rendering it directly: flat grey boxes) was
removed wholesale at the user's explicit request (`git stash push -u`,
recoverable, not deleted — see the SESSION_LOG recap). Then **Phase C started**:
a real-time upgrade queue (`systems/UpgradeQueue.js` + `buildingUpgrade.js`)
replaced instant upgrades — `BuildingConfig.upgradeCost(...).seconds` was
already computed (`TIME_GROWTH` 1.25) but unconsumed until now. Verified live
in-browser: pay-up-front, countdown, completion, the HQ-level gate and
`UPGRADE_QUEUE_SLOTS` (1) composing correctly, the live "Ns" label caption.

**Session 48 — corrected: that was the wrong system.** User: building
upgrades must be instant (resources + materials only); real time belongs to
Research and Engineering-Center material crafting instead — both of which
turn out to already be fully speced in config (`MaterialsConfig.
materialCraftSeconds`, GDD 12) and simply unbuilt, the same "config ready,
runtime not wired" pattern Session 47 itself had just fixed for buildings,
just pointed at the wrong consumer the first time. `UpgradeQueue.js` deleted
outright (not spring-repurposed for Research/materials — those systems don't
exist yet, so their own timed-job design should wait for them, not be
pre-built speculatively); `BuildingConfig`'s `TIME_GROWTH` / `baseSec` /
`upgradeCost().seconds` all removed; `BaseManager.upgradeInstant` renamed back
to `upgrade` — the one real path again. GDD 04 corrected to match. Verified
live: `base.upgrade(id)` now bumps the level synchronously, no wait.

**Session 49 — the tap→context-menu UI kit exists now (Upgrade only).**
`BuildingContext` (`src/worldmap/`) + `BuildingPanel` (`src/ui/hud/`, reviving
the orphaned `ui/controls/Button.js`) implement GDD 23's "context panel":
tap any building (HQ included) → a docked action bar shows the next-level
cost → tap Upgrade → `BaseManager.upgrade`. `BaseSite` now owns the panel +
controller together (the `BaseArmy` → `OrderController` pattern);
`BuildingContext.hitTest` composes into `WorldScene`'s existing
`army.setHudHitTest` chain so a building tap can't double as a march order.
Verified end-to-end via simulated screen-coordinate taps (not direct method
calls): open → live cost → pay → level bump → panel close → re-tap shows MAX
LEVEL with the button disabled → tap-outside dismisses. Fixed one real bug
along the way: `Button` hit-tests in raw screen coordinates with no
parent-transform awareness, so it can't live inside an animated sliding
container — visually correct, silently untappable, only caught by testing
an actual tap against it. A separate peer AI session started a fresh 3D
model redesign pass in parallel (3 new concept PNGs appeared under
`assets/buildings/`) — left untouched, no overlap this session.

**Session 51 — the tap menu now matches Warpath's actual UI.** User pointed at
`GAME_DESIGN.md/Research center.jpeg`: not a docked bar — a fan of glass hex
icons anchored on the tapped building, gold-highlighted primary action. Built
`BuildingHexMenu`/`BuildingHexOption` (`src/ui/hud/`), generalizing the
existing `RadialMenu`/`RadialOption` unit-order pattern (as new parallel
classes, not a shared rewrite, to avoid destabilizing the working menu) to a
variable-count hex fan. `BuildingContext` now opens this FIRST on a building
tap; picking Info/Upgrade still lands on S49's real `BuildingPanel`; picking
Manage (Barracks only, new) cycles production instantly via the already-real
`BaseManager.setBarracksProduction` — deliberately no icons for Research/
Tactics, since those systems don't exist. One real bug caught only by
scripting an actual tap and checking state after (not by reading the code):
`handleTap` called `close()` — which nulls `_onPick` — before invoking it,
so every pick silently did nothing. Fixed. Verified end-to-end: barracks
shows 3 actions, treasury shows 2, Upgrade opens the panel, Manage cycles
the variant with the building's own label updating live, tap-outside
dismisses. The peer session's parallel visual/art redesign
(`BuildingArtConfig.js`'s new 12-tier ladder, `assets/buildings/hq_v2/`)
confirmed untouched — no file overlap with this session's work.

Next: a dedicated read-only Info view (currently aliases Upgrade's panel);
a real Produce/train queue (Manage only cycles *what* a barracks makes,
doesn't queue units); the same concept→mesh→sprite pass for `defence_wall` /
`attack_towers` / `engineering` (likely superseded by the peer session's
redesign) · Blender cleanup + real band×state atlases · the material-
crafting queue at Engineering Center (the real home for a timed-job system)
· production pipeline / research / the rest of Phase C · playtest / retune
the balance anchors · Onslaught-difficulty scaling · a real Airlift/
relocation flow wired to `territory.js` · GDD-17 map objects (roads, sectors,
fog, resource fields / camps / plunder).

Commits: `a221794` (1–5b) · `cf427a1` (6) · `b0ddf15` + `8fe7508` (docs) ·
`e505309` (7) · step 8 + docs · … · Session 38 (base-HP) · Session 39
(personnel roster + garrison) · Session 40 (ground decals).

---

## 1. The one finding that matters

**The runtime only reaches a thin placeholder combat stack. The real
entity stack — `BaseTank` + `TankTurret` (turret slew, recoil, fire-arc
gating), `InfantrySquad` + per-soldier sim, `DeployableWeapon`,
`RocketLauncher`, `EntityView`, `HealthBar` — is orphaned.** Nothing on the
live path imports any of it. This is exactly the "tank turret moving etc.
that isn't active anymore" you flagged.

What the world map actually runs today:

```
main.js → Game → WorldScene
    ├─ WorldTerrain            hex terrain bands (placeholder art)          ✅ live
    ├─ BaseSite                marker ⇄ compound, continuous-zoom LOD       ✅ live
    │    ├─ BaseManager        hex building grid                            ✅ live
    │    ├─ ResourceManager    Money / Steel / Oil                         ✅ live
    │    └─ BaseGridView       walled compound + buildings                  ✅ live
    ├─ BaseArmy                player marching squads                       ✅ live
    │    ├─ WorldField         all-passable stub grid (no terrain, no base) 🟡 thin
    │    ├─ EntityManager      unit registry + order handling              ✅ live
    │    ├─ OrderController    tap / drag / long-press → ORDER_*           ✅ live
    │    └─ MarchUnit ×N       PLACEHOLDER unit (flat stat block)          🟡 placeholder
    ├─ WorldCombat            AI + Fury + projectiles + FX on the map      ✅ live
    │    ├─ AIManager / AIController   IDLE→PATROL→ALERT→ENGAGE→RETREAT    ✅ live
    │    ├─ FuryManager       FieldFury ✅ live · BaseFury 🟡 inert         🟡 partial
    │    ├─ ProjectileSystem  COMBAT_SHOT → pooled projectile → impact     ✅ live
    │    │    └─ DamageResolver  "reduced model": def×splash×variance only  🟡 stub
    │    └─ EffectsSystem     particles / explosions / dust                 ✅ live
    └─ HudContext             top-left resource + personnel line            🟡 thin
```

Everything else in `src/` is either a **shared util/config** these use, or is
**not reachable from `main.js` at all.**

### The 8 dev harnesses are dead code

`DevHarness`, `DevAIHarness`, `DevBattlefieldHarness`, `DevEntityHarness`,
`DevOrderHarness`, `DevPersonnelHarness`, `DevScreensHarness`,
`DevSkirmishHarness` — **nothing imports them.** There is no `?dev=` router,
no second HTML file, no build flag. They were the old per-session probe
entry points. They are the *only* remaining importers of much of the
orphaned code, which is why a naive "is it referenced?" check looks
healthier than the game actually is.

---

## 2. Verdict legend

| Tag | Meaning |
|-----|---------|
| ✅ **LIVE** | On the runtime path, matches the Warpath direction. Leave it. |
| 🟡 **LIVE — thin** | Wired, but a placeholder / partial. Needs an upgrade pass. |
| 🔵 **ORPHAN — revive** | Not wired, but it's the *correct* implementation. Switch to it. |
| 🟠 **ORPHAN — rework** | Not wired; the idea is right, the code assumes the old model. Redesign before use. |
| 🔴 **ORPHAN — cut** | Superseded by the direction. Delete. |
| ⚪ **Dev / util** | Tooling or a shared helper. Keep as-is (or trim). |

---

## 3. Engine (`src/engine/`, 21 files)

| File | Verdict | Note |
|------|---------|------|
| `Game.js` | ✅ LIVE | Boot lifecycle only (BOOT→LOADING→RUNNING), no screen router — matches GDD 23. Header still name-drops a "PAUSED overlay (Slice 5)" — stale, there is no pause. |
| `GameLoop.js` | ✅ LIVE | Fixed 20 Hz sim + interpolated render. `setSimPaused` survives but is only used by tab-visibility now. |
| `Renderer.js` | ✅ LIVE | 13-layer container stack under a camera-transformed `worldRoot`. |
| `Camera.js` | ✅ LIVE | Pan / pinch / clamp / shake. Runtime limits come from `WorldScene` via `setZoomLimits` / `setWorldBounds`; the `CAMERA.*` zoom fields in `GameConfig` are ignored. |
| `CameraShake.js` | ✅ LIVE | Used by `Camera`. |
| `InputManager.js` · `GestureEmitter.js` · `GestureRecognizer.js` · `PinchRecognizer.js` · `PointerPool.js` | ✅ LIVE | Touch gesture stack (tap / drag / pinch / long-press / double-tap). |
| `GameEvents.js` | ✅ LIVE | Event-name registry. Carries dead names (`SKIRMISH_*`, screen-state events) — harmless, worth a sweep. |
| `OrderController.js` | ✅ LIVE | Wired through `BaseArmy`. Tap-to-move, drag-to-attack, long-press. `_menu` is a `NO_MENU` stub so the radial menu currently does nothing. |
| `OrderIndicator.js` | ✅ LIVE | Order-feedback rings / arrows. |
| `devParade.js` | ⚪ Dev | Only `WaveRoster` + `DevPersonnelHarness` import it. |
| `DevHarness.js` · `DevAIHarness.js` · `DevBattlefieldHarness.js` · `DevEntityHarness.js` · `DevOrderHarness.js` · `DevPersonnelHarness.js` · `DevScreensHarness.js` · `DevSkirmishHarness.js` | ⚪ Dev — **dead** | **Nothing imports these.** Recommend moving to a `dev/` folder excluded from the build, or deleting. They reference deleted concepts (screen-swap, separate battlefield, solo skirmish). |

---

## 4. World map scene (`src/worldmap/`, 11 files)

| File | Verdict | Note |
|------|---------|------|
| `WorldScene.js` | ✅ LIVE | The single always-on scene. Owns terrain / base / army / combat / HUD. |
| `BaseSite.js` | ✅ LIVE | Continuous-zoom LOD: marker ⇄ compound blend tracks `camera.zoom` every frame. |
| `BaseMarker.js` · `PlotMarker.js` | ✅ LIVE | Zoomed-out base marker + neighbour-hex markers. Placeholder vector art; `PlotMarker` stands in for real world-map POIs (GDD 17). |
| `WorldTerrain.js` | ✅ LIVE | Hex terrain bands via fbm noise. Placeholder art — no sectors / roads / resource nodes yet (GDD 17). |
| `BaseArmy.js` | ✅ LIVE | Owns the player's platoon + garrison, the order stack, and a `SquadManager` over the shared `PersonnelManager` (Session 39). Platoon capped at `BASE.army.deploySlots` (5); garrison from `BASE.garrison.roster`; each unit personnel-costed on deploy, freed on death. |
| `WorldCombat.js` | ✅ LIVE | Revives AI + Fury + projectiles + FX as permanent world-map systems. Spawns one static enemy camp near the base. |
| `WorldField.js` | 🟡 LIVE — thin | Collision / pathing substrate. **Every tile is passable**, there is no terrain, and `isInSpawn()` always returns `false` — so **Base Fury can never trip on the map** and `addDecal()` is a no-op. FORWARD work per GDD 17. |
| `MarchUnit.js` | 🟡 LIVE — placeholder | `extends Entity`, adds a flat `{hp,def,dmg,rangePx,rof,aoePx,weapon}` block and a minimal fire path. **Reinvents a dumbed-down tank/infantry.** No turret, no recoil, no per-soldier sim, no counters, no armour facing. Replace with the real subclasses. |
| `MarchUnitView.js` | 🟡 LIVE — placeholder | Simple tokens (dot huddle / hull rect / barrel). No turret rotation, muzzle flash, damage-state tint, or wreck. Replace with `EntityView` / `InfantrySquadView` / `DeployableView`. |
| `BaseTroops.js` | 🟡 LIVE — glyph | Zoomed-out garrison pips under the marker — now **one pip per real garrison unit** (`setCount` from `BaseArmy.garrisonCount`, Session 39). The playable units are `BaseArmy`; this is the LOD hint that fades as they take over. |

---

## 5. Entities — the real unit stack (`src/entities/`, 46 files)

**Almost the entire directory is orphaned.** `MarchUnit` on the live path
`extends Entity` and reuses `entityMotion` + `EntityManager`, so the *base*
is exercised — but every rich subclass and view is dark.

| File(s) | Verdict | Note |
|---------|---------|------|
| `Entity.js` | 🔵 REVIVE (base partly live) | Base class: stance (CALM / FIELD_FURY / BASE_FURY), target, `moveTo` → hex A*, `takeDamage`, facing. `MarchUnit` uses it; the real subclasses don't run. |
| `EntityManager.js` | ✅ LIVE | Unit registry, loop system, `ORDER_*` consumer, wreck sweep, segment hit-tests. Used by `BaseArmy`. |
| `entityMotion.js` | ✅ LIVE | Hex pivot-then-drive + `slideAlongHex` wall-slide. Used by `Entity`. |
| `EntityView.js` | 🔵 REVIVE | Turret `Container` that rotates with `turretAngle`, muzzle flash, damage-state hull tint, wreck fade. **This is the turret movement you want back.** |
| `HealthBar.js` | 🔵 REVIVE | Ghost-trail drain, crit pulse, segment ticks. |
| `GatherTruck.js` | 🔵 REVIVE | Non-combat resource gatherer — maps to Warpath resource trucks / gathering on the world map. |
| `tanks/BaseTank.js` · `TankMotor.js` · `TankTurret.js` | 🔵 REVIVE | Hull drive + independent turret slew at `turretTurnDegPerSec`, recoil retract/return, `isOnTarget(fireArcDeg)` gates fire, fixed-barrel TDs lock to hull. |
| `tanks/{PanzerIV,TigerI,Maus,Jagdpanther,M4Sherman,M26Pershing,M18Hellcat,M24Chaffee,T34_85,IS2,SU100}.js` + `tankConfig.js` | 🔵 REVIVE | 11 tank / tank-hunter classes, each bound to a `UnitStats` row, faction rosters (Germany / USA / Russia). |
| `infantry/InfantrySquad.js` · `Soldier.js` · `InfantrySquadView.js` · `squadConfig.js` | 🔵 REVIVE | Squad = N individually-simulated soldiers (formation, spread, per-man death). |
| `infantry/{Kar98kSquad,Gewehr43Squad,Stg44Squad,M1GarandSquad,M2CarbineSquad,SpringfieldSquad,MosinSquad,MosinCarbineSquad,Svt40Squad}.js` | 🔵 REVIVE | 9 rifle-squad classes across the three factions. |
| `artillery/DeployableWeapon.js` · `DeployableView.js` · `artilleryConfig.js` · `{PaK40,M12GMC,ISU152}.js` | 🔵 REVIVE | Towed guns / TDs that deploy → pack-up with a setup timer. |
| `rocket-artillery/RocketLauncher.js` · `RocketLauncherView.js` · `rocketConfig.js` · `Katyusha.js` | 🔵 REVIVE | Salvo rocket artillery (multi-projectile ripple fire). |

---

## 6. Combat (`src/combat/`, 6 files)

| File | Verdict | Note |
|------|---------|------|
| `ProjectileSystem.js` · `Projectile.js` · `ProjectileMotion.js` · `ProjectileView.js` · `ProjectileImpact.js` | ✅ LIVE | Pooled travelling projectiles, swept entity + terrain hit tests, splash over `aoePx`, impact flash + `PROJECTILE_IMPACT`. Alloc-free steady state. |
| `DamageResolver.js` | 🟡 LIVE — stub | **"Session 6 reduced model."** Applies only `def mitigation × splash falloff × variance`. `COUNTERS[attacker][defender]` and PEN-vs-armour-depth bands are `// TODO`, **even though `CombatConfig.js` fully specifies the Warpath counter chain.** This is the single biggest design-vs-code gap. |

---

## 7. AI (`src/ai/`, 5 files) — all ✅ LIVE

`AIController` + `AIStates` + `Behaviors` + `aiState` + `AIManager`, wired
through `WorldCombat`. States: IDLE (turret sweep) → PATROL → ALERT
(recognition delay + "!") → ENGAGE (Fury-gated; holds at class ideal range,
feeds aim scatter, never pulls its own trigger) → RETREAT (below hp frac,
run home). Boids separation so a group doesn't stack a waypoint. Correct
per GDD 02. It currently only ever drives one static enemy camp — content,
not code, is the gap.

---

## 8. Systems (`src/systems/`, 12 files)

| File | Verdict | Note |
|------|---------|------|
| `BaseManager.js` | ✅ LIVE | Hex building grid, `STARTING_LAYOUT` seed, `BUILDING_PLACED/UPGRADED`. Via `BaseSite`. |
| `ResourceManager.js` | ✅ LIVE | Money / Steel / Oil stocks + rates, `RESOURCE_CHANGED`. Via `BaseSite`. |
| `DynamicBarracks.js` | ✅ LIVE | Barracks variant swap. Via `BaseManager`. |
| `FuryManager.js` · `FieldFury.js` · `furyZone.js` | ✅ LIVE | Field Fury: first CALM shot from an out-of-base unit flips both sides to auto-fire; lingers 8 s. Correct per GDD 02. |
| `BaseFury.js` | 🟡 LIVE — inert | Wired, but `furyZone.inBase()` calls `WorldField.isInSpawn()` which always returns `false`, so the garrison never rages when the base is hit. Needs a real base footprint polygon. |
| `SettingsStore.js` · `haptics.js` | ✅ LIVE | Settings persistence + routing; vibration. Via `Game`. |
| `PersonnelManager.js` | ✅ LIVE | GDD 06 personnel pool + regen. Owned by `BaseSite`, feeds `TopBar`'s `PERS <cur>/<max>` and gates the `BaseArmy` roster (Session 39). |
| `SquadManager.js` · `DeployedSquad.js` | ✅ LIVE | Wired into `BaseArmy` (Session 39). Reserves personnel per deployed unit, runs the recall CATCH, `deduct`s on death, drops spent squads. API targets the world map as-is — no rework needed. |

---

## 9. UI (`src/ui/`, 35 + `controls/` 4 + `orders/` 1)

### Live
| File | Verdict | Note |
|------|---------|------|
| `HudContext.js` | 🟡 LIVE — thin | Top-left line: 3 resources (live), "Personnel —/—" + "Base HP —" + "Raid —" placeholders. Needs to become the Warpath **top bar**: 5 resources incl. **Gold**, Power number, alliance tag, commander level (GDD 07 / 23). |
| `BaseGridView.js` · `BaseDraw.js` · `MarkerDraw.js` · `TroopDraw.js` | ✅ LIVE | Base compound + marker + troop-token draw helpers. Placeholder vector art by design. |
| `LoadingScreen.js` · `LoadingDraw.js` · `ScreenFade.js` · `ScreenDraw.js` | ✅ LIVE | Boot loading screen + reusable fade (GDD 23). |
| `orders/OrderDraw.js` | ✅ LIVE | Order-indicator draw helpers. |
| `controls/{Button,Slider,Toggle,SegmentedControl}.js` | ⚪ Reusable | Widget kit. Only `SettingsScreen` / dev screens use them today; needed for the real Warpath panels (research, armory, build menu). Keep. |

### Orphaned — rework for GDD 23 (Warpath HUD: top resource bar, 6-tab bottom nav, context panel)
| File | Verdict | Note |
|------|---------|------|
| `HUD.js` · `HudLayout.js` | 🟠 REWORK | Old screen-space battle-HUD container. Only `DevEntityHarness`. Rebuild against GDD 23. |
| `Minimap.js` · `MinimapDraw.js` | 🟠 REWORK | Battle minimap. GDD 17/23 wants a world-map minimap — same idea, new bounds + content. |
| `UnitInfoPanel.js` · `UnitSelectionBar.js` | 🟠 REWORK | Selected-unit context + multi-unit bar. Concept is Warpath-correct; needs the new HUD shell + real units. |
| `KillFeed.js` · `Announcements.js` · `DamageDirection.js` · `AIAlertIndicator.js` | 🟠 REWORK | Battle-feedback overlays, built for the BATTLE state. Reusable ideas. |
| `SettingsScreen.js` · `SettingsDraw.js` | 🟠 REWORK | Settings should be an in-world overlay panel, not a full screen. Nothing imports it now. |

### Orphaned — revive
| File | Verdict | Note |
|------|---------|------|
| `DamageNumbers.js` | 🔵 REVIVE | Floating damage numbers — drop-in on the world map. |
| `RadialMenu.js` · `RadialOption.js` | 🔵 REVIVE | Long-press tactical menu. `BaseArmy` passes a `NO_MENU` stub — wire the real one for Recall / Hold / Follow. |

### Orphaned — cut (superseded by "no menu / no pause" + world-map combat + Onslaught)
| File | Verdict | Note |
|------|---------|------|
| `MenuScreen.js` | 🔴 CUT | No main menu (GDD 23). Nothing imports it. |
| `PauseScreen.js` · `PauseButton.js` | 🔴 CUT | No pause — online game. `PauseButton` is still imported by the orphaned `HUD.js`. |
| `DeploymentScreen.js` · `DeploymentDraw.js` · `DeploymentLayout.js` · `DeploymentRoster.js` | 🔴 CUT | Solo-skirmish lineup picker. Superseded by marching units out of the base on the map. |
| `SkirmishBanner.js` | 🔴 CUT | Solo-skirmish wave banner. |
| `ResultsScreen.js` · `ResultsDraw.js` | 🔴 CUT | Solo-skirmish results screen. |

---

## 10. Skirmish (`src/skirmish/`, 6 files) — 🟠 REWORK as *Onslaught*

`SkirmishDirector` + `SkirmishState` + `SkirmishTally` + `WaveRoster` +
`directorStep` + `resultsScore`. Currently a 10-wave **solo practice arena**
(old GDD 16). The **wave-director / phase-machine pattern is exactly what
the Onslaught base-defense event needs** (GDD 16 rewrite: the Legion attacks
your base in escalating waves, ~once/30 days, on the map — not a separate
arena). Keep the code as the seed; re-point it at the world-map base and
the real enemy roster. `resultsScore` (star rating) still applies.

---

## 11. World generation (`src/world/`, 8 + `passes/` 4)

| File | Verdict | Note |
|------|---------|------|
| `TerrainGrid.js` · `TerrainTile.js` | ✅ LIVE | Flat-top hex grid + tile record. Used by `WorldField`. |
| `Pathfinder.js` · `PriorityQueue.js` | ✅ LIVE | Hex A* (6-neighbour, `axialDistance` heuristic). Via `entityMotion.resolvePath`. |
| `Battlefield.js` | 🟠 REWORK | Old composition root (grid + renderer + decals). `WorldField` replaced it on the live path. Keep `TerrainGrid`; fold decals into `WorldField` or retire. |
| `DecalField.js` | ✅ LIVE | Pooled tracks / craters / scorch on `LAYERS.DECALS`, owned by `WorldScene`, fed through `WorldField.addDecal` — shell scorch (`EffectsSystem`) + tank tread marks (`VehicleDust`). Session 40. |
| `TerrainRenderer.js` | 🔴 CUT | Square-tile placeholder renderer. `WorldTerrain` draws the hex map now. |
| `MapGenerator.js` + `passes/{BaseTerrainPass,RoadPass,FeaturePass,SpawnZonePass}.js` | 🟠 REWORK | Square-grid procedural gen, self-marked "HEX PENDING". GDD 17 world map wants sectors / roads / resource nodes / NPC bases on hex — rewrite against that spec or discard. |

---

## 12. Config (`src/config/`, 34 + `research/` 7 + `equipment/` 5)

The config layer is the strongest part of the repo — a thorough,
Warpath-shaped **content bible**. Most of it isn't *wired* yet because the
systems that would read it (`StatResolution`, research, equipment, officers,
power) aren't on the live path.

**LIVE (read at runtime):** `GameConfig`, `LayerConfig`, `WorldMapConfig`,
`BaseConfig`, `HudConfig`, `ResourceConfig`, `TerrainConfig`, `AIConfig`,
`CombatConfig` (Fury + splash only — counters/pen unused), `ProjectileConfig`,
`EffectsConfig`, `SettingsConfig`, `EconomyConfig`, `BuildingConfig`,
`MaterialsConfig`.

**DESIGN-ONLY (thorough, not yet consumed):** `UnitStats` (27 rows),
`StatResolution`, `StarTiers`, `ProgressionConfig`, `PowerConfig`,
`FactionConfig`, `OfficerConfig`, `PersonnelConfig`, `ArmoryConfig`,
`PartsConfig`, `EntityConfig`, `InfantryConfig`, `ArtilleryConfig`,
`OrdersConfig`, `SquadStateConfig`, `FeedbackConfig`, `research/*` (7),
`equipment/*` (5). These are the spec for reviving §5 and building
progression — keep all, mark clearly as pending.

**STALE / needs a sweep:**
- `MenuConfig.js` — 🔴 no main menu.
- `SkirmishConfig.js` — 🟠 old 10-wave; retune for Onslaught.
- `GameConfig.CAMERA.zoomLevels / minZoom / maxZoom` — dead (WORLDMAP wins at runtime).
- `GameConfig.RENDER.dev*` flags — dead (harnesses unreferenced).
- `GameConfig.BATTLEFIELD.*` square fields (`widthTiles`, `spawnColumns`, `waterBand`, `road`, `buildings`, `trees`) — feed only the orphaned `MapGenerator`.
- `HudConfig.visibleStates: ['BATTLE','SKIRMISH']` — states that no longer exist.

---

## 13. Utils & Effects — all ✅ LIVE

- `utils/{Hex,MathUtils,Noise,ObjectPool,ScalarTween,EventEmitter}.js` — shared, all used.
- `effects/{EffectsSystem,Emitter,Explosion,Particle,ParticleSystem,VehicleDust,particleStep}.js` — via `WorldCombat`.

---

## 14. Tally

| Verdict | ~Files | Where |
|---------|-------:|-------|
| ✅ LIVE | ~70 | engine, worldmap scene, EntityManager, combat projectiles, AI, base economy, Fury (field), loading UI, utils, effects, live configs |
| 🟡 LIVE — thin / placeholder | 7 | `MarchUnit(+View)`, `WorldField`, `DamageResolver`, `HudContext`, `BaseFury`, `BaseTroops` |
| 🔵 ORPHAN — revive | ~55 | the real entity stack (tanks/turret/infantry/artillery/rockets + views), `PersonnelManager`, `DecalField`, `DamageNumbers`, `RadialMenu` |
| 🟠 ORPHAN — rework | ~25 | old battle HUD family, `Minimap`, `SquadManager`, `skirmish/*` → Onslaught, `MapGenerator`+passes, `Battlefield`, `SettingsScreen` |
| 🔴 ORPHAN — cut | ~12 | `MenuScreen`, `PauseScreen`, `PauseButton`, `Deployment*`, `SkirmishBanner`, `ResultsScreen`, `TerrainRenderer` |
| ⚪ Dev / reusable | ~15 | 8 dev harnesses + `DevHarness` + `devParade`, `controls/*` widget kit |
| Design-only config | ~33 | the content bible in `src/config/` |

---

## 15. Recommended order of work

1. **Swap the placeholder unit for the real stack.** Replace `MarchUnit` /
   `MarchUnitView` in `BaseArmy` + `WorldCombat` with `BaseTank` /
   `InfantrySquad` / `DeployableWeapon` / `RocketLauncher` + their real views,
   sourced from `UnitStats` rows. Restores turret rotation, recoil, per-soldier
   squads, damage states. *(This is the fix for your "tank turret" note.)*
2. **Finish `DamageResolver`.** Wire `CombatConfig.COUNTERS` + PEN/armour-facing
   bands — the spec is already written, the code just stops early.
3. **Give the base a real footprint.** A base polygon in `WorldField` so
   `inBase()` is true inside the compound → **Base Fury works**, and enemies
   can actually raid the base.
4. **Rebuild the HUD to GDD 23.** New top resource bar (5 + Gold + Power) and
   6-tab bottom nav in `HudContext` / a new `Hud/` module; revive
   `DamageNumbers` + `RadialMenu`; retire `HUD.js` and its battle-era children
   or fold their ideas in.
5. **Reframe `skirmish/` as Onslaught** — point the wave director at the
   world-map base.
6. **Delete the cut list** (§9 🔴, `TerrainRenderer`) and move the 8 dev
   harnesses out of `src/`.
7. **Sweep the stale config fields** (§12) so `src/config/` stops advertising
   dead knobs.
8. **World-map content** (GDD 17): real terrain / sectors / roads / resource
   nodes / NPC bases in `WorldTerrain` + `WorldField` + a hex `MapGenerator`.
