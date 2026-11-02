# 08 — Project Setup: Version Control and Code Checks

**Status:** v1.0. Baseline measured on 2 Nov 2026 against commit `9cef412`.
The setup steps in §3 change project files or repository settings, so they
are listed here and carried out with the client's OK.

## 1. Measured baseline

| Item | Result |
|---|---|
| git | GitHub repository, branch `main`, 40 commits, 820 tracked files, **~259 MB packed history**, **no Git LFS** |
| Large files in git | All 130 GLBs (168.7 MB) plus `.blend`, `.webm`, `.mp4` and images under `assets/` (256.8 MB on disk) are committed as normal files |
| `.gitignore` | Covers `node_modules/`, `dist/`, `.env`, logs, and `docs/visual-reference/` (local Warpath screenshots, kept out of git; good) |
| Dependencies | Installed with `npm ci` from `package-lock.json` |
| Lint (`npx eslint src/`) | **0 errors, 384 warnings** in 50 of 373 files: 375 `no-magic-numbers`, 5 `max-params`, 2 `max-depth`, 1 `complexity`, 1 `prefer-const` |
| Tests (`node --test "tests/*.test.mjs"`) | **47 pass, 0 fail**, 21 files, ~2.5 s |
| Test gap | Tests cover 3D assets, layout and motion. **No tests** for damage maths, counters, stat resolution, research, economy or pathfinding, the code that will move to the server |
| `package.json` | Has `dev`, `build`, `preview`, `lint`; **no `test` script**. `node --test tests/` fails on Node 24 (it treats the folder as one file) |

## 2. Why this matters now

- **Large files in normal git** make every clone slow, and the history only
  grows: every new version of a model is stored in full, forever. GitHub
  blocks single files over 100 MB and warns from 50 MB; the history is
  already ~259 MB. With art production starting in Phase 2, model files will
  change often.
- The server will run the simulation code. That code needs tests **before**
  it moves (01, Phase 3).

## 3. Proposed setup steps (need approval)

| # | Step | Changes |
|---|---|---|
| 1 | Confirm the repository is **private** and everyone with access uses 2-factor login | Settings |
| 2 | Run a **secret scan** (e.g. gitleaks) over the history | Nothing |
| 3 | Track big binaries with **Git LFS from now on**: `*.glb *.blend *.webm *.mp4 *.png *.jpg *.jpeg` under `assets/`. The existing history stays as it is (rewriting 40 published commits would force everyone to re-clone) | Adds `.gitattributes` |
| 4 | Protect `main`: changes by pull request only | Branch settings |
| 5 | Add `"test": "node --test \"tests/*.test.mjs\""` to `package.json` | One line in `package.json` |
| 6 | **CI** on every pull request: `npm ci` → lint (fail on errors) → tests → `vite build` → report bundle and asset sizes | New workflow file |
| 7 | Lint rule for new code: no new warnings. Fix the 384 existing warnings gradually, mostly moving numbers into `src/config/` | Policy |
| 8 | Add **unit tests** for `DamageResolver`, `StatResolution`, `ResearchModel`, `Pathfinder` and storage/production formulas before Phase 3 | New test files |
| 9 | Keep `docs/SESSION_LOG.md` and `ARCHITECTURE.md` current, as CLAUDE.md asks | — |

Example commands for step 3 (after approval):
```
git lfs install
git lfs track "assets/**/*.glb" "assets/**/*.blend" "assets/**/*.webm" "assets/**/*.mp4" "assets/**/*.png" "assets/**/*.jpg" "assets/**/*.jpeg"
git add .gitattributes
```

## 4. Repository layout once the server exists (Phase 3)

```
/client     today's src/, index.html, vite config
/shared     simulation + config used by client and server
/server     world shard + meta integration
/tools      economy export script (02 §6), asset checks
/assets     LFS-tracked art
/docs       GDD, reference/, phase1/, ADRs
```
This is a plan only; nothing moves in Phase 1.

## 5. Quality gates per phase (proposal)

- Every pull request: lint clean (no new warnings), tests pass, build passes.
- Every asset: passes the size and triangle limit check (04 §4).
- Every phase end: tested on at least two real phones (one mid-range
  Android, one iPhone), FPS recorded.
