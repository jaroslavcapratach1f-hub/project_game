# Events & Season

Config: `src/config/EventsConfig.js` (+ per-event tables). Events are the
retention layer; nothing here changes the core rules.

## DAILY & WEEKLY
- **Daily Objectives** — a task bar (build, train, gather, kill Legion,
  research, spend) → activity points → a daily reward track + a daily chest at
  full. Resets on server day.
- **Weekly Objectives** — a bigger version over the server week, better chest.
- **Login calendar** — cumulative day-N rewards per month; a separate
  new-player 7-day track.

## ARMS RACE
A multi-day rotating event. **Each day scores one category** — base power /
training / research (City Honor) / unit assembly / officers / spend — into
personal points:
- **Milestone rewards** at point thresholds each day.
- A **daily server leaderboard** with ranked rewards.
- **City Honor** research (GDD 12 track note) exists mainly to feed the
  research day. Plan builds/spends to land on the matching day.

## LIMITED-TIME EVENTS
Rotating themed events, each with **its own currency + event shop**, wiped at
cycle end:
- Gather Blitz · Legion Purge (PvE kill race) · Siege Week (PvP points) ·
  Spend-and-Get · Officer Recruitment drive · Assembly push.
- Event shop stock: officer shards, blueprint fragments, equipment parts,
  speed-ups, teleports, shields, cosmetics. **Unspent event currency expires.**
- **Onslaught** (GDD 16) is one of these on its ~30-day slot.

## BATTLE PASS  ("Frontline Pass")
- A ~4–6 week track: **free lane** + **paid lane** (Gold, or a bundle).
- Pass XP from daily/weekly/event activity points.
- Rewards per level; premium buy also grants an instant level jump and a
  cosmetic. Missed free-lane rewards are forfeit at cycle end; paid-lane can be
  claimed retroactively after purchase.

## SEASON — FRONTLINE WAR
The headline cross-server competitive cycle. Runs ~6–10 weeks.
- **Matchmaking:** several servers are joined onto a shared war map (or a
  bracket) by combined Power.
- **Objective:** capture and hold the central **Capital / Supreme Command**;
  alliances score from territory, Fortress control (GDD 19), kills, and
  objectives.
- **Phases:** Prep (shields up, build) → Land Grab (open borders, claim
  sectors) → Sieges (CC / Fortress war) → Capital Contest → Settlement.
- **Rewards:** season titles, exclusive officer/equipment/cosmetics, season
  currency (its own shop), and a lasting **server buff** for the winning
  bloc. Settlement may open a **new Frontier region** (GDD 20) and soft-reset
  contested territory — **never** player bases, buildings, troops, or
  progression.
- An inter-alliance ladder ("Legion Clash") runs inside the season for
  alliance-vs-alliance ranking.

## TRUCE
Event configs can declare a **Truce window** that pauses all PvP (used around
season phase changes and maintenance).
