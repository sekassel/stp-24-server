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
