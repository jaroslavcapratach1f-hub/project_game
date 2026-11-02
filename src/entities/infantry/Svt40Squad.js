/**
 * Svt40Squad — Russia 5★ infantry, semi-automatic rifle squad (highest Russian
 * infantry DPS). Thin InfantrySquad subclass; every stat resolves from the
 * `svt40_squad` row via squadConfigFromRow. No behaviour code.
 */
import { InfantrySquad } from './InfantrySquad.js';
import { INFANTRY } from '../../config/UnitStats.js';
import { squadConfigFromRow } from './squadConfig.js';

const KEY = 'svt40_squad';

export class Svt40Squad extends InfantrySquad {
  /** @param {object} spawn { id, team, x, y, count?, events?, battlefield? } */
  constructor(spawn) {
    super(squadConfigFromRow(KEY, INFANTRY[KEY], spawn));
  }
}
