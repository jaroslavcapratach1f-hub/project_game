/**
 * FactionBgConfig — the faction-identifying background photos (S58's 6
 * stored images, `public/menu/`), keyed by faction. Horizontal only here —
 * SquadBar's cards are always landscape-shaped regardless of device
 * orientation; the vertical variants are already stored for the future
 * faction menu screens this doesn't build yet.
 */
export const FACTION_BG_URL = {
  germany: '/menu/germany_horizontal.jpg',
  usa: '/menu/usa_horizontal.jpg',
  russia: '/menu/russia_horizontal.jpg',
};
