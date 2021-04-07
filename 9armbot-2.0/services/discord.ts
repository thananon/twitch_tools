import Discord from 'discord.js'
import commands from './bot'
import { testWidget } from './widget'

const helpers = {
  buildEmbedMessage: (
    messages: { name: string; value: string }[],
  ): Discord.MessageEmbed => {
    const messageEmbed = new Discord.MessageEmbed().setFooter(
      'Contribute @ github: https://github.com/thananon/twitch_tools',
    )

    messages.forEach((message) => {
      messageEmbed.addField(message.name, message.value)
    })

    return messageEmbed
  },
}

export async function discordService() {
  const client = new Discord.Client()

  client.on('ready', () => {
    console.log('Logged into Discord as ' + client.user!.tag)
  })

  await client.login(process.env.BOTV2_DISCORD_OAUTH_TOKEN)

  client.on('message', async (msg) => {
    if (msg.author.bot) return

    // ! Commands
    switch (msg.content.split(/\s+/)[0]) {
      case '!github':
        await msg.channel.send('https://github.com/thananon/twitch_tools')
        break

      case '!coin':
        const group = msg.content.match(/!coin\s+([a-zA-Z0-9_]*)/)
        if (group && group[1]) {
          const username = group[1].toLowerCase()
          const result = await commands.coin(username)

          if (result.error) {
            await msg.channel.send(
              `ไม่พบ username <${group[1]}> โปรดใส่ Twitch username..`,
            )
            return
          }

          let embed = helpers.buildEmbedMessage([
            {
              name: `<${username}>`,
              value: `มียอดคงเหลือ ${result.data} armcoin`,
            },
          ])

          await msg.channel.send(embed)
          return
        }

        await msg.channel.send(
          'ใส่ username ของ twitch สิวะ ไม่บอกแล้วจะไปรู้ได้ไงว่า id twitch เอ็งคืออะไร คิดดิคิด...',
        )

        break

      case '!leader':
        console.log('TODO')
        break
      case '!command':
        console.log('TODO')
        break
      case '!testwidget':
        await testWidget()
        break
      default:
        break
    }
  })
}
