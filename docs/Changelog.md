# v1.0.0 (2024-04-29)

## New Features

+ Added Users and auth.
+ Added Games and Members.
+ Added Achievements.

## Preview Features

+ Added Systems.
+ Added Empires.
+ Added presets (resources, system upgrades and types, empire variables, technologies and tech tree, buildings, districts, traits, variables)
+ Added Empire variables and aggregates.

# v1.0.1 (2024-05-07)

## Bugfixes

* Unique constraint violations (e.g. duplicate username) now correctly return `409 Conflict` responses.
* Non-Members can no longer receive System events.

## Documentation

* Clarified the behavior of the `POST .../members` endpoint wrt. spectators.

# v1.1.0 (2024-05-21)

## New Features

+ Added `members` and `maxMembers` to Games. [#2](https://github.com/sekassel/stp-24-server-tracker/issues/2)
+ Added the `members` boolean query parameter to `GET /games`.
+ The game owner can now kick other members before and during the game. [#3](https://github.com/sekassel/stp-24-server-tracker/issues/3)

## Bugfixes

* The `GET /games/:game/empires` endpoint now returns `ReadEmpireDto`s.
* The `PATCH /games/:game` endpoint now updates the password correctly. [#4](https://github.com/sekassel/stp-24-server-tracker/issues/4)

# v1.1.1 (2024-05-23)

## Bugfixes

* The `Game.settings` property is now checked for being an object. [#5](https://github.com/sekassel/stp-24-server-tracker/issues/5)
* Games are now deleted after 2 days by default.
* The `GET /games/:game/systems` endpoint no longer requires the `owner` query parameter.
* Removed the `started` and `speed` properties from `CreateGameDto`. This means the game speed needs to be set when/after the game is started.

## Documentation

* Clarified a few endpoints.
* Changed some schemas to reduce redundant information in map-like objects.

# v1.2.0 (2024-06-05)

## New Features

+ Added Friends and Friend Requests. [#7](https://github.com/sekassel/stp-24-server-tracker/issues/7)
+ Added the `__dev__` trait that starts the empire with lots of extra resources.
+ Added the `_private` and `_public` properties to Empires for custom data.
+ Added the `_public` property to Systems for custom data.
+ Added the `effects` property to Empire for events and other custom modifiers.

## Bugfixes

* Fixed the `GET /presets/technologies/tree` endpoint. [#8](https://github.com/sekassel/stp-24-server-tracker/issues/8)
* The `Game.maxMembers` property is now limited to a maximum of 100. [#9](https://github.com/sekassel/stp-24-server-tracker/issues/9)
* The `UpdateEmpireDto` no longer needs to specify all properties.
* Systems can no longer generate without any links.

## Documentation

* Added a way to specify aggregate query parameters in Swagger.
* Improved the aggregate documentation.
* Improved the `UpdateEmpireDto` and `UpdateSystemDto` documentation.
* Added additional descriptions for some game concept properties.

# v1.3.0 (2024-06-10)

## New Features

+ Added the `_public` property to Users for custom data. [#17](https://github.com/sekassel/stp-24-server-tracker/issues/17)
+ Added the `effects` property to Systems for events and other custom modifiers. [#18](https://github.com/sekassel/stp-24-server-tracker/issues/18)

## Preview Features

+ Added Jobs REST endpoints and schemas (not yet functional).

## Improvements

* Made the `resources.periodic` query parameter `resource` optional to get all resources at once. [#10](https://github.com/sekassel/stp-24-server-tracker/issues/10)
* Renamed the pseudo-variables for resource production in the `empire.level.*` aggregates from `resources.*.production` to `resources.*.periodic`.

## Bugfixes

* Fixed a rare issue where a system would be linked to itself. [#16](https://github.com/sekassel/stp-24-server-tracker/issues/16)
* Fixed `500 Internal Server Error` when attempting to explain an unknown variable.
* Fixed an error when starting a game with members without empires (spectators).

## Documentation

* Documented the possible `403 Forbidden` error in the `PATCH .../systems/:system` endpoint.

# v1.3.1 (2024-06-14)

## Balancing

* Pops consume way more food and (if unemployed) more credits.
* Home systems start as developed instead of upgraded.
* Replaced system food consumption with minerals.
* Halved pop growth for colonized and developed systems.
* Pop growth now follows a logistic curve.

## Bugfixes

* Fixed isolated system clusters without outgoing links. [#19](https://github.com/sekassel/stp-24-server-tracker/issues/19)

# v1.3.2 (2024-06-17)

## Improvements

* Pop migration now depends on free jobs instead of free capacity.
* New colonies (`colonized`) start with at least one pop.
* Attempting to upgrade a system in the wrong order now results in a `400 Bad Request` error.

## Bugfixes

* Fixed a wrong population delta value in the system resource aggregate.
* Fixed invalid pop growth when a system with capacity 0 is somehow colonized.

# v1.3.3 (2024-06-20)

## Improvements

* Creating a new game now pauses all other games of the same owner.

## Documentation

* Improved the `403 Forbidden` error documentation for updating a running game.

# v3.0.0 (2024-06-24)

## BREAKING CHANGES
* Game ticks are no longer scheduled and must be trigger via `PATCH /games/:game?tick=true`.
* Changed the `empire.pop.credits.unemployed` variable to `empire.pop.unemployed_upkeep.credits`.
* Adding buildings and districts, upgrading systems, and researching technologies are no longer possible via direct updates to the Empire or System. A Job must be started instead.

## New Features
+ Custom effects with `base` values can now create new variables that are respected in the following contexts:
  * Building and district cost, upkeep and production.
  * System upgrade cost and upkeep.
  * System type district spawn chances.
  * Pop consumption.
  * Unemployed pop costs.
+ Added Jobs for the following actions:
  * Adding buildings and districts.
  * Upgrading systems.
  * Researching technologies.
+ Added the `priority` and `result` properties to Jobs.
+ Added the `PATCH .../jobs/:id` endpoint to prioritize Jobs.
+ Added the `technology.time` aggregate.
+ Added the `build_time` attribute to buildings and districts.
+ Added the `upgrade_time` attribute to system upgrades.

## New Content
+ Added 2 new buildings: `shipyard` and `fortress`[.](https://i.kym-cdn.com/photos/images/facebook/001/264/842/220.png)
+ Added 3 new technologies
  * `more_colonists_1` to `more_colonists_3` that increase the number of pops that spawn on newly colonized systems.
  * `cheap_buildings_3` improves the new `shipyard` and `fortress` buildings.
+ Added new variables:
  + `empire.technologies.research_time`
  + `technologies.<tag>.time_multiplier`
  + `buildings.<building>.build_time`
  + `districts.<district>.build_time`
  + `systems.<upgrade>.upgrade_time`

## Improvements
* Game speed can be any positive number number now.
  It must be interpreted by the client to trigger manual ticks.
* The `PATCH /games/:game` request that starts a game now waits until the game is properly initialized before responding.
* Exploring a system (via a Job) no longer makes the empire the owner of the system.
* Adjusted the `cheap_buildings` tech tree.
* Technology research costs are no longer rounded.
* The tech tree now shows which technologies are superseded by others.

## Bugfixes
* Fixed some situations where systems may not be connected to the rest of the map. [#21](https://github.com/sekassel/stp-24-server-tracker/issues/21)

## Removals
- Removed the technology cost reduction when the user has already unlocked the technology in a previous game.

# v3.0.1 (2024-07-01)

## Bugfixes

* The Jobs endpoint now properly filters with the `system` query parameter.
* Deleting a job no longer results in a `404 Not Found` error.
* Colonizing a system no longer fails with a `404 Not Found` error.
* Upgrading or developing a system no longer fails with a `400 Bad Request` error.
* Jobs on the same system can no longer progress in parallel.
* The Job status now reflects the contents of other `ErrorResponse`s.

# v3.1.0 (2024-07-11)

## New Content

+ Added 21 new technologies:
  * `faster_building_construction_1,2,3`
  * `faster_district_construction_1,2,3`
  * `faster_research_1,2,3`
  * `faster_explored_system_upgrade_1,2,3`
  * `faster_colonized_system_upgrade_1,2,3`
  * `faster_upgraded_system_upgrade_1,2,3`
  * `faster_developed_system_upgrade_1,2,3`

## New Features

+ Added the `free` query parameter to the `PATCH .../empires/:empire` endpoint for directly manipulating resources without affecting credits. [#24](https://github.com/sekassel/stp-24-server-tracker/issues/24)

## Improvements

* Spectators can now read all empire's variables, aggregates, private Empire data, and Jobs.
* Some technologies now reduce the time for researching technologies.

## Bugfixes

* Creating a new game no longer marks all other games of the same owner as updated, allowing them to be cleaned up properly.

# v3.1.1 (2024-07-15)

## Bugfixes

* The `PATCH .../empires/:empire` endpoint with `free=true` now correctly updates the empire's resources.
* The `UpdateSystemDto` now accepts the `effects` property.

## Documentation

* Documented the System `type` property correctly.

# v4.0.0 (2024-07-22)

## BREAKING CHANGES

* Exploring a system now requires a fleet with an explorer ship in the system.
* Colonizing a system now requires a fleet with a colonizer ship in the system (the colonizer will ship will be removed when the colonization job completes).

## New Content

+ Added 44 new technologies:
  - `ship_construction`
  - `small_ship_construction`
  - `fast_small_ship_construction_1,2,3`
  - `medium_ship_construction`
  - `fast_medium_ship_construction_1,2,3`
  - `large_ship_construction`
  - `fast_large_ship_construction_1,2,3`
  - `fast_ship_construction_1,2,3`
  - `armor_plating_1,2,3,4`
  - `ship_speed_1,2,3,4`
  - `cheap_ships_1,2,3,4`
  - `efficient_ships_1,2,3,4`
  - `small_fighters_1,2`
  - `medium_fighters_1,2`
  - `large_fighters_1,2`
  - `small_ship_defense_1,2`
  - `medium_ship_defense_1,2`
  - `large_ship_defense_1,2`
+ Empires spawn with a shipyard, an explorer ship and 3 fighter ships.
+ Rogue fleets now spawn in the galaxy.

## New Features

+ Added Fleets and Ships.
+ Added Wars.
+ Added Ship types (designs) and associated variables.
+ Added the `buildings.fortress.health` and `buildings.fortress.defense` variables.
+ Added the `systems.<upgrade>.health` and `systems.<upgrade>.defense` variables.
+ Added the `health` property to Systems.
+ Added the `system.max_health` and `system.defense` aggregates.
+ Added the `fleet.power` aggregate.
+ Added the `fleet`, `ship` and `path` properties to Jobs.
+ Added the `ship` and `travel` Job types.

## Bugfixes

* Fixed a bug where the `city` and `industry` district slots could be a decimal number.
* Fixed a bug where an `undefined` district slot would appear.
* Fixed some traits and technologies with duplicate effects.

# v4.0.1 (2024-07-26)

## New Features

+ Added battle mechanics:
  + Ships attack other ships in the same system if at war or part of rogue fleets.
  + Ships can be destroyed in battle.
  + Fleets can be destroyed if all ships are destroyed.
  + Systems can be attacked and claimed by ships.
  + Ships can be repaired in shipyards.
  + Empires are deleted when all their systems are lost.
+ Implemented the `fleet.power` aggregate and made the `fleet` query parameter optional (to get the empire's total fleet power).
+ Implemented ship upkeep.
+ Added the `fleet` query parameter to the `GET .../jobs` endpoint.
+ Added the `type` query parameter to the `GET .../ships` endpoint.
+ Added the `buildings.shipyard.healing_rate` variable.
+ Added the `ships.bomber.attack.system` variable.
+ Added the `health` property to `ReadShipDto` (made it visible to everyone).

## Improvements

* Temporary fleets (that are created when the original fleet moves away from a shipyard while a ship is being built) are now re-used for additional ships.

## Bugfixes

* Fixed some cases where fleets would not end up in the destination system after traveling.
* Fixed a `500 Internal Server Error` when upgrading a (colonized) system without a colonizer.

# v4.1.1 (2024-07-31)

## Bugfixes

* Home systems now start at full health.
* Systems can now heal up to their maximum health. [#28](https://github.com/sekassel/stp-24-server-tracker/issues/28)
* Empires can no longer start with `uninhabitable_*` home systems.

# v4.2.0 (2024-08-01)

## New Features
+ Added the `ships` computed property to Fleets to count the number of actual ships (in endpoints that return one Fleet).
+ Added the `ships` query parameter to the `GET .../fleets` endpoint to enable computing `ships` in the list of Fleets.
+ Added the `ships` query parameter to the `POST .../fleets` endpoint to immediately spawn the ships specified by the Fleet size.
  - Only the game owner can use this query parameter.
+ Added the `POST .../empires` endpoint to create a new empire.
  - Only the game owner can use this endpoint.
  - The new empire will be associated with the game owner's user.
    This means a user may now have multiple empires in the same game.

## Improvements
* Adapted the access checks for systems, jobs, wars, fleets and ships to handle users with multiple empires in the same game.

# v4.2.1 (2024-08-02)

## Balancing
* Adjusted the base research time and buffed the techs that reduce the research time for specific tags.

## Bugfixes
* After removing a fortress, the system health decreases back to the new maximum health in the next period.
* Creating a `type=ship` Job without setting a `system` now produces a `400 Bad Request` error.
* War declaration now correctly checks if the user is the attacker (and no longer allows declaring wars for other empires). 

## Documentation
* Explained the `empire.compare.*` aggregates more clearly.
* Documented the required `system` property for `type=ship` Jobs.
* Documented the behavior of WebSocket events for computed properties like `Game.members` and `Fleet.ships`.

# v4.3.0 (2024-08-07)

## Balancing
- Major Technology Rebalancing:
  - Added new tech tags: `weaponry` (physics) and `shipmaking` (engineering)
  - Adjusted costs of all techs to be linear and according to the level in the tech tree.
  - Adjusted variable modifiers of many techs to be linear (e.g. -5%, -10%, -15% instead of -5%, -10%, -20%)
  - Added 4 new technologies: `biology_specialization`, `economy_specialization`, `building_specialization`, `system_specialization`
  - Removed 8 technologies: `computing`, `construction`, `demographic`, `engineering`, `production`, `faster_ship_construction_1,2,3`
  - Diff of resulting tech list: https://www.diffchecker.com/ShjjrptE/

## New Features
+ Added a new `games.<gameId>.started` event that is sent when a game is started.

## Bugfixes
* It is no longer possible to build ships if their `build_time` is 0 (this indicates they must be researched first).
* Reduced the chance to generate overlapping systems. [#27](https://github.com/sekassel/stp-24-server-tracker/issues/27)
* Ships no longer spawn twice when starting a game. [#29](https://github.com/sekassel/stp-24-server-tracker/issues/29)

# v4.3.1 (2024-08-09)

## Balancing
* Adjusted the default starting resource amounts.

## Bugfixes
* Explorer ships are no longer deleted when exploring a system.
* Colonizer ships are no longer deleted when colonizing a system fails due to missing resources.
* District slots are properly generated again.
* Jobs are now properly deleted when an empire is deleted.
* When a system claimed by another empire, all jobs on that system now also belong to the new owner.
* Building, district and ship jobs now check if the empire actually owns the system before starting.
* Ship jobs now check for shipyards.
* If a ship job completes on a system with a different owner, a New Fleet spawns for that owner.
* Users that lost their empire can now spectate the game.
* Creating an empire with incomplete resources no longer results in a `500 Internal Server Error`. [#30](https://github.com/sekassel/stp-24-server-tracker/issues/30)
* Ships can now properly attack systems and gain experience.

## Documentation
* Properly documented all possible job creation errors.

# v4.3.2 (2024-08-14)

## Balancing
* Adjusted the speed of most ships.

## Bugfixes
* Travel jobs now respect fleet effects in time calculations.
* Rogue fleets no longer spawn right next to home systems.
* Reduced the chance to spawn large ships in rogue fleets.
