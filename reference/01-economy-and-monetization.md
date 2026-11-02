# 01 — Economy & Monetization

## Client's words (verbatim)

> For me personally it can take as much as it's needed, most important to gave
> it visually attractive and not boring to play so people stays and plays it.
>
> Also I have noticed that in your prepared file you have mentioned about
> building upgrade time, me earlier was playing a lot of mobile games and I
> stuck with warpath because it was unique and different from other games.
> No building speed but takes time to gather recourses and construction
> materials.
>
> However people spends the most on troop cards so they can rise troop star
> level, this is necessary to structure the way so people spends a lot there.
>
> Next part where people spends money a lot is officers cards to unlock
> officers skills..
>
> We can create something with officers equipment as well to make players to
> spend more to get better stats on the battlefield, but base buildings I want
> to keep as in warpath, free of time..
>
> Research and materials production has to have timers

## Our response (sent)

> Hey brother, thanks, this is really helpful. These are exactly the decisions
> I needed from you.
>
> Got it on the buildings: no upgrade timers, the Warpath way. Progress comes
> from gathering resources and construction materials. Your current code
> already works like that, so we keep it. Research and material production get
> timers, and the code already has the start of that too. Since buildings are
> instant, the pace of the game depends on how resources and materials flow.
> We'll balance that carefully so it never feels too fast or like a grind, and
> the server will handle it so nobody can cheat.
>
> On spending, I agree with your priorities:
> 1. **Troop cards** to raise star levels, the main spending area
> 2. **Officer cards** to unlock officer skills
> 3. **Officer equipment** for better battlefield stats
>
> Your project already has early settings for officers and equipment, but none
> of the actual logic yet. I'll design all three properly as one connected
> system in the first phase, including how free players progress. That matters
> because they keep the world alive, and the paying players need someone to
> fight.
>
> One thing to plan for: the app stores require card packs to show their drop
> rates, and a few countries have extra rules on them. I'll make sure we're
> compliant from the start.
>
> Agreed on taking the time to do it right. Making it look great and fun enough
> that people keep playing is the main goal. I'll update the plan with these
> decisions.

## Agreed decisions

- **Buildings:** instant upgrades with no timer and no speed-ups. The limit is
  resources plus construction materials.
- **Timers:** on research and on material production.
- **Spending areas, in order:** troop cards (star levels) → officer cards
  (skills) → officer equipment (stats).
- **Priority:** visual appeal and fun matter more than speed of delivery.

## Implementation notes

- Instant upgrades already exist: `src/systems/buildingUpgrade.js`,
  `src/systems/BaseManager.js` (`upgrade()`).
- Research timers: `src/systems/ResearchManager.js`, using
  `src/systems/TimedJob.js`. Material production:
  `src/systems/EngineeringCenter.js` and `ProductionQueue.js`. All of these are
  in memory and use the client clock. They **must move to the server**, with
  server time.
- Officers, armory and parts exist only as config and UI:
  `src/config/OfficerConfig.js`, `ArmoryConfig.js`, `PartsConfig.js`, plus
  `ui/hud/BarracksOfficerSlots.js`. There is no draw (gacha) logic.
- With building timers gone, the economy's pacing levers are resource and
  material flow, research timers, and production timers. A balance model is a
  Phase 1 deliverable.
- Compliance: Apple and Google require published odds for paid random items.
  Belgium and the Netherlands restrict loot boxes. Some regions have age or
  spending rules. Card draws must be **server-side**, with an audit log.
- Design the experience for free players on purpose (a guaranteed progression
  path, pity counters). A shared world needs a large free-player population.
