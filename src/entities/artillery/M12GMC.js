/**
 * M12GMC — USA howitzer (longest range in the game, lowest HP/def, indirect
 * fire). Thin DeployableWeapon subclass; every stat resolves from the `m12_gmc`
 * row via artilleryConfigFromRow. No behaviour code — the howitzer-vs-AT-gun
 * split is driven by `cls` + the `indirect` flag in the cfg.
 */
import { DeployableWeapon } from './DeployableWeapon.js';
import { UNIQUE } from '../../config/UnitStats.js';
import { artilleryConfigFromRow } from './artilleryConfig.js';

const KEY = 'm12_gmc';

export class M12GMC extends DeployableWeapon {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(artilleryConfigFromRow(KEY, UNIQUE[KEY], spawn));
  }
}
