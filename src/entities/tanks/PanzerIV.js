/**
 * PanzerIV — Germany medium tank. Thin BaseTank subclass; every stat resolves
 * from the `panzer_iv` row via `tankConfigFromRow`. No behaviour code.
 */
import { BaseTank } from './BaseTank.js';
import { TANKS } from '../../config/UnitStats.js';
import { tankConfigFromRow } from './tankConfig.js';

const KEY = 'panzer_iv';

export class PanzerIV extends BaseTank {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(tankConfigFromRow(KEY, TANKS[KEY], spawn));
  }
}
