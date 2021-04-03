import tmi from 'tmi.js'

export async function twitchService() {
  const client = new tmi.Client({
    options: {
      debug: [undefined, 'development'].includes(process.env.NODE_ENV),
    },
    connection: { reconnect: true },
    identity: {
      username: process.env.tmi_username,
      password: process.env.BOTV2_TWITCH_OAUTH_TOKEN,
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
