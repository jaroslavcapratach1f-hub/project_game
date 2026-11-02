/**
 * MosinCarbineSquad — Russia 4.5★ infantry, shorter-barrel carbine (slightly
 * faster mobility/firing). Thin InfantrySquad subclass; every stat resolves from
 * the `mosin_carbine_squad` row via squadConfigFromRow. No behaviour code.
 */
import { InfantrySquad } from './InfantrySquad.js';
import { INFANTRY } from '../../config/UnitStats.js';
import { squadConfigFromRow } from './squadConfig.js';

const KEY = 'mosin_carbine_squad';

export class MosinCarbineSquad extends InfantrySquad {
  /** @param {object} spawn { id, team, x, y, count?, events?, battlefield? } */
  constructor(spawn) {
    super(squadConfigFromRow(KEY, INFANTRY[KEY], spawn));
  }
}
