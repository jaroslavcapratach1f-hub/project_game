/**
 * PaK40 — Germany anti-tank gun (massive damage vs tanks, useless on the field,
 * must deploy). Thin DeployableWeapon subclass; every stat resolves from the
 * `pak40` row via artilleryConfigFromRow. No behaviour code — direct fire + the
 * front-arc gun shield follow from `cls === 'atGun'` in the cfg.
 */
import { DeployableWeapon } from './DeployableWeapon.js';
import { UNIQUE } from '../../config/UnitStats.js';
import { artilleryConfigFromRow } from './artilleryConfig.js';

const KEY = 'pak40';

export class PaK40 extends DeployableWeapon {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(artilleryConfigFromRow(KEY, UNIQUE[KEY], spawn));
  }
}
