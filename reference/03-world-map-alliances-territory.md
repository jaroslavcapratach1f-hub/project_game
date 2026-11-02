# 03 — World Map, Alliances & Territory

## Client's words (verbatim)

> Hello Bro,
> I do not recap on this did we have discussed that, but the world map needs
> also to be unique. As I mentioned earlier the idea is to have multiple level
> maps like in the beginning every player will be dropped to lvl-1 map which
> we should also build during our development, which going to have from lvl-1
> to lvl-5 resource farms on the map so players could gather resources with
> Army trucks. On this I still considering to make them attack free, first
> reached will get's it so even free players can grow. The same way map should
> we big with multiple 1st lvl forts at first line of the map, even with same
> buffs so multiple alliances can grow equally strong without needing to fight
> each other and surrounded by lvl-1 and lvl-2 resources, then going closer to
> the center there will be higher lvl forts and lvl-3 and lvl-4 resources and
> finaly one central base which allows to set up captains there with different
> stats boost for which every alliance has to fight. Also we need I think
> multiple Forts which allow to move to the next lvl map which we will build
> after we start generating the funds, so I think we should build them but not
> activate them something to be Coming Soon or something like that. Also maybe
> gates to other lvl 1 maps, but again that's very questionable at this stage.
>
> The main idea is that every server always looses a lot of players if they
> can't grow and be always attacked so I want to build the game where
> attacking the base and destroying it gives zero resources to the attacker,
> only what he can collect is killed troop count and killed troop level just
> to show how active the player is.
>
> Also every alliance has to build it's territory and connect it to the fort
> to be able to occupy it so we have to pre-build some kind of towns to be
> able to build them something very similar like warpath that instead of
> sending troops to build that territory you have to relocate your base to it
> to speed it up the construction and to stop enemy territory construction you
> can relocate your base to their territory so enemy has to attack you to
> continue construction of their territory. As this game should be based on
> war battle experience to make it attractive and fun to play without being
> afraid that you loose your week of work collecting resources in one lost
> base attack.
>
> Also coming back to the map structure, after we build and launch second lvl
> map, and strongest players moves to the new worlds without possibility to
> get back to lvl1 map, I want to make sure that lower level players get a
> chance to take over those previous alliance taken forts and buffs and
> somehow structure the system the way so we could refill the map with new
> players and make it full and fun to play and allow those free2play players
> also have their fun, most important that the game do not become a farm wile
> where boringness and farming only kills the game attraction and people drops
> the game because it becomes too boring so we need to come up with a very
> good idea how to structure everything properly, maybe 2 lvl1 maps merge to
> one when each of them drops to low number of active players.. I don't know
> actually which Idea would be the best, but to push new players to already
> established map also might be not really good idea, unless we will structure
> it some kind of interesting way. Maybe map reset, or territory with limited
> base lvl, but map itself I want to have very unique structure, needs to
> define that proper way.

## Our response (sent)

> Hello brother,
>
> Thank you for explaining the world map vision in so much detail. It helps a
> lot. We hadn't gone into the map at this level before, so I'm glad you
> brought it up now, before any development starts, rather than halfway
> through.
>
> **1. The world map structure**
>
> I like the direction. The tiered map, with level-1 forts and resources on
> the outer ring, stronger forts and richer resources toward the centre, and
> one central base that every alliance competes for, gives the game a clear
> goal and a natural path for players to grow. Equal buffs on the outer forts
> are also a smart way to let several alliances develop without being forced
> into early fights.
>
> Here's how it relates to the current code. Your project has one 100×100
> hexagon map with terrain, pathfinding and a simple territory system around
> the base. There's also an early "gathering truck" piece of code, but it
> isn't connected to the game yet. Forts, resource farms, alliances, alliance
> territory, base relocation and multiple map levels don't exist yet. Most
> importantly, all of them need a live server, because many real players
> share the same map. So this isn't a small addition. It's one of the largest
> and most important parts of the game, and it needs to be designed properly
> from the start.
>
> **2. Your rules for fair play**
>
> Your goal is clear: players should enjoy battles without being afraid of
> losing a week of work in one attack. I fully agree that this is one of the
> main reasons servers lose players.
>
> - **No resources lost when a base is attacked.** The attacker only gains
>   kill counts and the levels of the troops they killed, to show how active
>   they are. This is a strong retention idea. During design we'll still need
>   to make sure players have good reasons to fight: fort control, alliance
>   territory, rankings, event rewards and kill-based rewards. We'll also
>   define what happens to a defeated base (for example, troops going to a
>   hospital, or a short protection period). That way battles feel meaningful
>   without being punishing.
> - **Attack-free resource farms, first come first served.** This works well
>   for free players. We'll design it to stop one player or alliance from
>   blocking all the farms, for example with gathering limits or rotating
>   farms.
> - **Alliance territory built by relocating bases**, and enemy construction
>   blocked by moving a base into it. This makes territory a real strategic
>   game, and I'll design it in detail.
>
> **3. Moving to higher-level maps and keeping level-1 maps alive**
>
> You're right that this is the hardest question, and that both "boring
> farming" and "empty servers" kill games. There are several possible models:
> seasonal map resets, merging two level-1 maps when activity drops,
> ownership of forts and buffs that lapses when an alliance leaves, zones
> limited by base level for newer players, or new players arriving through
> special events instead of being dropped into an established map. My
> recommendation is to compare these properly in Phase 1 and choose a
> combination, instead of deciding too early.
>
> I also agree with building the level-2 portal forts as "Coming Soon" in the
> first version. They should be designed and visible on the map from the
> beginning, but we only build the full level-2 map once the game earns money.
>
> **4. What this means for the plan**
>
> Your world map makes a shared multiplayer map **a requirement for the first
> release**, not something to add later. That increases the server work.
> I'll add a dedicated **World Map, Alliance & Territory Design** to Phase 1,
> so that by the end of Phase 1 you have a clear, written map design.

*(Parts 5 onward of this reply, on servers, payments and costs, are in
file 04.)*

## Client's design (structured summary)

**Map levels**
- Every new player starts on a **level-1 map**.
- **Next-level maps** (level 2 and up) are reached through special forts.
  Those forts are built in v1 but shown as **"Coming Soon"** until the
  level-2 map is funded and built.
- Players who move up **cannot return** to the level-1 map.
- Gates between level-1 maps: undecided.

**Level-1 map layout (outer ring → centre)**
| Ring | Forts | Resource farms |
|---|---|---|
| Outer ("first line") | Many level-1 forts, **all with equal buffs** | L1–L2 |
| Middle | Higher-level forts | L3–L4 |
| Centre | **One central base**: captains can be stationed there for different stat boosts; every alliance fights for it | (L5 farms exist on the map; where they sit is still to be decided) |

**Resource gathering**
- Resource farms of levels 1–5, gathered with **Army trucks**.
- Likely **attack-free**: the first player to reach a farm gets it.

**Combat consequences**
- Attacking or destroying a base gives the attacker **no resources**.
- The attacker only gains **kill count** and **killed troop levels**, shown as
  an activity statistic.

**Alliance territory**
- An alliance must build territory and **connect it to a fort** before it can
  occupy the fort.
- Pre-built **towns** or nodes act as territory building sites.
- Territory is built faster by **relocating member bases** into it, instead
  of sending troops.
- An enemy can block construction by **relocating their base into the
  territory**. The owners must then attack that base to continue building.

**Map lifecycle (open)**
- When strong alliances move up, lower-level players must be able to take
  over the forts and buffs they leave behind.
- The map must be refilled with new players and stay full and fun.
- Avoid a "farming simulator" feel.
- Candidate ideas from the client: merging two level-1 maps when activity is
  low, map reset, territory with a base-level limit. He is unsure whether
  pushing new players onto an established map is a good idea.

## Open design questions (for Phase 1)
> Update: questions 2, 3, 5 and 7 are partly answered in
> [05-forts-relocation-merges-fairness.md](05-forts-relocation-merges-fairness.md).

1. Why fight, if attacks give no loot? Define the rewards: kill-point events,
   rankings, fort and territory control, central-base buffs, alliance rewards.
2. What happens to a defeated base: hospital and wounded troops, a burning
   state, forced relocation, protection time?
3. How to stop farm hogging: gathering limits per player or alliance, limits
   on how many trucks a player can send, farms that run out and respawn.
4. Fort ownership: does it lapse when an alliance moves up or goes inactive,
   and how do forts reset or get handed over?
5. Map lifecycle model: seasons, merges, newbie zones limited by base level,
   staggered opening of new servers, or a combination.
6. Rules for moving between map levels: requirements, what a player takes
   with them, and how the alliance moves as a group.
7. Map size and player count per level-1 map, which determine server
   capacity.
8. What the captains stationed at the central base do: number of slots, stat
   types, duration.
9. Rules for relocating bases into territory: cost, cooldown, how many bases
   speed up construction.

## Implementation notes
- Current code: one 100×100 flat-top hex map (`src/config/WorldMapConfig.js`,
  `src/worldmap/worldTerrainGen.js`), hex A* (`src/world/Pathfinder.js`), a
  7-hex territory registry (`src/world/WorldEntityRegistry.js`,
  `src/worldmap/territory.js`), and 4 static neighbour bases.
- `src/entities/GatherTruck.js` is orphan code (not on the runtime path). It
  could be revived as a client view, but **all gathering must be resolved on
  the server**.
- Everything in this file needs a **server-authoritative shared world**: map
  state, fort ownership, alliance membership, territory graph, marches, base
  relocation and battles.
- Architecture direction: one world shard per map instance. Marches resolve
  on the server tick; distant battles use coarse resolution (sim LOD). The
  territory connection check is a graph search from the alliance's territory
  to the fort node. "Coming Soon" portal forts are data-flagged map objects.
