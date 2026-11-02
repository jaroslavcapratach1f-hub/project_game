# UX & Navigation

Mobile-first, one-scene, always-live. Layout constants in
`src/config/HudConfig.js` + `MenuConfig.js`. Screen-space UI on `LAYERS.HUD`
(11) and `OVERLAY` (12).

## BOOT FLOW  (states: BOOT → LOADING → RUNNING)
`LoadingScreen` (progress bar + rotating tips) → **"TAP TO BEGIN"** → the world
map, camera on the player's base at base-view zoom. **No menu screen.** No
faction pick here (faction is per-Barracks, GDD 03/10).

## NO PAUSE, NO QUIT
The world never stops. There is **no pause button, no pause screen, no
"return to menu", no quit**. Leaving the app just leaves; offline rules apply
(GDD 09). Backgrounding halts local rendering only.

## PERSISTENT HUD  (always on, over the live map)
- **Top bar:** the 5 resources + Gold `+` (GDD 07); Commander avatar / level /
  Power (→ Profile); server + live **(X, Y)** coordinate; alliance tag.
- **Top-right:** notifications bell · Mail · Chat · **Settings gear**
  (overlay, not a screen).
- **Left rail:** rotating **event** icons · **Onslaught** alert when live ·
  daily-objectives chest · VIP badge.
- **Bottom-right:** **Home** (snap camera to base) / **World** (pull out to
  strategic zoom) · **Search** · **March / Rally queue** status chips (tap to
  jump to that march).
- **Context panel:** selecting a squad, a building, or a map target slides in
  an action bar — orders / upgrade / train / march / gather, per selection.
- **Attack-incoming alert:** full-width red banner + screen-edge pulse +
  "Jump to base" button; Base Fury arms automatically (GDD 02).

## BOTTOM NAV  (6 tabs — full-screen panels over the running map)
**Campaign · Alliance · Store · Officers · Units · More**
- **Units** — roster, squads & formations, Assembly, Modify, Equipment, Power
  breakdown per unit.
- **Officers** — roster, assign to squads/buildings, skills & star-up, Recruit.
- **Store** — Gold packs, Monthly Card, Growth Fund, offers, bundles,
  cosmetics, subscriptions (GDD 22).
- **Campaign** — the Frontier map, node stars, idle-income collect (GDD 20).
- **Alliance** — roster & ranks, tech, territory, rallies, help, alliance shop,
  gifts, diplomacy, chat (GDD 19).
- **More** — Settings, Bag/Items, Mail, Missions (daily/weekly/Arms Race),
  Battle Pass, Leaderboards, Achievements, Account, Help.
Panels dismiss straight back to the map (tap-outside / back / X). The map keeps
simulating behind every panel.

## IN-BASE ENTRY POINTS
Every building uses the same selection structure from the supplied Building
Menu reference: **Info · Upgrade · View**, with Upgrade lower in the centre.
A smoked-glass crescent sits behind silver point-up hex buttons; labels are
white with dark outlines. A dark nameplate reads `Lvl N Building Name`
(the first barracks reads `Lvl N No. 1 Barracks`). Four solid white arrows
sit outside the movable plot's edge midpoints, pointing along grid axes;
selection still arms the existing hold-drag/snap relocation. Wall and tower
assemblies show the same menu but no relocation arrows.

Currently Info and Upgrade open real building details/costs; View opens
those details too, with **Change Production** for the dynamic barracks.
This preserves its existing Military → Tank → Artillery cycle without
making a binoculars button silently change production. Future building
functions can extend View when their systems exist. Armory, Research tree, Hospital, Officer Barracks, Black Market,
Reserves Barracks are entered from their building (also shortcut-linked from
the relevant nav panel).

## SECONDARY SCREENS
- **Profile** — avatar, frame, title, Power by source (GDD 15), kill stats
  (GDD 10), VIP, alliance.
- **Bag / Items** — consumables: speed-ups, resource crates, teleports,
  shields, officer XP, skill books, Expansion items.
- **Mail** — tabs: System · Alliance · Reports · Personal. Battle reports open
  a replay-style summary (forces, losses, timeline, rewards).
- **Chat** — World · Sector · Alliance · Private; coordinate and unit links.

## CONTROLS  (touch)
- Drag empty → **pan** · pinch → **zoom** (drives base LOD, GDD 18).
- Tap own unit/squad → select · tap empty → deselect · two-finger tap →
  deselect all.
- Drag from own unit → ground = **move/march**, → enemy = **attack override**.
- Long-press own squad → **radial** (Recall · Hold · Entrench · Converge ·
  Follow · Retreat).
- Tap map target → **action menu** (March · Attack · Gather · Scout · Rally ·
  Reinforce, per type).
- Double-tap → toggle world ↔ base zoom.

## SETTINGS OVERLAY  (`SettingsStore`)
Graphics quality · FPS counter · touch sensitivity · music / SFX volume ·
vibration · notifications · language · account (link / switch) · support ·
credits. **No gameplay toggles** — no auto-fire (CALM model, GDD 02), no
difficulty.

## CONVENTIONS
- Confirm dialogs for irreversible / premium actions: Gold spend, disassemble,
  relocate, disband.
- Toasts for background completions; a shared claimable-reward popup style.
- Respect safe-area insets; nav + Home/World reachable one-thumbed; 60 FPS.

## Current Units presentation (2026-09-30)
The roster and individual troop dossier share an olive field-command surface,
quiet grid, brass active accents, portrait cards and dark nameplates. Preserve
All / USA / German / Russian / Blueprints & Materials filters and Upgrade /
Promote / Modify / Parts detail tabs. Current troop art supplies portraits.
Landscape side margins are symmetric: at least 44 CSS px, or the greater
browser-reported left/right safe inset plus 14 px. Portrait fallback is 14 px.
Upgrade is a separate fixed action above the detail tabs; stats scroll without
hiding it. Returning to the roster refreshes card levels. This still uses the
existing session-local troopLevels prototype (cap 20, displayed stat growth),
not persistent economy, ammunition/EXP costs or live combat stat changes.
Promote/Modify/Parts remain explicit placeholders pending their systems.
