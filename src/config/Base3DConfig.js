/**
 * Base3DConfig — the locked camera frame (GDD 24) expressed as a real 3D
 * camera instead of hand-rolled 2D diamond math. `utils/SquareGrid.js`'s
 * `ISO_RATIO = sin(30°)` and this camera's `pitchDeg`/`azimuthDeg` describe
 * the SAME projection — this file is the live-3D side, SquareGrid the 2D
 * side; they must never drift apart (see `THREE_TO_GRID_SCALE` below, which
 * ties a 3D scene unit to one `BaseGridConfig.CELL_PX`).
 */
export const BASE3D = {
  // Locked frame (GDD 24 "THE LOCKED FRAME"): 30° pitch, azimuth chosen so
  // grid +cx/+cy read the same screen directions as SquareGrid's diamond.
  pitchDeg: 30,
  azimuthDeg: 45,
  fovDeg: 11, // near-orthographic — matches the model-viewer captures' own FOV

  // One 3D scene unit == one grid cell (BaseGridConfig.CELL_PX px at zoom 1).
  // cameraScale is the derived projection constant (1/sqrt(2)) that makes a
  // 1-cell 3D-space step land exactly on a 1-cell SquareGrid step on screen
  // — see Base3DLayer.js for the derivation.
  cameraScale: 1 / Math.SQRT2,

  lightColor: 0xfff2d9, // warm ~5000K key (CLAUDE.md lighting spec)
  lightIntensity: 12, // three.js r155+ physically-correct lighting needs much higher values than the old default
  lightElevationDeg: 45,
  lightAzimuthDeg: -35, // upper-left key, matches GDD 24
  ambientColor: 0xb9c9d6, // cool ambient fill
  ambientIntensity: 6.5, // lifted (S54) — buildings were reading dark/muddy against CLAUDE.md's "bright, clean daylight" spec
  lightDistance: 500, // scene units the key light sits out along its direction
  toneMappingExposure: 1.45, // lifted alongside ambientIntensity, same reason

  // S58: was nearPlane 0.1 / farPlane 4000, tuned only for objects near
  // scene origin (the player's own compound). Base3DLayer.update()'s
  // depth-stripping trick keeps the CAMERA'S OWN look-at target always
  // exactly `distance` (1000) from the camera, but a building far from
  // scene origin (a neighbour compound elsewhere on the persistent map —
  // NeighbourCompound3D.js) does NOT sit at that stripped depth — its
  // OWN depth-along-view-direction grows with how far its world position
  // is from WORLDMAP.baseCentre. Measured empirically (in-browser) across
  // the whole persistent map's corners: forward depth ranges roughly
  // -15335..+17500 depending on pan DIRECTION (negative = literally
  // behind the camera at the old nearPlane, not just far away — a bigger
  // farPlane alone can't fix that half). Widened symmetrically to comfortably
  // cover the whole map with margin; safe for an ORTHOGRAPHIC camera
  // specifically — depth precision is linear here (no perspective 1/z
  // bunching near the near-plane), so this range costs nothing in z-fighting
  // risk, unlike widening a perspective camera's frustum would.
  nearPlane: -20000,
  farPlane: 20000,
  degPerHalfTurn: 180, // deg<->rad conversion divisor
};
