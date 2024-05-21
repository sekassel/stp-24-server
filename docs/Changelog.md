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
