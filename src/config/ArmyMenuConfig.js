/**
 * ArmyMenuConfig — the ARMY nav-tab's own pop-up panel (`ARMY_MENU`): a
 * column of 5 barrack sections anchored to the nav menu's own right edge and
 * running up to the top of the screen, "like an extension of the menu" (the
 * player's own words). One horizontal section per Military Barracks slot
 * (`BUILDINGS.barracks.unique` is 5) — the SAME tile shape whether locked or
 * built (the player's own correction): LOCKED shows the barracks' own number
 * + a padlock centred in it; BUILT shows the actual troop that barracks
 * produces. Beside the tile sit 2 officer slots (every barracks, locked ones
 * included — locked slots show a padlock too), a small "trained/capacity"
 * badge in the row's own top-right corner (no "RESERVES" label — the
 * player's own correction), and — built rows only — a TRAIN button that
 * fields one more troop per press.
 *
 * DRAFT: every value is a proposal. REVIEW.
 */
import { levelOverride } from './BuildingLevelOverrides.js';

export const ARMY_MENU = {
  barrackSlots: 5,

  // Panel shell — same dark card language NavBar/SquadBar already use.
  bg: 0x14140f, bgAlpha: 0.96,
  stroke: 0xe4e5e6, strokeAlpha: 0.5, strokeWidthPx: 1.5, radiusPx: 10,
  padPx: 10, rowGapPx: 7,
  titleLabel: 'ARMY', titlePx: 14, titleHeightPx: 24,
  topInsetPx: 38, // clears the TopBar resource strip

  // One barrack section. Rows share whatever height the panel has, clamped
  // to this band so a tall portrait screen doesn't stretch them absurdly.
  rowMinHeightPx: 52, rowMaxHeightPx: 74,
  rowRadiusPx: 8, rowBg: 0x1b1b12, rowBgAlpha: 0.92,
  rowStroke: 0xe4e5e6, rowStrokeAlpha: 0.3, rowStrokeWidthPx: 1,
  rowPadPx: 6, lockedAlpha: 0.45,

  // The troop tile — a LANDSCAPE (wider than tall) shape, the player's own
  // call, widened further after the player's own "not wide enough" report.
  // BUILT: that troop's own FACTION background photo (the player's own
  // correction — "unique each troop background", same cover-fit technique
  // `UnitCard`'s grid card already uses) + its own hero/3D art on top,
  // contain-fit so it's never cropped; no placeholder icon while that art
  // loads (the player's own call — just the flat tile underneath). LOCKED:
  // the same flat tile with the barracks' own number + a padlock, centred.
  tileAspect: 1.9, tileRadiusPx: 5, lockFallbackBg: 0x0a0a08,
  // Locked tile stack: padlock, then "No. N" / "Barrack" on two lines —
  // fixed sizes (not innerH-scaled) so they stay readable without ballooning
  // on a tall row.
  lockColor: 0x9a9a95, lockIconPx: 17, lockIconGapPx: 3,
  lockNumberPx: 12, lockNumberLabel: 'No. ', lockNumberGapPx: 1,
  lockSubLabelPx: 9, lockSubLabel: 'Barrack',

  // Officer slots — 2 per barracks, matching OfficerConfig's own
  // primary/secondary pair, shown on EVERY row (the player's own
  // correction). No officer ROSTER exists anywhere yet (see
  // ARCHITECTURE.md): a built barracks shows an empty "+" assign slot, a
  // locked one shows a padlock in the same slot.
  officerCount: 2, officerGapPx: 5, officerRadiusPx: 5, officerSizeFrac: 0.82,
  officerBg: 0x24241a, officerBgAlpha: 0.9,
  officerStroke: 0xe4e5e6, officerStrokeAlpha: 0.4,
  officerPlusPx: 13, officerPlusColor: 0x9a9a95, officerLockColor: 0x6d6e68,

  // The row's own "trained/capacity" corner badge — a small dark chip, no
  // label text (the player's own correction), pinned to the row's own
  // top-right corner, clear of the TRAIN button below (TRAIN is sized off
  // the officer-slot gap and stays well short of this corner in practice).
  badgePx: 11, badgePadXPx: 5, badgePadYPx: 2, badgeRadiusPx: 4,
  badgeBg: 0x0a0a08, badgeBgAlpha: 0.7, badgeInsetPx: 4,
  reserveLowColor: 0xff6b35, // trained < capacity — a slot is free to train into

  // The barracks' own TRAIN button — sized off the actual gap between the
  // officer slots and the row's own right edge and CENTRED in it (neither
  // stretched edge-to-edge nor a fixed tiny size — both the player's own
  // corrections), clamped to a sane min/max so it reads right whether that
  // gap is narrow (portrait) or wide (landscape). Each press fields one
  // more troop, gated by capacity and the personnel pool, same MAX-style
  // grey-out `TroopUpgradeButton` already uses at a hard cap. Always
  // visible on a built barracks (not conditional on a death first).
  trainWidthFrac: 0.78, trainMinWidthPx: 56, trainMaxWidthPx: 108,
  trainMinHeightPx: 24, trainMaxHeightPx: 32,
  trainRadiusPx: 6, trainLabel: 'TRAIN', trainLabelPx: 12,
  trainColor: 0x4b6b1f, trainStroke: 0xaed26a, trainDisabledAlpha: 0.3,
};

/**
 * Reserve-troop capacity of one barracks — how many troops it can keep
 * fielded at once. Grows slowly with the building's own level.
 * DRAFT: a placeholder curve; no production pipeline exists yet (GDD 04).
 */
export const RESERVE_CAP = { base: 6, perLevel: 0.2, max: 12 };

/**
 * @param {number} level the barracks' own building level
 * @returns {number} how many troops this barracks may field at once —
 *   confirmed levels (BuildingLevelOverrides.barracks, currently L2/L3:
 *   +3 each, matching the player's "Springfield Squad x9 -> x12"
 *   reference) take priority level-by-level; unconfigured levels fall back
 *   to the old placeholder trickle so nothing is fabricated.
 */
export function reserveCapacity(level) {
  const lvl = Math.max(1, Math.round(level || 1));
  let capacity = RESERVE_CAP.base;
  for (let l = 2; l <= lvl; l++) capacity += levelOverride('barracks', l)?.capacityDelta ?? RESERVE_CAP.perLevel;
  return Math.min(RESERVE_CAP.max, Math.floor(capacity));
}

/**
 * The Army panel's own shell-sizing formula, factored out so
 * `BuildingUpgradeScreen` can share it verbatim (the player's own explicit
 * instruction: identical outer measurements to the Army screen, not an
 * independently-estimated size) instead of drifting its own numbers over
 * time. Rows fill whatever vertical room there is, clamped to
 * rowMinHeightPx/rowMaxHeightPx — never stretched past that band on a tall
 * portrait screen, never shrunk below it on a short landscape one (growing
 * UP from NavBar instead).
 * @param {{x:number,y:number,w:number,h:number}} navBarRect
 * @param {number} rowCount
 * @returns {{rect:{x:number,y:number,w:number,h:number}, rowH:number, listY:number}}
 */
export function armyShellRect(navBarRect, rowCount) {
  const m = ARMY_MENU;
  const chromeH = m.padPx * 2 + m.titleHeightPx;
  const gaps = m.rowGapPx * (rowCount - 1);
  const maxAvail = Math.max(0, navBarRect.y - m.topInsetPx) - chromeH - gaps;
  const rowH = Math.max(m.rowMinHeightPx, Math.min(m.rowMaxHeightPx, maxAvail / rowCount));
  const h = chromeH + gaps + rowH * rowCount;
  const top = Math.max(m.topInsetPx, navBarRect.y - h);
  return { rect: { x: navBarRect.x, y: top, w: navBarRect.w, h }, rowH, listY: top + m.padPx + m.titleHeightPx };
}
