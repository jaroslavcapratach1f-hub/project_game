# 04 — Art Direction and 3D Asset Guide

**Status:** v1.0. The style rules are already strong (CLAUDE.md
"VISUAL STYLE" and "BUILDING VISUAL GUARDRAILS", GDD 24). This document turns
them into a **production plan**: what to make, to what technical limits, in
what order.

## 1. Locked style rules (already decided, keep)

- **Vivid, game-readable WWII**, not a grey, muted diorama. A muted render is
  a failed asset.
- **One shared palette and accent kit** for every building: olive greens,
  warm earth, cool steel, plus at least one accent pop (hazard yellow/black,
  tarp blue `#2E6E8E`, insignia white).
- **Fixed camera** (30° pitch, 45° rotation) and **one light** from the upper
  left, ~5000 K. Never re-lit per building.
- **Same level tier = same look** across all buildings (timber → concrete →
  steel → fortified).
- Every building shows **"something is happening in there"** (an animated
  signature per building, GDD 24 briefs).
- **Original work only**: we copy design language and behaviour, never a
  model, texture, icon or UI layout from another game.

## 2. Where the art is today

| Item | State | Source |
|---|---|---|
| Buildings | 14 of 19 types have a tier-01 / levels 1–6 model. HQ, barracks and the timber defence kit are **approved** for levels 1–6 | `assets/buildings/`, GDD 24 |
| Units | USA tanks (Sherman, Chaffee, Pershing, Hellcat), M12 GMC, US infantry, a super-heavy | `assets/units/` |
| Method | AI-generated base meshes (Replicate TRELLIS) with manual cleanup; Blender scripts | asset packet READMEs |
| Size | 130 GLBs, **168.7 MB**, uncompressed. HQ alone is **11.1 MB** | measured |
| Animation | No skeletal rigs. Infantry legs are separately pivoted parts | GDD 24 status |

The client's view (ref 00): today's AI-generated buildings are **not** the
quality he wants.

## 3. The biggest decision: how often buildings change look (C11)

Buildings go up to level 36 (level 36 is a unique final design).

| Cadence | Looks per building | Models for 19 buildings |
|---|---|---|
| New look every **3** levels (CLAUDE.md today) | 13 | **247** |
| New look every **6** levels (matches the approved 1–6 range) | 7 | **133** |

**Proposed:**
1. Use the **6-level cadence** as the standard. Smaller visual steps inside a
   band (extra props, banners, lights every 3 levels) add variety without a
   full remodel.
2. **Make tiers in the order players reach them.** v1 ships art for the
   levels players reach first (levels 1–18, 3 bands). Higher tiers are made
   after launch, before players get there. Every model gets full attention
   instead of 247 being rushed at once.

## 4. Technical limits (proposal, verified on real phones in Phase 2)

| Asset | Triangles (closest LOD) | Textures | File size (compressed) |
|---|---|---|---|
| Building, one tier | 15k–30k; a second LOD at ~40% | One 1024² set (HQ may use 2048²), KTX2 | ≤ 1.5 MB |
| Tank | ≤ 10k | 1024², KTX2 | ≤ 0.8 MB |
| Infantry soldier | 2k–3k, skeleton ≤ 20 bones | Shared atlas per faction | ≤ 0.3 MB |
| Map object (farm, fort part, prop) | 1k–8k | Shared atlases | ≤ 0.5 MB |
| **First download** | — | — | Target ≤ 150 MB; later tiers download on demand |

Compression: meshopt or Draco for geometry, KTX2 (Basis) for textures.

## 5. Animation

- **Buildings:** node animation exported in glTF: cranes, pumps, smoke,
  conveyor belts, flags, a door opening, lights at night. One signature loop
  per building + an upgrade "build-up" moment.
- **Tanks:** tracks scrolling, turret traverse, gun recoil, muzzle flash,
  damage smoke, destruction.
- **Infantry:** a real skeleton. Walk, run, fire, prone/entrench, hit, die.
- **Officers:** 2D painted portraits (cards and menus); no 3D officer models
  in v1 (proposal).

## 6. Factions and sensitive content

- Factions: Germany, USA, Russia (GDD 03). Vehicles may use real historical
  designations (Sherman, Pershing). Clear the final name list with the IP
  lawyer.
- **No prohibited symbols** (e.g. swastika, SS runes). They're illegal to
  display in some countries and a store-review risk. Use neutral period
  markings (crosses, stars, numerals, unit stencils).
- **Officers are fictional** (C10), with a clear wartime look and no real
  person's face or name.

## 7. Production pipeline (per asset)

1. Brief (GDD 24 per-building brief + its tier).
2. 2D concept in a grounded, colourful setting (grass, road, foliage).
3. **Client approval** of the concept, one building at a time (GDD 24 rule).
4. Block-out placed in the game camera, checked next to the other buildings
   of the same tier.
5. Final model: by an artist, or AI-assisted with cleanup to the same
   standard.
6. Tier variants, animation, LODs, compression.
7. **On-device check** (size, FPS, readability when zoomed out).
8. Final approval, then into the asset catalogue.

For AI-assisted work, confirm each tool's commercial-use and ownership terms
and keep the provenance notes (the project already does this for TRELLIS).

## 8. v1 asset list

Uses the defaults: 6-level cadence, launch art for levels 1–18 (3 bands).
Band 4 (levels 19–24) must be ready before the first players reach level 19
(02 §5).

| Group | Count | Items |
|---|---|---|
| Base buildings | **16 types × 3 bands = 48 looks** (4 band-1 looks already approved: HQ, barracks, wall, towers) | HQ, Treasury, Steelworks, Crude Oil, Engineering Center, Barracks, Armory, Parts Workshop, Disassemble, Assembly, Defence Wall, Attack Towers, Research Center, Hospital, Alliance Hall, Officer Barracks. **After launch:** Recon Post, Reserves Barracks, Black Market; bands 4–6; level-36 finals |
| Base dressing | 1 kit per band | Walls, gates, trenches, props (the timber kit exists) |
| Units | **27 models** + 9 Legion re-skins + 3 gather-truck skins + 1 convoy truck | 9 classes × 3 factions (USA tanks partly exist) |
| World map | **15 farms**, **5 forts**, 1 territory town (3 build stages) | Farms: money/steel/oil × 5 tiers. Forts: L1, L2, L3, central, "Coming Soon" portal. Terrain set and props |
| Characters | **15 officer portraits** (*proposal*: 5 per faction) | 2D painted, fictional |
| UI | 1 full set | Icons, frames, top bar, crate opening, own UI layout (C1) |

## 9. Choosing the artists

Phase 2 produces the hero building (3 bands), one tank and one infantry
squad. This is also the trial for the chosen artist or studio: quality,
style match and on-device results are checked before the bulk of the work.
Order of production follows the roadmap (07).
