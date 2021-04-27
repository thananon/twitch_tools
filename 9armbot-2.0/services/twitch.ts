import tmi from 'tmi.js'
import commands, { isError } from './bot'
import Player from './models/player'

const axios = require('axios')

/* return online { chatters, mods, total } */
async function getViewerList() {
  const url = `${process.env.twitch_api}/group/user/${process.env.tmi_channel_name}/chatters`
  const { data } = await axios.get(url)
  return {
    viewers: data.chatters.viewers,
    mods: data.chatters.moderators,
    total: data.chatter_count,
  }
}

async function payday(amount: number = 1) {
  const twitch = await getViewerList()

  /* Give coins to online players/mods */
  await commands.giveCoinToList(twitch.viewers, amount)
  await commands.giveCoinToList(twitch.mods, amount)

  console.log(`payday: ${amount} armcoin to ${twitch.total} viewers.`)
}

async function subscriptionPayout(username: string) {
  console.log(`subscriptionPayout: ${username}`)
  let player = await Player.withUsername(username)
  player.giveCoin(10)
  await payday()
  // TODO: emit msg/notification
}

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
    const [cmdName, ...cmdArgs] = message.split(/\s+/)

    let result, amount

    // ! Commands
    switch (cmdName) {
      case '!github':
        client.say(channel, 'https://github.com/thananon/twitch_tools')
        break
      case '!fetch':
        // test cmd; precursor to give coin to everyone.
        console.log(getViewerList())
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
        if (cmdArgs.length) {
          let group = cmdArgs[0].match(/(\d+)/)
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
        if (cmdArgs) {
          let group = cmdArgs.join(' ').match(/(\S+)\s(\d+)?/)
          if (group && group[1] && group[2]) {
            amount = Number.parseInt(group[2])

            result = await commands.giveCoin(group[1], amount)

            if (!isError(result)) {
              await client.say(
                channel,
                `@${username} เสกเงินให้ ${group[1]} จำนวน ${amount} (${result.data}).`,
              )
            }
          }
        }
        break
      case '!income':
        console.log('TODO')
        break
      case '!kick':
        console.log('TODO')
        break
      case '!payday':
        let player = await Player.withUsername(username)
        if (player.info.is_admin) {
          await payday()
        }
        break
      case '!payout': // placeholder for subscription event
        await subscriptionPayout(username)
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
