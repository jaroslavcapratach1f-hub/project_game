/**
 * IS2 — Russia heavy tank. Thin BaseTank subclass; every stat resolves from the
 * `is2` row via `tankConfigFromRow`. Russia's largest tank (heavyTank scale) —
 * Russia has no super-heavy. No behaviour code.
 */
import { BaseTank } from './BaseTank.js';
import { TANKS } from '../../config/UnitStats.js';
import { tankConfigFromRow } from './tankConfig.js';

const KEY = 'is2';

export class IS2 extends BaseTank {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(tankConfigFromRow(KEY, TANKS[KEY], spawn));
  }
}
