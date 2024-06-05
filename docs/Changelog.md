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
