/**
 * T34_85 — Russia medium tank. Thin BaseTank subclass; every stat resolves
 * from the `t34_85` row via `tankConfigFromRow`. No behaviour code.
 */
import { BaseTank } from './BaseTank.js';
import { TANKS } from '../../config/UnitStats.js';
import { tankConfigFromRow } from './tankConfig.js';

const KEY = 't34_85';

export class T34_85 extends BaseTank {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(tankConfigFromRow(KEY, TANKS[KEY], spawn));
  }
}
