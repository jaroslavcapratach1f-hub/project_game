/**
 * M24Chaffee — USA light tank (UNIQUE export). Thin BaseTank subclass; every
 * stat resolves from the `m24_chaffee` row via `tankConfigFromRow`. Fastest
 * tank in the game. No behaviour code.
 */
import { BaseTank } from './BaseTank.js';
import { UNIQUE } from '../../config/UnitStats.js';
import { tankConfigFromRow } from './tankConfig.js';

const KEY = 'm24_chaffee';

export class M24Chaffee extends BaseTank {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(tankConfigFromRow(KEY, UNIQUE[KEY], spawn));
  }
}
