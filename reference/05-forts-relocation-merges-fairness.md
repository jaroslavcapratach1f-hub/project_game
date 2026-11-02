# 05 — Kill Stats, Fort Pyramid, Merges, Relocation, Trucks, Fairness

Follow-up to file 03 (world map). It answers several of the open questions
listed there.

## Client's words (verbatim)

> Attacker gains kills count and level of troops they have killed: I mean by
> that example:
> • 6lvl 150 troops killed
> • 7lvl 200 troops killed
> • and so on just a statistics.
>
> Players has to fight for forts as we should design that if spread equally
> only 16 alliances at lvl-1 forts and lands, 8 alliances at lvl-2 forts and
> lands, 4 alliances at lvl-3 forts and lands and 1 main fort at the center.
> Just an idea, we can discuss this together which section makes more sense..
> Maybe build much smaller map just with few forts and design it the way that
> one alliance could not take all forts by limiting territory expansion
> buildings or just add gates to next lvl-1 maps and open those gates after a
> month of game play..
>
> Also when server drops active player number, we can just announce 7days
> server merge event and just teleport all payers to one server so all
> alliances could have a fresh start. Again it's just an ideas coming to my
> head, definitely we have to discuss and come up with best idea.
>
> Definitely to increase the battles we have to build multiple events and
> daily tasks etc.
>
> What happens when base gets attacked and it's defense reaches zero? Base
> will be relocated to random location with 10% restored base health and will
> regenerate over the time.
> Also player should have "Relocate" function where base transforms in to the
> convoy truck and slow traveling speed so player could travel to it's decided
> location. Troops will be separated from the base so player has to move them
> separately. Actually this idea is from Warpath game but I love it actually 😅
> it makes the game very unique but might be counted as copying, I have no
> idea on that. That's the reason I have locked base actual grids and base
> territory so bases could not build too close to each other and all forts and
> alliance territory buildings would have special dedicated territory on the
> map.
>
> Resources farm: every player starts with 1 farming truck and access to lvl 1
> resources farms only which they can scale with researches I have already
> build in the game. First lvl map will unlocks only max 5lv farms and 5
> trucks. So that's kind of limits every player.
>
> Actually before we actually start designing whole game infrastructure you
> have to play that game to actually see how everything works and how can we
> build it better without getting in trouble after the launch of the game.
> Earlier I was playing a lot of strategy games, because of my work I had way
> too much time to waist 😅 Warpath is the one game which I ended up playing
> for more then a year only because of it's unique structure and being
> different from all other strategy games, I dropped the game after it became
> only pay-2-win when all new update forced you to spend more on the game as
> you can play for free, hundreads of events and new buildings just to get
> more money out, at that point I just quit the game, so I want this game to
> build different way and not oversaturate with useless updates, it has to be
> fair to all players but as well give big advantage for those who spends on
> the game. As I said you should test the game to have better view and how can
> we built it better as warpath itself.

## Our response (sent)

> Hello brother,
>
> Thank you for the details. They answer several of the open questions from
> my last message, and they make your vision much clearer. I'll go through
> them one by one.
>
> **1. Kill statistics**
>
> That's clear now. When a player attacks, they collect statistics only, such
> as "Level 6: 150 troops killed, Level 7: 200 troops killed". These would
> appear on the player's profile and in the rankings, and no resources are
> taken. This is easy to support, and it also gives us a good basis for events
> and rewards later, such as kill-based events or weekly rankings.
>
> **2. Forts and alliance structure**
>
> The pyramid idea works well: 16 alliances at level-1 forts, 8 at level-2, 4
> at level-3, and one central fort. It naturally pushes alliances to compete
> as they grow. Your alternative is also worth considering: a smaller map
> where one alliance can't take every fort, by limiting how many territory
> buildings each alliance can have. These are good options, and I'd like to
> model them properly before we choose, because the right number of forts
> depends on how many active players each map holds. I'll prepare two or three
> map layouts in Phase 1 so we can compare them together. Opening gates to
> other level-1 maps after about a month of play is also a good way to add new
> competition once a map has settled.
>
> **3. Server merges**
>
> A 7-day merge event, with every player moved to one server and all
> alliances getting a fresh start, is a proven approach. Many successful
> strategy games use it to keep servers active. We'll need to plan a few
> details, such as duplicate player and alliance names, how fort ownership is
> handled during the merge, and making sure the event itself feels exciting
> rather than just a technical change. I'll include this in the map lifecycle
> design.
>
> **4. Events and daily tasks**
>
> I agree. Events and daily tasks are what bring players back every day and
> create reasons to fight, especially since attacks don't give resources.
> I'll design a core set of events for launch. Following your experience with
> Warpath, I'll keep the number of events under control so the game never
> feels overloaded.
>
> **5. Defeated bases and relocation**
>
> The rules are clear:
>
> - When a base's defence reaches zero, it moves to a random location with
>   10% health and slowly regenerates.
> - Players can choose to **relocate**: the base turns into a slow convoy
>   truck that drives to the chosen location, while the troops move
>   separately.
>
> Your current project already locks base grids and base territory, so bases
> can't be built too close together. That's a good foundation for dedicated
> fort and territory areas. One thing we'll need to design is protection
> after a base is defeated, such as a short shield, so the same player can't
> be attacked over and over after being moved.
>
> On copying: generally, using a game *mechanic* such as a relocation convoy
> isn't a problem. Problems come from copying artwork, names, user interface
> layouts or text. We'll give these features our own look and presentation.
> Before launch I still recommend a short review by an IP lawyer, to be safe.
>
> **6. Resource farms and trucks**
>
> Every player starts with one truck and access to level-1 farms only.
> Researches increase both, and the level-1 map is capped at level-5 farms
> and 5 trucks. This fits the research tree you've already built, which
> includes research for more trucks and higher farm levels. We'll connect it
> to real gathering on the map and the server.
>
> **7. Studying Warpath**
>
> I agree that we need to understand Warpath properly before designing the
> full game. I'll study and play it as part of Phase 1, focusing on the
> systems you've described: map structure, relocation, forts, alliances,
> events and how spending is structured. That way we can keep what makes it
> unique and avoid the things that made you quit.
>
> **8. Fair play and spending**
>
> This is the most important point. Your goal is a game that is fair to every
> player and still gives a clear advantage to players who spend, without
> turning into pay-to-win with constant new events and buildings designed
> only to make money. I'll design the economy and monetisation around this
> principle:
>
> - Spending speeds up progress and gives a meaningful advantage.
> - Free players can still compete through time, skill and alliance strategy.
> - Updates add real gameplay, not just new ways to spend.
>
> Thank you again for sharing your experience. Your years of playing these
> games are a big advantage for this project, and they help us avoid the
> mistakes that made other games lose their players.

## Decisions and ideas (structured)

| Topic | Client position | Status |
|---|---|---|
| Attack rewards | Stats only: killed troop count **per troop level** (e.g. L6 ×150, L7 ×200). No resources | Decided |
| Fort pyramid | 16 alliances (L1 forts and lands) → 8 (L2) → 4 (L3) → 1 central fort | Idea, to be modelled |
| Alternative layout | Smaller map with few forts; limit territory-expansion buildings so one alliance can't take everything | Idea, to be compared |
| Gates to other L1 maps | Open after about 1 month of play | Idea |
| Server merge | Announce a 7-day merge event, teleport all players to one server, fresh start for alliances | Idea, likely |
| Events and daily tasks | Needed to drive battles; avoid flooding the game with events | Agreed |
| Defeated base | Defence hits 0 → relocate to a random spot with 10% base HP, which regenerates over time | Decided |
| Voluntary relocate | Base turns into a slow **convoy truck** driving to the chosen spot; troops travel separately | Decided (Warpath-inspired; must be presented in our own way) |
| Base spacing | Base grid and territory are locked; forts and alliance territory buildings have dedicated map areas | Decided (partly in code already) |
| Gathering | 1 truck and L1 farms at start; research raises both; the **L1 map caps at L5 farms and 5 trucks** | Decided |
| Research before design | We must play and study Warpath before designing the infrastructure | Agreed (Phase 1) |
| Fairness | Fair to all, big advantage for spenders, no pay-to-win update treadmill, no "hundreds of events and buildings" | Core principle |

## Answers to file 03 open questions
- Q2 (defeated base): answered. Random relocation with 10% HP and
  regeneration. A post-defeat shield is still to be designed.
- Q3 (farm hogging): partly answered by the 5-truck / L5-farm cap per player.
- Q5 (lifecycle): candidates are now a 7-day merge event and gates that open
  after about 1 month.
- Q7 (map size): the fort pyramid suggests about 29 alliances per L1 map.
  Players per alliance still need to be set to size servers.

## Implementation notes
- Research already includes truck and farm-tier nodes in
  `src/config/research/DevelopmentTree.js`: `dev_collection_truck` (L38),
  `_2` (L45) and `_3` (L51) each give +1 truck, and
  `dev_resource_collection_sites_2…5` raise the farm tier.
  `EconomyConfig.GATHER.trucksBase = 1`. That makes **4 trucks max today vs.
  the client's 5**, so one more truck node (or a base of 2) is needed.
  Gathering itself isn't implemented: `GatherTruck.js` is orphan code and the
  `gather_truck` stats live in `UnitStats.js`.
- Existing base spacing: the 7-hex territory registry
  (`src/world/WorldEntityRegistry.js`, `src/worldmap/territory.js`,
  `TerritoryRing.js`). Its spacing has no buffer for plot growth (see
  ARCHITECTURE.md Known Issues).
- Kill stats: the server records kills per (unit level) from the
  `ENTITY_DIED` / `killerId` path. Today that path is client-side.
- Relocation convoy: a base becomes a world entity that marches. Base troops
  detach. This needs server-side march state and a rule about arriving at an
  occupied spot.
- Merge tooling: the server data model must support merging two worlds from
  day one, with namespaced IDs and rename handling for player and alliance
  names.
- IP: mechanics are generally not protectable; art, names, UI layout and text
  are. Keep a separate presentation. A lawyer review is recommended before
  launch (this note is not legal advice).
