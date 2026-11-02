/**
 * M1GarandSquad — USA 4.5★ infantry, standard semi-auto (highly reliable). Thin
 * InfantrySquad subclass; every stat resolves from the `m1garand_squad` row via
 * squadConfigFromRow. No behaviour code.
 */
import { InfantrySquad } from './InfantrySquad.js';
import { INFANTRY } from '../../config/UnitStats.js';
import { squadConfigFromRow } from './squadConfig.js';

const KEY = 'm1garand_squad';

export class M1GarandSquad extends InfantrySquad {
  /** @param {object} spawn { id, team, x, y, count?, events?, battlefield? } */
  constructor(spawn) {
    super(squadConfigFromRow(KEY, INFANTRY[KEY], spawn));
  }
}
