# STP Server 2024

## Non-Development

To run everything for non-development, use

```bash
$ docker compose up
```

## Development

### Setup

Requires [`pnpm`](https://pnpm.js.org/) instead of `npm`.

```bash
$ pnpm install
```

MongoDB and NATS are required and provided with `docker-compose`.

```bash
$ docker compose up database nats
```

### Running

Choose one of the following ways to run the server:

```bash
# development
$ pnpm run start
```

```bash
# watch mode (recommended)
$ pnpm run start:dev
```

```bash
# production mode
$ pnpm run start:prod
```

## Testing

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
