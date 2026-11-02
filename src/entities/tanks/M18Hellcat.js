/**
 * M18Hellcat — USA tank hunter (TANK_HUNTERS export). Thin BaseTank subclass;
 * every stat resolves from the `m18_hellcat` row via `tankConfigFromRow`. Its
 * row's `noTurret: true` (fixed barrel) + `noOverpen: true` flow through the
 * helper — the Session-8 hull-aims / aim-cone behaviour applies for free.
 */
import { BaseTank } from './BaseTank.js';
import { TANK_HUNTERS } from '../../config/UnitStats.js';
import { tankConfigFromRow } from './tankConfig.js';

const KEY = 'm18_hellcat';

export class M18Hellcat extends BaseTank {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(tankConfigFromRow(KEY, TANK_HUNTERS[KEY], spawn));
  }
}
