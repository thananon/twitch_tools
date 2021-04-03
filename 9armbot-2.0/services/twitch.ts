import tmi from 'tmi.js'
import fs from 'fs'
import path from 'path'

let oauth_token = fs.readFileSync(
  path.resolve(__dirname, '../../9armbot/oauth_token'),
  'utf8',
)

export async function twitchService() {
  const client = new tmi.Client({
    options: { debug: true },
    connection: { reconnect: true },
    identity: {
      username: process.env.tmi_username,
      password: oauth_token,
    },
    channels: [process.env.tmi_channel_name as string],
  })

  await client.connect()

  client.on('message', (channel, _tags, message, self) => {
    if (self) return

    // ! Commands
    switch (message) {
      case '!github':
        client.say(channel, 'https://github.com/thananon/twitch_tools')
        break

      default:
        break
    }
  })
}
