/**
 * OrderController — the tactical-order brain (GDD 02). Subscribes to the
 * gesture events, hit-tests against a unit source (screen->world first), and
 * turns them into ORDER_* events + OrderIndicator feedback.
 *
 * S71 hex-lock targeting (the player's own spec): a drag always locks its
 * destination to the nearest hex, showing a green (empty, march there) or
 * red (enemy-occupied, attack it) marker (`OrderHexFlow`/`HexTargetMarker`)
 * — releasing commits it. A plain tap-select on open ground instead shows a
 * GO/ATTACK confirm button at the hex (`HexGoButton`) rather than acting
 * immediately; tapping that button commits it, tapping elsewhere re-targets.
 * A drag starting on a SquadBar slot (`squadBarSource`) behaves exactly
 * like starting the drag on that unit's own map position.
 *
 * Unit source contract: unitAt(worldX, worldY) -> {id,x,y,isOwn} | null
 * (returns a live/stable record), baseAnchor() -> {x,y} in world px, and
 * (S54) an optional handleOf(id) -> the same record type, for `selectById`.
 */
import { EVENTS } from './GameEvents.js';

export class OrderController {
  /**
   * @param {import('../utils/EventEmitter.js').EventEmitter} events
   * @param {import('./Camera.js').Camera} camera
   * @param {{indicator:import('../ui/OrderIndicator.js').OrderIndicator, menu:import('../ui/RadialMenu.js').RadialMenu,
   *   hexFlow:import('./OrderHexFlow.js').OrderHexFlow}} ui bundled to keep this constructor's own param count under the lint cap
   * @param {{unitAt:Function,baseAnchor:Function}} unitSource
   */
  constructor(events, camera, ui, unitSource) {
    /** @private */ this._events = events;
    /** @private */ this._camera = camera;
    /** @private */ this._ind = ui.indicator;
    /** @private */ this._menu = ui.menu;
    /** @private */ this._hex = ui.hexFlow;
    /** @private */ this._units = unitSource;
    /** @private @type {?(sx:number,sy:number)=>boolean} */ this._hudHitTest = null;
    /** @private @type {?(sx:number,sy:number)=>?object} squad-bar slot -> live unit handle, screen px */ this._squadBarSource = null;
    /** @private @type {?object} */ this._selected = null;
    /** @private @type {?object} */ this._dragUnit = null;
    /** @private @type {?object} last OrderHexFlow.dragMove() classification, used by drag-end */ this._dragTarget = null;
    /** @private S78: false while the base's buildings are interactive (zoomed in) — see setOrdersEnabled */ this._ordersEnabled = true;
    /** @private reused world-point scratch */ this._w = { x: 0, y: 0 };
    /** @private event name -> bound handler */ this._map = this._buildMap();
  }

  /** @private @returns {Array<[string,Function]>} */
  _buildMap() {
    return [
      [EVENTS.INPUT_TAP, (p) => this._onTap(p)],
      [EVENTS.INPUT_DOUBLE_TAP, (p) => console.debug('[Order] doubleTap', Math.round(p.x), Math.round(p.y))],
      [EVENTS.INPUT_DRAG_START, (p) => this._onDragStart(p)],
      [EVENTS.INPUT_DRAG_MOVE, (p) => this._onDragMove(p)],
      [EVENTS.INPUT_DRAG_END, (p) => this._onDragEnd(p)],
      [EVENTS.INPUT_LONGPRESS, (p) => this._onLongPress(p)],
    ];
  }

  /**
   * Register a predicate that claims screen points for the HUD (e.g. the
   * minimap); such taps are ignored here so the HUD handles them, mirroring the
   * radial-menu defer. Pass null to clear.
   * @param {?(sx:number,sy:number)=>boolean} fn @returns {void}
   */
  setHudHitTest(fn) { this._hudHitTest = fn; }

  /** @param {?(sx:number,sy:number)=>?object} fn squad-bar slot under a screen point -> live unit handle, or null @returns {void} */
  setSquadBarSource(fn) { this._squadBarSource = fn; }

  /**
   * S78: suspend (or resume) every gesture this controller handles — the
   * fix for a real reported bug: a unit selected before/while zooming into
   * the base stayed selected, so tapping base ground while reviewing
   * buildings popped the GO/ATTACK hex marker over the compound. Disabling
   * deselects immediately (clearing any pending hex-target and in-flight
   * drag) so there's nothing left for a stray tap to act on; WorldScene
   * drives this every frame off the same `BaseSite.buildingsInteractive`
   * threshold that already governs whether buildings themselves are
   * clickable. Idempotent — a no-op once already in the requested state.
   * @param {boolean} enabled @returns {void}
   */
  setOrdersEnabled(enabled) {
    if (this._ordersEnabled === enabled) return;
    this._ordersEnabled = enabled;
    if (!enabled) {
      this._deselect();
      this._dragUnit = null;
      this._dragTarget = null;
      this._hex.dragEnd();
    }
  }

  /** Subscribe to gesture events. @returns {void} */
  enable() { for (let i = 0; i < this._map.length; i++) this._events.on(this._map[i][0], this._map[i][1]); }

  /** Unsubscribe and reset. @returns {void} */
  disable() {
    for (let i = 0; i < this._map.length; i++) this._events.off(this._map[i][0], this._map[i][1]);
    this._selected = null;
    this._dragUnit = null;
  }

  /** @returns {boolean} dragging an own unit (Game suppresses camera-pan) */
  isDraggingUnit() { return Boolean(this._dragUnit); }

  /**
   * Select an own unit directly by id — same effect as tapping it on the
   * map (S54: a squad-slot HUD button). No-op if `id` isn't a live handle.
   * @param {string} id @returns {void}
   */
  selectById(id) {
    if (!this._ordersEnabled) return;
    const u = this._units.handleOf?.(id);
    if (u) this._select(u);
  }

  /** @private @param {number} sx @param {number} sy @returns {?object} unit under the screen point */
  _pick(sx, sy) {
    this._camera.screenToWorld(sx, sy, this._w);
    return this._units.unitAt(this._w.x, this._w.y);
  }

  /** @private @param {string} evt @param {object} payload */
  _emit(evt, payload) {
    this._events.emit(evt, payload);
    console.debug('[Order]', evt, JSON.stringify(payload));
  }

  /** @private @param {{x:number,y:number}} p SCREEN px */
  _onTap(p) {
    if (!this._ordersEnabled) return;
    if (this._menu.isOpen) return void this._menu.handleTap(p.x, p.y);
    if (this._hudHitTest && this._hudHitTest(p.x, p.y)) return;
    this._camera.screenToWorld(p.x, p.y, this._w);
    if (this._hex.hasPending()) {
      const t = this._hex.confirmIfHit(this._w.x, this._w.y);
      if (t) return this._commit(this._selected.id, t);
    }
    const u = this._pick(p.x, p.y);
    if (!u) {
      if (this._selected) return void this._hex.targetHex(this._w.x, this._w.y);
      return this._deselect();
    }
    if (u.isOwn && (!this._selected || this._selected.id !== u.id)) return this._select(u);
    if (u.isOwn) return this._recall(u);
    // S79 bug fix: tapping an enemy unit directly used to commit ORDER_ATTACK
    // immediately (pre-S71 code, left behind when the hex-lock confirm flow
    // was added) — no ATTACK popup, no chance to cancel, inconsistent with
    // every other targeting path (drag, tap-empty-ground, tap-a-base all go
    // through OrderHexFlow). Route through the same targetHex() call so
    // classifyHex finds this same unit (the tap landed on it) and shows the
    // red ATTACK confirm button like everywhere else.
    if (this._selected) this._hex.targetHex(this._w.x, this._w.y);
  }

  /**
   * @private commit a hex-flow target (drag-end or GO-button confirm). A
   * live enemy entity gets a real ORDER_ATTACK; a base territory (S74/S76 —
   * `entity.type === 'base'`, own or not — no live EntityManager id to
   * attack/garrison yet, see HexTargeting's own doc) marches the unit up to
   * its anchor instead — `ORDER_MOVE`'s own hex resolution already snaps
   * that to just outside the base's blocked 7-cell territory, so the unit
   * visibly closes in and stops at the wall (an enemy base) or the gate (the
   * player's own, future garrison groundwork). FORWARD: swap the enemy-base
   * case for a real base-attack order once base HP/combat exists, and the
   * own-base case for a real garrison order once that exists; keep the
   * attack-styled line on an enemy base either way so the confirm reads the
   * same as a real attack.
   * @param {string} unitId @param {{hex:{x:number,y:number},kind:string,entity:?object}} t
   */
  _commit(unitId, t) {
    const isBase = t.entity?.type === 'base';
    if (t.kind === 'enemy' && t.entity && !isBase) {
      this._emit(EVENTS.ORDER_ATTACK, { unitId, targetId: t.entity.id });
      this._ind.showAttack(this._selected, t.hex);
      return;
    }
    this._emit(EVENTS.ORDER_MOVE, { unitId, x: t.hex.x, y: t.hex.y });
    if (isBase && t.kind === 'enemy') this._ind.showAttack(this._selected, t.hex);
    else this._ind.showMove(this._selected, t.hex);
  }

  /** @private @param {object} u */
  _select(u) {
    this._hex.clearPending();
    this._selected = u;
    this._emit(EVENTS.ORDER_SELECT, { unitId: u.id });
    this._ind.showSelection(u);
  }

  /** @private */
  _deselect() {
    if (!this._selected) return;
    this._hex.clearPending();
    this._selected = null;
    this._ind.clearSelection();
    this._emit(EVENTS.ORDER_DESELECT, {});
  }

  /** @private @param {object} u */
  _recall(u) {
    this._emit(EVENTS.ORDER_RECALL, { unitId: u.id });
    this._ind.showRecall(u, this._units.baseAnchor());
  }

  /** @private @param {{x:number,y:number}} p */
  _onDragStart(p) {
    if (!this._ordersEnabled) { this._dragUnit = null; return; }
    const fromBar = this._squadBarSource?.(p.x, p.y);
    const u = fromBar ?? this._pick(p.x, p.y);
    if (u && u.isOwn) {
      if (!this._selected || this._selected.id !== u.id) this._select(u);
      this._dragUnit = u;
    } else {
      this._dragUnit = null;
    }
  }

  /** @private @param {{x:number,y:number}} p */
  _onDragMove(p) {
    if (!this._dragUnit) return;
    this._camera.screenToWorld(p.x, p.y, this._w);
    this._dragTarget = this._hex.dragMove(this._w.x, this._w.y);
    this._ind.showDragPreview(this._dragUnit, this._dragTarget.hex); // unit's own position -> the LOCKED hex, not the raw finger point
  }

  /** @private @param {{x:number,y:number}} _p unused — the lock already tracked the last drag-move point */
  _onDragEnd(_p) {
    const u = this._dragUnit, t = this._dragTarget;
    this._dragUnit = null; this._dragTarget = null;
    this._hex.dragEnd();
    this._ind.hideDragPreview();
    if (u && t) this._commit(u.id, t);
  }

  /** @private @param {{x:number,y:number}} p SCREEN px */
  _onLongPress(p) {
    if (!this._ordersEnabled) return;
    const u = this._pick(p.x, p.y);
    if (!u || !u.isOwn) return;
    if (!this._selected || this._selected.id !== u.id) this._select(u);
    this._menu.open(p.x, p.y, {
      onRecall: () => this._recall(u),
      onHold: () => this._emit(EVENTS.ORDER_HOLD, { unitId: u.id }),
      onFollow: () => this._emit(EVENTS.ORDER_FOLLOW, { unitId: u.id }),
    });
  }
}
