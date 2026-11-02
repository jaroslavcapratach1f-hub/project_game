# dev/ — legacy dev harnesses

Session 2–21 in-browser probes (camera, AI, entities, orders, personnel,
screens, skirmish). Moved out of `src/` in the Sessions-1–6 cleanup: nothing
loads them (there is no `?dev=` router), the build ignores this folder, and
most of them import modules that have since been **deleted or rewritten** —
the battle HUD family, `world/Battlefield` + `MapGenerator`, `src/skirmish/`,
the front-end screens (see `docs/CODE_AUDIT.md`).

They are kept for reference and partial salvage only. To revive one, expect to
rewire it against the current world-map stack (`src/worldmap/`, `src/onslaught/`,
`src/ui/hud/`). Pre-cleanup working copies are in git history at the commit
before this folder was created.

## Current defence comparison (not a legacy harness)
`defence/index.html` is served at `/dev/defence/` by Vite. It imports the
current DefenceWall3D, AttackTowers3D and shared kit/placement modules and
uses the gameplay camera angles and lighting config. It is an art-only
comparison; live WorldScene collision, selection and mobile checks must
still be performed separately. See docs/DEFENCE_PERIMETER_PLAN.md.

## Current HQ comparison
`headquarters/index.html` is served at `/dev/headquarters/`. It renders the
current timber HQ GLB with shared gameplay camera/light constants. This is
asset inspection only; actual WorldScene placement and selection must also
be checked. See docs/HEADQUARTERS_REDESIGN_PLAN.md.
