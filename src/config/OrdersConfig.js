/**
 * OrdersConfig — tuneables for tactical-order visual feedback (GDD 02).
 *
 * DRAFT: every value is a proposal; art / balance not final. Grep "REVIEW".
 * Palette references are CLAUDE.md "VISUAL STYLE" colours where one fits.
 * Blue is NOT in the CLAUDE.md palette — recall feedback needs a cool colour
 * to read as "friendly / retreat", so 0x4A90D9 is flagged REVIEW below.
 */
export const ORDERS = {
  // Pulsing ring under the currently selected unit — ONE flat size for
  // every unit (S57: growing it with squad troop count was the original
  // idea, but the user's own follow-up call was a same-size ring across
  // every troop type instead, easier to reason about and to tap/drag on a
  // phone regardless of unit type). Green while CALM, red the instant the
  // unit's own `stance` flips to FIELD_FURY/BASE_FURY (SelectionRing.js
  // reads Entity.stance off the handle every tick) — a vivid green/red
  // pair, not the terrain's own muted olive, so it still reads on a small
  // phone screen; the wider stroke + higher floor alpha hold up when the
  // pulse dims. radiusPx=72 sized to comfortably enclose the biggest
  // vehicle sprite (Sherman, ~92px hull) with room to spare.
  selectionRing: {
    radiusPx: 72,
    color: 0x39ff6a,
    furyColor: 0xff2d1f,
    widthPx: 5,
    pulseMinAlpha: 0.55,
    pulseMaxAlpha: 1,
    pulsePeriodMs: 900,
  },
  // Static ring at the selected unit's own weapon range (S57) — same
  // selected-only visibility as selectionRing, but a fixed radius (rangePx
  // doesn't change over a unit's life the way troop count does) and its own
  // colour so the two rings read as different concepts at a glance: "ground
  // the squad occupies" vs "how far it can hit".
  rangeRing: { color: 0xff6b35, widthPx: 2, alpha: 0.4 }, // palette combat orange

  // Move order: arrow from unit to ground target, fades out.
  moveArrow: {
    color: 0x556b2f, widthPx: 3, headPx: 14, headSpreadRad: 2.6, fadeMs: 1000,
  }, // palette green

  // Attack order: line + crosshair at the target end, fades out.
  attackLine: { color: 0xff4500, widthPx: 3, crosshairPx: 16, fadeMs: 1000 }, // palette combat

  // Recall order: dashed line to the base + home marker, fades out.
  recallLine: {
    color: 0x4a90d9,      // REVIEW: outside CLAUDE.md palette (no blue defined)
    widthPx: 2,
    dashPx: 10,
    gapPx: 8,
    markerPx: 12,
    fadeMs: 1000,
  },
  // Live line that tracks the finger during an order drag.
  dragPreview: { color: 0xc5a55a, widthPx: 2, alpha: 0.5 }, // palette UI gold

  // Fixed-barrel (noTurret) units: translucent firing wedge ahead of the hull,
  // shown only while the unit is selected.
  aimCone: { halfAngleDeg: 45, radiusPx: 90, color: 0xffd37a, alpha: 0.14 },

  // Long-press radial menu (screen-space, GSAP-animated).
  radial: {
    menuRadiusPx: 96,
    optionRadiusPx: 26,
    scaleInMs: 200,
    ease: 'back.out(1.7)',
    recall: { color: 0x4a90d9 }, // REVIEW: outside palette
    hold: { color: 0xffd700 },   // palette combat gold
    follow: { color: 0x556b2f }, // palette green
  },
  // Pre-allocated Graphics counts for the OrderIndicator pools.
  pool: { rings: 4, transient: 12 },

  // S71: the hex-lock drag/tap-Go marker — same green as selectionRing,
  // same red as attackLine (one colour vocabulary for "friendly/go" and
  // "hostile/attack" across every order visual, not a 3rd new pair).
  hexTarget: {
    radiusPx: 46, bgAlpha: 0.22, strokeWidthPx: 2.5, strokeAlpha: 0.85, iconPx: 30,
    moveColor: 0x39ff6a, attackColor: 0xff4500,
  },
  // The tap-to-confirm "GO" button shown at a tap-selected hex — visually
  // matches BuildingHexOption's own glass-hex button (the player's own
  // explicit ask: "same icon as green one... hex button we have build in
  // base buildings menu"), kept as its own small component rather than
  // folding a troop-movement action into the Building menu's own vocabulary.
  goButton: {
    hexRadiusPx: 30, iconPx: 20, labelPx: 12, labelGapPx: 4, labelColor: 0xf4f4f0,
  },
};
