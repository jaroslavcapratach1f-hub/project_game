/**
 * M26Pershing — USA heavy tank. Thin BaseTank subclass; every stat resolves
 * from the `m26_pershing` row via `tankConfigFromRow`. USA's largest tank
 * (heavyTank scale) — USA has no super-heavy. No behaviour code.
 */
import { BaseTank } from './BaseTank.js';
import { TANKS } from '../../config/UnitStats.js';
import { tankConfigFromRow } from './tankConfig.js';

const KEY = 'm26_pershing';

export class M26Pershing extends BaseTank {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(tankConfigFromRow(KEY, TANKS[KEY], spawn));
  }
}
