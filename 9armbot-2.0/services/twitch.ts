import tmi from 'tmi.js'
import { Db } from './db'

const db = new Db()

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

  client.on('connected', () => {
    console.log('Connected to Twitch')
  })

  await client.connect()

  client.on('message', async (channel, tags, message, self) => {
    if (self) return

    // ! Commands
    switch (message) {
      case '!github':
        client.say(channel, 'https://github.com/thananon/twitch_tools')
        break
      case '!allin':
        console.log('TODO')
        break
      case '!auction':
        console.log('TODO')
        break
      case '!botstat':
        console.log('TODO')
        break
      case '!coin':
        const username = tags!.username!
        const player = await db.getPlayerbyUsername(username)
        if (player)
          client.say(channel, `@${player.username} มี ${player.coins} armcoin.`)
        else client.say(channel, `@${username} มี 0 armcoin.`)
        break
      case '!draw':
        console.log('TODO')
        break
      case '!give':
        console.log('TODO')
        break
      case '!income':
        console.log('TODO')
        break
      case '!kick':
        console.log('TODO')
        break
      case '!load':
        console.log('TODO')
        break
      case '!payday':
        console.log('TODO')
        break
      case '!raffle':
        console.log('TODO')
        break
      case '!reset':
        console.log('TODO')
        break
      case '!save':
        console.log('TODO')
        break
      case '!sentry':
        console.log('TODO')
        break
      case '!thanos':
        console.log('TODO')
        break
      case '!time':
        console.log('TODO')
        break
      default:
        break
    }
  })
}
