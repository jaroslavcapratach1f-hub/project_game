/**
 * ResearchManager — the Research Center's own real start/complete flow
 * (the player's own explicit choice: not browse-only). Owns completed
 * ranks + active jobs for every node in `src/config/research/` and
 * validates + starts research against real resource/HQ/prerequisite/
 * parallel-slot gates. In-memory only, resets on reload — no save system
 * exists anywhere in this codebase yet (same honest scope `troopLevels.js`/
 * `trainingJobs.js`/`ProductionQueue.js` already document for their own
 * state); inventing one here would be its own, much bigger, unrequested
 * task.
 *
 * Unlike `ProductionQueue` (always exactly ONE active serial slot, with a
 * FIFO backlog), Research Center's `parallelResearch` effect allows SEVERAL
 * nodes researching at once — so `_jobs` holds up to `parallelSlots`
 * CONCURRENT active jobs directly, no backlog/promotion machinery:
 * `canStart`/`start` simply reject once slots are full, same as every
 * other gate here.
 *
 * FORWARD: `PowerConfig.researchPower(track, ranksCompleted)` already
 * exists for turning completed ranks into Power, but nothing wires it into
 * the shared account-wide `totalPower()`/TopBar `POWER_CHANGED` pipeline
 * (that's currently buildings-only, via `BaseManager.totalPower`) — the
 * research screens compute their own local readout directly instead (see
 * `ResearchHubView`/`ResearchTreeView`). Extending the shared total is a
 * separate, bigger change than this feature asked for.
 */
import { BUILDINGS, resolveEffect } from '../config/BuildingConfig.js';
import { researchNode, nodesInTrack, canResearch, nodeCost, nodeSeconds } from '../config/research/index.js';
import { startJob, remainingMs, isJobDone, jobProgress } from './TimedJob.js';

const RESEARCH_CENTER_ID = 'research_center';

export class ResearchManager {
  /**
   * @param {import('./BaseManager.js').BaseManager} baseManager
   * @param {import('./ResourceManager.js').ResourceManager} resourceManager
   */
  constructor(baseManager, resourceManager) {
    /** @private */ this._base = baseManager;
    /** @private */ this._rm = resourceManager;
    /** @private @type {Map<string,number>} nodeId -> completed rank (absent/0 = never started) */
    this._ranks = new Map();
    /** @private @type {{nodeId:string,rank:number,startedAt:number,durationMs:number}[]} every entry here IS active — no backlog */
    this._jobs = [];
  }

  /** @param {string} nodeId @returns {number} */ rankOf(nodeId) { return this._ranks.get(nodeId) ?? 0; }
  /** @param {string} nodeId @returns {boolean} */
  isMaxed(nodeId) { const n = researchNode(nodeId); return Boolean(n) && this.rankOf(nodeId) >= n.maxRank; }

  /** @returns {number} live headquarters level */ get hqLevel() { return this._base.hqLevel; }
  /** @returns {number} this Research Center's own live building level (1 if somehow unbuilt — it's seeded at level 1 in STARTING_LAYOUT) */
  get centerLevel() { return this._base.buildings.find((b) => b.id === RESEARCH_CENTER_ID)?.level ?? 1; }
  /** @returns {number} concurrent research slots at the current center level */
  get parallelSlots() { return resolveEffect(BUILDINGS[RESEARCH_CENTER_ID], 'parallelResearch', this.centerLevel); }
  /** @returns {number} research-time speed multiplier at the current center level */
  get speedMult() { return resolveEffect(BUILDINGS[RESEARCH_CENTER_ID], 'researchSpeed', this.centerLevel); }

  /** @param {string} nodeId @returns {?{nodeId:string,rank:number,remainingMs:number,progress:number}} */
  jobFor(nodeId) {
    const j = this._jobs.find((x) => x.nodeId === nodeId);
    return j ? { nodeId: j.nodeId, rank: j.rank, remainingMs: remainingMs(j), progress: jobProgress(j) } : null;
  }

  /** @returns {{nodeId:string,rank:number,remainingMs:number,progress:number}[]} every active job, for a "what's researching" readout if ever needed */
  activeJobs() { return this._jobs.map((j) => ({ nodeId: j.nodeId, rank: j.rank, remainingMs: remainingMs(j), progress: jobProgress(j) })); }

  /** @param {string} track @returns {{ranksDone:number, ranksTotal:number, nodesMaxed:number, nodesTotal:number}} real aggregate for the hub's own per-track readout */
  trackProgress(track) {
    const nodes = nodesInTrack(track);
    let ranksDone = 0, ranksTotal = 0, nodesMaxed = 0;
    for (const n of nodes) {
      const rank = this.rankOf(n.id);
      ranksDone += rank; ranksTotal += n.maxRank;
      if (rank >= n.maxRank) nodesMaxed++;
    }
    return { ranksDone, ranksTotal, nodesMaxed, nodesTotal: nodes.length };
  }

  /**
   * @param {string} nodeId
   * @returns {boolean} maxed? already active? parallel slots full? HQ-gated or prereq-missing? can't afford the next rank?
   */
  canStart(nodeId) {
    const node = researchNode(nodeId);
    if (!node || this.isMaxed(nodeId) || this.jobFor(nodeId)) return false;
    if (this._jobs.length >= this.parallelSlots) return false;
    if (!canResearch(nodeId, (nid) => this.rankOf(nid), this.hqLevel, this.centerLevel)) return false;
    return this._rm.canAfford(nodeCost(node, this.rankOf(nodeId) + 1));
  }

  /**
   * Spend + start the timer for the next rank of `nodeId`. Re-validates via
   * `canStart` (double-press-safe, same discipline as `BaseManager.upgrade`
   * — a 2nd tap just fails once the first already spent/claimed the slot).
   * @param {string} nodeId @returns {boolean} started
   */
  start(nodeId) {
    if (!this.canStart(nodeId)) return false;
    const node = researchNode(nodeId), rank = this.rankOf(nodeId) + 1;
    if (!this._rm.spend(nodeCost(node, rank))) return false;
    const job = startJob(nodeSeconds(node, rank) / this.speedMult);
    this._jobs.push({ nodeId, rank, ...job });
    return true;
  }

  /** @param {number} _dt unused — TimedJob is timestamp-based, not tick-accumulated @returns {void} settle finished jobs, credit their rank */
  update(_dt) {
    for (let i = this._jobs.length - 1; i >= 0; i--) {
      const j = this._jobs[i];
      if (isJobDone(j)) { this._ranks.set(j.nodeId, j.rank); this._jobs.splice(i, 1); }
    }
  }
}
