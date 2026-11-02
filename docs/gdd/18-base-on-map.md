# The Base as a Place on the Map

The base is **not a mode** — it is the player's tile on the world map, seen up
close. Same scene, same camera, continuous zoom. No `changeState`, no
mount/unmount. Config: `WorldMapConfig.js` (`WORLDMAP.baseRect`, LOD zooms) +
`BaseConfig.js` (build grid).

## FOOTPRINT & GRID  (all hex — matches the world grid)
- The base is a **hexagonal walled compound** centred on its map hex
  (`WORLDMAP.baseCentre`); `WORLDMAP.baseRect` is just its square bounding box.
- The **build grid** is a hexagon of hexagonal cells — flat-top axial `(q, r)`
  centred on `(0, 0)`, `BASE.grid.radius` rings out (currently radius 3 = 37
  cells), each cell `BASE.grid.cellHexSize` (currently 50px). Same `utils/Hex`
  math as the world map. Buildings are hexagonal blocks on hex cells.
- `STARTING_LAYOUT` / `BUILDING_PLACED` / placement use axial `(q, r)`;
  in-bounds = `axialDistance(0,0,q,r) ≤ radius`.
- The **platform** hexagon (`BASE.platform.hexR`) wraps the outer cell ring +
  a margin; its perimeter is the **wall** (6 edges, a **gate gap** in one) with
  a **nub block at each of the 6 vertices**. The **Defence Wall** /
  **Attack Towers** buildings feed the whole-base HP / Base Fury (GDD 04) —
  they don't literally draw the perimeter.

## ZOOM LEVEL-OF-DETAIL  (Warpath-style, seamless)
A **continuous** blend driven by camera zoom every frame — **not** a threshold
flip. `BaseSite` smoothsteps `camera.zoom` across `[lodZoomOut, lodZoomIn]`
into a `t` in 0..1 and hands it to the marker / compound / garrison. As you
pinch, the base fades and grows in — no snap, no "jump to the expanded
version". The band is wide (`lodZoomOut` well below `lodZoomIn`) so the
transition spans a long stretch of the pinch.
- **`t → 0` (zoomed out)** — a compact **walled-compound marker**: a small
  fort icon (wall, keep, a couple of building nubs), a cast shadow so it sits
  on the map, nameplate + HQ level. The same icon every base uses
  (`ui/MarkerDraw`), so the map reads consistently — the player's is
  gold-walled, neighbours brown. FORWARD: Power, alliance tag, shield icon.
- **`t → 1` (zoomed in)** — the **full compound**: a hexagonal walled earth
  platform (6-edge wall, a gate gap, a nub block at each vertex) with the hex
  build grid on it, hexagonal building blocks, and the garrison on a parade
  strip inside the gate.
- **In between** — a genuine cross-dissolve: the marker fades while growing
  ~1.5×, the platform fades + scales `0.93 → 1`, buildings fade in slightly
  later, the garrison later still. Buildings also **pop in staggered**
  (`back.out`) the first time the base is revealed, and **pulse** on upgrade.
- Camera: `setZoomLimits(WORLDMAP.minZoom, WORLDMAP.maxZoom)`, opens at
  `startZoom`. Current placeholders: `minZoom` 0.12 / `maxZoom` 2.5 /
  `startZoom` 0.35; LOD band `lodZoomOut` 0.42 → `lodZoomIn` 0.95.

## NAVIGATION  (no screens, no pause)
- **Pinch** to move between world view and base view — there is no "enter
  base" button gating it.
- **Home** button — snaps the camera to your base at a comfortable base-view
  zoom. **World** button — pulls back to strategic zoom on your last map
  focus. Both are camera moves, nothing else.
- You can zoom into **any** base on the map to view its layout (read-only for
  others); a Scout report fills in garrison and plating detail (GDD 17).

## BUILDING PLACEMENT
- Buildings occupy grid cells. Place rule: **free cell + in-bounds + unique
  count cap + HQ-level gate** (`BuildingConfig` — see 04).
- HQ is pre-placed at seed. The player places and **freely rearranges**
  buildings within the unlocked grid — free and instant (Warpath parity).
- Barracks visually swap type by production (Dynamic Barracks, GDD 04).

## BASE EXPANSION
- The build grid starts partly **locked**. **Expansion plots** (grid regions,
  and extra footprint tiles) unlock with **HQ level + an Expansion cost/item**
  (`HQ.expansionUnlocks`), growing both the buildable area and the world
  footprint. Mirrors clearing Warpath's expansion areas.
- Expansion is one-way and permanent; each plot lists its HQ-level gate.

## TERRITORY AROUND THE BASE
- The tiles bordering the footprint are the base's own — not buildable by
  others, a small defensive bonus, and reserved for future **outbuildings**
  (decorations, static emplacements, traps — FORWARD).
- The base also sits in a **Sector** (level band, GDD 17) and may sit in
  **alliance territory** (buffs while inside it, GDD 19).

## RENDERING
- Placeholder graphics until Blender assets, per CLAUDE.md: the walled earth
  platform + faux-3D building blocks (drop shadow + body + outline + lit top
  face) are drawn in `ui/BaseDraw` / `ui/BaseGridView`; the compact marker in
  `ui/MarkerDraw`. All geometry / colours / timings live in `BaseConfig.BASE`
  (platform, building, parade) and `WORLDMAP.marker` / `.plot`.
- The garrison cluster is placeholder dots now; FORWARD: real entities at low
  count, one per garrisoned unit — not a number.
