/**
 * Gewehr43Squad — Germany 4.5★ infantry, semi-automatic upgrade (faster fire
 * rate). Thin InfantrySquad subclass; every stat resolves from the
 * `gewehr43_squad` row via squadConfigFromRow. No behaviour code.
 */
import { InfantrySquad } from './InfantrySquad.js';
import { INFANTRY } from '../../config/UnitStats.js';
import { squadConfigFromRow } from './squadConfig.js';

const KEY = 'gewehr43_squad';

export class Gewehr43Squad extends InfantrySquad {
  /** @param {object} spawn { id, team, x, y, count?, events?, battlefield? } */
  constructor(spawn) {
    super(squadConfigFromRow(KEY, INFANTRY[KEY], spawn));
  }
}
