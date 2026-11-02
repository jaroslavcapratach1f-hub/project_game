/**
 * UnitHeroConfig — `TroopDetailScreen`'s static "hero" photo per roster key
 * (the player's own explicit ask: an image already in the asset files,
 * "not a 3D model", "more detailed visually" than the live snapshot). Each
 * PNG is that unit's own existing render — concept art for most, a cropped
 * turntable-video frame for `m24_chaffee` (no concept art exists for it) —
 * with its studio background removed offline
 * (`assets/units/_hero/bg_remove.py` — a smooth distance-from-background-
 * colour alpha ramp, not a hard threshold) and downsized to a 700px-long-
 * edge display size (matches the S61 mobile-payload lesson — see
 * docs/SESSION_LOG.md). Every roster unit has an entry; `TroopHeroImage.js`
 * only falls back to the live 3D snapshot if a URL ever fails to load.
 */
import m4ShermanHero from '../../assets/units/m4_sherman/tier01/m4_sherman_hero.png';
import m18HellcatHero from '../../assets/units/m18_hellcat/tier01/m18_hellcat_hero.png';
import m26PershingHero from '../../assets/units/m26_pershing/tier01/m26_pershing_hero.png';
import soldierHero from '../../assets/units/us_infantry/tier01/soldier_hero.png';
import m24ChaffeeHero from '../../assets/units/m24_chaffee/tier01/m24_chaffee_hero.png';
import howitzerHero from '../../assets/units/m12_gmc/tier01/howitzer_hero.png';

/** roster key -> hero image URL. Infantry roster keys share one photo (same class render). */
export const UNIT_HERO_URL = {
  m4_sherman: m4ShermanHero,
  m18_hellcat: m18HellcatHero,
  m26_pershing: m26PershingHero,
  springfield_squad: soldierHero,
  m1garand_squad: soldierHero,
  m2carbine_squad: soldierHero,
  m24_chaffee: m24ChaffeeHero,
  m12_gmc: howitzerHero,
};
