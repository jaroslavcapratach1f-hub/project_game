Write a UX specification for one Blitzmire screen, HUD element, or flow —
before any implementation. Screen/flow name comes from the command
argument; if none was given, ask what we're speccing.

This does NOT implement anything. It produces one file:
docs/ux/[screen-name].md

1. Read CLAUDE.md (hard constraints, VISUAL STYLE, BUILDING VISUAL
   GUARDRAILS, RENDERING LAYERS) and ARCHITECTURE.md (current state).
2. Read docs/gdd/23-ux-navigation.md for where this screen sits in the
   nav/flow map, and docs/gdd/01-core-pillars.md for pillar alignment.
   Read any other docs/gdd/ file that specifically covers this screen's
   system (ask which, if more than one plausibly applies).
3. Inventory what already exists before designing anything new:
   - `src/ui/controls/` and `src/ui/hud/` for reusable components
   - `src/config/HudConfig.js`, `MenuConfig.js`, `BuildingMenuConfig.js`
     for existing layout/timing tokens
   - `docs/ui/DESIGN_SYSTEM.md`, if it exists (note once if it doesn't —
     don't re-flag it every run)
4. Delegate authoring to the `ux-designer` subagent (Agent tool,
   subagent_type: ux-designer), handing it: the screen/flow name, the GDD
   context from step 2, and the existing-component inventory from step 3.
   ux-designer owns structure, flow, and touch usability — not visual
   style.
5. If the user has a Figma reference for this screen, pull it via Figma
   MCP for layout/structure reference only — never as the visual target.
6. Spec sections (touch-first mobile; no localization/gamepad — Blitzmire
   has neither today):
   - Purpose & Player Need
   - Navigation Position (per GDD 23)
   - Entry & Exit Points
   - Layout (Pixi layer per CLAUDE.md's RENDERING LAYERS table; which
     existing components are reused vs. genuinely new)
   - States & Variants (empty / loading / populated / error / disabled)
   - Touch Interaction Map (every tap/drag/hold target, minimum ~44px)
   - Data & Events (EventEmitter sources/sinks — UI never owns state)
   - Visual Notes (palette/accent reference to CLAUDE.md — not a new
     palette; flag anything that needs art-bible judgment rather than
     deciding it here)
   - Design System Candidates (any new component/pattern proposed, to be
     folded into `docs/ui/DESIGN_SYSTEM.md` once it exists)
   - Acceptance Criteria (5+, specific and testable)
   - Open Questions
7. Ask before creating the file, and again before writing each section —
   ux-designer's own protocol already requires this; don't skip it even
   when running this command directly.
8. When complete, suggest `/ui-review docs/ux/[screen-name].md` next.
   Implementation (`ui-programmer`) does not start until that returns
   APPROVED.
