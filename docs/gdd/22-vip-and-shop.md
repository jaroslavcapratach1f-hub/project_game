# VIP & Shop  (Monetization)

Warpath parity requires a premium currency and store. This **supersedes** the
old GDD 07 line "no premium hard currency" — **Gold** exists. Money / Steel /
Oil / Materials remain non-lootable (pillar 8); Gold is never lootable either.
Config: `src/config/ShopConfig.js`, `VipConfig.js`.

## GOLD  (premium currency)
- **Sources:** real-money purchase; VIP daily chest; events, leaderboards,
  first-clears; small daily/campaign trickle.
- **Sinks:** shop bundles; instant-finish build / research / heal when out of
  item speed-ups; Armory pulls (Gold → Arms Coupons, or direct pull); recruit
  and Black Market refreshes; teleport / shield / Redeploy purchases; Battle
  Pass; converting Gold → VIP points.
- Gold buys **time, convenience, cosmetics, and gacha attempts** — never
  combat content a F2P player can't otherwise earn.

## VIP
- **VIP points:** 1 Gold = 1 VIP point; also granted by packs and events.
- **VIP level** 0–15+ (`VipConfig`). Each level adds **permanent passive
  perks** — march speed, extra build/research queue, gather rate, hospital
  capacity, shop discount, more daily assists — plus a **daily VIP chest** and
  convenience unlocks (auto-gather, quick-heal, one-tap collect). VIP level
  **never decays**.
- **VIP status** (timed, from the Monthly Card) stacks extra perks while
  active on top of the permanent level.

## SHOP
- **Gold packs** — tiered price → Gold, first-purchase double.
- **Monthly Card** — one purchase: Gold now + daily Gold for 30 days +
  temporary VIP status.
- **Growth / Commander Fund** — pay once, claim escalating rewards as HQ
  level climbs; total value far above price.
- **Special Offers** — state-triggered popups (after a defeat, on level-up,
  when a resource is low); time-limited bundles.
- **Bundles** — resource / speed-up / item packs, officer packs, blueprint
  packs.
- **Cosmetics** — base skins, unit skins, avatar frames, march-trail FX, name
  colours, alliance banners. Cosmetic only — zero stat effect.
- **Subscriptions** — optional weekly/monthly value passes.

## BLACK MARKET  (building #19 — unchanged)
The in-base rotating shop that spends **Money / Steel / Oil + market currency**
(not Gold). Sells resource packs, speed-ups, officer shards, troop parts,
blueprint fragments, equipment parts, cosmetics. See GDD 04 #19.

## FAIR-PLAY GUARDRAILS  (design intent)
- No purchase loots or transfers another player's stockpiled resources.
- No pay-exclusive unit, officer, or research — only skins, time, odds,
  and consumables.
- Peace Shields are purchasable so a spender can always opt out of PvP.
