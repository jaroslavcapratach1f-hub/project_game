/**
 * researchLabels — derives a readable label from a research node/track's
 * own real id, MECHANICALLY (strip the track prefix, Title-Case each
 * remaining token). No node anywhere in `src/config/research/` has a
 * display-name field, and neither the GDD nor the tree files hand-author
 * per-node flavor text — inventing ~57 names would be fabricating content
 * that doesn't exist in the design docs (CLAUDE.md's anti-fabrication
 * rule), so this formats the real identifier instead. The small ACRONYM
 * table is still 100% mechanical (a literal-token lookup for abbreviations
 * that actually appear in real ids — `hp`, `rof`, `aoe`, `exp`, `us`), just
 * preventing those from reading as typos ("Hp"/"Rof"/"Aoe"/"Exp"/"Us").
 */
import { RESEARCH_HUB } from '../config/ResearchScreenConfig.js';

const TRACK_PREFIX = { development: 'dev_', military: 'mil_', doctrine: 'doc_', defense: 'def_', support: 'sup_' };
const ACRONYM = { hp: 'HP', rof: 'RoF', aoe: 'AoE', exp: 'EXP', us: 'US' };

/** @param {object} node a RESEARCH_NODES entry @returns {string} e.g. "dev_gather_trucks" -> "Gather Trucks" */
export function nodeLabel(node) {
  const prefix = TRACK_PREFIX[node.track] ?? '';
  const rest = node.id.startsWith(prefix) ? node.id.slice(prefix.length) : node.id;
  return rest.split('_').map((w) => ACRONYM[w] ?? (w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
}

/** @param {string} track a TRACKS entry (or 'placeholder') @returns {string} the hub's own real display name (e.g. "Industry" for 'development' — not a mechanical capitalize, since the player's own name for a track can differ from its internal id) */
export function trackLabel(track) {
  return RESEARCH_HUB.trackLabel[track] ?? (track.charAt(0).toUpperCase() + track.slice(1));
}
