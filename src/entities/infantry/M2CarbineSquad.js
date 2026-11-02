/**
 * M2CarbineSquad — USA 5★ infantry, fully automatic carbine (high burst
 * damage). Thin InfantrySquad subclass; every stat resolves from the
 * `m2carbine_squad` row via squadConfigFromRow. No behaviour code.
 */
import { InfantrySquad } from './InfantrySquad.js';
import { INFANTRY } from '../../config/UnitStats.js';
import { squadConfigFromRow } from './squadConfig.js';

const KEY = 'm2carbine_squad';

export class M2CarbineSquad extends InfantrySquad {
  /** @param {object} spawn { id, team, x, y, count?, events?, battlefield? } */
  constructor(spawn) {
    super(squadConfigFromRow(KEY, INFANTRY[KEY], spawn));
  }
}
