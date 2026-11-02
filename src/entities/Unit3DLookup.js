/**
 * Unit3DLookup — the one place every 3D-bodied view resolves a `UNIT_3D`
 * entry from a live entity, so the priority order can't drift out of sync
 * between EntityView / DeployableView / InfantrySquadView (three separate
 * call sites before this, each duplicating the same lookup).
 *
 * S61: an `entity.team === 'enemy'` unit checks `enemy:${cls}` FIRST — the
 * Legion's own dark-blue reuse of the established USA meshes (see
 * Unit3DConfig.js) — before falling back to its own `faction:cls` / bare
 * `cls`. This is keyed on TEAM, not faction: Legion currently fields
 * germany-pattern stat rows (OnslaughtConfig's own `legionFaction`), but a
 * future PLAYER-controlled Germany unit must still read as Germany, not
 * inherit the enemy's blue paint just because the stat row matches.
 */
import { UNIT_3D } from '../config/Unit3DConfig.js';

/**
 * @param {?import('../engine/Unit3DLayer.js').Unit3DLayer} unit3D falsy disables every live-3D lookup (e.g. loading)
 * @param {{team?:string, faction:string, cls:string}} entity
 * @returns {?object} a UNIT_3D entry, or undefined when none applies (2D fallback)
 */
export function resolveUnit3D(unit3D, entity) {
  if (!unit3D) return undefined;
  if (entity.team === 'enemy') {
    const enemyCfg = UNIT_3D[`enemy:${entity.cls}`];
    if (enemyCfg) return enemyCfg;
  }
  return UNIT_3D[`${entity.faction}:${entity.cls}`] ?? UNIT_3D[entity.cls];
}
