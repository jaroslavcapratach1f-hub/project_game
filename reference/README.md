# Client Reference — Ideas, Decisions & Responses

This folder records the client's ideas and decisions about Blitzmire, and the
responses we sent, so they are not lost between conversations. Use it when
planning and implementing features.

Each topic file has four parts:
1. **Client's words** — copied exactly as received.
2. **Our response** — what we replied.
3. **Agreed decisions**
4. **Implementation notes / open questions** — technical notes for the
   development team.

## Files

| File | Topic |
|---|---|
| [00-project-vision.md](00-project-vision.md) | Original vision, goals, the flanking example, assessment summary |
| [01-economy-and-monetization.md](01-economy-and-monetization.md) | Timers vs. no timers, the main spending areas (troop cards, officer cards, equipment) |
| [02-development-plan.md](02-development-plan.md) | Phased development plan |
| [03-world-map-alliances-territory.md](03-world-map-alliances-territory.md) | Map levels, forts, resource farms, alliances, territory, fair-play rules, map lifecycle |
| [04-business-operations-payments.md](04-business-operations-payments.md) | Servers after launch, payments (Stripe vs. app stores), business licence, running costs |
| [05-forts-relocation-merges-fairness.md](05-forts-relocation-merges-fairness.md) | Kill stats, fort pyramid, server merges, events, defeated-base and convoy relocation, truck limits, fairness principle |

The Phase 1 blueprint built on these decisions is in
[../phase1/](../phase1/README.md).

## Decisions at a glance

| # | Decision | Status | Source |
|---|---|---|---|
| D1 | Building upgrades are **instant, no timers** (Warpath style); the limit is resources and construction materials | Agreed | 01 |
| D2 | **Research** and **material production** have timers | Agreed | 01 |
| D3 | Main spending area #1: **troop cards** → troop star levels | Agreed | 01 |
| D4 | Main spending area #2: **officer cards** → unlock officer skills | Agreed | 01 |
| D5 | Spending area #3: **officer equipment** → better battle stats | Agreed (design in Phase 1) | 01 |
| D6 | Quality and fun come before speed. "Take as long as needed" | Agreed | 01 |
| D7 | Several **map levels**. New players start on a level-1 map | Client idea, design in Phase 1 | 03 |
| D8 | Level-1 map: resource farms L1–L5, gathered with **Army trucks** | Client idea | 03 |
| D9 | Resource farms possibly **attack-free, first come first served** | Client still considering | 03 |
| D10 | Rings: outer L1 forts (equal buffs) → stronger forts toward the centre → **one central base** with captain stat boosts | Client idea | 03 |
| D11 | Forts that lead to the next map level are built but shown as **"Coming Soon"** | Agreed | 03 |
| D12 | Gates between level-1 maps | Uncertain ("very questionable") | 03 |
| D13 | **Attacking or destroying a base gives zero resources**; the attacker only records kill count and killed troop levels | Client requirement | 03 |
| D14 | Alliance territory must connect to a fort before the alliance can occupy it; territory is built by **relocating bases** into it; relocating into enemy territory blocks their construction | Client requirement | 03 |
| D15 | Lower-level players must be able to take over forts left behind by alliances that move up; the map must refill and must not become a boring farm | Open problem, design in Phase 1 | 03 |
| D16 | A shared multiplayer map is needed **at first release** (follows from D7–D15) | Consequence; built into the Phase 1 roadmap | 03 |
| D17 | Servers, payments, business setup and running costs to be covered in a Phase 1 overview | Agreed | 04 |
| D18 | Attack stats = killed troop count **per troop level** (e.g. L6 ×150, L7 ×200) | Decided | 05 |
| D19 | Fort pyramid: 16 alliances (L1) → 8 (L2) → 4 (L3) → 1 central fort; alternative: a smaller map with limits on territory buildings | Idea, model 2–3 layouts in Phase 1 | 05 |
| D20 | Gates to other L1 maps open after about 1 month | Idea | 05 |
| D21 | Low activity → announce a **7-day server merge event**; all players move to one server; fresh start for alliances | Idea, likely | 05 |
| D22 | Events and daily tasks drive battles, kept to a controlled number (no event flood) | Agreed | 05 |
| D23 | Defeated base (defence = 0) → relocates to a random spot with 10% HP, regenerates over time; post-defeat shield still to be designed | Decided | 05 |
| D24 | Voluntary **Relocate**: base becomes a slow convoy truck; troops move separately; must have our own presentation (IP) | Decided | 05 |
| D25 | Gathering: start with 1 truck and L1 farms; research scales both; L1 map caps at **L5 farms and 5 trucks** (code currently allows 4) | Decided | 05 |
| D26 | Study and play Warpath during Phase 1 before designing the infrastructure | Agreed | 05 |
| D27 | **Core principle:** fair to all, real advantage for spenders, no pay-to-win update treadmill | Core principle | 05 |
