/** Reserve-weighted visual occupancy of the four fixed barracks assembly bays. */
import { ENTITY_COST } from '../config/PersonnelConfig.js';
import { BARRACKS_YARD as C } from '../config/BarracksYardConfig.js';
/** @param {string} cls @returns {{x:number,z:number}[]} local cell-space display positions */
export function barracksYardLayout(cls) {
  if (!cls) return [];
  if (cls === 'infantry') {
    const count = C.bayCount * C.reservePerBay / C.infantryReserve;
    const rows = count / C.infantryColumns, center = (C.bays[0][1] + C.bays[2][1]) / 2;
    return Array.from({ length: count }, (_, i) => ({
      x: (i % C.infantryColumns - (C.infantryColumns - 1) / 2) * C.infantryColumnSpacing,
      z: center + (Math.floor(i / C.infantryColumns) - (rows - 1) / 2) * C.infantryRowSpacing,
    }));
  }
  if (cls === 'superHeavyTank') return [{ x: 0, z: (C.bays[0][1] + C.bays[2][1]) / 2 }];
  // Display occupancy is an art decision, independent of training reserve cost.
  if (C.singleBayClasses.includes(cls)) return C.bays.map(([x, z]) => ({ x, z }));
  const reserve = cls === 'infantry' ? C.infantryReserve : ENTITY_COST[cls];
  if (!reserve) return [];
  if (reserve <= C.reservePerBay) {
    const perBay = Math.floor(C.reservePerBay / reserve), result = [];
    for (const [x, z] of C.bays) for (let i = 0; i < perBay; i++) {
      const dx = perBay === 1 ? 0 : (i % 2 ? 1 : -1) * C.infantrySpacing;
      const dz = perBay === 1 ? 0 : (i < 2 ? -1 : 1) * C.infantrySpacing;
      result.push({ x: x + dx, z: z + dz });
    }
    return result;
  }
  const baysUsed = Math.ceil(reserve / C.reservePerBay), count = Math.floor(C.bayCount / baysUsed);
  return Array.from({ length: count }, (_, i) => ({ x: cls === 'heavyTank' ? Math.sign(C.bays[i][0]) * C.heavySpacing : C.bays[i][0], z: (C.bays[0][1] + C.bays[2][1]) / 2 }));
}
