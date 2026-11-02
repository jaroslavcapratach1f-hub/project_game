# Phase 1 — Planning & Architecture: Blueprint

**Version:** 1.0

This folder is the Phase 1 blueprint for Blitzmire v1: architecture, game
systems, scope and the roadmap for the next phases. No game code was changed
in this phase.

Where a client decision was still missing, the blueprint uses our
**recommended default** (§2). Changing a default later only changes the
affected section, not the plan as a whole.

## 1. Documents

| # | Deliverable | File |
|---|---|---|
| 0 | Baseline (measured) and conflict register | [00-baseline-and-conflicts.md](00-baseline-and-conflicts.md) |
| 1 | Technical architecture: game, server, database | [01-technical-architecture.md](01-technical-architecture.md) |
| 2 | Economy design | [02-economy-design.md](02-economy-design.md) |
| 3 | Monetisation design | [03-monetisation-design.md](03-monetisation-design.md) |
| 4 | Art direction + 3D asset guide | [04-art-direction-asset-guide.md](04-art-direction-asset-guide.md) |
| 5 | Battlefield: formations, flanking, tactical AI | [05-battlefield-design.md](05-battlefield-design.md) |
| 6 | World map, alliance & territory | [06-world-map-alliance-territory.md](06-world-map-alliance-territory.md) |
| 7 | V1 scope and roadmap | [07-v1-scope-and-roadmap.md](07-v1-scope-and-roadmap.md) |
| 8 | Project setup: version control & code checks | [08-project-setup.md](08-project-setup.md) |
| 9 | Operating cost & business setup | [09-operating-costs-business.md](09-operating-costs-business.md) |
| 10 | Warpath study plan (D26) | [10-warpath-study-plan.md](10-warpath-study-plan.md) |

Built on: the client's decisions D1–D27 ([../reference/](../reference/README.md)),
the client's Game Design Document ([../docs/gdd/](../docs/gdd/README.md)) and
the code as measured on 2 Nov 2026.

## 2. Decisions for the client to confirm (defaults in use)

| # | Question | Default used | Where |
|---|---|---|---|
| 1 | Kill statistics: by star level or troop level? | **Star level** (Gold I, Gold II…) | 00 C3, 06 §6.5 |
| 2 | Equipment: on officers or on troops? | **On officers**, reusing the GDD 13 slots and sets | 00 C9, 03 §4.3 |
| 3 | Officers: real historical or fictional? | **Fictional** | 00 C10, 04 §6 |
| 4 | Troop training timers? | **Kept** (as in code today) | 00 C18 |
| 5 | Building look changes every 3 or 6 levels? | **Every 6 levels** + small details in between | 00 C11, 04 §3 |
| 6 | Pity counter after a lucky 5★? | **Keeps counting** (banking, as GDD 08) | 03 §3 |
| 7 | World map layout? | **Layout A** (16/8/4/1 pyramid) built from modules that allow gates later | 06 §4 |
| 8 | Players per L1 map (planning figure) | **1,500** | 06 §5, 09 |
| 9 | Launch markets and languages | A few English-speaking markets, English only | 03 §6 |
| 10 | Country of the company | **Needed from the client** before company and store setup; doesn't block Phase 2 | 09 |

Every item marked **Proposed** in the conflict register (00) also applies
unless the client objects.

## 3. Status legend

- **Decided:** decided by the client (D-number in `reference/`).
- **Proposed / default:** our recommendation, in use until the client says
  otherwise.
- *proposal* next to a number: a starting value, tuned in a later phase.

## 4. Next step

**Phase 2: Quality sample + technical spike** (07 §3). It proves the
renderer, phone performance, the server-shared map and the flanking battle
before the large phases begin.
