/**
 * OnslaughtDirector — loop system that runs one Onslaught event (GDD 16): the
 * Legion throws `ONSLAUGHT_WAVE_COUNT` escalating waves at the player's base on
 * the world map. Shares BaseArmy's EntityManager + WorldField; DORMANT until
 * `start(levelId)` (the alliance-scheduled kickoff). Phase machine + raider
 * retargeting are onslaughtStep.js; wave spawning is onslaughtSpawn.js.
 * AIManager skips raiders (entity.onslaughtRaider) — this file drives them.
 */
import { EVENTS } from '../engine/GameEvents.js';
import { ONSLAUGHT, ONSLAUGHT_WAVE_COUNT, onslaughtLevel, resolveWave } from '../config/OnslaughtConfig.js';
import { baseHpAt } from '../config/BuildingLevelOverrides.js';
import { OnslaughtState, ONSLAUGHT_PHASE } from './OnslaughtState.js';
import { BaseHealth } from './BaseHealth.js';
import { stepPhase, composeText } from './onslaughtStep.js';
import { spawnWaveUnits } from './onslaughtSpawn.js';

const MS_PER_SECOND = 1000;
const PLAYER = 'player';
const WALL_ID = 'defence_wall';

export class OnslaughtDirector {
  /**
   * @param {import('../engine/Renderer.js').Renderer} renderer
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('../entities/EntityManager.js').EntityManager} entityManager
   * @param {import('../worldmap/WorldField.js').WorldField} field
   * @param {import('../engine/Unit3DLayer.js').Unit3DLayer} unit3D live 3D unit models (S55)
   * @param {import('../systems/BaseManager.js').BaseManager} baseManager the
   *   player's own base — read ONLY for its Wall level (the player's own
   *   rule: Wall level drives the whole-base HP pool)
   */
  constructor(renderer, events, entityManager, field, unit3D, baseManager) {
    this.renderer = renderer;
    this.unit3D = unit3D;
    this.events = events;
    this.em = entityManager;
    this.field = field;
    /** @private */ this._baseManager = baseManager;
    /** @private */ this._state = new OnslaughtState();
    /** @private */ this._baseHp = new BaseHealth(events, entityManager, field);
    /** @private reused live-defender scratch */ this._players = [];
    /** @private */ this._onDied = (p) => this._state.remove(p.id);
  }

  /** @returns {OnslaughtState} run state (dev handle: window.onslaught.state) */
  get state() { return this._state; }

  /** @returns {BaseHealth} the base's HP for this run (onslaughtStep + dev) */
  get baseHp() { return this._baseHp; }

  /** @returns {boolean} a run is live (not idle / ended) */
  get active() {
    const p = this._state.phase;
    return p !== ONSLAUGHT_PHASE.IDLE && p !== ONSLAUGHT_PHASE.ENDED;
  }

  /** @returns {void} */
  enable() {
    this.events.on(EVENTS.ENTITY_DIED, this._onDied);
    if (typeof window !== 'undefined') window.onslaught = this;
  }

  /** @returns {void} */
  disable() {
    this.events.off(EVENTS.ENTITY_DIED, this._onDied);
    this._state.reset();
    this._baseHp.stop();
    if (typeof window !== 'undefined') delete window.onslaught;
  }

  /**
   * Begin a run at the alliance-chosen difficulty level.
   * @param {number} [levelId=1] an ONSLAUGHT_LEVELS id @returns {void}
   */
  start(levelId = 1) {
    if (this.active) return;
    const s = this._state;
    s.reset();
    s.levelId = onslaughtLevel(levelId).id;
    const wallLevel = this._baseManager?.buildings.find((b) => b.id === WALL_ID)?.level ?? 1;
    this._baseHp.reset(baseHpAt(ONSLAUGHT.baseHp.max, wallLevel));
    this.events.emit(EVENTS.ONSLAUGHT_STARTED, { levelId: s.levelId, waveCount: ONSLAUGHT_WAVE_COUNT });
    s.waveNumber = 1;
    this._armIncoming();
  }

  /** @param {number} dt seconds @returns {void} */
  update(dt) {
    if (!this.active) return;
    this._baseHp.update(dt);
    stepPhase(this, dt * MS_PER_SECOND);
  }

  /** @package INCOMING lead elapsed — spawn the wave, go FIGHTING (onslaughtStep) */
  spawnWave() {
    spawnWaveUnits(this, resolveWave(this._state.levelId, this._state.waveNumber));
    this._state.phase = ONSLAUGHT_PHASE.FIGHTING;
  }

  /** @package refill + return the reused live-defender list (onslaughtStep) @returns {object[]} */
  collectDefenders() {
    this._players.length = 0;
    this.em.forEach((e) => { if (e.team === PLAYER && e.isAlive) this._players.push(e); });
    return this._players;
  }

  /** @package current wave cleared -> PAUSE, or the run is won (onslaughtStep) */
  clearWave() {
    const s = this._state;
    s.wavesCleared += 1;
    this.events.emit(EVENTS.ONSLAUGHT_WAVE_CLEARED, { number: s.waveNumber, reward: null });
    if (s.waveNumber >= ONSLAUGHT_WAVE_COUNT) return this.endRun(true);
    s.clearEnemies();
    s.phase = ONSLAUGHT_PHASE.PAUSE;
    s.timerMs = ONSLAUGHT.interWavePauseMs;
  }

  /** @package pause elapsed -> arm the next wave (onslaughtStep) */
  advanceWave() {
    this._state.waveNumber += 1;
    this._armIncoming();
  }

  /** @package end the run either way (onslaughtStep) @param {boolean} won */
  endRun(won) {
    const s = this._state;
    s.phase = ONSLAUGHT_PHASE.ENDED;
    s.outcome = won;
    this._baseHp.stop();
    this.events.emit(EVENTS.ONSLAUGHT_ENDED, { wavesCleared: s.wavesCleared, fullClear: won, score: s.wavesCleared });
  }

  /** @private INCOMING + the banner event for the current wave */
  _armIncoming() {
    const s = this._state;
    const wave = resolveWave(s.levelId, s.waveNumber);
    s.phase = ONSLAUGHT_PHASE.INCOMING;
    s.timerMs = ONSLAUGHT.bannerLeadMs;
    this.events.emit(EVENTS.ONSLAUGHT_WAVE_INCOMING, {
      number: s.waveNumber, total: ONSLAUGHT_WAVE_COUNT,
      boss: wave.boss, composition: composeText(wave.groups),
    });
  }
}
