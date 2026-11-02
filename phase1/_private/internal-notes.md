# Internal notes (local only — excluded via .git/info/exclude, never pushed)

## Phase 1
- Plan sent to the client: Phase 1 = 2–3 weeks, 50–80 h + 15–25 h for
  monetisation, map, alliance and business-cost work.
- Phase 1 promises still outstanding: the **Warpath study** (D26, the client
  asked for it before infrastructure design; plan in `../10-warpath-study-plan.md`),
  and artist/vendor quotes for the art budget (04).
- Old pre-map totals ($62k–155k engineering, $35k–100k art): do not re-quote.

## Client country
- `src/config/VipPackagesConfig.js` prices the VIP-1 package at 2.99 AED,
  recorded from "the player's own confirmed reference data". That suggests
  the client's store region may be the UAE. Don't assume it; ask. If it is
  the UAE, a local adviser should cover licence type (free zone vs mainland),
  VAT and corporate tax.

## Repository (since 2 Nov 2026)
- `.git` is now the client's repo (github.com/Blitzmire/Blitzmire, `main`,
  in sync with `origin/main` at `9cef412`). The old local `.git` (one
  `initial` commit) is backed up at `E:\task\Blitzmire-main\_old-local-git-backup`.
- Local excludes (`.git/info/exclude`): `phase1/_private/`, `blitzmire_new/`.

## Before committing to the client's GitHub
- `reference/` is **untracked** in the client repo, but its files contain
  internal sections, e.g. `reference/02-development-plan.md` "Internal
  notes" (old totals, "do not re-quote"), `reference/05-...md` ("budget
  about 10–15 hours in the quote"), `reference/04-...md` (country unknown).
  Strip those sections, or leave `reference/` out, **before** `git add`.
