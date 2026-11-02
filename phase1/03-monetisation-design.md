# 03 — Monetisation Design

**Status:** v1.0. This document sets the structure and rules. Prices and
exact rates are set with the balance model (02 §6).

## 1. Decided

| Decision | Source |
|---|---|
| Spending area 1: **troop cards**, used to raise troop star levels | D3 |
| Spending area 2: **officer cards**, used to unlock officer skills | D4 |
| Spending area 3: **equipment** for better battle stats | D5 (owner open, C9) |
| Fair to all, a big advantage for spenders, **no pay-to-win treadmill**, no flood of events and buildings made only to sell | D27 |
| No purchase can take resources from another player | D13, GDD 22 |

## 2. What the GDD and code already define

| Item | Current value | Source |
|---|---|---|
| Troop crate rates | 5★ 2% · 4★+ 8% · 4★ 30% · 3★ 60% | `ArmoryConfig.DROP_RATES` |
| Troop pity | Guaranteed 5★ at 100 draws; up to 300 can be banked | `ArmoryConfig.PITY`, GDD 08 |
| Officer crate rates | 5★ 2% · 4★ 14% · 3★ 84%; pity at 60, bank up to 120 | `ArmoryConfig` |
| Duplicates | Officers → shards (20 / 40 / 80 by star); promotion costs 50 and 150 shards | `ArmoryConfig`, `OfficerConfig` |
| Star ladder | 3★ → 4★ → … → Gold II++; copies needed rise from 1 to 4 | `StarTiers.js`, GDD 10 |
| Early drop pool | Days 1–9: 4 classes only; day 10+: all 9 | `ArmoryConfig.DROP_POOL` |
| Country crates | Open from server day 4 and HQ 6 | `ArmoryConfig.CRATE_UNLOCK` |
| Gold, VIP 0–15, Monthly Card, Growth Fund, bundles, cosmetics, Battle Pass | Designed in text | GDD 21, 22 |
| VIP perk table | **Copied reference data**: must be replaced (C2) | `VipConfig.js` |

Draw logic, shop and purchases are **not built** yet.

## 3. Measured: what the current rates really give

| Crate | Base 5★ rate | Pulls per 5★ on average* | Players who hit pity |
|---|---|---|---|
| Troop | 2% | **43.4** (real rate ≈ 2.3%) | 13.5% |
| Officer | 2% | **35.1** (real rate ≈ 2.9%) | 30.4% |

\*Assumes the pity counter **resets after any 5★**. GDD 08 also allows
"banking" (300/100), which suggests the counter **does not reset** on a lucky
5★. In that case the real rates are 3.0% (troop) and 3.7% (officer). **This
rule must be decided**, because it changes the value of every purchase by
about 30%.

## 4. Proposed structure

### 4.1 Troop cards (main spending area)
- Crates with published odds and visible pity. Banking stays (players like
  it), with one clear rule about resets.
- **Free path:** Arms Coupons from daily tasks, campaign and events. *Proposal:*
  a free player who plays daily reaches pity about **once a month**. Calibrate
  in the model.
- **Paid path:** Gold → coupons, plus bundles. Spenders get there sooner and
  more often. They get no unit a free player can never get.
- Star-ups use real copies (GDD 08/10). This is where spending power
  concentrates, as the client asked.

### 4.2 Officer cards (second area)
- Separate officer crates and pity (already in config).
- Skills unlock with level and star (GDD 05); duplicates become shards for
  promotion.
- **Officers should be fictional characters** (C10).

### 4.3 Equipment (third area), owner to decide (C9)
| Option | How it works | For | Against |
|---|---|---|---|
| A. On troops (GDD 13 today) | 3 slots per troop: Firepower, Protection, Support; 6 set families | Already designed and in config | Many troops means lots of items to manage |
| B. On officers (client's wording) | Same 3 slots and sets, but on the officer; the bonus follows the officer to whichever squad they lead | Easy to understand; makes officers more valuable (connects areas 2 and 3) | Needs the stat rules moved from troop to squad |

### 4.4 VIP, passes and shop
- **Own VIP table** (replaces C2): perks focus on convenience (queues,
  auto-collect, daily chest) and modest economy speed. **Proposal:** no VIP
  level gives direct combat stats. The copied table includes +5% troop HP,
  firepower and damage resistance at higher levels.
- **At launch (proposal):** Gold packs, Monthly Card, Growth Fund, one
  Battle Pass track, a few bundles, cosmetics. More later, guided by data.
- **Shields:** purchasable, but not usable while holding a fort or blocking
  territory (C17).
- No Gold speed-ups for buildings (they're instant; C12).

## 5. Fairness guardrails (D27), written as testable rules

1. **No pay-only power.** Every unit, officer, research and equipment item can
   be earned free (GDD 22 already says this).
2. **Spending buys time, odds and convenience**, not exclusive strength.
3. **Power-gap target:** a measured limit on the Power difference between a
   free player and a heavy spender with the same play days (e.g. at day 30
   and day 90). Set it in the model; check it with real data after launch.
4. **Update rule:** no new power tier (e.g. Gold III, ladder keys 8.5+) for a
   set period after launch. Updates must add gameplay first.
5. **Event cap:** a maximum number of events running at once (C14).

## 6. Compliance checklist

- [ ] Odds shown in-game **before** purchase for every random item (Apple and
      Google require this).
- [ ] Draws made on the server; audit log with rate-table version (01 §6).
- [ ] Market check per launch country. **Belgium** treats paid loot boxes as
      gambling, so paid crates must be off there or not launched there. Several
      other countries have rating or labelling rules for paid random items
      (e.g. Australia's classification rules); verify for each target market.
- [ ] Age rating questionnaires answered with "in-game purchases" and
      "random items".
- [ ] Spending protections for minors; refund handling.
- [ ] Store receipt validation and idempotent grants (01 §6).

## 7. Defaults used (client can change)

1. The pity counter **keeps counting** after a lucky 5★ (banking, GDD 08):
   real 5★ rates 3.0% (troop) and 3.7% (officer).
2. Equipment sits on **officers** (option B, C9).
3. A free player who plays daily reaches troop pity about once a month.
4. VIP gives **convenience and economy perks only**, no direct combat stats.
5. Launch in a few English-speaking markets first; §6 is checked for each.
