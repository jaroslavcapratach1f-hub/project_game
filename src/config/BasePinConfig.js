/**
 * BasePinConfig — the locked "battlefield vs strategic map" icon swap (S57 —
 * the user's own live-session zoom pick, camera.zoom ~0.381). A HARD cutoff,
 * unlike every continuous LOD band in WorldMapConfig.js: below it, every
 * base — the player's own (BaseLodPin.js) and every neighbour
 * (PlotMarker.js via NeighbourBases.js) — hides its full render and shows
 * one small always-legible tower icon instead (S58 — a crenellated
 * castle/rook-style tower, the user's own "chess tower" call, after a first
 * peaked-roof watchtower pass read as generic; see
 * MarkerDraw.buildTowerIcon), so nearby bases read at a glance from a wide
 * zoomed-out view; above it, the normal continuous LOD governs as before.
 * `hysteresis` stops the swap flickering right at the cutoff during a slow
 * pinch (Schmitt-trigger style — see BaseLodPin.update/PlotMarker.update).
 * Split out of WorldMapConfig.js to keep that file under the 150-line cap.
 *
 * Total icon height (bodyHeightPx+deckThicknessPx+merlonHeightPx = 200) is
 * in the same ballpark as OrdersConfig's selectionRing.radiusPx*2 (144,
 * proven legible zoomed all the way out) rather than the compound's own
 * true-to-plot scale (WorldMapConfig.plot.sizePx = 176) — the icon has to
 * read as a small dot on the strategic map, not shrink toward invisible at
 * minZoom.
 *
 * No alliance/threat data model exists yet (WORLDMAP.neighbourHexes bases
 * are cosmetic placeholders, confirmed elsewhere) — every neighbour icon is
 * `neutral` (grey) until a real system sets a base's alliance state;
 * `ally`/`enemy` are wired and ready for that (PlotMarker._pin.setColor).
 */
export const PIN = {
  zoomThreshold: 0.381,
  hysteresis: 0.02,
  bodyHalfPx: 42,       // trunk half-width
  bodyHeightPx: 150,
  deckHalfPx: 54,       // battlement deck half-width — overhangs the trunk
  deckThicknessPx: 14,
  merlonCount: 3,       // raised battlement teeth across the deck's top edge
  merlonGapPx: 14,
  merlonHeightPx: 36,
  outlineColor: 0x14140f,
  outlineWidthPx: 8,
  shadow: 0x000000,
  shadowAlpha: 0.3,
  colors: {
    neutral: 0x9aa0a6, // palette steel grey
    ally: 0x4a90d9,    // REVIEW: outside CLAUDE.md palette (no blue defined) — same value ORDERS.recallLine already flags
    enemy: 0xff4500,   // palette combat
    home: 0xd4af37,    // palette UI gold — always the player's own base, never confusable with a neutral grey neighbour
  },
  labelPx: 42, labelGapPx: 16, labelColor: 0xc5a55a, fontFamily: 'monospace',
};
