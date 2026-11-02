/**
 * SU100 — Russia tank hunter (TANK_HUNTERS export). Thin BaseTank subclass;
 * every stat resolves from the `su100` row via `tankConfigFromRow`. Its row's
 * `noTurret: true` (fixed casemate gun) + `noOverpen: true` flow through the
 * helper — the Session-8 hull-aims / aim-cone behaviour applies for free, just
 * like Jagdpanther and M18 Hellcat.
 */
import { BaseTank } from './BaseTank.js';
import { TANK_HUNTERS } from '../../config/UnitStats.js';
import { tankConfigFromRow } from './tankConfig.js';

const KEY = 'su100';

export class SU100 extends BaseTank {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(tankConfigFromRow(KEY, TANK_HUNTERS[KEY], spawn));
  }
}
