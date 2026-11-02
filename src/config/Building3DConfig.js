/**
 * Building3DConfig — the live-3D building registry (S54). Each entry names
 * a building already converted from a pre-rendered 2D sprite to a real GLB
 * model rendered live via `Base3DLayer` (see `Building3DView.js` /
 * `Buildings3D.js`). Adding a building here — and dropping its
 * `BuildingArtConfig` `sprite` entry — is the whole "port this building to
 * 3D" step; nothing else needs a per-building special case.
 */
import { footprintOf } from './BaseGridConfig.js';
import { WORLDMAP } from './WorldMapConfig.js';
import hqModelUrl from '../../assets/buildings/hq/levels01-06/timber_headquarters.glb';
import barracksModelUrl from '../../assets/buildings/barracks/levels01-06/reference_barracks.glb';
import treasuryModelUrl from '../../assets/buildings/treasury/levels01-06/treasury.glb';
import steelworksModelUrl from '../../assets/buildings/steelworks/levels01-06/steelworks.glb';
import crudeOilModelUrl from '../../assets/buildings/crude_oil/levels01-06/crude_oil.glb';
import engineeringModelUrl from '../../assets/buildings/engineering/levels01-06/engineering.glb';
import researchCenterModelUrl from '../../assets/buildings/research_center/levels01-06/research_center.glb';
import armoryModelUrl from '../../assets/buildings/armory/levels01-06/armory.glb';
import partsWorkshopModelUrl from '../../assets/buildings/parts_workshop/tier01/parts_workshop.glb';
import disassembleModelUrl from '../../assets/buildings/disassemble/levels01-06/disassemble.glb';
import assemblyModelUrl from '../../assets/buildings/assembly/tier01/assembly.glb';
import officerBarracksModelUrl from '../../assets/buildings/officer_barracks/levels01-06/officer_barracks.glb';
import reservesBarracksModelUrl from '../../assets/buildings/reserves_barracks/tier01/reserves_barracks.glb';

export const BUILDING_3D = {
  headquarters: {
    visualLevels: { min: 1, max: 6 },
    url: hqModelUrl,
    footprint: footprintOf('headquarters'),
    // Authored entrance is local +Z; face the compound gate on grid +X.
    rotationYDeg: 90,
    // Always visible, even at far zoom (it stands in for the whole base) —
    // oversized there, shrinking to true size as the compound reveals.
    farScale: WORLDMAP.lod.hqFarScale,
  },
  barracks: {
    visualLevels: { min: 1, max: 6 },
    url: barracksModelUrl,
    footprint: footprintOf('barracks'),
    // Authored +Z yard faces screen-left; rear building reads on the right.
    rotationYDeg: 0,
    // Invisible at far zoom, grows to true size with the rest of the
    // compound — a normal building, not the HQ's always-visible centerpiece.
    farScale: 0,
  },
  treasury: {
    visualLevels: { min: 1, max: 6 },
    url: treasuryModelUrl,
    footprint: footprintOf('treasury'),
    // The timber treasury entrance is authored on +X, toward the compound gate.
    rotationYDeg: 0,
    farScale: 0,
  },
  steelworks: {
    visualLevels: { min: 1, max: 6 },
    url: steelworksModelUrl,
    footprint: footprintOf('steelworks'),
    // Open forge faces lower-right (+X) in the gameplay camera.
    rotationYDeg: 0,
    farScale: 0,
  },
  crude_oil: {
    visualLevels: { min: 1, max: 6 },
    url: crudeOilModelUrl,
    footprint: footprintOf('crude_oil'),
    // Metal pumpjack and timber service plant; +X frontage.
    rotationYDeg: 0,
    farScale: 0,
  },
  engineering: {
    visualLevels: { min: 1, max: 6 },
    url: engineeringModelUrl,
    footprint: footprintOf('engineering'),
    // +Z authored open frontage turns toward lower-right; retain 3x4 fit.
    rotationYDeg: 90,
    farScale: 0,
  },
  research_center: {
    visualLevels: { min: 1, max: 6 },
    url: researchCenterModelUrl,
    footprint: footprintOf('research_center'),
    // Timber Academy: authored +Z entrance faces lower-right.
    rotationYDeg: 90,
    farScale: 0,
  },
  armory: {
    visualLevels: { min: 1, max: 6 },
    url: armoryModelUrl,
    footprint: footprintOf('armory'),
    // User's own "turn 90 degrees" from the unverified 0 starting guess.
    rotationYDeg: 90,
    farScale: 0,
  },
  parts_workshop: {
    url: partsWorkshopModelUrl,
    footprint: footprintOf('parts_workshop'),
    // First pass, unverified — own arbitrary front, empirically corrected
    // in-browser same as every other building (TODO: confirm/adjust).
    rotationYDeg: 0,
    farScale: 0,
  },
  disassemble: {
    visualLevels: { min: 1, max: 6 },
    url: disassembleModelUrl,
    footprint: footprintOf('disassemble'),
    // Authored +Z dismantling bay faces lower-right.
    rotationYDeg: 90,
    farScale: 0,
  },
  assembly: {
    url: assemblyModelUrl,
    footprint: footprintOf('assembly'),
    // User tried "turn 90 degrees" then "turn back" — reverted to the
    // original 0 starting guess.
    rotationYDeg: 0,
    farScale: 0,
  },
  officer_barracks: {
    visualLevels: { min: 1, max: 6 },
    url: officerBarracksModelUrl,
    footprint: footprintOf('officer_barracks'),
    // Authored +Z recruitment entrance faces lower-right.
    rotationYDeg: 90,
    farScale: 0,
  },
  reserves_barracks: {
    url: reservesBarracksModelUrl,
    footprint: footprintOf('reserves_barracks'),
    // First pass, unverified — own arbitrary front, empirically corrected
    // in-browser same as every other building (TODO: confirm/adjust).
    rotationYDeg: 0,
    farScale: 0,
  },
};
