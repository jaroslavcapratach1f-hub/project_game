/**
 * BuildingScreenConfig — visual tuning for the 3 reusable building screens
 * (`BuildingInfoScreen`, `BuildingLevelInfoScreen`, `BuildingUpgradeScreen`).
 * Same dark/glass HUD language the rest of the game already uses
 * (`WORLD_HUD.panel`'s own scrim + card tokens for the two centered
 * screens); `BUILDING_UPGRADE.shell` deliberately MIRRORS `ARMY_MENU`'s own
 * shell numbers (padPx/topInsetPx/radiusPx/bg/stroke) rather than inventing
 * new ones — the player's own explicit instruction to reuse the Army
 * screen's outer structure exactly.
 */

/** BuildingInfoScreen — centered panel: header (name+level, ?, X), left preview, right description, stat rows. */
export const BUILDING_INFO = {
  widthPx: 420, padPx: 18, radiusPx: 10,
  headerPx: 40, titlePx: 17, titleColor: 0xf4f4f0,
  btnSizePx: 28, btnGapPx: 8, btnRadiusPx: 6,
  previewSizePx: 112, previewRadiusPx: 8,
  descGapPx: 14, descPx: 12, descLineHeightPx: 16,
  statRowH: 26, statGapPx: 10, statLabelPx: 12, statValuePx: 13,
  iconR: 9,
};

/** BuildingLevelInfoScreen — centered, scrollable table of every level, opened via BuildingInfoScreen's own "?" button. */
export const BUILDING_LEVEL_INFO = {
  widthPx: 440, heightFrac: 0.82, padPx: 18, radiusPx: 10,
  headerPx: 36, titlePx: 16, titleColor: 0xf4f4f0,
  btnSizePx: 28, btnRadiusPx: 6,
  colHeaderPx: 11, colHeaderColor: 0x9a9a95,
  rowH: 30, rowRadiusPx: 5, levelColWidthPx: 56,
  rowBg: 0x1b1b12, rowBgAlpha: 0.6,
  currentBg: 0x3a2f14, currentBgAlpha: 0.95, currentStroke: 0xd4af37,
  valuePx: 12, valueColor: 0xf4f4f0, dimValueColor: 0x9a9a95,
};

/**
 * BuildingUpgradeScreen — the Army-shell-SIZED right panel (the player's
 * own explicit, repeated instruction: identical outer measurements to the
 * Army screen, not an independent estimate). The outer shell's own
 * geometry/chrome (rect size+position, bg/stroke/radius/pad/topInset) comes
 * straight from `ARMY_MENU`/`armyShellRect()` (`ArmyMenuConfig.js`) — no
 * second copy of those numbers here, so the two panels can't drift apart.
 * Everything below is this screen's OWN content sizing — comfortable,
 * non-cramped values sized for the real Army-shell body height (no
 * scrolling, ever — the player's own explicit instruction, and with the
 * full Army-sized shell there's room to spare for it).
 */
export const BUILDING_UPGRADE = {
  header: {
    heightPx: 46, bg: 0x0a0a08, bgAlpha: 0.9,
    namePx: 15, nameColor: 0xf4f4f0,
    levelPx: 12, levelColor: 0x9a9a95, arrowColor: 0xd4af37, nextLevelColor: 0xf4f4f0,
    btnSizePx: 24, btnRadiusPx: 6,
  },
  sectionTitlePx: 11, sectionTitleColor: 0x9a9a95, sectionGapPx: 12, ruleAlpha: 0.18,
  // FEATURES UNLOCKED — one tile per real headline stat + Power, never padded to a fixed count.
  featureTileMinWidthPx: 84, featureTileGapPx: 10, featureIconR: 12,
  featureLabelPx: 10, featureValuePx: 14, featureValueColor: 0x8fd16a,
  // MATERIAL COST — one item card per required special material.
  materialCardSizePx: 50, materialCardGapPx: 10, materialCardRadiusPx: 7,
  materialCardBg: 0x1b1b12, materialCardBgAlpha: 0.9, materialCardStroke: 0xe4e5e6,
  materialQtyPx: 11, materialShortColor: 0xff6b35, materialOkColor: 0xc9c9c2,
  // RESOURCE COST — plain icon + amount, no card.
  resourceIconR: 9, resourceGapPx: 16, resourceValuePx: 13,
  resourceShortColor: 0xff6b35, resourceOkColor: 0xf4f4f0,
  // UPGRADE button. HQ-gated (this building hit the CURRENT headquarters
  // level's cap, not its own real ceiling — the player's own explicit
  // request: say so instead of a bare "MAX LEVEL", and grey out same as a
  // true max) reads e.g. "Upgrade Headquarters to Lvl 4 First".
  btnHeightPx: 44, btnRadiusPx: 8, btnLabelPx: 15, btnLabel: 'UPGRADE',
  btnColor: 0x965400, btnStroke: 0xffb35c, btnDisabledAlpha: 0.3,
  // disabled (can't afford yet) keeps the brand colour, just dimmed —
  // locked (HQ-gated or true max) switches to an actual neutral grey so it
  // reads unambiguously "not available" rather than "a dim orange button".
  btnLockedColor: 0x2a2a24, btnLockedStroke: 0x6d6e68, btnLockedLabelColor: 0x9a9a95,
  maxLabel: 'MAX LEVEL', hqGateLabelPrefix: 'Upgrade Headquarters to Lvl ', hqGateLabelSuffix: ' First',
};

/**
 * BarracksDetailScreen — the per-barracks screen opened from the map's own
 * "View" action (replaces the old blind-cycle panel). Rebuilt frame-by-frame
 * against the player's own 2 Warpath reference screenshots (landscape "No. 3
 * Barracks" + portrait "No. 1 Barracks") after an earlier pass drifted into
 * an invented layout — the player's own explicit correction: "follow this
 * exact style... structure me exact same menu." FULL-SCREEN on
 * `LAYERS.OVERLAY` (`TroopDetailScreen`'s own shell shape — `drawTroopSurface`
 * + a docked header — not a centered scrim+card dialog), so the screen's own
 * size is trivially fixed regardless of content (the player's earlier,
 * still-standing correction — the window must never resize switching
 * between troops): header + hero/officer row are fixed-height, only the
 * grid+stats column below them scrolls. Officer chips reuse `ArmyIconDraw`'s
 * own `drawOfficerPlus` glyph; the unit grid reuses `UnitCard` VERBATIM (the
 * exact same card the Units nav-tab screen renders for this same roster —
 * the reference's own card-grid look, and the player's own original
 * instruction that this list is "directly connected" to that real
 * inventory). The stats panel (`BarracksUnitStats.js`) reuses `StatMedallion`
 * for Firepower/HP but packs every remaining stat 2-per-row (the player's
 * own call — a full 1-per-row copy of Troop Detail's own stat list read as
 * "way too much space"/"big gaps" inline inside a scrolling card grid).
 */
export const BARRACKS_DETAIL = {
  header: { heightPx: 56, titlePx: 19, titleColor: 0xf4f4f0, badgeGapPx: 10 },
  // Hero block (left column, reference's own art+name+REMOVE stack):
  // faction-photo-cover backdrop (`ArmyBarrackTile`'s own technique) behind
  // a contain-fit hero cutout, a dark name bar with a real level badge below
  // it, this screen's own two-state action button below that.
  // `widthFrac`/`maxWidthPx` size the portrait layout's hero column (beside
  // the officer cards); `widthFracLandscape` sizes the landscape layout's
  // LEFT column instead (hero stacked ABOVE a side-by-side officer row,
  // reference's own landscape split — `BarracksDetailScreen._layoutLandscape`).
  hero: {
    widthFrac: 0.42, maxWidthPx: 190, widthFracLandscape: 0.34, radiusPx: 10, bg: 0x1b1b12,
    levelPx: 10, levelPadPx: 4, levelRadiusPx: 3, levelBg: 0x0a0a08, levelBgAlpha: 0.65,
    nameBarH: 30, namePx: 13, nameColor: 0xf4f4f0, metaPx: 10, metaColor: 0x9a9a95,
    gapPx: 6,
  },
  // The hero's own action button — REMOVE (a unit IS assigned) or ASSIGN
  // (the barracks is locally emptied; green, disabled until a candidate is
  // tapped in the grid below) — the player's own explicit, still-standing
  // two-step flow: REMOVE only clears this screen's own local state (never
  // touches `BaseManager`) until ASSIGN commits the pending pick.
  action: {
    heightPx: 34, radiusPx: 8, labelPx: 13,
    removeLabel: 'REMOVE', removeBg: 0xc0564f, removeColor: 0xfceceb,
    assignLabel: 'ASSIGN', assignBg: 0x4b7a3f, assignColor: 0xeaf7e4,
    assignDisabledAlpha: 0.4,
  },
  // Officer cards (right column, stacked "Captain"/"Aide"-style): a
  // two-tone header bar + an empty "+" placeholder body — no officer
  // roster/skills/portraits exist anywhere yet (`OfficerConfig.js` has real
  // bonus math, zero actual officer instances), so the body stays bare per
  // the player's own earlier call. `cardCapPx` caps each card's own height
  // instead of stretching to match the hero block/landscape row (the
  // player's own "too big"/"bulky" correction — an empty "+" body filling
  // that much height read as oversized; left over space below just stays
  // empty rather than stretching a near-empty card further).
  officer: {
    gapPx: 6, radiusPx: 7, headerHPx: 18, cardCapPx: 60,
    primaryColor: 0xb89b5e, secondaryColor: 0x5d7a8c, headerLabelPx: 10, headerLabelColor: 0x14140f,
    bg: 0x1b1b12, bgAlpha: 0.9, stroke: 0xe4e5e6, strokeAlpha: 0.35,
    plusPx: 12, plusColor: 0x6d6e68,
    primaryLabel: 'Primary Officer', secondaryLabel: 'Secondary Officer',
  },
  sectionTitlePx: 13, sectionTitleColor: 0xf4f4f0, sectionGapPx: 10, ruleAlpha: 0.2,
  // UNIT SELECTION — the real "Units" inventory (`BASE.army.roster`) as the
  // SAME square icon-card grid the Units nav-tab screen uses (`UnitCard`),
  // but its OWN, SMALLER min/max width bounds — NOT `WORLD_HUD.unitsMenu`'s
  // shared ones (130-178, tuned for the dedicated Units screen's own
  // breathing room) — reused there unchanged. The player's own "too
  // bulky" correction for this screen specifically: smaller cards so more
  // of the real roster is visible without feeling oversized. A gold ring
  // marks whichever card's stats are currently shown below the grid. Tight
  // gap below that row into the stats panel (the player's own "too big
  // gaps" correction — was 18, now a thin breathing gap, not a block).
  grid: {
    cardMinWidthPx: 84, cardMaxWidthPx: 112,
    highlightStroke: 0xd4af37, highlightWidthPx: 2, gapBelowPx: 6,
  },
  // BarracksUnitStats' own 2-column stat list below the medallions
  // (`WORLD_HUD.troopDetail` owns the medallions' own radius/gap/label
  // size — `StatMedallion` reads those directly, not a param, so they're
  // not duplicated here, only the ring colours are).
  statGrid: {
    firepowerColor: 0xff6b35, hpColor: 0x6f8f35,
    rowHeightPx: 20, iconR: 6, labelPx: 11, valuePx: 12, colGapPx: 16, padYPx: 6,
  },
};
