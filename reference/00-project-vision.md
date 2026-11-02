# 00 — Project Vision & Initial Assessment

## Client background and goals (as first briefed)

- The client wants a visually impressive, production-ready **3D military
  strategy game inspired by Warpath**. It should keep Warpath's strategic
  structure while improving graphics, battlefield behaviour, building systems,
  animation and tactical depth.
- He built the current prototype as a hobby, using Claude Code and other AI
  tools. He is not a professional developer, and he built what he could
  himself to give the project a head start.
- His main concerns are **visual quality, building design, animation, game
  architecture, storytelling and overall game design**.
- The current AI-generated building art does **not** represent the quality he
  wants. He wants realistic, well-designed buildings with **animated parts**
  and **upgrades that visibly change the building**.
- He wants detailed military units, tanks, officers and animated 3D characters.
- He wants engaging missions and a story.
- His goal is an attractive, commercially viable first version, improved over
  time, built in clear milestones as a long-term partnership.

## Tactical battle example (client idea, not yet a final requirement)

> Player A has two troop formations. Player B has one. One of Player A's
> formations engages the enemy directly, while the second moves around the
> enemy and attacks from behind. The rear attack should provide a meaningful
> tactical advantage.

What already exists in the code: front/side/rear armour facings in
`src/combat/DamageResolver.js` and `src/entities/Entity.js` (`facingOf`), and
an AI "flank" movement profile in `src/ai/Behaviors.js`. Rear hits already do
more damage to armoured targets.
Missing: formations, group orders, a "go around and attack from behind" order,
cover, line of sight.

## Assessment summary (Oct 2026, source code read only — nothing was run)

- **Stage:** playable single-player browser prototype. No backend, no saving,
  no accounts.
- **Keep:** the simulation code (AI, combat, economy, pathfinding). None of it
  depends on the graphics code, so it can later run on a server.
- **Rebuild:** the rendering setup. Three separate WebGL renderers are stitched
  together every frame. This is likely heavy on phones, and units can't be
  drawn behind buildings correctly.
- **Replace:** the placeholder AI-generated (TRELLIS) models. About 169 MB of
  GLBs, no compression, no rigs.
- **Build:** server, persistence, anti-cheat, missions, tutorial, building
  level-tier art, character animation, formations.
- **Recommended strategy:** keep the useful systems and rebuild the problem
  areas selectively. No engine migration for now; check real-phone performance
  early in Phase 2.
- **Risk to address:** the docs call the game a "Warpath clone… re-skinned".
  Blitzmire should have its own visual identity and get a short IP review.

The full Phase 1 blueprint is in [../phase1/](../phase1/README.md).
