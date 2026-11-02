/**
 * M4Sherman — USA medium tank. Thin BaseTank subclass; every stat resolves
 * from the `m4_sherman` row via `tankConfigFromRow`. No behaviour code.
 */
import { BaseTank } from './BaseTank.js';
import { TANKS } from '../../config/UnitStats.js';
import { tankConfigFromRow } from './tankConfig.js';

const KEY = 'm4_sherman';

export class M4Sherman extends BaseTank {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(tankConfigFromRow(KEY, TANKS[KEY], spawn));
  }
}
