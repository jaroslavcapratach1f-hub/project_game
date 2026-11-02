Validate a Blitzmire UI spec before implementation starts. Acts as the
quality gate between /ui-spec and ui-programmer. Target file comes from
the command argument (docs/ux/[name].md); if none given, ask which spec.

This is read-only — never edits the spec. Verdict: APPROVED / NEEDS
REVISION / MAJOR REVISION NEEDED.

1. Read the target spec in full. If it doesn't exist, say so and point to
   `/ui-spec` — do not proceed.
2. Read CLAUDE.md and ARCHITECTURE.md — they outrank the spec. Check
   first for violations of CLAUDE.md's hard constraints (no pause, one
   persistent map, ground-war-only), VISUAL STYLE / BUILDING VISUAL
   GUARDRAILS (no new ad hoc palette), and RENDERING LAYERS (the spec's
   layer assignment must be a real layer from that table).
3. Design System check: does the Layout section reuse existing
   `src/ui/controls/` / `src/ui/hud/` components wherever an equivalent
   already exists? Any new component must be listed under "Design System
   Candidates," not slipped in as if it were ordinary. Flag anything that
   invents a one-off visual treatment instead of reusing the shared kit.
4. Completeness (every section from /ui-spec's skeleton must have real
   content, not a placeholder):
   - Purpose stated from the player's perspective, not a system's
   - Navigation position matches docs/gdd/23-ux-navigation.md
   - All of empty / loading / populated / error / disabled states present
   - Every interactive element has a touch target and it's >= ~44px
   - No data element is "owned by UI" — each has a real source system
   - Acceptance criteria: 5+, specific, testable without re-reading other
     docs
5. Visual-principle check (frontend-design's categories, judged
   conceptually — never by invoking it to generate code here): hierarchy,
   composition, spacing, typography, contrast, depth, interaction
   feedback. Flag anything that reads as a generic/templated default. Flag
   immediately, as MAJOR REVISION NEEDED, anything that assumes HTML/CSS/
   DOM/React/Tailwind or any non-PixiJS/Three.js approach.
6. Report:
   - Blocking issues (must fix before implementation)
   - Advisory issues (recommended, not blocking)
   - Verdict: APPROVED / NEEDS REVISION / MAJOR REVISION NEEDED
7. On APPROVED: say implementation may proceed via the `ui-programmer`
   subagent, spec path included.
   On NEEDS REVISION: name the specific fixes; the spec is revised in
   place (via /ui-spec or ux-designer directly), not discarded, then
   re-reviewed.
   On MAJOR REVISION NEEDED: name which sections need rethinking and
   recommend returning to /ui-spec for those sections.
8. Never block silently — if the user chooses to proceed past NEEDS
   REVISION, note in your summary that it was a conscious override.
