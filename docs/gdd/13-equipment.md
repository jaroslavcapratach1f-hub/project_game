# Equipment — Troop Parts & Sets

Defined in `src/config/equipment/`. Crafted and enhanced at the **Parts
Workshop** (#7); dropped by crates and the **Black Market** (#19).

## SLOTS
Every **combat** troop has **3 equipment slots** (the Gather Truck has none):
| Slot | Accepts stats |
|---|---|
| Firepower | dmg, pen, rof |
| Protection | armor, hp, def |
| Support | rng, spd, acc, dodge |

## PARTS
A part has a **family**, a **rarity**, and an **enhancement level**.
- **Rarities:** Common ×1.0 (max L10), Uncommon ×1.35 (L15), Rare ×1.8 (L20),
  Epic ×2.4 (L25), Legendary ×3.2 (L30).
- **Value** = `(base + perLevel·(level−1)) · rarityMult`, either a percent
  (feeds `equipmentPct`, capped per stat in `StatResolution`) or a flat add
  (feeds `equipmentFlat`, applied after the multiplier bucket).
- **Enhance** spends **Troop Component** + Money + time, growing per level;
  sped up by `equipmentCraftSpeed`.

## FAMILIES & SET BONUSES
Six families: **Blitz** (mobility/aggression), **Bulwark** (protection),
**Marksman** (range/accuracy), **Assault** (raw damage), **Hunter**
(penetration), **Siege** (evasion/durability for exposed guns).

With only 3 slots, wearing **2** or **3** parts of one family grants that
family's set bonus (e.g. Bulwark 2-pc +8% HP, 3-pc +12% armor & +12 def). A
troop can complete at most one 3-piece set.

## RESOLUTION ORDER
`resolveEquipment(loadout)` → `{ equipmentPct, equipmentFlat }` → passed into
`StatResolution.resolveStat` as the `equipmentPct` (inside the additive bucket,
capped) and `equipmentFlat` (added after) layers. Set bonuses are folded in
before resolution.

## POWER
Each equipped part adds Power by rarity + level; each completed set adds a flat
bonus (see 15-power-rating).
