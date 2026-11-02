/**
 * aiState — the enemy AI state-machine state names, in their own file so
 * AIController, AIStates, AIManager and the UI indicator can all share the enum
 * without a circular import.
 *
 *   IDLE   -> PATROL -> ALERT -> ENGAGE -> RETREAT   (see AIController)
 */

/** @enum {string} */
export const AI_STATE = {
  IDLE: 'IDLE',
  PATROL: 'PATROL',
  ALERT: 'ALERT',
  ENGAGE: 'ENGAGE',
  RETREAT: 'RETREAT',
};
