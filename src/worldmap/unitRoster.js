/**
 * unitRoster — the world map's single "UnitStats key -> Entity subclass + view"
 * table. BaseArmy (player platoon), WorldCombat (Legion camp) and the
 * OnslaughtDirector all build units through `makeUnit`, so the real BaseTank /
 * InfantrySquad / DeployableWeapon / RocketLauncher stack — turret slew,
 * per-soldier sim, deploy timers, salvo fire — runs on the map.
 *
 * Covers every combat unit in UnitStats. Add a row here to field a new unit.
 */
import { EntityView } from '../entities/EntityView.js';
import { InfantrySquadView } from '../entities/infantry/InfantrySquadView.js';
import { DeployableView } from '../entities/artillery/DeployableView.js';
import { RocketLauncherView } from '../entities/rocket-artillery/RocketLauncherView.js';
import { PanzerIV } from '../entities/tanks/PanzerIV.js';
import { TigerI } from '../entities/tanks/TigerI.js';
import { Maus } from '../entities/tanks/Maus.js';
import { Jagdpanther } from '../entities/tanks/Jagdpanther.js';
import { M24Chaffee } from '../entities/tanks/M24Chaffee.js';
import { M4Sherman } from '../entities/tanks/M4Sherman.js';
import { M26Pershing } from '../entities/tanks/M26Pershing.js';
import { M18Hellcat } from '../entities/tanks/M18Hellcat.js';
import { T34_85 } from '../entities/tanks/T34_85.js';
import { IS2 } from '../entities/tanks/IS2.js';
import { SU100 } from '../entities/tanks/SU100.js';
import { Kar98kSquad } from '../entities/infantry/Kar98kSquad.js';
import { Gewehr43Squad } from '../entities/infantry/Gewehr43Squad.js';
import { Stg44Squad } from '../entities/infantry/Stg44Squad.js';
import { SpringfieldSquad } from '../entities/infantry/SpringfieldSquad.js';
import { M1GarandSquad } from '../entities/infantry/M1GarandSquad.js';
import { M2CarbineSquad } from '../entities/infantry/M2CarbineSquad.js';
import { MosinSquad } from '../entities/infantry/MosinSquad.js';
import { MosinCarbineSquad } from '../entities/infantry/MosinCarbineSquad.js';
import { Svt40Squad } from '../entities/infantry/Svt40Squad.js';
import { PaK40 } from '../entities/artillery/PaK40.js';
import { M12GMC } from '../entities/artillery/M12GMC.js';
import { ISU152 } from '../entities/artillery/ISU152.js';
import { Katyusha } from '../entities/rocket-artillery/Katyusha.js';

const TANK = EntityView;
const FOOT = InfantrySquadView;
const GUN = DeployableView;

/** @type {Object<string, {Ctor: Function, View: Function}>} */
export const UNIT_ROSTER = {
  panzer_iv: { Ctor: PanzerIV, View: TANK },
  tiger_i: { Ctor: TigerI, View: TANK },
  maus: { Ctor: Maus, View: TANK },
  jagdpanther: { Ctor: Jagdpanther, View: TANK },
  m24_chaffee: { Ctor: M24Chaffee, View: TANK },
  m4_sherman: { Ctor: M4Sherman, View: TANK },
  m26_pershing: { Ctor: M26Pershing, View: TANK },
  m18_hellcat: { Ctor: M18Hellcat, View: TANK },
  t34_85: { Ctor: T34_85, View: TANK },
  is2: { Ctor: IS2, View: TANK },
  su100: { Ctor: SU100, View: TANK },
  kar98k_squad: { Ctor: Kar98kSquad, View: FOOT },
  gewehr43_squad: { Ctor: Gewehr43Squad, View: FOOT },
  stg44_squad: { Ctor: Stg44Squad, View: FOOT },
  springfield_squad: { Ctor: SpringfieldSquad, View: FOOT },
  m1garand_squad: { Ctor: M1GarandSquad, View: FOOT },
  m2carbine_squad: { Ctor: M2CarbineSquad, View: FOOT },
  mosin_squad: { Ctor: MosinSquad, View: FOOT },
  mosin_carbine_squad: { Ctor: MosinCarbineSquad, View: FOOT },
  svt40_squad: { Ctor: Svt40Squad, View: FOOT },
  pak40: { Ctor: PaK40, View: GUN },
  m12_gmc: { Ctor: M12GMC, View: GUN },
  isu152: { Ctor: ISU152, View: GUN },
  bm13_katyusha: { Ctor: Katyusha, View: RocketLauncherView },
};

/**
 * Spawn one roster unit and its (not-yet-mounted) view.
 * @param {string} key a UNIT_ROSTER key
 * @param {{id:string,team:string,x:number,y:number,events?:object,battlefield?:object}} spawn
 * @returns {{entity:object, view:object}}
 */
export function makeUnit(key, spawn) {
  const def = UNIT_ROSTER[key];
  if (!def) throw new Error(`unitRoster: unknown unit key "${key}"`);
  const entity = new def.Ctor(spawn);
  return { entity, view: new def.View(entity) };
}
