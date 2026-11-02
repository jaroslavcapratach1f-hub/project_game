/**
 * DevAIHarness — dev-only, deletable (gated by RENDER.devAI, composed by
 * DevEntityHarness). Mounts the enemy-AI + Fury stack — AIManager, FuryManager,
 * AIAlertIndicator — and parades 3 enemy tanks down a patrol line just
 * field-side of the enemy spawn column, so Field Fury has live targets to flip.
 * Split from DevEntityHarness for that file's line cap.
 */
import { TILE_SIZE } from '../config/GameConfig.js';
import { EntityView } from '../entities/EntityView.js';
import { PanzerIV } from '../entities/tanks/PanzerIV.js';
import { AIManager } from '../ai/AIManager.js';
import { FuryManager } from '../systems/FuryManager.js';
import { AIAlertIndicator } from '../ui/AIAlertIndicator.js';

const PATROL_TANKS = 3;
const ROUTE_MARGIN_TILES = 4; // field-side offset from the enemy spawn column (clears the startup turn arc)
const ROUTE_INSET_TILES = 8;  // keep the route ends clear of the arena edges

export class DevAIHarness {
  constructor() {
    /** @private */ this._ai = null;
    /** @private */ this._fury = null;
    /** @private */ this._alert = null;
    /** @private */ this._loop = null;
  }

  /**
   * @param {import('./Renderer.js').Renderer} renderer
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../world/Battlefield.js').Battlefield} battlefield
   * @param {import('./GameLoop.js').GameLoop} loop
   * @param {import('../entities/EntityManager.js').EntityManager} entityManager
   * @returns {void}
   */
  enable(renderer, events, battlefield, loop, entityManager) {
    this._loop = loop;
    this._fury = new FuryManager(entityManager, battlefield, events);
    this._fury.enable();
    this._ai = new AIManager(entityManager, battlefield);
    this._ai.enable(events);
    this._alert = new AIAlertIndicator(renderer, events, entityManager);
    this._alert.enable();
    const route = this._route(battlefield);
    this._ai.setPatrol(route);
    this._spawn(renderer, events, battlefield, entityManager, route);
    loop.addSystem(this._fury);
    loop.addSystem(this._ai);
    loop.addSystem(this._alert);
  }

  /** @param {import('../utils/EventEmitter.js').EventEmitter} events @returns {void} */
  disable(events) {
    this._loop.removeSystem(this._fury);
    this._loop.removeSystem(this._ai);
    this._loop.removeSystem(this._alert);
    this._ai.disable(events);
    this._fury.disable();
    this._alert.disable();
    this._ai = this._fury = this._alert = this._loop = null;
  }

  /** @private @returns {{x:number,y:number}[]} top->bottom line just field-side of the enemy zone */
  _route(bf) {
    const r = bf.spawnColumns('enemy');
    const x = (r.x0 - ROUTE_MARGIN_TILES) * TILE_SIZE;
    return [
      { x, y: (r.y0 + ROUTE_INSET_TILES) * TILE_SIZE },
      { x, y: (r.y1 - ROUTE_INSET_TILES) * TILE_SIZE },
    ];
  }

  /** @private string PATROL_TANKS enemy PanzerIVs evenly along the patrol line */
  _spawn(renderer, events, bf, em, route) {
    const a = route[0];
    const b = route[route.length - 1];
    for (let i = 0; i < PATROL_TANKS; i++) {
      const f = (i + 1) / (PATROL_TANKS + 1);
      const tank = new PanzerIV({
        id: `ai-tank-${i + 1}`, team: 'enemy',
        x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f,
        events, battlefield: bf,
      });
      const view = new EntityView(tank);
      view.mount(renderer);
      em.add(tank, view);
    }
  }
}
