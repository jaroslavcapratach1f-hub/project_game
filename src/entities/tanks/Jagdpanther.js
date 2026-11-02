/**
 * Jagdpanther — Germany tank hunter (TANK_HUNTERS export). Thin BaseTank
 * subclass; every stat resolves from the `jagdpanther` row via
 * `tankConfigFromRow`. Its row's `noTurret: true` (fixed casemate gun) +
 * `noOverpen: true` flow through the helper — no behaviour code here.
 */
import { BaseTank } from './BaseTank.js';
import { TANK_HUNTERS } from '../../config/UnitStats.js';
import { tankConfigFromRow } from './tankConfig.js';

const KEY = 'jagdpanther';

export class Jagdpanther extends BaseTank {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(tankConfigFromRow(KEY, TANK_HUNTERS[KEY], spawn));
  }
}
