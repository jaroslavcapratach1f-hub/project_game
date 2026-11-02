/**
 * Kar98kSquad — Germany 4★ infantry, basic bolt-action rifle squad. Thin
 * InfantrySquad subclass; every stat resolves from the `kar98k_squad` row via
 * squadConfigFromRow. No behaviour code.
 */
import { InfantrySquad } from './InfantrySquad.js';
import { INFANTRY } from '../../config/UnitStats.js';
import { squadConfigFromRow } from './squadConfig.js';

const KEY = 'kar98k_squad';

export class Kar98kSquad extends InfantrySquad {
  /** @param {object} spawn { id, team, x, y, count?, events?, battlefield? } */
  constructor(spawn) {
    super(squadConfigFromRow(KEY, INFANTRY[KEY], spawn));
  }
}
