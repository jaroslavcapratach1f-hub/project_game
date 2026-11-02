/**
 * WorldMapConfig — the single persistent world map (the game IS this scene).
 * The map is a flat-top HEX grid: an axial rectangle q∈[0,cols), r∈[0,rows).
 * All movement — marches, troops, AI — paths on this grid (see utils/Hex.js) so
 * the whole game moves the same way. The player base sits on `baseHex` — the
 * base's own SQUARE build grid lives in BaseGridConfig.js.
 *
 * Base LOD (GDD 24, see BaseSite + worldmap/HqView.js): the compound's
 * FOOTPRINT is drawn at its TRUE, FIXED world size always — it never
 * independently rescales, it just gets bigger on screen as the camera zooms
 * in, same as terrain or a unit. The one exception is the Headquarters
 * itself: it renders at EVERY zoom (never swapped for an icon), oversized at
 * `lod.hqFarScale` and shrinking down to its true size (1) as `lod.
 * buildingBand` climbs — the reference video's "HQ stands in for the whole
 * base, then shrinks in place as the rest reveals". Walls solidify early in
 * that band (`wallRevealFrac`); the dotted `territoryRadiusPx` ring (the same
 * fixed footprint, drawn as a placeholder before the walls take over) fades
 * out over `ringFadeFrac`; the remaining buildings stagger-reveal across
 * `buildingStart`.. `buildingStart+buildingSpread`. `lod.pinBand` is now only
 * the zoomed-out garrison-pip-hint (BaseTroops) <-> real-troops crossfade.
 *
 * DRAFT / REVIEW — every number is a proposal.
 */
import { STARTING_PLOT_HALF } from './BaseConfig.js';
import { axialToPixel, axialRectPixelBounds, rOffset } from '../utils/Hex.js';
import { radius1Hex, resolvePattern } from '../world/HexFootprint.js';
import { PIN } from './BasePinConfig.js';

const HEX_SIZE = 110;              // hexagon centre-to-corner, world px (flat-top)
const COLS = 100;                  // axial q extent
const ROWS = 100;                  // per-column axial r window (rectangular layout)
const BOUNDS = axialRectPixelBounds(COLS, ROWS, HEX_SIZE);
const BASE_HEX = { q: COLS >> 1, r: (ROWS >> 1) + rOffset(COLS >> 1) };
// S72: the base sits dead-centre on BASE_HEX's own true axial pixel — no
// sub-hex nudge (supersedes S70's BASE_OFFSET hack, which existed only to
// chase 4 equal wall-to-hex ratios at the OLD, oversized wall footprint).
// Now that the player has explicitly allowed resizing the compound itself
// (BaseGridConfig.CELL_PX shrunk to fit — see that file's own doc), the
// whole problem this offset existed to work around is gone: the wall is
// sized so its outline sits exactly inside BASE_TERRITORY_HEXES below, with
// no offset needed to make it fit well.
const BASE_CENTRE = axialToPixel(BASE_HEX.q, BASE_HEX.r, HEX_SIZE);
// S72: the player's own locked base territory — the centre hex (dead centre
// of the compound) plus its 6 immediate neighbours, 7 hexes total, fixed
// regardless of HQ level (only the INTERIOR build grid grows with HQ level,
// never this external world-map footprint — same rule S55/S70 already
// established). CELL_PX is tuned (BaseGridConfig.js) so the wall's outline
// sits exactly inside this set, touching its boundary; defence trenches
// (DEFENCE.trenchOffset, cell-unit, unchanged) are allowed to extend past it
// into the 8th-ring hexes — that's dressing, not territory. FORWARD: this is
// the set the base-attack system (S71 scoping) checks a troop's hex against
// to trigger an attack on this base.
const BASE_TERRITORY_HEXES = resolvePattern(BASE_HEX, radius1Hex());
// Territory ring: a circle circumscribing the (rectangular) starting plot,
// times a multiple. Static at boot — see BaseGridConfig.js header.
const TERRITORY_FRAC = 2.3;
const TERRITORY_R = Math.hypot(STARTING_PLOT_HALF.hw, STARTING_PLOT_HALF.hh) * TERRITORY_FRAC;

export const WORLDMAP = {
  // Hex grid.
  orientation: 'flat',
  hexSize: HEX_SIZE,
  cols: COLS,
  rows: ROWS,
  widthPx: BOUNDS.width,
  heightPx: BOUNDS.height,

  // Camera. At minZoom the terrain still overfills a desktop viewport (the flat
  // ground backdrop covers any remainder); maxZoom stands you among the buildings.
  minZoom: 0.12,
  maxZoom: 2.5,
  nearZoom: 1.1,   // Home button — stand in the compound
  farZoom: 0.22,   // World button — the strategic map
  startZoom: 1.0,  // boot into the base view (near), like the reference

  // Continuous level-of-detail (BaseSite._syncLod → setBlend), NOT a threshold:
  //   pinBand        the zoomed-out garrison-pip-hint (BaseTroops) fades out
  //                  as real marchable squads take over — no visual swap.
  //   buildingBand   the HQ shrink + wall/building/territory-ring reveal (see
  //                  the file header). hqFarScale is the HQ's oversized
  //                  world-scale at buildingBand[0]; the rest are fractions
  //                  OF that band (0 = band start, 1 = band end).
  lod: {
    pinBand: [0.34, 0.46],
    buildingBand: [0.40, 1.0],
    // S54: was 3.0 — at that scale HQ's own 7x8 footprint (half-extents
    // 3.5x4 cells) grows past the STARTING 18x22 plot's own wall (half-
    // extents 9x11 cells, HQ seeded at cx=0.5,cy=0 — BaseConfig.STARTING_
    // LAYOUT), overlapping the perimeter instead of stopping at it. Capped
    // to the tightest of the two axes: min((9-0.5)/3.5, (11-0)/4) = 2.4286,
    // rounded down for a visible margin so HQ's oversized silhouette
    // reads as "the base, at a distance" without ever touching the wall.
    // Static, like the plot itself (BaseGridConfig.js — re-growth mid-
    // session isn't wired) — revisit if HQ's footprint, seed position, or
    // the starting plot size ever change.
    hqFarScale: 2.4,
    wallRevealFrac: 0.38,
    ringFadeFrac: 0.4,
    buildingStart: 0.30,
    buildingSpread: 0.55,
  },
  territoryRadiusPx: TERRITORY_R, // dotted claim ring — no other base/object inside it
  territory: {
    dashPx: 14, gapPx: 10, widthPx: 3, color: 0xe8e4d6, alpha: 0.8,
  },
  // S70: every hex tile outline on the world map, always visible
  // (WorldHexGrid — the player's own explicit ask).
  worldHexGrid: { strokeColor: 0xe8e4d6, strokeWidthPx: 1, strokeAlpha: 0.35 },
  // S75: a locked base's own 7-hex territory, filled as ONE continuous
  // shape (HexClusterOutline — not 7 individually-outlined hexagons) and
  // drawn AFTER worldHexGrid on the same layer, so it visually paves over
  // the ordinary grid lines specifically within a base's own territory —
  // the compound's own 3D ground doesn't reach every outer hex corner (a
  // rounded compound shape vs. a hex-cluster shape), so without this the
  // grid read as "7 separate sections" instead of one locked plot (the
  // player's own report). Fill colour matches the compound's own clearing
  // tone so it blends in rather than standing out as a separate patch.
  baseTerritoryGround: { fillColor: 0x6f8f35, fillAlpha: 0.5, strokeColor: 0xe8e4d6, strokeWidthPx: 2, strokeAlpha: 0.55 },

  // Flat ground behind the hex tiles so panning to the map edge never shows
  // black (WorldTerrain draws one oversized rect of this colour on LAYERS.SKY).
  ground: { color: 0x4a5d23 },

  // Real hex terrain (GDD 17). worldmap/worldTerrainGen.js paints every tile of
  // WorldField's grid from two fbm layers sampled in WORLD PIXELS: an elevation
  // field (low -> water, high -> hills) and a forest field. Keep-clear circles
  // (base compound + muster + Onslaught approach, Legion camp) force grass so
  // units never spawn stuck. WorldTerrain renders each hex by its tile type.
  // FORWARD: roads, sectors, resource fields, Marauder camps as map objects.
  terrain: {
    seed: 6041,
    elevFreq: 0.00042,   // fbm sample step per world px for the elevation field
    elevOctaves: 4,
    waterBelow: 0.30,    // elevation < this -> water
    hillsAbove: 0.74,    // elevation > this -> hills
    forestSeed: 9173,
    forestFreq: 0.00075,
    forestAbove: 0.60,   // forest-field value > this -> forest (grass/hills only)
    clearBaseRadiusPx: 1500, // grass around baseCentre (base + muster + approach)
    clearCampRadiusPx: 420,  // grass around the Legion camp centre
  },

  // Solid map objects — WorldField.blockDisc/blockPolygon stamp their tiles
  // impassable so marches path AROUND them and a drag-drop onto one snaps to
  // the nearest open tile (nearestOpen). GDD-17 resource fields / Marauder
  // camps call blockDisc the same way. The player base itself uses
  // blockPolygon against its own true diamond wall footprint (S55 —
  // WorldScene._blockObstacles, BaseGridConfig.plotCorners/gateAnchorAt) —
  // a circular approximation either left corner gaps troops could walk
  // through into the base, or bulged past the flat edges, blocking open
  // ground outside the wall that should be walkable.
  obstacles: {
    plotBlockPx: 150,     // block radius around each neighbour base
    snapMaxRings: 6,      // nearestOpen: give up after this many hex rings
  },

  // The player base sits on this hex. `baseCentre` is the compound centre in
  // world px — BaseGridView / HqView / BaseTroops anchor there; the base's
  // own rectangular plot size (BaseGridConfig.plotSizePx) is level-driven.
  baseHex: BASE_HEX,
  baseCentre: { x: BASE_CENTRE.x, y: BASE_CENTRE.y },
  // S72: the 7 locked territory hexes (centre + ring) — see its own doc above.
  baseTerritoryHexes: BASE_TERRITORY_HEXES,

  // Neighbour bases: an axial offset from `baseHex` + a label; the same fort
  // icon with a neutral brown wall. Slice 3 makes these tappable map objects.
  neighbourHexes: [
    { dq: -20, dr: -6, name: 'Volkov', level: 6 },
    { dq: 18, dr: -14, name: 'Kepler', level: 4 },
    { dq: -16, dr: 16, name: 'Aomori', level: 5 },
    { dq: 15, dr: 12, name: 'Sable', level: 7 },
  ],
  plot: {
    sizePx: 176, isoSquash: 0.56,
    ground: 0x3e3a2c, rim: 0x1c1a12,
    wall: 0xa88f6d, wallShade: 0x574636, wallWidthPx: 13, wallHeightPx: 24, gateFrac: 0.34,
    towerW: 36, towerHeightPx: 32, towerTop: 0x8f8f7c, towerSide: 0x3a3a30,
    bldDX: 70, bldDY: -6, bldW: 36, bldHeightPx: 24, bldTop: 0x747462, bldSide: 0x35352b,
    keepW: 78, keepH: 56, keepHeightPx: 42, keepTop: 0x6f5c46, keepSide: 0x3a3025,
    shadow: 0x000000, shadowAlpha: 0.32, shadowOffsetPx: 12,
    labelPx: 40, labelGapPx: 22, labelColor: 0xc5a55a, fontFamily: 'monospace',
  },

  pin: PIN, // S57 locked battlefield-vs-map pin-icon swap — see BasePinConfig.js
};
