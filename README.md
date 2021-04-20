## Twitch Tool repo

Repo to keep my community's twitch gadgetries. Join me at [www.twitch.tv/armzi](https://www.twitch.tv/armzi).

### Projects:

- 9armbot - custom bot to moderate twitch channel with unique personality.
- webapp - a webapp to display events/gif/messages from 9armbot but it can be a standalone project on its own.

### Contribute

- Please open an issue for feature request.
- Open a PR - Please describe the benefit of your PR and run some basic testing. I should not be the one to test and fix your 'feature' or 'enhancement'.
- We do not accept PR for minor typo or 'code cleanup'. Your PR should have some form of enhancement/feature or major refactoring.

## 📦 Installation

```bash
$ git clone https://github.com/thananon/twitch_tools.git
$ cd twitch_tools
$ npm install
```

## 🔨 Usage

**Use through `docker-compose.yml`**

Change the configuration to your channel and the database path.

```diff
version: "3.9"
services:
  9armbot:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
+      - ./9armbot/botstat.json:/twitch_tools/9armbot/botstat.json
+      - ./9armbot/players.json:/twitch_tools/9armbot/players.json
      - type: bind
+        source: ./9armbot/oauth_token
        target: /twitch_tools/9armbot/oauth_token
        read_only: true
    environment:
    - twitch_api=https://tmi.twitch.tv
+    - tmi_username=9armbot
+    - tmi_channel_name=armzi
+    - admin_username=armzi
```

```bash
$ docker-compose up
```

**Use through `NodeJs`**

Change the configuration to your channel in `.env` file and copy oauth token to `9armbot/oauth_token`.

```diff
twitch_api="https://tmi.twitch.tv"
+tmi_username="9armbot"
+tmi_channel_name="armzi"
+admin_username="armzi"
```

```bash
$ npm install
$ npm start
```

> More information about `oauth_token` [here](https://dev.twitch.tv/docs/irc).

## [v2.0.0 (work in progress)](https://github.com/thananon/twitch_tools/issues/44)

### Development workflow

1. Create Twitch and/or Discord Application, then get OAuth Token
1. Open `.env`, modify names and credentials, then save it as `.env.local` (This file is Git-ignored)
1. Initiate database by running `npm run db:migrate`
1. Start development server `npm run dev-2.0`
1. Run tests with `npm run test-2.0`
1. See database with `npm run db:studio`

### Migrate from JSON database (players.json)

See [json-to-prisma.ts](./9armbot-2.0/scripts/json-to-prisma.ts)

### Debug Console

```bash
$ npm run console
```

### Prisma Studio (View database on browser)

```bash
$ npm run db:studio
```

### Updating Database Schema

1. Planning - Update [schema.prisma](./prisma/schema.prisma) ([Docs](https://pris.ly/d/prisma-schema))
1. Generate - Run `npm run db:generate`, name the schema (eg. `"Add is_admin field"`), SQL migration file will be created.
1. Inspect - Verify and/or edit `.sql` file at [prisma/migrations](./prisma/migrations)
1. Migrate - Run `npm run db:migrate` to apply changes to your database (**Note: This action cannot be reversed easily without resetting your schema ([Ref](https://www.prisma.io/docs/concepts/components/prisma-migrate/prisma-migrate-limitations-issues#lack-of-rollbacks--down-migrations)).**)
1. Commit - Don't forget to Git-commit the migration files.
