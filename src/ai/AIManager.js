/**
 * AIManager — loop system that owns one AIController per live enemy combat unit
 * (mirrors EntityManager's registry shape). It adds / drops controllers as the
 * EntityManager rows change, feeds every controller the shared patrol route,
 * and ticks them all alloc-free each sim step. Registered via loop.addSystem().
 */
import { AIController } from './AIController.js';

const ENEMY = 'enemy';
const PLAYER = 'player';

export class AIManager {
  /**
   * @param {import('../entities/EntityManager.js').EntityManager} entityManager
   * @param {import('../worldmap/WorldField.js').WorldField} battlefield
   */
  constructor(entityManager, battlefield) {
    /** @private */ this._em = entityManager;
    /** @private */ this._bf = battlefield;
    /** @private */ this._events = null;
    /** @private @type {import('./AIController.js').AIController[]} */ this._ctl = [];
    /** @private ids that currently have a controller */ this._ids = new Set();
    /** @private ids seen this sync pass (reused) */ this._seen = new Set();
    /** @private shared enemy patrol route (world px) */ this._route = [];
    /** @private reused per-tick player-unit list */ this._players = [];
    /** @private */ this._track = (e) => this._trackOne(e);
    /** @private */ this._collect = (e) => { if (e.team === PLAYER && e.isAlive) this._players.push(e); };
  }

  /** @returns {number} live controllers */ get controllerCount() { return this._ctl.length; }

  /**
   * Inject the shared enemy patrol route (world-px waypoints) and hand it to
   * every existing controller.
   * @param {{x:number,y:number}[]} waypoints @returns {void}
   */
  setPatrol(waypoints) {
    this._route = waypoints || [];
    for (let i = 0; i < this._ctl.length; i++) this._ctl[i].setWaypoints(this._route);
  }

  /** @param {import('../utils/EventEmitter.js').EventEmitter} events @returns {void} */
  enable(events) {
    this._events = events;
  }

  /** @param {import('../utils/EventEmitter.js').EventEmitter} _events @returns {void} */
  disable(_events) {
    this._ctl.length = 0;
    this._ids.clear();
    this._seen.clear();
    this._players.length = 0;
    this._events = null;
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    this._syncControllers();
    this._players.length = 0;
    this._em.forEach(this._collect);
    for (let i = 0; i < this._ctl.length; i++) this._ctl[i].update(dt, this._players);
    // unit-to-unit spacing (all teams) is entityMotion.js/TankMotor's own hard-stop + slide (S80)
  }

  /** @private add controllers for new enemy rows, drop them for vanished ids */
  _syncControllers() {
    this._seen.clear();
    this._em.forEach(this._track);
    for (let i = this._ctl.length - 1; i >= 0; i--) {
      const id = this._ctl[i].entity.id;
      if (this._seen.has(id)) continue;
      this._ids.delete(id);
      this._ctl.splice(i, 1);
    }
  }

  /** @private @param {import('../entities/Entity.js').Entity} e */
  _trackOne(e) {
    if (e.team !== ENEMY || !e.isAlive || e.nonCombat || typeof e.rangePx !== 'number') return;
    if (e.onslaughtRaider) return; // OnslaughtDirector drives raiders, not the patrol AI
    this._seen.add(e.id);
    if (this._ids.has(e.id)) return;
    const c = new AIController(e, this._bf, this._events);
    c.setWaypoints(this._route);
    this._ctl.push(c);
    this._ids.add(e.id);
  }
}
