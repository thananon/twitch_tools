import Discord, { Message } from 'discord.js'
import commands, { isError } from './bot'
import { devMode } from '../config'
import Widget from './widget'
import prisma from '../../prisma/client'

let client: Discord.Client
const widget = new Widget(false)

const silentBotMode = ['1', 'true'].includes(
  process.env.SILENT_BOT_MODE as string,
)

const helpers = {
  buildEmbedMessage: (
    messages: { name: string; value: string; inline?: boolean }[],
  ): Discord.MessageEmbed => {
    const messageEmbed = new Discord.MessageEmbed().setFooter(
      'Contribute @ github: https://github.com/thananon/twitch_tools',
    )

    messages.forEach((message) => {
      messageEmbed.addField(message.name, message.value, message.inline)
    })

    return messageEmbed
  },
}

type SendMessageParams = Parameters<Message['channel']['send']>

async function botSay(
  channel: Message['channel'],
  content: SendMessageParams[0],
  options?: SendMessageParams[1],
) {
  if (silentBotMode) {
    console.log(`[Silent Mode] Bot: ${JSON.stringify(content)}`)
  } else if (options) {
    return await channel.send.apply(channel, [content, options])
  } else {
    return await channel.send.apply(channel, [content])
  }
}

export async function discordLog(
  guildName: string,
  channelName: string,
  content: string,
) {
  const guild = client.guilds.cache.find((guild) => guild.name === guildName)!
  const channel = guild.channels.cache.find(
    (channel) => channel.name === channelName,
  ) as Discord.TextChannel
  return await botSay(channel, content)
}

export async function discordService() {
  client = new Discord.Client()

  client.on('ready', () => {
    console.log('Logged into Discord as ' + client.user!.tag)
  })

  await client.login(process.env.BOTV2_DISCORD_OAUTH_TOKEN)

  client.on('message', async (msg) => {
    if (msg.author.bot) return

    // ! Commands
    switch (msg.content.split(/\s+/)[0]) {
      case '!github':
        await botSay(msg.channel, 'https://github.com/thananon/twitch_tools')
        break

      case '!coin':
        if (`${process.env.DISCORD_WHITELIST_CHANNELS}`.length) {
          const whitelistChannels =
            process.env.DISCORD_WHITELIST_CHANNELS!.split(',')

          if (
            msg.channel.type == 'text' &&
            !whitelistChannels.includes(msg.channel.name!)
          ) {
            await botSay(
              msg.channel,
              `ไปถามในห้อง ${whitelistChannels
                .map((c) => `#${c}`)
                .join(', ')} หรือ dm นะจ๊ะ`,
            )
            return
          }
        }

        const group = msg.content.match(/!coin\s+([a-zA-Z0-9_]*)/)
        if (group && group[1]) {
          const username = group[1].toLowerCase()
          const result = await commands.coin(username)

          if (isError(result)) {
            await botSay(
              msg.channel,
              `ไม่พบ username <${group[1]}> โปรดใส่ Twitch username..`,
            )
            return
          }

          let embed = helpers.buildEmbedMessage([
            {
              name: `<${username}>`,
              value: `มียอดคงเหลือ ${result.data} $ARM`,
            },
          ])

          await botSay(msg.channel, embed)
          return
        }

        await botSay(
          msg.channel,
          'ใส่ username ของ twitch สิวะ ไม่บอกแล้วจะไปรู้ได้ไงว่า id twitch เอ็งคืออะไร คิดดิคิด...',
        )

        break

      case '!leader':
        // Get top 20 $ARM holders
        const topPlayers = await prisma.player.findMany({
          select: { username: true, coins: true },
          orderBy: [{ coins: 'desc' }],
          take: 20,
        })

        if (topPlayers.length) {
          let embed = helpers.buildEmbedMessage(
            topPlayers.map((player, idx) => ({
              name: player.username,
              value: String(player.coins),
              inline: idx >= 5,
            })),
          )

          embed
            .setTitle('กลุ่มผู้นำ $ARM')
            .setDescription('นายทุนผู้ถือเหรียญดิจิทัลที่มาแรงที่สุดในขณะนี้')
            .setThumbnail(
              'https://cdn.shopify.com/s/files/1/1955/3977/products/stonl_800x.png',
            )

          await botSay(msg.channel, embed)
        }

        break

      case '!marketcap':
        const marketcap = await commands.marketcap()

        botSay(
          msg.channel,
          `Market Cap: ${marketcap.data.baht} บาท (${marketcap.data.coins} $ARM)`,
        )

        break
      case '!command':
        console.log('TODO')
        break
      case '!testwidget':
        if (devMode) {
          await widget.testWidget()
        }
        break
      default:
        break
    }
  })
}
