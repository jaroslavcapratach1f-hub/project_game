/**
 * ISU152 — Russia howitzer (shorter range than the M12 but higher HP/def and
 * bigger splash, indirect fire). Thin DeployableWeapon subclass; every stat
 * resolves from the `isu152` row via artilleryConfigFromRow. No behaviour code.
 */
import { DeployableWeapon } from './DeployableWeapon.js';
import { UNIQUE } from '../../config/UnitStats.js';
import { artilleryConfigFromRow } from './artilleryConfig.js';

const KEY = 'isu152';

export class ISU152 extends DeployableWeapon {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(artilleryConfigFromRow(KEY, UNIQUE[KEY], spawn));
  }
}
