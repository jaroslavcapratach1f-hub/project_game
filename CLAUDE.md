# CLAUDE.md — Blitzmire

## PROJECT IDENTITY
Mobile WWII military strategy game called "Blitzmire."
Persistent multiplayer base-building, gacha troop acquisition,
faction-based armies (Germany/USA/Russia), squad combat, PvP
on one shared, always-on world map.

**Design north star: Warpath parity.** Blitzmire matches Warpath
(Lilith Games' WWII persistent MMO strategy) — its gameplay, functions,
menus, fields, and screen flow. Where a design detail is thin, do it
the Warpath way. See docs/gdd/01-core-pillars.md.

The DESIGN is modelled on Warpath; the WORK is original — all code,
assets, art, unit/officer/faction names, story, and the NPC enemy
faction ("the Legion", not "Raven") are our own. Do not copy Warpath
art, text, code, or trademarked names.

**Hard constraints (never violate):** ground war only — no aircraft,
no naval, no scout planes, no shooter/FPS mode; one persistent shared
world map — no menu, no screen-swap, no separate battlefield (combat
resolves in place on the map); no pause (always-online; Settings is an
overlay); the base is a place on the map that expands on zoom-in.

Read these files before ANY work:
1. This file (CLAUDE.md) — coding rules and standards
2. ARCHITECTURE.md — current project state and file map (present-tense
   only; do not add history here — see docs/SESSION_LOG.md below)
3. GDD files in docs/gdd/ — game design specifications

docs/SESSION_LOG.md holds session-by-session history. It is NOT required
reading before work — only consult it when you need past context (why
something was built a certain way, what a prior session verified). It grows
every session by design (it's a changelog) — once it's long, look it up with
Grep for the session number or keyword, then read just that entry. Never
read the whole file top-to-bottom; that habit is what made ARCHITECTURE.md
unmanageable before this split.

## TECH STACK
- Renderer: **the whole game is moving to 3D, not just buildings** (S54
  direction, extended same session) — buildings, tanks, troops, the world
  map terrain, fog of war, and every other world structure render as real
  3D models, never pre-rendered sprites or flat 2D shapes. Ground war only
  still applies (see hard constraints below) — this is a rendering-fidelity
  change, not a design-scope change. Engine approach: PixiJS 8.x
  (WebGL-accelerated 2D) hosts the HUD/UI layer; a live Three.js layer
  (`src/engine/Base3DLayer.js`) is composited into the Pixi scene graph as
  an off-screen-canvas-backed Sprite for 3D world content — buildings are
  the first system converted (see `Base3DConfig.js` for the camera math
  that keeps 3D and 2D content in lockstep); USA light/medium tanks now also use the shared `Unit3DLayer` / `Unit3DBody`
  path; remaining units, world terrain and fog are next targets — this is a large,
  perf-sensitive undertaking (see PERFORMANCE TARGETS below) that should be
  planned system-by-system, not attempted as one change.
- Animation: GSAP for UI, custom tweening for gameplay
- Audio: Howler.js + Web Audio API for procedural sounds
- Build: Vite
- Platform: Mobile-first (touch controls)
- Language: Vanilla JavaScript ES6+ modules
- Editor: Cursor IDE
- No TypeScript. No React. No frameworks.

## CODE RULES (STRICT)
1. Max file length: 150 lines. Split if approaching 150.
2. Single Responsibility: 1 file = 1 class OR 1 system.
3. No god classes. Break large systems into sub-modules.
4. Named exports only. No default exports.
5. JSDoc comments on all public methods.
6. All tuneable values in src/config/ files. No magic numbers.
7. Event-driven communication via EventEmitter.
8. Object pooling for frequently created/destroyed objects.
9. Never create objects during gameplay loop. Pre-allocate.
10. Max 50 lines per function. Split if longer.

## FILE NAMING
- Classes: PascalCase.js (MediumTank.js, ParticleSystem.js)
- Configs: PascalCase.js (GameConfig.js, UnitStats.js)
- Utils: PascalCase.js (MathUtils.js, ObjectPool.js)
- One class per file. File name matches class name exactly.

## RENDERING LAYERS (PixiJS Container order)
- Layer 0: sky/background
- Layer 1: terrain tiles
- Layer 2: ground decals (tracks, craters, scorch marks)
- Layer 3: shadows and selection indicators
- Layer 4: ground units (infantry, deployed artillery)
- Layer 5: vehicles (tanks, armored cars, mobile artillery)
- Layer 6: projectiles
- Layer 7: lower particles (dust, dirt)
- Layer 8: upper particles (explosions, fire, smoke)
- Layer 9: weather effects and fog of war
- Layer 10: world-space UI (health bars, labels, damage numbers)
- Layer 11: screen-space HUD (fixed UI, buttons, panels)
- Layer 12: overlay effects (vignette, flash, menus)

## VISUAL STYLE
- Semi-realistic military, World War II era — **vivid and game-readable,
  not a desaturated realism diorama.** A flat, muted, "nothing but grey
  concrete and mud" render is a FAILED asset, full stop — regenerate it.
  Reference bar: Warpath's own base renders (Blitzmire's north star — see
  PROJECT IDENTITY above), not a moody military art-book study.
- Color palette (saturated military — desaturated is NOT the goal):
  * Greens: #4B6B1F, #5C7A29, #6F8F35 (true olive/field green — push
    chroma up, not just value; avoid grey-green mud)
  * Earth: #6B4423, #8B5A2B, #A67C4E (warm saturated browns)
  * Metal: #55595E, #767C82, #9AA0A6 (cool steel greys that still read
    as distinct color against the greens/earth, not as more grey-on-grey)
  * Accent (mandatory pop — every building/vehicle needs at least one):
    hazard #FFC72C + #1A1A1A (yellow/black stripes on ramps, warnings),
    tarp/canvas #2E6E8E (a deliberate cool blue-green pop against the
    warm olive), insignia white #F2F2ED (graphic, high-contrast stars/
    stencils/numerals — never washed to grey)
  * Combat: #FF6B35, #FF4500, #FFD700 (also doubles as warning/hazard
    accent on structures, not just VFX)
  * UI Gold: #C5A55A, #D4AF37, #8B7332
- Lighting: bright, clean daylight key from upper-left (warm, ~5000K),
  strong color separation. Weathering/wear is a light accent (grime in
  seams, a little rust bleed) — it never dominates the read or drains
  the color; "battle-worn" is not the same as "colorless."
- Concept/reference renders should sit in a grounded, colorful environment
  (grass, dirt road, foliage) — not floating on a flat grey studio
  background. Context sells the color as much as the palette does.

## BUILDING VISUAL GUARDRAILS
Buildings are the most-seen art in the game — the base is the whole first
screen — so they carry the strictest consistency rules on top of VISUAL
STYLE above. Full detail (tier table, per-building briefs) lives in
docs/gdd/24-visual-direction.md; this is the non-negotiable summary.

- **One shared kit, no per-building palette.** All 19 buildings
  (docs/gdd/04-buildings.md) draw from the exact same greens/earth/metal
  swatches and the exact same accent kit (hazard yellow/black, tarp blue,
  insignia white) above. Differentiate buildings by FORM and FUNCTION — a
  derrick reads differently from a strongroom — never by drifting the
  color story into its own thing.
- **Level TIER drives the look, on a fixed 3-level cadence.** Buildings go
  up to level 36 (level 36 is a final, unique-design tier — S49); the art
  changes on a full remodel every 3 levels (a "tier") up through level 35,
  not continuously and not on the old improvised/established/reinforced/
  fortified 4-band split — that split is superseded, DRAFT pending the
  real tier table in GDD 24.
- **Same tier = same read, across every building.** A level-10 Treasury
  and a level-10 Barracks must look like the same fortification tier at a
  glance: same material stage (timber → concrete → steel → fortified),
  same scale growth, same accent-color intensity, same insignia/lighting
  tells — even though they're different buildings with different
  briefs. No building may look more or less advanced than its siblings at
  the same level. This is the actual guardrail.
- **Every building render needs its own signature "something is happening
  in there"** (per-building brief, GDD 24) PLUS at least one shared accent
  pop from the kit above. A monochrome material study is a failed asset,
  same as a flat desaturated one.

## PERFORMANCE TARGETS
- 60 FPS on mid-range mobile (2020+)
- Max 500 active particles
- Off-screen culling for all entities
- Throttle: fog of war 500ms, minimap 250ms
- Initial load: under 5 seconds on 4G

## TESTING
- After every file creation, system must be runnable
- Placeholder graphics (colored rectangles) until Blender assets
- Every session ends with a testable result

## SESSION WORKFLOW
1. Read CLAUDE.md
2. Read ARCHITECTURE.md
3. Read relevant GDD file for current task
4. Do NOT modify working files unless asked
5. After completing task: update ARCHITECTURE.md in place (current state
   only) AND prepend a full recap to docs/SESSION_LOG.md — use the
   `/update-architecture` command, which does both correctly
6. Keep files under 150 lines