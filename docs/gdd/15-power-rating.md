# Power Rating

Defined in `src/config/PowerConfig.js`. **Power** is the single public number
on a player's profile and on the world map. It only ever grows with
investment, and it is the **sum of five sources**. Players use it to size up a
target before attacking.

## SOURCES
| Source | Grows with | Notes |
|---|---|---|
| **Buildings** | every level of every building | geometric per level; category-weighted (core ×2, military ×1.4, defense ×1.3, rest ×1) |
| **Troops** | resolved combat stats × squad size | weighted sum of DPS, HP, def, pen, armour, range, speed, accuracy; each extra rendered squad member adds 90% |
| **Research** | each completed rank | per-track weight (military 1.5 highest) |
| **Officers** | star + level + skills + talent nodes | flat per component |
| **Equipment** | each equipped part's rarity + level + completed sets | |

## RULES
- **Monotonic:** no action lowers Power. Losing a battle does not (troops are
  recoverable — GDD 01). Disassembling a troop removes only that troop's
  contribution.
- **Total** = `totalPower({ buildings, troops, research, officers, equipment })`.
- Shown per-source in the profile so a player can see *where* someone is strong
  (e.g. high building Power but low troop Power = soft target).
- Target-selection UI compares your total vs theirs and flags safe / even /
  risky.

## TUNING
All weights are DRAFT. Calibrate so a day-1 account reads ~1–2k and a maxed
account reads in the millions, with troop Power the largest share at endgame.
