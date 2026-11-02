/**
 * ProductionScreenConfig — visual tuning for `ProductionScreen` (the
 * Factory's "Production" button — master-task section 10). Same centered
 * scrim+card shell language as `BuildingLevelInfoScreen`
 * (`BuildingScreenConfig.BUILDING_LEVEL_INFO`), own content sizing below.
 */
export const PRODUCTION_SCREEN = {
  // widthPx stays under a real 390px-wide phone viewport minus a 16px
  // gutter each side (the player's own explicit mobile-accuracy check) —
  // narrower than BUILDING_LEVEL_INFO/BUILDING_INFO's 420-440, which
  // already overflow that same width.
  widthPx: 358, heightFrac: 0.82, padPx: 14, radiusPx: 10,
  headerPx: 36, titlePx: 16, titleColor: 0xf4f4f0,
  btnSizePx: 28, btnRadiusPx: 6, sectionGapPx: 14,

  // Workshop tabs (one per built Factory) — hidden entirely when only one exists.
  tab: {
    heightPx: 26, gapPx: 6, radiusPx: 6, labelPx: 11,
    bg: 0x1b1b12, bgAlpha: 0.8, activeBg: 0x3a2f14, activeBgAlpha: 0.95,
    stroke: 0xe4e5e6, strokeAlpha: 0.25, activeStroke: 0xd4af37,
    labelColor: 0x9a9a95, activeLabelColor: 0xf4f4f0,
  },

  // Queue panel — active (crafting) job preview + progress bar, waiting-job
  // strip (tap an icon to cancel it), Clear + total-time/Rush row.
  queue: {
    // heightPx/rowY/footerY were tuned against an actual rendered capture
    // (not guessed): tile bottom sits at ~96, time label ~96-118, waiting
    // row needs real clearance below the time label or the two overlap —
    // the exact bug an earlier pass shipped.
    heightPx: 200, bg: 0x14140f, bgAlpha: 0.9, radiusPx: 8,
    stroke: 0xe4e5e6, strokeAlpha: 0.2,
    queueLabelPx: 11, queueLabelColor: 0x9a9a95, queueFullColor: 0xff6b35,
    activeIconR: 30, activeIconBg: 0x1b1b12, activeIconRadiusPx: 8,
    barFill: 0x8fd16a, // the active tile's own bottom-up fill colour (ProductionQueuePanel._drawActive)
    timePx: 12, timeColor: 0xf4f4f0,
    waitIconR: 13, waitIconGapPx: 6, waitIconBg: 0x1b1b12, waitIconRadiusPx: 5,
    rowY: 128, // local y where the waiting-job strip + Clear button sit
    clearW: 64, clearH: 26, clearRadiusPx: 6, clearLabelPx: 11,
    clearBg: 0x2a2a24, clearStroke: 0x6d6e68, clearLabelColor: 0xc9c9c2,
    footerY: 162, // local y where total-time + Rush sit
    rushW: 90, rushH: 30, rushRadiusPx: 6, rushLabelPx: 12, rushLabel: 'RUSH',
    rushBg: 0x965400, rushStroke: 0xffb35c, rushDisabledAlpha: 0.35,
  },

  // Material picker — horizontal-scroll row of swatches; locked (level-gated) ones dim.
  picker: {
    heightPx: 72, iconSizePx: 56, gapPx: 10, radiusPx: 7,
    bg: 0x1b1b12, bgAlpha: 0.9, stroke: 0xe4e5e6, strokeAlpha: 0.4,
    selectedStroke: 0xd4af37, selectedStrokeWidthPx: 2,
    lockedAlpha: 0.35, stockPx: 10, stockColor: 0xc9c9c2,
  },

  // Selected-material detail — name, description, base-vs-current duration, Produce.
  detail: {
    namePx: 15, nameColor: 0xf4f4f0,
    descPx: 11, descColor: 0x9a9a95, descLineHeightPx: 15, descGapPx: 6,
    timePx: 12, baseTimeColor: 0xff6b35, currentTimeColor: 0x8fd16a, timeGapPx: 20,
    btnHeightPx: 42, btnRadiusPx: 8, btnLabelPx: 14, btnLabel: 'PRODUCE',
    btnColor: 0x4b6b1f, btnStroke: 0xaed26a, btnDisabledAlpha: 0.3,
  },
};
