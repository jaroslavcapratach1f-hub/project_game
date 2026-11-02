/**
 * Maus — Germany super-heavy tank (UNIQUE export). Thin BaseTank subclass;
 * every stat resolves from the `maus` row via `tankConfigFromRow`. Its shells
 * splash (`aoe` 0.6) — the splash path is already wired through BaseTank.
 */
import { BaseTank } from './BaseTank.js';
import { UNIQUE } from '../../config/UnitStats.js';
import { tankConfigFromRow } from './tankConfig.js';

const KEY = 'maus';

export class Maus extends BaseTank {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(tankConfigFromRow(KEY, UNIQUE[KEY], spawn));
  }
}
