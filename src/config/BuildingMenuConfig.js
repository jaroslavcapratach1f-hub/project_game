/** Building selection presentation, matched to the supplied Building Menu reference. */
export const BUILDING_ACTIONS = {
  default: ['info', 'upgrade', 'view'],
  // Factory (engineering id, unrenamed internally) swaps View for its own
  // Production action — opens the material-queue panel instead of the
  // generic (and here unused) view/upgrade fallback every other building gets.
  engineering: ['info', 'upgrade', 'produce'],
  // Research Center swaps View for its own Research action — opens
  // `ResearchScreen` (category hub + per-track tree) instead of the
  // generic (and here unused) view/upgrade fallback, same override style.
  research_center: ['info', 'upgrade', 'research'],
};
export const ACTION_LABEL = { info: 'Info', upgrade: 'Upgrade', view: 'View', manage: 'Change production', produce: 'Production', research: 'Research' };
export const BUILDING_MENU = {
  // On-screen SIZE stays this ONE constant at any zoom (the player's own
  // correction — shrinking it at high zoom kept it technically on-screen
  // but made the text illegible, "barely visible", which isn't actually
  // visible in any useful sense). `BuildingHexMenu.open()` divides this by
  // the live camera zoom (which the WORLD_UI layer otherwise folds straight
  // into the menu's own scale — the original bug: it grew WITH zoom) so the
  // menu always reads at this exact size, same as the original hand-tuned
  // zoom===1 look.
  scale: 0.62, backdropBlurPx: 2, backdropBlurQuality: 3,
  hexRadiusPx: 25, spacingPx: 82, dropPx: 12, vSpreadPx: 34, titleGapPx: 16,
  glass: { fill: 0xbfc2c5, fillAlpha: 0.88, stroke: 0xe4e5e6, strokeWidthPx: 1.5 },
  bevelInset: 0.89, innerInset: 0.82, bevelColor: 0x797d81,
  iconColor: 0x191a1b, iconPrimaryColor: 0x965400, iconPx: 34,
  fontFamily: 'Arial Narrow, Impact, sans-serif',
  labelPx: 13, labelColor: 0xffffff, labelGapPx: -3,
  titlePx: 13, titleColor: 0xf4f4f0, strokePx: 1.5, strokeColor: 0x161616,
  titlePadPx: 12, titleHeightPx: 24,
  panel: { halfWidth: 124, top: -28, innerBottom: 29, outerBottom: 90, color: 0x191813, alpha: 0.58 },
  scaleInMs: 180, staggerMs: 45, ease: 'back.out(2)',
  stillEpsPx: 0.3, stillEpsZoom: 0.001,
  // On-screen EDGE clamp — belt-and-suspenders under the camera recentre
  // below; `BuildingHexMenuLayout.js` nudges the anchor back on-screen,
  // margined by `screenEdgeMarginPx`, in case that pan hasn't settled yet.
  screenEdgeMarginPx: 8,
  // If the raw anchor's own on-screen bounding box doesn't already fit the
  // viewport, `BuildingContext._openMenu` pans the camera to recentre on
  // it before opening (the player's own design: "if the view [is] slightly
  // on the side the game automatically relocates the screen"). A no-op,
  // zero-distance pan when the anchor's already comfortably visible.
  recentreMs: 260,
};
export const RELOCATE_ARROWS = {
  sizePx: 13, edgeGapPx: 15, pulsePx: 4, pulseMs: 900,
  // Normalized chevron artwork (tip at 0,-1 — same convention as MENU_ICON
  // below), scaled by sizePx at draw time. Narrower than tall (back
  // corners at +/-0.42, not +/-0.62) — the wider draft's back corners
  // were nearly as far from centre as the true tip, so the shape read as
  // "pointing" toward a back corner as easily as the actual tip, making
  // correctly-rotated arrows look like they pointed the wrong way.
  shape: [0, -1, 0.42, 0.35, 0, 0.1, -0.42, 0.35],
  // "Glass white" per the reference: a soft silver fill (matches
  // BUILDING_MENU.glass.stroke, not pure 0xffffff — that read as too
  // bright/blown-out) with a faint bright rim and a soft dark shadow
  // behind each arrow for depth, instead of a flat opaque shape.
  fill: 0xe4e5e6, fillAlpha: 0.9,
  strokeColor: 0xffffff, strokeAlpha: 0.5, strokeWidthPx: 1,
  shadowColor: 0x0d0d0a, shadowAlpha: 0.3, shadowOffsetPx: 2.5,
};

/** Normalized vector artwork, independent of menu display size. */
export const MENU_ICON = {
  hex: [0, -1, 0.866, -0.5, 0.866, 0.5, 0, 1, -0.866, 0.5, -0.866, -0.5],
  infoDot: [-0.15, -0.82, 0.36, 0.32],
  infoBody: [-0.35, -0.36, 0.21, -0.36, 0.21, 0.6, 0.4, 0.6, 0.4, 0.82,
    -0.4, 0.82, -0.4, 0.6, -0.16, 0.6, -0.16, -0.15, -0.35, -0.15],
  upgradeBaseY: 0.62, upgradeBaseHeight: 0.2,
  binoculars: { offset: 0.48, halfWidth: 0.3, top: -0.7, width: 0.6, height: 1.05,
    radius: 0.28, lensY: 0.3, lensRadius: 0.46, rimWidth: 0.1, rimColor: 0xc7c9ca,
    bridge: [-0.2, -0.18, 0.4, 0.25] },
  // Factory — sawtooth roofline (2 peaks) sitting on a body block, one
  // offset chimney. Same normalized (-1..1) convention as every other icon.
  factory: {
    roof: [-0.75, 0, -0.75, -0.35, -0.4, -0.05, -0.05, -0.35, 0.3, -0.05, 0.75, -0.35, 0.75, 0],
    bodyX: -0.75, bodyY: 0, bodyW: 1.5, bodyH: 0.6,
    chimneyX: 0.42, chimneyY: -0.75, chimneyW: 0.18, chimneyH: 0.45,
  },
  // Flask — narrow neck + rim cap widening into a body, one bubble. Same
  // normalized (-1..1) convention as every other icon.
  flask: {
    neckHalfW: 0.16, neckTopY: -0.85, neckBottomY: -0.1,
    bodyHalfW: 0.7, bodyBottomY: 0.85,
    rimHalfW: 0.28, rimH: 0.12,
    bubbleR: 0.09, bubbleX: 0.18, bubbleY: 0.45,
  },
};

/** Full names for selected buildings; compact map labels remain independent. */
export const BUILDING_MENU_NAMES = {
  headquarters: 'Headquarters', treasury: 'Treasury', steelworks: 'Steelworks',
  crude_oil: 'Crude Oil Reserve', engineering: 'Factory',
  research_center: 'Research Center', armory: 'Armory', parts_workshop: 'Parts Workshop',
  disassemble: 'Disassembly Plant', assembly: 'Assembly Plant',
  officer_barracks: 'Officer Barracks', reserves_barracks: 'Reserves Barracks',
  defence_wall: 'Defence Wall', attack_towers: 'Attack Towers',
};
export const BARRACKS_MENU = { name: 'No. 1 Barracks', productionLabel: 'CHANGE PRODUCTION' };
