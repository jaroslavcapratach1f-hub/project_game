/**
 * devParade — the roster + spawn-geometry data for DevEntityHarness, split out
 * to keep that file under the line cap. Dev-only, deletable with the harness.
 * `PARADE_BY_FACTION` = each faction's tank column (three or four);
 * `SQUAD_BY_FACTION` = its lone 4★ infantry squad, `ARTY_BY_FACTION` = its lone
 * deployable weapon — both tail the parade.
 */
import { TILE_SIZE } from '../config/GameConfig.js';
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
import { SpringfieldSquad } from '../entities/infantry/SpringfieldSquad.js';
import { MosinSquad } from '../entities/infantry/MosinSquad.js';
import { PaK40 } from '../entities/artillery/PaK40.js';
import { M12GMC } from '../entities/artillery/M12GMC.js';
import { ISU152 } from '../entities/artillery/ISU152.js';

const HALF = 0.5;

export const PARADE_SPACING_PX = 120; // vertical gap between parade units (whole column is centred on the spawn point)

export const GERMAN_ARMOR = [
  { Ctor: PanzerIV, id: 'panzer-1' },
  { Ctor: TigerI, id: 'tiger-1' },
  { Ctor: Maus, id: 'maus-1' },
  { Ctor: Jagdpanther, id: 'jagd-1' },
];
const US_ARMOR = [
  { Ctor: M24Chaffee, id: 'chaffee-1' },
  { Ctor: M4Sherman, id: 'sherman-1' },
  { Ctor: M26Pershing, id: 'pershing-1' },
  { Ctor: M18Hellcat, id: 'hellcat-1' },
];
const RUSSIAN_ARMOR = [
  { Ctor: T34_85, id: 't3485-1' },
  { Ctor: IS2, id: 'is2-1' },
  { Ctor: SU100, id: 'su100-1' },
];

export const PARADE_BY_FACTION = { germany: GERMAN_ARMOR, usa: US_ARMOR, russia: RUSSIAN_ARMOR };
export const SQUAD_BY_FACTION = { germany: Kar98kSquad, usa: SpringfieldSquad, russia: MosinSquad };
export const ARTY_BY_FACTION = { germany: PaK40, usa: M12GMC, russia: ISU152 };

/**
 * World-px centre of a spawn column.
 * @param {import('../world/Battlefield.js').Battlefield} bf
 * @param {string} side 'player' | 'enemy'
 * @returns {{x:number,y:number}}
 */
export function spawnCentre(bf, side) {
  const r = bf.spawnColumns(side);
  return {
    x: (r.x0 + r.x1 + 1) * HALF * TILE_SIZE,
    y: (r.y0 + r.y1 + 1) * HALF * TILE_SIZE,
  };
}
