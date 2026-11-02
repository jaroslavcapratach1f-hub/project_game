/**
 * MosinSquad — Russia 4★ infantry, basic bolt-action rifle squad (Mosin-Nagant).
 * Thin InfantrySquad subclass; every stat resolves from the `mosin_squad` row
 * via squadConfigFromRow. No behaviour code.
 */
import { InfantrySquad } from './InfantrySquad.js';
import { INFANTRY } from '../../config/UnitStats.js';
import { squadConfigFromRow } from './squadConfig.js';

const KEY = 'mosin_squad';

export class MosinSquad extends InfantrySquad {
  /** @param {object} spawn { id, team, x, y, count?, events?, battlefield? } */
  constructor(spawn) {
    super(squadConfigFromRow(KEY, INFANTRY[KEY], spawn));
  }
}
