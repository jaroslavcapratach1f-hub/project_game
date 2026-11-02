/**
 * ResearchScreenConfig — visual tuning for `ResearchScreen` (the Research
 * Center's own "Research" hex-menu action, replacing the generic "View"):
 * the resource strip (`RESEARCH_HUB.resourceBar`), the category hub (6
 * equal-size hex buttons, 1 then 2 then 1 then 2 — the player's own
 * explicit layout), the per-track tree (a REAL connected node graph — the
 * player's own reference screenshots), and the node detail popup. Same
 * dark/glass HUD language the rest of the game already uses; the glass-hex
 * bevel tokens mirror `BUILDING_MENU`'s own (see `GlassHexDraw.js`).
 *
 * This is NOT the global HUD TopBar showing through a gap (an earlier,
 * corrected approach) — the player's own explicit correction: "resources
 * ... allocated to this research screen which will be in all screens in
 * Research Center under Research button" — so every page here (hub AND
 * tree) is a genuine full-screen overlay starting at y=0, carrying its OWN
 * live Money/Steel/Oil readout, same real icons `ResourceStatIcon` already
 * uses everywhere else. SCOPE LOCK (`ResourceConfig.js`): no Gold here —
 * exactly the 3 resources research costs are ever paid in.
 *
 * Orientation changes WHERE it sits (the player's own 2 reference
 * screenshots, portrait then landscape): portrait gets its own full-width
 * strip above the back/title row (`ResearchResourceBar.layoutBar`);
 * landscape folds it into that SAME single header row, right-aligned
 * (`layoutInline`) — `ResearchScreen._reflow` picks per `w > h` and hands
 * the resulting header height to the node-detail popup as its own minimum
 * top reserve, so the popup never covers whichever header is on screen.
 */

export const RESEARCH_HUB = {
  header: { heightPx: 56, titlePx: 19, titleColor: 0xf4f4f0, badgeGapPx: 10 },
  resourceBar: {
    heightPx: 44, bg: 0x0a0a08, bgAlpha: 0.95,
    iconHeightPx: 22, iconColor: 0xc9c9c2, valuePx: 15, textColor: 0xf4f4f0,
    padXPx: 16, gapPx: 20,
  },
  // 6-slot order: hero, pair, single, pair — 5 REAL tracks + 1 inert
  // "Coming Soon" placeholder (the player's own explicit choice: keep the
  // 1-2-1-2 rhythm even though only 5 tracks have real data).
  categories: ['development', 'military', 'doctrine', 'defense', 'support', 'placeholder'],
  trackLabel: { development: 'Industry', military: 'Military', doctrine: 'Doctrine', defense: 'Defense', support: 'Support' },
  placeholderLabel: 'Coming Soon',
  // Only these 2 are open right now (the player's own explicit instruction,
  // matching the reference screenshot's own locked/open state: only 2 of
  // its ~7 visible hexes are unlocked/coloured, the rest show a plain
  // locked placeholder). Doctrine/Defense/Support already have real node
  // data and a working tree wired (`ResearchTreeView` renders any track
  // generically) — flipping one open later is this one line, no other
  // change needed.
  openCategories: ['development', 'military'],
  // No real photo art exists anywhere in this project for these 5 abstract
  // themes (checked) — the player's own explicit call: a themed colour
  // wash (CLAUDE.md's own named palette, one swatch per track) instead,
  // swappable for real art later without touching any layout code.
  trackColor: {
    development: 0x767c82, military: 0x5c7a29, doctrine: 0x2e6e8e,
    defense: 0x8b5a2b, support: 0xc5a55a,
  },
  // Every hex is the SAME size with EQUAL spacing (the player's own
  // explicit correction — no more differently-sized hero/column hexes).
  radiusPx: 52,
  rowGapPx: 16, colGapPx: 20, topGapPx: 18, bottomGapPx: 28,
  // Label + progress sit INSIDE the hex now (the player's own reference —
  // both baked into the lower-middle of the hex, not below it).
  labelPx: 13, labelColor: 0xf2f2ed, labelGapPx: 4,
  progressPx: 10, progressColor: 0xe4e5e6, progressGapPx: 2,
  iconColor: 0x14140f, iconFrac: 0.34,
  comingSoonAlpha: 0.4,
  glass: {
    fillAlpha: 0.92, stroke: 0xe4e5e6, strokeWidthPx: 1.5,
    bevelInset: 0.89, innerInset: 0.82, bevelColor: 0x1a1a1a,
  },
};

export const RESEARCH_TREE = {
  // Gap between tier-groups (portrait: vertical rows; landscape: horizontal
  // columns). No tier HEADER text renders in the tree any more — the
  // player's own explicit correction: "that tier section and Research
  // Center requirements should be... not in research tree... add to each
  // research menu" (the node detail popup, `RESEARCH_DETAIL.gate` below).
  tierTopGapPx: 22,
  // The node graph (the player's own reference): nodes grouped by real
  // `tier` (same real field as before), wrapped into rows of `maxPerRow`
  // within a tier, connected by real elbow lines drawn from each node to
  // its own real `requires` parent(s) once every node's position is known
  // — see `ResearchTreeView.js`. No DAG auto-layout engine exists in this
  // codebase; this reuses the already-correct tier grouping and just adds
  // the connecting lines on top, rather than re-deriving layer depth.
  node: {
    maxPerRow: 3, colGapPx: 14, rowGapPx: 36,
    // Landscape (the player's own reference): tiers flow LEFT-TO-RIGHT as
    // columns instead of top-to-bottom rows — nodes within one tier stack
    // vertically in their own column. `hColGapPx` separates columns,
    // `hRowGapPx` separates stacked nodes within one column. The column is
    // much narrower than a 3-wide portrait row, so labels get a WIDER wrap
    // (`labelWidthLandscapePx`) to fit on 1 line more often, keeping each
    // stacked node's own vertical footprint small enough that even a
    // 3-node column comfortably fits a landscape phone's short screen.
    // `hSubColGapPx` separates sub-columns WITHIN one tier (a tier with
    // more than `maxPerRow` nodes wraps into side-by-side sub-columns, same
    // reason portrait wraps into rows) — smaller than `hColGapPx` so it
    // still reads as "one tier" rather than two separate tiers.
    hColGapPx: 64, hSubColGapPx: 28, hRowGapPx: 20, labelWidthLandscapePx: 132,
    // Square "milestone" nodes (maxRank===1 — Collection Truck/Collection
    // Sites and the like) are BIGGER than the circular multi-rank "gear"
    // nodes (the player's own explicit ask: these pivotal unlocks "need
    // proper showcasing" since they're what let the player scale) — a
    // squareHalf of 42 (84px side) clearly outsizes a circleR of 34 (68px
    // diameter). `ResearchTreeView.layout` sizes each ROW off whichever
    // shape is actually in it, so a square never overlaps its neighbours.
    circleR: 34, squareHalf: 42, squareRadiusPx: 8, ringWidthPx: 3,
    fillColor: 0x1b2a3f, ringColor: 0x4a7fae, iconColor: 0xeaf2f8,
    lockedFillColor: 0x1b1b12, lockedRingColor: 0x6d6e68, lockedIconColor: 0x6d6e68,
    iconSizePx: 30,
    rankPx: 10, rankHeightPx: 15, rankPadXPx: 5, rankRadiusPx: 7, rankBg: 0x14140f,
    // Narrower than the tightest possible column pitch (3 circles/row:
    // circleR*2+colGapPx = 82) so two adjacent labels never run into each
    // other horizontally — real labels in the Industry tree are long
    // enough ("Resource Collection Speed") to reliably hit this wrap width,
    // unlike the shorter labels elsewhere that rarely wrapped before.
    labelPx: 10, labelColor: 0xf4f4f0, labelGapPx: 6, labelWidthPx: 78,
    lineColor: 0x4a4a42, lineWidthPx: 2,
  },
  // The Start/Disabled/Active/Maxed control — now only ever rendered
  // inside `ResearchNodeDetail`'s own popup (`ResearchNodeAction`, reused
  // verbatim from the earlier inline-card design).
  action: {
    heightPx: 34, radiusPx: 8, labelPx: 13,
    startBg: 0x4b7a3f, startColor: 0xeaf7e4,
    disabledBg: 0x2a2a24, disabledColor: 0x9a9a95, disabledAlpha: 0.6,
    maxedBg: 0x3a2f14, maxedColor: 0xd4af37,
    progressBg: 0x24241a, progressFill: 0x6f8f35, progressLabelColor: 0xeaf7e4,
  },
  resourceIconR: 8, resourceGapPx: 14, costValuePx: 13,
  placeholderPx: 15, placeholderColor: 0x9a9a95,
};

// The node tap-detail popup (the player's own reference): icon + title,
// a real plain-language effect description, real Power gain
// (`PowerConfig.researchPower` — written long ago, first real consumer),
// the real cost row + Start control (`ResearchNodeAction`, reused
// verbatim — the ONE place cost/action ever render now), real time, and
// (the player's own explicit move) the tier/Research-Center-level gate +
// prerequisite line that used to render as tree header text — this is now
// the ONE place that info shows. Text sizes bumped across the board (the
// player's own complaint: "numbers are not clear") and the cost row's
// icons no longer flicker (`ResearchNodeAction`'s own doc — they were
// being destroyed/recreated every single refresh frame). Deliberately
// omits the reference's flavour quote (no real quotes exist for any node
// — inventing one would be fabricated content) and its 2nd "pay Gold to
// finish instantly" button (no premium currency economy exists anywhere
// in this game yet).
export const RESEARCH_DETAIL = {
  widthFrac: 0.92, maxWidthPx: 420, padPx: 16, radiusPx: 12,
  bg: 0x14140f, bgAlpha: 0.97, stroke: 0xe4e5e6, strokeWidthPx: 1.5,
  scrim: 0x0a0a08, scrimAlpha: 0.7,
  headerHPx: 42, titlePx: 17, titleColor: 0xf4f4f0,
  btnSizePx: 28, btnRadiusPx: 6,
  iconBoxPx: 74, iconBoxRadiusPx: 8, iconBoxBg: 0x1b1b12, iconBoxStroke: 0xe4e5e6,
  descPx: 13, descColor: 0xd4d4ce, descGapPx: 10,
  rulePx: 1, ruleAlpha: 0.25, rowGapPx: 10,
  rowPx: 14, powerColor: 0x8fe06a,
  // The gate/prerequisite line(s) — moved in from the tree's own former
  // tier header (the player's own explicit instruction).
  gatePx: 12, gateMetColor: 0x8fe06a, gateLockedColor: 0xff9466,
  actionGapPx: 12,
};
