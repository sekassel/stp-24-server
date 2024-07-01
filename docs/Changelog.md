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
* Fixed some situations where systems may not be connected to the rest of the map.

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
