/**
 * ResearchNodeDetailRows — the node detail popup's own info rows: Power,
 * Time, and (the player's own explicit move, out of the tree's former
 * tier header) the gate ("Unlocks at Research Center/HQ Lvl N") and
 * prerequisite ("Requires: X") lines — shown ONLY while actually still
 * locked, same as the tier header used to only show its own requirement
 * text when locked, keeping an already-unlocked node's popup uncluttered.
 * Split out of `ResearchNodeDetail` purely to keep that file under the
 * 150-line cap.
 */
import { Text, TextStyle } from 'pixi.js';
import { WORLD_HUD } from '../../config/HudConfig.js';
import { RESEARCH_DETAIL as C } from '../../config/ResearchScreenConfig.js';

const ROW_GAP_SCALE = 0.6;

export class ResearchNodeDetailRows {
  constructor() {
    const fam = WORLD_HUD.fontFamily;
    this._powerLabel = new Text({ text: 'Power', style: new TextStyle({ fontFamily: fam, fontSize: C.rowPx, fill: WORLD_HUD.dimColor }) });
    this._powerValue = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: C.rowPx, fill: C.powerColor, fontWeight: 'bold' }) });
    this._powerValue.anchor.set(1, 0);
    this._timeLabel = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: C.rowPx, fill: WORLD_HUD.dimColor }) });
    this._gateLabel = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: C.gatePx, fill: C.gateLockedColor, fontWeight: 'bold' }) });
    this._requiresLabel = new Text({ text: '', style: new TextStyle({ fontFamily: fam, fontSize: C.gatePx, fill: C.gateLockedColor, fontWeight: 'bold', wordWrap: true }) });
    this.children = [this._powerLabel, this._powerValue, this._timeLabel, this._gateLabel, this._requiresLabel];
  }

  /** @param {object} state from `ResearchTreeView.stateFor` @param {number} power real Power gain for the rank about to be bought @param {string} timeText already-formatted, or '' to hide @returns {void} */
  setState(state, power, timeText) {
    this._powerValue.text = `+${power.toLocaleString('en-US')}`;
    this._timeLabel.text = timeText;
    this._gateLabel.text = state.gate.met ? '' : `Unlocks at ${state.gate.label}`;
    this._requiresLabel.text = state.requires && !state.requires.met ? `Requires: ${state.requires.label}` : '';
  }

  /** @param {number} x @param {number} y @param {number} w @returns {number} the Y just below these rows */
  layout(x, y, w) {
    this._powerLabel.position.set(x, y); this._powerValue.position.set(x + w, y); y += C.rowPx + C.rowGapPx;
    this._timeLabel.position.set(x, y);
    if (this._timeLabel.text) y += C.rowPx + C.rowGapPx;
    if (this._gateLabel.text) { this._gateLabel.position.set(x, y); y += C.gatePx + C.rowGapPx * ROW_GAP_SCALE; }
    if (this._requiresLabel.text) {
      this._requiresLabel.style.wordWrapWidth = w;
      this._requiresLabel.position.set(x, y);
      y += this._requiresLabel.height + C.rowGapPx * ROW_GAP_SCALE;
    }
    return y;
  }
}
