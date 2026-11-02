/** Eight grid sockets allow the reference's chamfer without rotating the camera. */
export const DEFENCE_DIRS = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
const CARDINAL = { 0: 'post', 1: 'end', 17: 'straight', 5: 'corner', 21: 'junction', 85: 'cross' };
const QUARTER = Math.PI / 2, COUNT = 8, FULL_MASK = 255;
/** @param {number} x @param {number} y @returns {string} stable key */
export function defenceKey(x, y) { return `${x},${y}`; }
/** @param {Map<string,object>} nodes @param {object} node @returns {number} adjacent sockets without diagonal corner shortcuts */
export function defenceMask(nodes, node) {
  let mask = 0;
  DEFENCE_DIRS.forEach(([dx, dy], i) => {
    if (!nodes.has(defenceKey(node.cx + dx, node.cy + dy))) return;
    if (dx && dy && (nodes.has(defenceKey(node.cx + dx, node.cy)) || nodes.has(defenceKey(node.cx, node.cy + dy)))) return;
    mask |= 1 << i;
  });
  return mask;
}
/** @param {number} mask @returns {{asset:string,rotation:number}} cardinal pieces auto-rotate; chamfers have measured diagonal sockets */
export function resolveDefence(mask) {
  for (let turn = 0; turn < COUNT; turn += 2) {
    const rotated = ((mask >> turn) | (mask << (COUNT - turn))) & FULL_MASK;
    if (CARDINAL[rotated]) return { asset: `wall_${CARDINAL[rotated]}`, rotation: turn / 2 * QUARTER };
  }
  return { asset: `wall_mask_${mask}`, rotation: 0 };
}
