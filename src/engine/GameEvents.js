/**
 * GameEvents — central registry of event-name string constants. Systems
 * import EVENTS.* instead of hard-coding strings, so a rename is one edit
 * and typos surface as undefined rather than a silently dead listener.
 */
export const EVENTS = {
  // Game state machine
  STATE_CHANGED: 'game:stateChanged',

  // Simulation / render loop
  LOOP_TICK: 'loop:tick',
  LOOP_FPS: 'loop:fps',

  // Input gestures (GDD 02 touch controls)
  INPUT_TAP: 'input:tap',
  INPUT_PAN: 'input:pan',
  INPUT_ZOOM: 'input:zoom',
  INPUT_LONGPRESS: 'input:longpress',

  // Input gestures (Session 3)
  INPUT_DOUBLE_TAP: 'input:doubleTap',
  INPUT_DRAG_START: 'input:dragStart',
  INPUT_DRAG_MOVE: 'input:dragMove',
  INPUT_DRAG_END: 'input:dragEnd',
  INPUT_SWIPE: 'input:swipe',

  // Entities / combat (Session 5-7)
  ENTITY_SPAWNED: 'entity:spawned',
  // { id, amount, type, hp, facing, x, y, team, crit }
  ENTITY_DAMAGED: 'entity:damaged',
  // { id, team, x, y, killerId } — killerId = last unit whose shot hit this one
  // (Entity.lastAttackerId, stamped by ProjectileImpact); null if unknown.
  ENTITY_DIED: 'entity:died',
  // { shooterId, targetId, originX, originY, dmg, pen, aoePx, weapon, angle }
  // MAY also carry optional { targetX, targetY } (world px) — an explicit aim
  // point that overrides target-unit tracking (indirect fire / scatter) —
  // and optional { hexSplash:true } (S71) — indirect fire (howitzer, rocket
  // launcher): splash resolves against whoever is actually standing in the
  // exact impact hex (binary in/out), not a circular aoePx falloff.
  COMBAT_SHOT: 'combat:shot',
  PROJECTILE_IMPACT: 'projectile:impact', // { x, y, weapon, targetId|null, killed }

  // Enemy AI state machine (Session 17)
  AI_STATE_CHANGED: 'ai:stateChanged', // { id, from, to }

  // Fury aggro states (GDD 02) — Field Fury / Base Fury, independent systems
  FURY_FIELD_TRIGGERED: 'fury:fieldTriggered', // { initiatorId, targetId }
  FURY_BASE_TRIGGERED: 'fury:baseTriggered',   // { attackerId }
  FURY_BASE_ENDED: 'fury:baseEnded',           // {}

  // Personnel pool + deployed-squad lifecycle (GDD 06, Session 18)
  PERSONNEL_CHANGED: 'personnel:changed', // { current, max, regenPerTick }
  PERSONNEL_DENIED: 'personnel:denied',   // { requested, available }
  SQUAD_UNIT_STATE: 'squad:unitState',    // { unitId, squadId, from, to }

  // Onslaught — alliance base-defense event (GDD 16 / 19). 10 escalating Legion
  // waves at the player's own base; alliance leader picks the difficulty level.
  ONSLAUGHT_STARTED: 'onslaught:started',             // { levelId, waveCount }
  ONSLAUGHT_WAVE_INCOMING: 'onslaught:waveIncoming',  // { number, total, boss, composition }
  ONSLAUGHT_WAVE_CLEARED: 'onslaught:waveCleared',    // { number, reward }
  ONSLAUGHT_BASE_HP: 'onslaught:baseHp',              // { hp, maxHp, frac } — on rounded-% change
  ONSLAUGHT_ENDED: 'onslaught:ended',                 // { wavesCleared, fullClear, score }

  // Player orders (GDD 02 tactical control)
  ORDER_SELECT: 'order:select',
  ORDER_DESELECT: 'order:deselect',
  ORDER_MOVE: 'order:move',
  ORDER_ATTACK: 'order:attack',
  ORDER_RECALL: 'order:recall',
  ORDER_HOLD: 'order:hold',
  ORDER_FOLLOW: 'order:follow',

  // Player settings (SettingsStore, front-end screens — Session A)
  SETTINGS_CHANGED: 'settings:changed', // { key, value }

  // Loading screen
  LOADING_PROGRESS: 'loading:progress',   // { frac } 0..1
  LOADING_DISMISSED: 'loading:dismissed', // {} — user tapped past "TAP TO BEGIN"

  // Persistent base economy (GDD 04 / 07 — ResourceManager / BaseManager)
  RESOURCE_CHANGED: 'resource:changed',         // { money, steel, oil, materials:{key:n}, rates:{money,steel,oil} per hour }
  BUILDING_PLACED: 'building:placed',           // { id, index, cx, cy, level } — cell-unit centre in the base's square grid; `index` is this building's own true position in BaseManager.buildings (Buildings3D's real per-INSTANCE identity — see its own doc)
  BUILDING_UPGRADED: 'building:upgraded',       // { id, index, level } — instant, no timer (GDD 04)
  POWER_CHANGED: 'power:changed',               // { total } — summed BUILDING_POWER across every active building, on placed/upgraded
  BUILDING_MOVED: 'building:moved',             // { id, index, cx, cy } — drag-relocated to a new cell-unit centre (S54)
  BUILDING_DRAG_STARTED: 'building:dragStarted', // {} — a relocate-drag began (S54); BuildingContext closes any open menu/panel
  BARRACKS_TRANSFORMED: 'barracks:transformed', // { id, index, variant, cls } — militaryBarracks | tankFactory | artilleryFactory

  // View / lifecycle
  RESIZE: 'view:resize',
  VISIBILITY: 'view:visibility',
};
