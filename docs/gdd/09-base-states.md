# Base States & Destruction

## STATE 1: DEPLOYED
- Full function on world map. Built-in defense guns.
- Gun range wider than ANY troop range.
- Troops inside ADD firepower to base gun output.
- Troops inside ADD defense stats to base HP pool.
- Base HP regenerates over time (max ~8 hours to full).
- Defense DORMANT by default. Activates on Base Fury only.

## STATE 2: CARAVAN MODE (Free, Unlimited)
- ALL troops ejected. Stand at current base location.
- Base transforms into slow truck (slower than infantry).
- NO weapons. Very high passive HP. Visible to ALL players.
- Player MUST manually drag troops alongside.
- Allies can voluntarily send troops to defend caravan.
- Caravan HP zero = forced random relocation.

## STATE 3: REDEPLOY (Limited Charges)
- Max 3/3 charges. Regen 1 per 8 hours. Cannot exceed 3.
- Near-instant relocation — motorised column / rail redeployment animation
  (no aircraft). Chosen or random destination per the teleport item used.
- Purchase: only available at 0/3. Restores to 1/3 only.

## STATE 4: CLOUD STATE
- Base invisible on map. Cannot be attacked or found.
- Exists only as data. Used when offline after destruction.

## DESTRUCTION SCENARIOS

SCENARIO 1 (Online, troops inside):
- Base HP zero → camera drag to explosion → random new location
  → motorised redeployment → base re-deploys at 0 HP
- Popup: "Relocate Troops? YES/NO"
- Troops STAY at old location
- YES = surviving troops teleport to new base
- NO = player keeps control at old location

SCENARIO 2 (Online, troops outside):
- Same as Scenario 1
- Pulls player attention from battlefield (enemy window)

SCENARIO 3 (Offline):
- Base enters Cloud State
- Login: notification → redeployment animation → random deploy
- Surviving troops: march manually or dismantle

SCENARIO 4 (Offline 30+ days):
- Base in Cloud State (safe)
- Troops on map killed by system after 30 days
- Personnel deducted (regenerates later)