/** Four physical assembly bays; visual occupancy does not change combat reserve costs. */
export const BARRACKS_YARD = {
  reservePerBay: 4, infantryReserve: 1, bayCount: 4,
  bays: [[-0.86, 0.05], [0.86, 0.05], [-0.86, 1.23], [0.86, 1.23]],
  infantrySpacing: 0.17, floorY: 0.008, displayScale: 0.58,
  referenceCellPx: 42, // display sizes were authored for this cell scale
  infantryScale: 0.84, infantryColumns: 4, infantryColumnSpacing: 0.76, infantryRowSpacing: 0.56,
  singleBayClasses: ['tankHunter', 'howitzer'],
  rotationY: 0, facingY: 0,
  faction: 'usa', superHeavyBays: 4, heavySpacing: 0.96,
  superHeavyFaction: 'germany',
};
