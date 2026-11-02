/**
 * Unit3DConfig — live-3D unit assets keyed by `${faction}:${cls}`, matching
 * EntityView and the HUD's unit-label convention. Each tank supplies separate
 * hull/turret GLBs and a raw SOURCE-space ring pivot. Unit3DBody applies the
 * same facing correction, scale and hull centering to that pivot as to the
 * hull; the turret GLB is already centered on the ring. Never pre-offset the
 * config pivot by the hull's floor or center.
 *
 * Asset packets follow assets/units/<roster_key>/tier01 with repeatable
 * preparation under source/. USA green / Germany gray / Russia red is the
 * project faction-paint convention. Both USA tanks use the existing BaseTank
 * simulation and shared Unit3DBody; no per-model behavior code is needed.
 */
import shermanHullUrl from '../../assets/units/m4_sherman/tier01/m4_sherman_hull.glb';
import shermanTurretUrl from '../../assets/units/m4_sherman/tier01/m4_sherman_turret.glb';
import chaffeeHullUrl from '../../assets/units/m24_chaffee/tier01/m24_chaffee_hull.glb';
import chaffeeTurretUrl from '../../assets/units/m24_chaffee/tier01/m24_chaffee_turret.glb';
import infantryUrl from '../../assets/units/us_infantry/tier01/soldier.glb';
import infantryTorsoUrl from '../../assets/units/us_infantry/tier01/torso.glb';
import infantryLegLUrl from '../../assets/units/us_infantry/tier01/leg_l.glb';
import infantryLegRUrl from '../../assets/units/us_infantry/tier01/leg_r.glb';
import howitzerUrl from '../../assets/units/m12_gmc/tier01/howitzer.glb';
import pershingUrl from '../../assets/units/m26_pershing/tier01/m26_pershing_hull.glb';
import pershingTurretUrl from '../../assets/units/m26_pershing/tier01/m26_pershing_turret.glb';
import hellcatUrl from '../../assets/units/m18_hellcat/tier01/m18_hellcat.glb';
import mausHullUrl from '../../assets/units/super_heavy/tier01/maus_hull.glb';
import mausTurretUrl from '../../assets/units/super_heavy/tier01/maus_turret.glb';
// S61: the Legion's (enemy team) own pre-recolored siblings — see
// assets/units/_enemy_tint/recolor_enemy.py's own doc for why the paint
// has to be baked into the texture rather than tinted at runtime.
import shermanHullEnemyUrl from '../../assets/units/m4_sherman/tier01/m4_sherman_hull_enemy.glb';
import shermanTurretEnemyUrl from '../../assets/units/m4_sherman/tier01/m4_sherman_turret_enemy.glb';
import chaffeeHullEnemyUrl from '../../assets/units/m24_chaffee/tier01/m24_chaffee_hull_enemy.glb';
import chaffeeTurretEnemyUrl from '../../assets/units/m24_chaffee/tier01/m24_chaffee_turret_enemy.glb';
import pershingEnemyUrl from '../../assets/units/m26_pershing/tier01/m26_pershing_hull_enemy.glb';
import pershingTurretEnemyUrl from '../../assets/units/m26_pershing/tier01/m26_pershing_turret_enemy.glb';
import hellcatEnemyUrl from '../../assets/units/m18_hellcat/tier01/m18_hellcat_enemy.glb';
import howitzerEnemyUrl from '../../assets/units/m12_gmc/tier01/howitzer_enemy.glb';
import infantryTorsoEnemyUrl from '../../assets/units/us_infantry/tier01/torso_enemy.glb';
import infantryLegLEnemyUrl from '../../assets/units/us_infantry/tier01/leg_l_enemy.glb';
import infantryLegREnemyUrl from '../../assets/units/us_infantry/tier01/leg_r_enemy.glb';

export const UNIT_3D = {
  'germany:superHeavyTank': {
    // Basic five-star Maus: museum-referenced silhouette, grey faction paint.
    // UV-preserving skirt split leaves hull armour and deck fittings fixed.
    hullUrl: mausHullUrl,
    turretUrl: mausTurretUrl,
    turretPivotLocal: { x: -0.000609515873, y: 0.035, z: -0.215817722833 },
    fitAxis: 'z',
    rotationYDeg: 90, // source front +Z -> runtime forward +X
    hullLengthWorldPx: 160,
    preserveMaterialColor: true,
  },
  'usa:tankHunter': {
    // The user's own explicit call: this class's gun is a fixed casemate
    // mount, not an independent turret (unitRoles.js's own `noTurret: true`
    // already drives the sim this way — M18Hellcat.js aims the whole hull).
    // Intact single-mesh export, same no-split path `usa:howitzer` and
    // `usa:heavyTank` (pre-split) already used — UnitMeshFactory hands back
    // a harmless empty turretPivot whenever turretUrl is omitted, so the
    // shared Unit3DBody/EntityView plumbing needs no changes.
    hullUrl: hellcatUrl,
    preserveMaterialColor: true,
    fitAxis: 'z',
    // Source barrel/hull front is +Z (same as the Pershing) — Ry(+90°)
    // normalizes it to the shared runtime +X forward.
    rotationYDeg: 90,
    // ~1.35x the 2D placeholder's effective hullPx (EntityConfig.js
    // hullPx=68 * scaleByClass.tankHunter=1.1), the same ratio every other
    // on-map unit's hullLengthWorldPx already uses.
    hullLengthWorldPx: 101,
  },
  'usa:heavyTank': {
    // Skirt split keeps rear log, deck, fenders and lamps attached to hull.
    hullUrl: pershingUrl,
    turretUrl: pershingTurretUrl,
    turretPivotLocal: { x: 0.000706329534, y: 0.055, z: -0.106018742084 },
    fitAxis: 'z',
    // Source barrel/hull front is +Z (opposite the Sherman/Chaffee's -Z) —
    // Ry(+90°) normalizes it to the shared runtime +X forward.
    rotationYDeg: 90,
    // ~1.35x the 2D placeholder's effective hullPx (EntityConfig.js
    // hullPx=68 * scaleByClass.heavyTank=1.25), the same ratio every other
    // on-map unit's hullLengthWorldPx already uses.
    hullLengthWorldPx: 115,
  },
  'usa:howitzer': {
    hullUrl: howitzerUrl,
    fitAxis: 'x',
    rotationYDeg: 180, // supplied muzzle -X -> runtime +X
    hullLengthWorldPx: 80, // complete carriage + barrel; current Sherman hull is 92
  },
  'usa:lightTank': {
    hullUrl: chaffeeHullUrl,
    turretUrl: chaffeeTurretUrl,
    // Source-space ring centre from the Chaffee's own inspected skirt cut.
    turretPivotLocal: { x: 0.001376673983, y: 0.075, z: 0.080184950065 },
    rotationYDeg: -90, // source nose -Z -> shared runtime +X forward
    hullLengthWorldPx: 78.2, // S57: doubled from 39.1 alongside every other on-map unit (still 85% of the Sherman's own doubled hull)
  },
  'usa:mediumTank': {
    hullUrl: shermanHullUrl,
    turretUrl: shermanTurretUrl,
    // Source-space ring centre from source/split_turret.py. The mesh's
    // turret skirt is at Y=0.075; hull deck and rear stowage stay fixed.
    turretPivotLocal: { x: -0.000169324409, y: 0.075, z: 0.070367523142 },
    // Source barrel/hull front is -Z. Ry(-90°) normalizes it to +X;
    // Unit3DLayer then maps each world heading to Three's Y rotation.
    rotationYDeg: -90,
    // Target for the HULL's own local-Z extent (its natural long axis) —
    // world px, converted to scene units the same way `cellToScene` converts
    // grid cells (`* BASE3D.cameraScale`). ~1.35x the 2D placeholder's
    // hullPx=34 (EntityConfig.js) so the body reads a bit longer than a
    // square, same proportions a real tank hull has; the turret/barrel
    // extend beyond it on their own, same as the 2D barrelLenPx overhang.
    // S57: doubled from 46 alongside every other on-map unit.
    hullLengthWorldPx: 92,
  },
  'usa:infantry': {
    // hullUrl (the ORIGINAL, unsplit static pose) is used ONLY by
    // UnitMeshFactory/UnitIconRenderer for the SquadBar portrait — that
    // path is unchanged and doesn't need to know about the leg split
    // below. fitAxis: fit by standing HEIGHT, not length — a person's
    // natural dimension, unlike a tank's hull.
    hullUrl: infantryUrl,
    fitAxis: 'y',
    // +90 read backwards in-game (soldiers walked away from their own
    // facing) despite looking plausible in a static screenshot — flipped
    // 180° from that. Source front is -Z; Ry(-90°) normalizes it to +X.
    rotationYDeg: -90,
    // Real soldier ~1.8m; matches the tanks' own real-world scale (Sherman
    // hullLengthWorldPx=92 for its real ~6m hull -> ~15.3px/m). S57: doubled
    // from 14 alongside every other on-map unit.
    hullLengthWorldPx: 28,

    // --- S56 walk-cycle rig (InfantryMeshFactory/SoldierBody3D only) ---
    // The single static-pose mesh above has no skeleton, so real leg
    // movement needed real geometry: the asset packet's documented trimesh split
    // found a genuine gap between the two feet/shins right up through
    // the model's own thigh region and cut the mesh into a static torso
    // + two independently-pivoting leg pieces at that gap. legL is the
    // forward-stepping leg (source +Z), legR the trailing one.
    torsoUrl: infantryTorsoUrl,
    legLUrl: infantryLegLUrl,
    legRUrl: infantryLegRUrl,
    // Hip-joint pivots, RAW mesh space (pre scale/rotation) — go through
    // the exact transform chain a hull vertex does, same contract as
    // turretPivotLocal above.
    legLPivotLocal: { x: -0.055000000000, y: -0.185869927461, z: 0.112000000000 },
    legRPivotLocal: { x: 0.040000000000, y: -0.187334883631, z: -0.048000000000 },
    // The split leg exports retain their upper edge at Y≈0.02 while the
    // torso's lower hip edge is Y≈-0.19. Pull each piece down to its hip
    // pivot before mounting; otherwise only the shin remains visible.
    legLTopY: 0.019313344732,
    legRTopY: 0.014378342777,
    legHeightScale: 1.2,
    hipRadiusWorld: 1,
    hipWidth: 1.35,
    hipHeight: 0.65,
    hipDepth: 1.05,
    // The ORIGINAL unsplit mesh's own bounds — torso
    // alone can't supply these (its own box excludes the legs' feet/floor
    // and is off-centre in Z), so they're precomputed once here and
    // shared by all three pieces, the same role hullBox plays for a tank.
    bodyCentreX: -0.000342, bodyCentreZ: 0.002433, bodyFloorY: -0.500255, bodyHeightRaw: 0.999527,
  },
};

// S61: the Legion (enemy team) reuses these SAME established models —
// same geometry, scale, pivots, rotation — under its own pre-recolored
// dark-blue textures (`*_enemy.glb`, see recolor_enemy.py's own doc: a
// runtime multiply tint can't work here, blue is the weakest channel in
// every one of these all-olive source textures). Unit3DLookup checks
// `enemy:${cls}` before a faction-keyed entry, so this is keyed on TEAM,
// not on the `germany` stat-row Legion currently fields (OnslaughtConfig's
// own `legionFaction`) — a future player-controlled Germany unit must
// still read as Germany, not inherit this paint just because its stat row
// matches. Every field except the URLs is copied UNCHANGED from the
// matching `usa:*` entry — same fit/rotation/pivot math applies either
// way. `enemy:atGun` (pak40) has no class-matching mesh of its own — the
// howitzer carriage is the closest existing shape/scale stand-in.
Object.assign(UNIT_3D, {
  'enemy:infantry': {
    ...UNIT_3D['usa:infantry'],
    torsoUrl: infantryTorsoEnemyUrl, legLUrl: infantryLegLEnemyUrl, legRUrl: infantryLegREnemyUrl,
  },
  'enemy:lightTank': { ...UNIT_3D['usa:lightTank'], hullUrl: chaffeeHullEnemyUrl, turretUrl: chaffeeTurretEnemyUrl },
  'enemy:mediumTank': { ...UNIT_3D['usa:mediumTank'], hullUrl: shermanHullEnemyUrl, turretUrl: shermanTurretEnemyUrl },
  'enemy:heavyTank': { ...UNIT_3D['usa:heavyTank'], hullUrl: pershingEnemyUrl, turretUrl: pershingTurretEnemyUrl },
  'enemy:tankHunter': { ...UNIT_3D['usa:tankHunter'], hullUrl: hellcatEnemyUrl },
  'enemy:atGun': { ...UNIT_3D['usa:howitzer'], hullUrl: howitzerEnemyUrl },
});
