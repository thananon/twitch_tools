## Twitch Tool repo

Repo to keep my community's twitch gadgetries. Join me at [www.twitch.tv/armzi](https://www.twitch.tv/armzi).

### Projects:
- 9armbot - custom bot to moderate twitch channel with unique personality.

### Contribute ###
- Please open an issue for feature request.
- Open a PR - Please describe the benefit of your PR and run some basic testing. I should not be the one to test and fix your 'feature' or 'enhancement'.

## 📦 Installation

```bash
$ git close https://github.com/thananon/twitch_tools.git
$ cd twitch_tools
$ npm install
```
## 🔨 Usage

**Use through `docker-compose.yml`**

Change the configuration to your channel.
```diff
version: "3.9"
services:
  9armbot:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
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