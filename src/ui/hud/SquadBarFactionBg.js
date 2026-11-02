/**
 * SquadBarFactionBg — loads the S58 faction background photos
 * (`FactionBgConfig`) once (Pixi's own `Assets` cache dedupes repeat
 * calls, including a future faction-menu screen loading the same URLs)
 * and hands back a plain `{faction: Texture}` map for `SquadBar` to paint
 * behind each card's live 3D portrait.
 */
import { Assets } from 'pixi.js';
import { FACTION_BG_URL } from '../../config/FactionBgConfig.js';

/** @returns {Promise<Object<string,import('pixi.js').Texture>>} faction -> loaded texture */
export function loadFactionTextures() {
  return Assets.load(Object.values(FACTION_BG_URL)).then((textures) => {
    const out = {};
    for (const faction of Object.keys(FACTION_BG_URL)) out[faction] = textures[FACTION_BG_URL[faction]];
    return out;
  });
}
