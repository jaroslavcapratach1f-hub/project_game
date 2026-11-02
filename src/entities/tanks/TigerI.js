/**
 * TigerI — Germany heavy tank. Thin BaseTank subclass; every stat resolves
 * from the `tiger_i` row via `tankConfigFromRow`. No behaviour code.
 */
import { BaseTank } from './BaseTank.js';
import { TANKS } from '../../config/UnitStats.js';
import { tankConfigFromRow } from './tankConfig.js';

const KEY = 'tiger_i';

export class TigerI extends BaseTank {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(tankConfigFromRow(KEY, TANKS[KEY], spawn));
  }
}
