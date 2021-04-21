import tmi from 'tmi.js'
import commands, { isError } from './bot'

type ICommand = [string, string | undefined]

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
    if (message[0] !== '!') return

    const username = tags!.username!
    const [cmdName, cmdArg] = message.split(/\s+/, 2) as ICommand

    let result

    // ! Commands
    switch (cmdName) {
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
        result = await commands.coin(username)

        if (isError(result)) {
          await client.say(channel, `@${username} มี 0 armcoin.`)
          return
        }

        await client.say(channel, `@${username} มี ${result.data} armcoin.`)
        break
      case '!draw':
        console.log('TODO')
        break
      case '!gacha':
        let amount

        if (cmdArg) {
          let group = cmdArg.match(/(\d+)/)
          if (group && group[1]) {
            amount = Number.parseInt(group[1])
          }
        }

        result = await commands.gacha(username, amount)

        if (isError(result)) {
          if (result.error == 'not_enough_coin') {
            await client.say(channel, `@${username} มี ArmCoin ไม่พอ!.`)
          }
          return
        }

        if (result.data.state == 'win') {
          await client.say(
            channel,
            `@${username} ลงทุน ${result.data.bet} -> ได้รางวัล ${result.data.win} ArmCoin (${result.data.balance}).`,
          )
        } else if (result.data.state == 'lose') {
          await client.say(
            channel,
            `@${username} ลงทุน ${result.data.bet} -> แตก! (${result.data.balance}).`,
          )
        }

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
      case '!payday':
        console.log('TODO')
        break
      case '!raffle':
        console.log('TODO')
        break
      case '!reset':
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
