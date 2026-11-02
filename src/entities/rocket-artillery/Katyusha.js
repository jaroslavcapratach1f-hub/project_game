/**
 * Katyusha — Russia's BM-13 rocket launcher (UNIQUE, faction exclusive): fast,
 * fragile, short range, a devastating 16-rocket area salvo. Thin RocketLauncher
 * subclass; every stat resolves from the `bm13_katyusha` row via
 * rocketConfigFromRow. No behaviour code.
 */
import { RocketLauncher } from './RocketLauncher.js';
import { UNIQUE } from '../../config/UnitStats.js';
import { rocketConfigFromRow } from './rocketConfig.js';

const KEY = 'bm13_katyusha';

export class Katyusha extends RocketLauncher {
  /** @param {object} spawn { id, team, x, y, events?, battlefield? } */
  constructor(spawn) {
    super(rocketConfigFromRow(KEY, UNIQUE[KEY], spawn));
  }
}
