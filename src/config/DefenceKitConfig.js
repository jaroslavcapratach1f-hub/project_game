/** Replaceable Y-up GLB kit. All geometry is authored in base-grid-cell units. */
const modules = import.meta.glob('../../assets/buildings/defence_wall/levels01-06/modular/*.glb', { eager: true, query: '?url', import: 'default' });
export const DEFENCE_KIT = Object.fromEntries(Object.entries(modules).map(([path, url]) => [path.split('/').pop().replace('.glb', ''), url]));
/** Shared levels 1–6 appearance spans existing gameplay tiers 1 and 2. */
export const DEFENCE_KIT_TIERS = { 1: DEFENCE_KIT, 2: DEFENCE_KIT };
