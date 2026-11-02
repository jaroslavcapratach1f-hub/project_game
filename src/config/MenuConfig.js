/**
 * MenuConfig — palette + geometry for the boot `LoadingScreen` and the reusable
 * `ui/controls/*` widget kit (Button / Slider / Toggle / SegmentedControl) that
 * the future in-world Settings overlay will use. Colours are the CLAUDE.md
 * VISUAL STYLE palette. `LOADING_TIPS` are short GDD-sourced hints on the
 * loader. (The menu / pause / results screens this once configured were deleted
 * in the post-audit rebuild — no menu, no pause, no solo skirmish.)
 *
 * DRAFT: every value is a proposal pending sign-off. Grep "REVIEW".
 */

/** Master front-end tuning. */
export const MENU = {
  title: 'BLITZMIRE',
  // S64: the user's own new "glass/steel" design (BuildingMenuConfig.js's
  // BUILDING_MENU is the source palette), propagated here too — white/
  // silver trim on the same dark grounds, replacing the old gold theme.
  fontFamily: 'Arial Narrow, Impact, sans-serif',

  // Shared palette. Field NAMES kept (gold/goldBright/goldDim — many
  // consumers reference them) even though the VALUES are no longer gold;
  // read them as "idle trim / bright emphasis / dim disabled" slots.
  color: {
    backdrop: 0x0a0a08,    // full-screen ground (matches RENDER.backgroundColor)
    ground: 0x14140f,      // panel / button ground
    glow: 0x2c2a1e,        // faint centre glow over the backdrop (fake vignette)
    panelStroke: 0xe4e5e6, // silver/glass stroke (BUILDING_MENU.glass.stroke)
    gold: 0xe4e5e6,        // idle trim (strokes / secondary text)
    goldBright: 0xffffff,  // bright emphasis (titles / active labels)
    goldDim: 0x9a9a95,     // disabled text
    text: 0xf4f4f0,        // off-white body / value text
    quit: 0xff4500,        // combat orange — destructive action (QUIT)
    confirm: 0x556b2f,     // olive — confirm / toggle-on
    track: 0x2a2a20,       // slider / toggle track ground
    knob: 0xe4e5e6,        // slider / toggle knob
    fill: 0xe4e5e6,        // slider filled portion
  },

  // S58: the loading screen's background is now a real photo (own image
  // per orientation — see LoadingScreen.js), `color.backdrop` kept only as
  // the flash-of-nothing fallback for the instant before it loads. `scrim`
  // is a dark top-to-bottom gradient (ui/ScreenDraw.js buildScrim) drawn
  // over the photo so the gold title/bar/tip text stays legible against a
  // bright, busy image — barely there at the top (let the sky show),
  // strongest at the bottom (where the tip/"TAP TO BEGIN" text sits).
  backdrop: {
    scrimColor: '10,10,8', // MENU.color.backdrop as an r,g,b triplet for the rgba() stops below
    scrimStops: [
      { offset: 0, alpha: 0.12 },
      { offset: 0.4, alpha: 0.38 },
      { offset: 1, alpha: 0.72 },
    ],
  },

  // Rectangular Button (ui/controls/Button.js). Screens stack these vertically
  // with `gapPx` between; press-punch uses `pressScale` + `springEase`.
  button: {
    widthPx: 280, heightPx: 52, gapPx: 16, radiusPx: 6,
    strokeWidthPx: 2, textPx: 17,
    bg: 0x14140f, bgAlpha: 0.9, disabledAlpha: 0.35,
  },
  pressScale: 0.95,
  pressMs: 90,           // scale-down leg of the press-punch
  springEase: 'back.out(2)', // scale-return leg + toggle knob slide

  // Slider + Toggle geometry (ui/controls/Slider.js / Toggle.js).
  control: {
    trackWidthPx: 220, trackHeightPx: 6, trackRadiusPx: 3,
    knobRadiusPx: 11, hitPadPx: 16,
    valueLabelPx: 13, valueGapPx: 14,
    toggleWidthPx: 56, toggleHeightPx: 28, toggleKnobPx: 22, togglePadPx: 3,
    slideMs: 150,        // toggle knob GSAP slide
  },

  // Loading screen (ui/LoadingScreen.js).
  loading: {
    titlePx: 52, titleYFrac: 0.34,     // "BLITZMIRE" size + vertical placement
    barGapPx: 46,                      // title baseline -> progress bar
    barWidthFrac: 0.6, barMaxWidthPx: 480, barHeightPx: 10, barRadiusPx: 5,
    barBg: 0x2a2a20, barFill: 0xe4e5e6, barFillFull: 0xffffff, barBgAlpha: 0.85,
    barFillMs: 220,                    // GSAP ease of the fill toward each frac
    percentPx: 13, percentGapPx: 14,   // "NN%" label under the bar
    tipPx: 13, tipGapPx: 30, tipRotateMs: 3000, tipFadeMs: 400,
    beginText: 'TAP TO BEGIN', beginPx: 16, beginGapPx: 30,
    beginPulseMs: 900, beginMinAlpha: 0.35,
  },

  // Settings panel over a dimmer (ui/SettingsScreen.js — kept for the overlay rework).
  panel: {
    widthPx: 440, maxWidthFrac: 0.92, radiusPx: 8, padPx: 22,
    bg: 0x14140f, bgAlpha: 0.97, stroke: 0xe4e5e6, strokeAlpha: 0.55, strokeWidthPx: 2,
    titlePx: 22, titleGapPx: 22, rowHeightPx: 44, rowGapPx: 12, labelPx: 14,
    dimmer: 0x0a0a08, dimmerAlpha: 0.78, enterMs: 180,
  },

  // Settings screen (ui/SettingsScreen.js / ui/SettingsDraw.js).
  settings: {
    title: 'SETTINGS', doneLabel: 'DONE',
    controlColPx: 248,    // right-hand column width for the Slider / Toggle / Segmented
    doneGapPx: 20,        // last row -> DONE button
  },

  // 3-way enum picker (ui/controls/SegmentedControl.js) — used for graphicsQuality.
  segmented: {
    heightPx: 30, gapPx: 4, radiusPx: 4, textPx: 12,
    onColor: 0x556b2f, offColor: 0x2a2a20, onTextColor: 0xf4f4f0, offTextColor: 0x9a9a95,
  },
};

/**
 * Loading-screen hints. Short, GDD-sourced (combat model / core pillars);
 * cross-faded one at a time every `MENU.loading.tipRotateMs`.
 */
export const LOADING_TIPS = [
  'Flank the enemy in the rear arc for full penetration.',
  'Personnel regenerates — losses are recoverable.',
  'Artillery deals double damage against infantry.',
  'Base Fury lingers two minutes after the last attacker leaves.',
  'Units stay CALM until you give the first order.',
  'Send a damaged unit to base and it walks home to heal.',
];
