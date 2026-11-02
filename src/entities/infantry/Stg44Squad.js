/**
 * Stg44Squad — Germany 5★ infantry, assault rifle squad (highest DPS for German
 * infantry). Thin InfantrySquad subclass; every stat resolves from the
 * `stg44_squad` row via squadConfigFromRow. No behaviour code.
 */
import { InfantrySquad } from './InfantrySquad.js';
import { INFANTRY } from '../../config/UnitStats.js';
import { squadConfigFromRow } from './squadConfig.js';

const KEY = 'stg44_squad';

export class Stg44Squad extends InfantrySquad {
  /** @param {object} spawn { id, team, x, y, count?, events?, battlefield? } */
  constructor(spawn) {
    super(squadConfigFromRow(KEY, INFANTRY[KEY], spawn));
  }
}
