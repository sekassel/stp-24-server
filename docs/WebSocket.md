# Asynchronous WebSocket

The asynchronous WebSocket is available under the `/ws/${environment.version}/events` path.
It accepts incoming commands and sends outgoing events.
To receive events, you first need to subscribe to them.

## Authentication

To connect to the WebSocket, you need to authenticate yourself using a JWT.
You can pass the token either via `Authorization: Bearer <Token>` header,
or using the query parameter `authHeader` in the endpoint URL.
Failing to provide a (valid) token will cause the WebSocket to disconnect automatically.

## Commands

The WebSocket supports the following commands:

| Command       | Payload                |
|---------------|------------------------|
| `subscribe`   | Event Pattern (string) |
| `unsubscribe` | Event Pattern (string) |

Commands are sent as JSON, for example:

```json
{"event":"subscribe","data":"users.*.*"}
```

## Events

Events are subscribed to and unsubscribed from using the commands described above.
Each event has a qualified name consisting of one or segments separated by periods (`.`).
You can subscribe to multiple events using qualified names or wildcard patterns, as shown by the following example patterns:

* `users.507f191e810c19729de860ea.created`
  * Matches: `users.507f191e810c19729de860ea.created`
  * Does not match: `users.507f191e810c19729de860ea.updated`, `groups.507f191e810c19729de860ea.created`, `users.60bfe4dff98fef16e696ce6c.created`
* `users.*.created`
  * Matches: `users.507f191e810c19729de860ea.created`, `users.60bfe4dff98fef16e696ce6c.created`
  * Does not match: `users.507f191e810c19729de860ea.updated`, `groups.507f191e810c19729de860ea.created`
* `users.507f191e810c19729de860ea.*`
  * Matches: `users.507f191e810c19729de860ea.created`, `users.507f191e810c19729de860ea.updated`, `users.507f191e810c19729de860ea.deleted`
  * Does not match: `groups.507f191e810c19729de860ea.updated`, `users.60bfe4dff98fef16e696ce6c.deleted`
* `users.*.*`
  * Matches: `users.507f191e810c19729de860ea.created`, `users.60bfe4dff98fef16e696ce6c.updated`, `users.507f191e810c19729de860ea.deleted`, `users.60bfe4dff98fef16e696ce6c.deleted`
  * Does not match: `groups.507f191e810c19729de860ea.updated`

You receive events from the moment you send the `subscribe` command, up until you send the `unsubscribe` command *with the exact same pattern*.
That means it is **not** possible to
a) subscribe with a wilcard pattern and selectively unsubscribe with a more specific pattern, or
b) subscribe with one or more specific pattern and unsubscribe with a wildcard pattern.

All events are automatically unsubscribed when closing the WebSocket connection.

Similar to commands, events are sent as JSON.
However, the payload within the `data` field may contain any JSON value, not just strings.

```json
{"event":"users.507f191e810c19729de860ea.created","data":{"_id": "507f191e810c19729de860ea", "...": "..."}}
```

The following table shows which events may be sent.
Some events are only visible to certain users for privacy reasons.

| Event Name                                                                 | Payload                                                                          | Visible to          | Note                                                   |
|----------------------------------------------------------------------------|----------------------------------------------------------------------------------|---------------------|--------------------------------------------------------|
| `users.<userId>.{created,updated,deleted}`<sup>1, 2</sup>                  | [`User`](#model-User)                                                            | Everyone            |
| `users.<userId>.achievements.<id>.{created,updated,deleted}`               | [`Achievement`](#model-Achievement)                                              | Everyone            |
| `users.<from>.friends.<to>.{created,updated,deleted}`                      | [`Friend`](#model-Friend)                                                        | `from` or `to` User |
| `games.<gameId>.{created,updated,deleted}`                                 | [`Game`](#model-Game)<sup>4</sup>                                                | Everyone            |
| `games.<gameId>.started`                                                   | [`Game`](#model-Game)                                                            | Everyone            | Sent when starting the game, after the `updated` event |
| `games.<gameId>.ticked`                                                    | [`Game`](#model-Game)                                                            | Everyone            | Sent when ticking the game, after the `updated` event  |
| `games.<gameId>.members.<userId>.{created,updated,deleted}`                | [`Member`](#model-Member)                                                        | Everyone            |
| `games.<gameId>.systems.<systemId>.{created,updated,deleted}`              | [`System`](#model-System)                                                        | Game Members        |
| `games.<gameId>.empires.<empireId>.{created,updated,deleted}`              | [`Empire`](#model-Empire) or [`ReadEmpireDto`](#model-ReadEmpireDto)<sup>3</sup> | Game Members        |
| `games.<gameId>.empires.<empireId>.jobs.<jobId>.{created,updated,deleted}` | [`Job`](#model-Empire)                                                           | The Empire          |
| `games.<gameId>.wars.<warId>.{created,updated,deleted}`                    | [`War`](#model-War)                                                              | Game Members        |
| `games.<gameId>.fleets.<fleetId>.{created,updated,deleted}`                | [`Fleet`](#model-Fleet)<sup>4</sup>                                              | Game Members        |
| `games.<gameId>.fleets.<fleetId>.ships.<shipId>.{created,updated,deleted}` | [`Ship`](#model-Ship)                                                            | Game Members        |

<sup>1</sup>: The shorthand notation `foo.{bar,baz}` means "either `foo.bar` or `foo.baz`" **in this table**. You **cannot** use this notation to subscribe to or unsubscribe from events!

<sup>2</sup>:
The placeholder `<userId>` stands for "some fixed User ID". For example, a possible event could be `users.507f191e810c19729de860ea.updated`.
You can use this to subscribe to events that concern a single resource. If you do want to subscribe to all user events, use the pattern `users.*.*`.
Similarly, to receive all events regarding the messages of a group, you could use the pattern `groups.507f191e810c19729de860ea.messages.*.*`.

<sup>3</sup>: The user corresponding to the empire receives more information than other game members.

<sup>4</sup>: Computed properties like `Game.members` and `Fleet.ships` do not trigger events when changed.
Instead, you need to listen for `created` or `deleted` events of the respective child resources.
