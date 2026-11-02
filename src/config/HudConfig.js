import { screenSafeAreaSide } from '../utils/ScreenSafeArea.js';
/**
 * HudConfig — the persistent world-map HUD (`WORLD_HUD`, GDD 23) plus the
 * shared unit-label / placeholder-portrait helpers. The old screen-space battle
 * HUD block was deleted in the post-audit rebuild along with its widgets.
 *
 * DRAFT: all values are proposals. Grep "REVIEW".
 */

const NONE = 'none';
const ENEMY_LABEL = 'Enemy';
const DIM_PORTRAIT = 0x8b7332; // fallback portrait fill (CLAUDE.md UI gold, dim)

/**
 * WORLD_HUD — the persistent world-map HUD frame (GDD 23): top resource bar,
 * 6-tab bottom nav, full-screen nav panels, and the Home / World map buttons.
 * Screen-space on LAYERS.HUD (bars, buttons) + LAYERS.OVERLAY (panels). DRAFT.
 */
export const WORLD_HUD = {
  // S64: the user's own new "glass/steel" design (BuildingMenuConfig.js's
  // BUILDING_MENU is the source palette) propagated across every OTHER HUD
  // surface — white/silver borders + text on the same dark bars/cards,
  // replacing the old gold trim everywhere. `accentColor` (was `goldColor`)
  // is the one bright-white emphasis colour; `dimColor` is now a cool grey
  // instead of a dim gold, matching the new steel palette's own dim tone
  // (BUILDING_MENU.bevelColor).
  fontFamily: 'Arial Narrow, Impact, sans-serif',
  textColor: 0xf4f4f0, dimColor: 0x9a9a95, accentColor: 0xffffff,
  barBg: 0x14140f, barAlpha: 0.82, stroke: 0xe4e5e6, strokeAlpha: 0.55, strokeWidthPx: 1,
  // Landscape-only edge gap for NavBar + MapButtons (flush-to-edge clipped
  // on a real device otherwise). Its own constant, separate from
  // `unitsMenu.sideInsetLandscapePx`, so either can be retuned independently.
  navEdgeInsetLandscapePx: 22,

  // S70: icon-only redesign, no text labels — TWO corner clusters, no
  // full-width bordered bar. LEFT: round player-avatar (tap -> a player
  // menu, not built yet) + Power/coords/base-warning + a live HQ-level
  // badge. RIGHT: personnel, gap, Money/Oil/Steel/Gold.
  topBar: {
    topInsetPx: 10, avatarRadiusPx: 27, avatarPressScale: 0.88, avatarBg: 0x14140f, avatarBgAlpha: 0.82, avatarStroke: 0xe4e5e6, avatarStrokeAlpha: 0.6,
    avatarStrokeWidthPx: 1.5, avatarIconColor: 0x9a9a95, avatarEdgeMarginPx: 8, lineGapPx: 2, badgeGapPx: 1,
    baseWarnPx: 10, baseWarnFrac: 0.3,
    baseHpColor: 0xffffff, baseWarnColor: 0xff6b35,
    // levelBadge: the live HQ-level tag on the avatar's own bottom rim.
    levelBadge: { heightPx: 11, padXPx: 3, radiusPx: 3, bg: 0x14140f, bgAlpha: 0.95, stroke: 0xe4e5e6, strokeAlpha: 0.6, strokeWidthPx: 1, textPx: 8, textColor: 0xffffff },
    // CORE_RESOURCES only — gold has no building, appended separately
    resourceKeys: ['money', 'oil', 'steel'],
    // Portrait: buffer between the avatar cluster's own right edge and
    // wherever the (shrunk-to-fit) resources row starts — same row, not a
    // second one (the player's own correction: "beside the player icon...
    // not above everything through the whole screen").
    rightRowGapPx: 4, coordThrottleMs: 150,
  },

  // S54: 5 SEPARATE icon-over-label button cards (own rounded-rect bg/stroke
  // each, same visual language as MapButtons' own Home/World buttons — was
  // first a 6-tab text-only strip spanning the full width, then one shared
  // bar that still read as a single continuous strip), docked bottom-RIGHT,
  // never wider than `widthFracMax` of the screen (user's own hard cap);
  // `preferredBtnWidthPx` is the comfortable per-card width the row asks
  // for first, only shrinking below that once `widthFracMax` actually binds
  // (narrow/mobile screens). Icons: `NavIconDraw.js`, one per tab.
  // S58: `widthFracMax` alone read fine on a wide desktop screen (40% of
  // 1200px+ still leaves ~96px/card) but collapsed to ~31px/card on a
  // 390px phone — not enough room for icon+label, which is what actually
  // overlapped. `widthFracMaxPortrait` is the user's own portrait-only
  // figure (70-80%, landscape stays exactly as it was) — NavBar/MapButtons
  // pick between the two off a plain width>height check (Hud has no other
  // orientation concept to hook into yet).
  navBar: {
    heightPx: 64, widthFracMax: 0.4, widthFracMaxPortrait: 0.78, preferredBtnWidthPx: 82, btnGapPx: 6, btnRadiusPx: 8,
    btnBg: 0x14140f, btnBgAlpha: 0.82, btnStroke: 0xe4e5e6, btnStrokeAlpha: 0.5, btnStrokeWidthPx: 1.5,
    activeBtnBgAlpha: 0.94, activeBtnStroke: 0xffffff, activeBtnStrokeWidthPx: 2,
    iconPx: 24, labelPx: 9, labelGapPx: 4,
    activeColor: 0xffffff, idleColor: 0x9a9a95,
    tabs: [
      { id: 'officers', label: 'OFFICERS', lines: ['Roster, assign to squads / buildings', 'Skills & star-up, Recruit'] },
      { id: 'units', label: 'UNITS', lines: ['Roster, squads & formations', 'Assembly, Modify, Equipment, Power'] },
      { id: 'supplies', label: 'SUPPLIES', lines: ['Money / Steel / Oil overview, storage caps', 'Materials & components inventory'] },
      { id: 'alliance', label: 'ALLIANCE', lines: ['Roster & ranks, tech, territory', 'Rallies, help, shop, gifts, chat (GDD 19)'] },
      { id: 'army', label: 'ARMY', lines: ['Deployed squads on the world map', 'March, recall, formations'] },
    ],
  },

  // S54: the platoon's 5 deploy-slot buttons — a second row directly above
  // NavBar, "an extension of" it (user's own words): SAME width, SAME
  // per-card size/gap/radius (reads `WORLD_HUD.navBar`'s own geometry
  // directly rather than duplicating numbers that could drift out of sync).
  // Only what's genuinely different from NavBar lives here. Each button
  // shows that slot's live unit as a coloured portrait disc (`portraitColor`,
  // GDD-established placeholder-portrait convention, previously unused
  // anywhere) + its short label (`unitLabel`); tapping it selects that squad
  // for orders exactly like tapping it on the map (`BaseArmy.selectSlot`).
  // S55: the portrait fills the WHOLE card (not a small icon-sized disc) —
  // the player asked to actually recognize the troop, which a tiny inset
  // circle didn't read as. `portraitPadPx`/`portraitRadiusPx` are the
  // image's own inset from the card edge and corner rounding.
  squadBar: {
    rowGapPx: 6, portraitPadPx: 4, portraitRadiusPx: 6, emptyColor: 0x35352b, emptyLabel: '—', collapseMs: 220, collapseDropPx: 56, // S78 roll-down collapse
  },

  panel: {
    scrim: 0x0a0a08, scrimAlpha: 0.86, cardBg: 0x1b1b12, cardStroke: 0xe4e5e6, cardStrokeWidthPx: 1.5,
    cardWidthPx: 468, cardRadiusPx: 6, padPx: 24, titlePx: 22, linePx: 13, hintPx: 11, lineGapPx: 9,
    slideMs: 190, slideFromPx: 24, soon: 'Coming soon', hint: 'tap anywhere to close',
  },

  // S58: the user's own icon redesign — World is a globe circle CENTRED
  // exactly at the screen's bottom-left corner (0, screenHeight), so only
  // its top-right quadrant (mathematically exactly 25% of the circle)
  // actually falls on-screen, reading as the globe "peeking in" from
  // outside the viewport; Home is a house-icon card stacked directly above
  // it, fully on-screen. Both flush to the corner — no margin.
  mapButtons: {
    worldRadiusPx: 70, homeSizePx: 56, homeRadiusPx: 10, gapPx: 6, bg: 0x14140f, bgAlpha: 0.82,
    stroke: 0xe4e5e6, strokeWidthPx: 1.5, iconColor: 0xffffff, doorColor: 0x14140f,
    globeLineColor: 0xe4e5e6, globeLineAlpha: 0.6, globeLineWidthPx: 2,
    flyMs: 320, // zoom targets: WORLDMAP.nearZoom / .farZoom
  },

  // The UNITS nav-tab screen (S65 v2): a full-screen "Ground Force" style
  // scrollable card GRID (the player's own reference — Warpath's own troop
  // roster screen), not the generic "coming soon" NavPanel. Every roster
  // entry (`BASE.army.roster`, `BaseConfig.js`) is one card: the unit's own
  // live 3D snapshot over its faction's background photo (same technique
  // `SquadBar` already uses for its 5 deploy-slot cards — SquadBarFactionBg
  // + UnitIconRenderer), a level badge, a star-tier row, sorted
  // highest-star-first. No real per-copy inventory or per-unit level exists
  // yet (see ARCHITECTURE.md) — this reads the same static roster BaseArmy
  // itself deploys from; `deploySlots` (5) marks which cards are the active
  // platoon vs the bench; every card shows `levelPlaceholder` since no
  // per-unit level is tracked anywhere yet.
  unitsMenu: {
    bg: 0x101915, bgAlpha: 1,
    headerPx: 68, titlePx: 23, titleGapPx: 10,
    backSizePx: 36, backRadiusPx: 8, backIconInset: 0.22, backIconAspect: 1.4, backIconStrokeWidthPx: 2.5,
    tabBarPx: 64, tabBarPadTopPx: 8, tabGapPx: 8, tabRadiusPx: 8, tabLabelPx: 13,
    // Filter tabs (the player's own explicit ask) — same card structure as
    // WORLD_HUD.navBar's own tabs (bg/stroke, active highlight), just a
    // full-width row inside this screen instead of NavBar's own docked
    // corner cluster. `faction: null` = no filter (every roster entry);
    // `placeholder: true` = no real data source yet (no Assembly/Parts
    // system wired up — see ARCHITECTURE.md), shows a "coming soon" note
    // instead of a grid.
    // Explicit \n splits (not just width-triggered wordWrap) — every tab
    // reads as 2 lines at the SAME font size regardless of screen width, so
    // the row stays visually even instead of only the longest label
    // ("Blueprints & Materials") ever actually wrapping.
    filters: [
      { id: 'all', label: 'All\nTroops', faction: null },
      { id: 'usa', label: 'USA\nTroops', faction: 'usa' },
      { id: 'germany', label: 'German\nTroops', faction: 'germany' },
      { id: 'russia', label: 'Russian\nTroops', faction: 'russia' },
      { id: 'blueprints', label: 'Blueprints &\nMaterials', placeholder: true },
    ],
    placeholderText: 'Coming soon',
    // LEFT/RIGHT only — a phone's camera cutout sits on a SIDE edge in
    // landscape, not top/bottom, and `gridPadPx` alone (tuned for
    // portrait) let it cover the first grid card (the player's own
    // report). `screenSidePad()` below picks between the two. Halved from
    // 44 (the player's own correction, same as `navEdgeInsetLandscapePx`
    // above — the original notch margin read as too wide once applied
    // across every screen).
    gridPadPx: 14, sideInsetLandscapePx: 22,
    cardGapPx: 14, cardMinWidthPx: 130, cardMaxWidthPx: 178, minCols: 2,
    nameHeightPx: 43, namePx: 12, tilePadPx: 4,
    levelPlaceholder: 1, levelPx: 10, levelPadPx: 4, levelInsetPx: 2, levelRadiusPx: 3,
    levelBg: 0x0a0a08, levelBgAlpha: 0.65,
    starPx: 6, starGapPx: 2, starColor: 0xffd23c, starEmptyColor: 0x5a5b52, starMax: 5,
    classIconPx: 9, classIconGapPx: 4,
    deployedPx: 9, deployedLabel: 'DEPLOYED',
  },

  // A single troop's own detail screen (S67 v4 — rebuilt frame-by-frame
  // against the player's own 4 reference screenshots, Warpath's real
  // vehicle-detail screen, after the S66 v3 chip/glass-panel pass was
  // rejected as "not attractive... adding small parts with different
  // colours does not add visuality at all"). A docked HEADER bar (back
  // button + class glyph + unit name, same `headerPx` convention
  // `unitsMenu` itself uses) sits above a hero image on a LIGHT studio
  // backdrop (`TroopHeroImage` — the reference's own catalog-photo look,
  // deliberately different from the grid card's dark cinematic photo).
  // Below it: a class-tag pill + the star row, a divider, "Level N/Cap",
  // another divider, then TWO big circular "medallion" stats (Firepower =
  // dmg, HP) — the reference's own emphasis treatment for a unit's two
  // headline numbers — and every remaining stat as a plain icon/label/value
  // row (no chip, no accent bar — the exact thing that was rejected). A
  // FIXED 4-tab bar at the very BOTTOM (Upgrade / Promote / Modify / Parts)
  // never moves. Reference chrome this deliberately does NOT copy because
  // Blitzmire has no such system behind it (would be faking a mechanic,
  // not a visual): the EXP/currency bar, the WoT tier hexagon + power
  // score, the research-tree caption, the 4 decorative left-side icons.
  troopDetail: {
    // PORTRAIT (h>w): image on top, content stacked below it — heroFracPortrait
    // is a CAP, not a fixed size; shrinks (down to heroMinPx) to whatever
    // leaves the Upgrade tab's own content fitting with no scroll, only
    // grows up to the cap when a unit's short stat list would otherwise
    // leave the image tiny.
    // LANDSCAPE (w>h, the player's own explicit call): SPLIT screen —
    // image fills the left `heroFracLandscape` of the width at full
    // content height, the tab content fills the remaining right column
    // (`midGapPx` between them) — the two don't compete for space, so no
    // shrink-to-fit is needed there.
    heroFracPortrait: 0.34, heroMinPx: 170, heroFracLandscape: 0.4, midGapPx: 18,
    heroPanelRadiusPx: 10,
    // The header bar docked above the hero — same height as unitsMenu's
    // own header so the two screens share one chrome language.
    headerPx: 68, nameGapPx: 10, namePx: 22,
    // Hero backdrop: a light vertical-gradient "studio" ground (the
    // reference's own catalog-photo look) instead of the grid card's dark
    // faction photo — drawn as 3 horizontal fill bands, lightest at top.
    heroBgTop: 0xe8e8e3, heroBgMid: 0xc7c8c1, heroBgBottom: 0xa9aaa2,
    // Class-tag pill (icon-less text chip, e.g. "Medium Tank") + star row,
    // side by side directly under the hero.
    classTagPx: 12, classTagPadXPx: 12, classTagPadYPx: 5, classTagRadiusPx: 12,
    classTagBg: 0x24241a, classTagBgAlpha: 0.85,
    starPx: 8, starGapPx: 3,
    levelPx: 17, levelCapPlaceholder: 20,
    // A single shared vertical rhythm — deliberately tight (the S66 pass's
    // 3 nested `+ 14px` gaps around a tall stat list left the UPGRADE
    // button clipped below the fold on a plain phone screen; this keeps
    // the whole Upgrade tab fitting with no scroll for every unit class).
    contentGapPx: 6, dividerAlpha: 0.35,
    // Two big circular "medallion" stats (dmg -> "Firepower", hp -> "HP") —
    // the reference's own emphasis treatment, replacing the rejected chips.
    medallionRadiusPx: 24, medallionRingWidthPx: 4, medallionGapPx: 20,
    medallionValuePx: 16, medallionLabelPx: 10,
    medallionColorFirepower: 0xff6b35, medallionColorHp: 0x6f8f35,
    // Every remaining stat: a plain icon + label (left) / value (right)
    // row, a hairline divider between rows — no chip background, no
    // coloured accent bar (the player's own explicit complaint).
    statRowH: 24, statIconR: 6, statLabelPx: 12, statValuePx: 13, statDividerAlpha: 0.14,
    // The Upgrade TAB's own in-content action button (the player's own
    // explicit ask — distinct from the tab itself, which only switches
    // which content shows) — increments `troopLevels.js`'s in-memory
    // level, capped at `levelCapPlaceholder`; `WORLD_HUD.buildingPanel`'s
    // own "MAX LEVEL" label/colour at the cap, same convention. A small
    // caption above it ("Next: Level N") stands in for the reference's own
    // "Research <name>" caption — we have no research tree, so it says
    // what the button actually does instead.
    upgradeHeightPx: 50, upgradeRadiusPx: 10, upgradeLabelPx: 16, upgradeLabel: 'UPGRADE',
    upgradeCaptionPx: 11, upgradeCaptionPrefix: 'Next: Level ',
    upgradeColor: 0x495f36, upgradeColorLight: 0xb87b2e, upgradeGlow: 0xffb35c,
    upgradeStroke: 0xd2b77a, upgradeDisabledAlpha: 0.25,
    actionBarPx: 52, actionGapPx: 8, actionRadiusPx: 8, actionLabelPx: 12,
    actions: [
      { id: 'upgrade', label: 'Upgrade' },
      { id: 'promote', label: 'Promote' },
      { id: 'modify', label: 'Modify' },
      { id: 'parts', label: 'Parts' },
    ],
  },

  // The GDD-23 "context panel" for a tapped base building: a bar docked above
  // NavBar, slides up like `panel` above. src/ui/hud/BuildingPanel.js.
  buildingPanel: {
    heightPx: 150, padPx: 16, titlePx: 17, costPx: 13, titleCostGapPx: 6,
    bg: 0x14140f, bgAlpha: 0.94, stroke: 0xe4e5e6, strokeWidthPx: 1.5,
    titleColor: 0xffffff, costColor: 0xf4f4f0, maxColor: 0x9a9a95,
    slideMs: 200, slideFromPx: 40, maxLabel: 'MAX LEVEL', upgradeLabel: 'UPGRADE',
    costSep: ' · ', costLabels: { money: 'Money', steel: 'Steel', oil: 'Oil' },
  },
};

/** Placeholder portrait fill colour, keyed by CLASS_TRAITS class. */
export const PLACEHOLDER_PORTRAIT = {
  infantry: 0x4a5d23, lightTank: 0x8b7355, mediumTank: 0x556b2f, heavyTank: 0x3b5323,
  superHeavyTank: 0x4a4a4a, tankHunter: 0x5c4033, howitzer: 0x6b4423, atGun: 0x6b6b6b,
  launcher: 0x8b4a2f, gatherTruck: 0x8a8a8a,
};

/**
 * Display names. Generic by class + faction-specific `${faction}:${cls}` (GDD 03
 * gives each faction one combat unit per class, so the pair is unambiguous).
 */
export const UI_UNIT_LABELS = {
  infantry: 'Rifle Squad', lightTank: 'Light Tank', mediumTank: 'Medium Tank',
  heavyTank: 'Heavy Tank', superHeavyTank: 'Super Heavy', tankHunter: 'Tank Hunter',
  howitzer: 'Howitzer', atGun: 'AT Gun', launcher: 'Rocket Launcher', gatherTruck: 'Armored Car',
  'germany:infantry': 'Wehrmacht Squad', 'germany:mediumTank': 'Panzer IV',
  'germany:heavyTank': 'Tiger I', 'germany:superHeavyTank': 'Maus',
  'germany:tankHunter': 'Jagdpanther', 'germany:atGun': 'PaK 40',
  'usa:infantry': 'US Rifle Squad', 'usa:lightTank': 'M24 Chaffee',
  'usa:mediumTank': 'M4 Sherman', 'usa:heavyTank': 'M26 Pershing',
  'usa:tankHunter': 'M18 Hellcat', 'usa:howitzer': 'M12 GMC',
  'russia:infantry': 'Red Army Squad', 'russia:mediumTank': 'T-34-85',
  'russia:heavyTank': 'IS-2', 'russia:tankHunter': 'SU-100',
  'russia:howitzer': 'ISU-152', 'russia:launcher': 'BM-13 Katyusha',
};

/**
 * S58: SquadBar's own card label — the user's own call, weight-class-style
 * shorthand (a light/medium/heavy/super-heavy tank reads "L"/"M"/"H"/"SH")
 * instead of the full display name, which is what was actually overlapping
 * on narrow cards. Class-only (not faction-specific — an M4 Sherman and a
 * Panzer IV are both just "M", the same way L/M/H/SH themselves don't name
 * a specific vehicle either).
 */
export const UI_UNIT_SHORT_LABELS = {
  infantry: 'IN', lightTank: 'L', mediumTank: 'M', heavyTank: 'H', superHeavyTank: 'SH',
  tankHunter: 'TH', howitzer: 'HW', atGun: 'AT', launcher: 'RL', gatherTruck: 'AC',
};

/**
 * Best display label for a unit.
 * @param {string} cls CLASS_TRAITS key
 * @param {?string} faction 'germany'|'usa'|'russia'|'none'
 * @param {?string} [team] 'player'|'enemy' — used only when faction is unknown
 * @returns {string}
 */
export function unitLabel(cls, faction, team) {
  if (faction && faction !== NONE) {
    return UI_UNIT_LABELS[`${faction}:${cls}`] ?? UI_UNIT_LABELS[cls] ?? cls;
  }
  if (team === 'enemy') return ENEMY_LABEL;
  return UI_UNIT_LABELS[cls] ?? cls;
}

/**
 * SquadBar's short card label for a unit — see `UI_UNIT_SHORT_LABELS`'s own doc.
 * @param {string} cls CLASS_TRAITS key
 * @param {?string} [team] 'player'|'enemy' — used only when cls is unknown
 * @returns {string}
 */
export function unitShortLabel(cls, team) {
  if (team === 'enemy' && !UI_UNIT_SHORT_LABELS[cls]) return ENEMY_LABEL;
  return UI_UNIT_SHORT_LABELS[cls] ?? cls;
}

/**
 * Placeholder portrait colour for a class.
 * @param {string} cls @returns {number} 0xRRGGBB
 */
export function portraitColor(cls) {
  return PLACEHOLDER_PORTRAIT[cls] ?? DIM_PORTRAIT;
}

/**
 * Left/right screen margin for a full-screen HUD panel (`UnitsMenu`,
 * `TroopDetailScreen`) — wider in landscape so a phone's camera cutout
 * (always on a SIDE edge there) can't cover the first grid card or the
 * back button, same "widthFracMaxPortrait vs widthFracMax" idea NavBar's
 * own responsive sizing already uses, just for a fixed inset instead of a
 * width fraction.
 * @param {number} screenWidth @param {number} screenHeight @returns {number} px
 */
export function screenSidePad(screenWidth, screenHeight) {
  const m = WORLD_HUD.unitsMenu;
  const fallback = screenWidth > screenHeight ? m.sideInsetLandscapePx : m.gridPadPx;
  return Math.max(fallback, screenSafeAreaSide() + m.gridPadPx);
}

/**
 * Landscape-only edge gap for NavBar + MapButtons (0 in portrait, where
 * both already dock flush to their own corner by design) — its own,
 * smaller inset than `screenSidePad`'s (see `navEdgeInsetLandscapePx`'s own
 * doc), still safe-area-aware for a real device's camera cutout.
 * @param {number} screenWidth @param {number} screenHeight @returns {number} px
 */
export function navEdgePad(screenWidth, screenHeight) {
  if (screenWidth <= screenHeight) return 0;
  return Math.max(WORLD_HUD.navEdgeInsetLandscapePx, screenSafeAreaSide());
}
